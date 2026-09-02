import type {
  InputSchema,
  ModelContext,
  ModelContextTool,
} from '@mcp-b/webmcp-types'
import { componentTypes, type CommandRuntime } from '../../core'
import type { WebMcpRegistration } from './describe-app'

const emptyInput = {
  type: 'object',
  properties: {},
  additionalProperties: false,
} as const

export const webMcpToolMetadata = [
  {
    name: 'describe_app',
    description: 'Describe the current validated AppSpec without changing it.',
    inputSchema: emptyInput,
  },
  {
    name: 'list_components',
    description:
      'List every component with its stable ID, type, parent, and children.',
    inputSchema: emptyInput,
  },
  {
    name: 'add_component',
    description:
      'Add one supported component to a parent through the validated Command Runtime.',
    inputSchema: {
      type: 'object',
      properties: {
        parentId: { type: 'string' },
        componentType: { type: 'string', enum: componentTypes },
        props: { type: 'object', additionalProperties: true },
        index: { type: 'integer', minimum: 0 },
      },
      required: ['parentId', 'componentType'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_component',
    description:
      'Update allowed properties on one component through the validated Command Runtime.',
    inputSchema: {
      type: 'object',
      properties: {
        nodeId: { type: 'string' },
        props: { type: 'object', additionalProperties: true },
      },
      required: ['nodeId', 'props'],
      additionalProperties: false,
    },
  },
  {
    name: 'move_component',
    description:
      'Move a component to a valid parent and index without creating cycles.',
    inputSchema: {
      type: 'object',
      properties: {
        nodeId: { type: 'string' },
        newParentId: { type: 'string' },
        index: { type: 'integer', minimum: 0 },
      },
      required: ['nodeId', 'newParentId', 'index'],
      additionalProperties: false,
    },
  },
  {
    name: 'remove_component',
    description:
      'Preview or confirm recursive component removal. First call without a token never changes state.',
    inputSchema: {
      type: 'object',
      properties: {
        nodeId: { type: 'string' },
        confirmationToken: { type: 'string' },
      },
      required: ['nodeId'],
      additionalProperties: false,
    },
  },
  {
    name: 'validate_app',
    description:
      'Validate the current AppSpec and return path-level errors without changing it.',
    inputSchema: emptyInput,
  },
  {
    name: 'undo_last_change',
    description:
      'Undo the most recent committed write through the shared Command Runtime.',
    inputSchema: emptyInput,
  },
] as const satisfies ReadonlyArray<{
  name: string
  description: string
  inputSchema: InputSchema
}>

function parentIdFor(runtime: CommandRuntime, nodeId: string): string | null {
  const spec = runtime.getSpec()
  return (
    Object.values(spec.nodes).find((node) => node.children?.includes(nodeId))
      ?.id ?? null
  )
}

export function createWebMcpTools(
  runtime: CommandRuntime,
): ModelContextTool<Record<string, unknown>>[] {
  const [describe, list, add, update, move, remove, validate, undo] =
    webMcpToolMetadata
  return [
    {
      ...describe,
      annotations: { readOnlyHint: true },
      execute: async () => {
        const spec = runtime.getSpec()
        return {
          version: spec.version,
          rootId: spec.rootId,
          nodeCount: Object.keys(spec.nodes).length,
          revision: runtime.getSnapshot().revision,
        }
      },
    },
    {
      ...list,
      annotations: { readOnlyHint: true },
      execute: async () => {
        const spec = runtime.getSpec()
        return {
          version: spec.version,
          components: Object.values(spec.nodes).map(
            ({ id, type, children = [] }) => ({
              id,
              type,
              parentId: parentIdFor(runtime, id),
              children,
            }),
          ),
        }
      },
    },
    {
      ...add,
      execute: (input) =>
        runtime.dispatch({
          type: 'add',
          source: 'agent',
          parentId: input.parentId,
          componentType: input.componentType,
          props: input.props,
          index: input.index,
        }),
    },
    {
      ...update,
      execute: (input) =>
        runtime.dispatch({
          type: 'update',
          source: 'agent',
          nodeId: input.nodeId,
          props: input.props,
        }),
    },
    {
      ...move,
      execute: (input) =>
        runtime.dispatch({
          type: 'move',
          source: 'agent',
          nodeId: input.nodeId,
          newParentId: input.newParentId,
          index: input.index,
        }),
    },
    {
      ...remove,
      execute: (input) =>
        runtime.dispatch({
          type: 'remove',
          source: 'agent',
          nodeId: input.nodeId,
          confirmationToken: input.confirmationToken,
        }),
    },
    {
      ...validate,
      annotations: { readOnlyHint: true },
      execute: () => runtime.dispatch({ type: 'validate', source: 'agent' }),
    },
    {
      ...undo,
      execute: () => runtime.dispatch({ type: 'undo', source: 'agent' }),
    },
  ]
}

export function registerWebMcpTools(
  runtime: CommandRuntime,
  modelContext: ModelContext | undefined = document.modelContext,
): WebMcpRegistration {
  if (!modelContext)
    return {
      available: false,
      dispose: () => undefined,
      registered: Promise.resolve(),
    }
  const controller = new AbortController()
  const register = modelContext.registerTool.bind(modelContext) as (
    tool: ModelContextTool<Record<string, unknown>>,
    options: { signal: AbortSignal },
  ) => Promise<void>
  const registered = Promise.all(
    createWebMcpTools(runtime).map((tool) =>
      register(tool, { signal: controller.signal }),
    ),
  ).then(() => undefined)
  registered.catch(() => controller.abort())
  return { available: true, dispose: () => controller.abort(), registered }
}
