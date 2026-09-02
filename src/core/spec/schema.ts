import { z } from 'zod'
import { catalog } from '../catalog/catalog'
import { componentTypes, type AppSpec, type ValidationIssue } from './types'

const nodeSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(componentTypes),
    props: z.record(z.string(), z.unknown()),
    children: z.array(z.string().min(1)).optional(),
  })
  .strict()

const appSpecShape = z
  .object({
    version: z.literal(1),
    rootId: z.string().min(1),
    nodes: z.record(z.string(), nodeSchema),
  })
  .strict()

function issuePath(path: PropertyKey[]): string {
  return path.length ? `/${path.map(String).join('/')}` : '/'
}

export function validateAppSpec(
  input: unknown,
):
  | { success: true; data: AppSpec }
  | { success: false; errors: ValidationIssue[] } {
  const parsed = appSpecShape.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => ({
        path: issuePath(issue.path),
        code: issue.code,
        message: issue.message,
      })),
    }
  }

  const spec = parsed.data as AppSpec
  const errors: ValidationIssue[] = []
  const root = spec.nodes[spec.rootId]
  if (!root) {
    errors.push({
      path: '/rootId',
      code: 'missing_root',
      message: 'rootId must reference an existing node',
    })
  } else if (root.type !== 'Page') {
    errors.push({
      path: `/nodes/${spec.rootId}/type`,
      code: 'invalid_root',
      message: 'Root node must be a Page',
    })
  }

  const parentCount = new Map<string, number>()
  for (const [key, node] of Object.entries(spec.nodes)) {
    if (key !== node.id) {
      errors.push({
        path: `/nodes/${key}/id`,
        code: 'id_mismatch',
        message: 'Node id must match its record key',
      })
    }
    const props = catalog[node.type].propsSchema.safeParse(node.props)
    if (!props.success) {
      for (const issue of props.error.issues) {
        errors.push({
          path: `/nodes/${key}/props${issue.path.length ? `/${issue.path.map(String).join('/')}` : ''}`,
          code: issue.code,
          message: issue.message,
        })
      }
    }
    for (const [index, childId] of (node.children ?? []).entries()) {
      const child = spec.nodes[childId]
      if (!child) {
        errors.push({
          path: `/nodes/${key}/children/${index}`,
          code: 'missing_child',
          message: `Unknown child ${childId}`,
        })
        continue
      }
      parentCount.set(childId, (parentCount.get(childId) ?? 0) + 1)
      if (!catalog[node.type].allowedChildren.includes(child.type as never)) {
        errors.push({
          path: `/nodes/${key}/children/${index}`,
          code: 'invalid_child_type',
          message: `${node.type} cannot contain ${child.type}`,
        })
      }
    }
  }

  for (const id of Object.keys(spec.nodes)) {
    if (id === spec.rootId) continue
    const count = parentCount.get(id) ?? 0
    if (count !== 1) {
      errors.push({
        path: `/nodes/${id}`,
        code: count === 0 ? 'orphan' : 'multiple_parents',
        message:
          count === 0
            ? 'Node is not reachable from a parent'
            : 'Node must have exactly one parent',
      })
    }
  }

  const visiting = new Set<string>()
  const visited = new Set<string>()
  const visit = (id: string) => {
    if (visiting.has(id)) {
      errors.push({
        path: `/nodes/${id}`,
        code: 'cycle',
        message: 'Component tree must not contain a cycle',
      })
      return
    }
    if (visited.has(id) || !spec.nodes[id]) return
    visiting.add(id)
    for (const childId of spec.nodes[id].children ?? []) visit(childId)
    visiting.delete(id)
    visited.add(id)
  }
  visit(spec.rootId)

  return errors.length
    ? { success: false, errors }
    : { success: true, data: spec }
}
