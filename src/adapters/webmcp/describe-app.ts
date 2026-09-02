import type { ModelContext } from '@mcp-b/webmcp-types'
import type { AppSpec } from '../../core'

export const describeAppInputSchema = {
  type: 'object',
  properties: {},
  additionalProperties: false,
} as const

export type WebMcpRegistration = {
  available: boolean
  dispose: () => void
  registered: Promise<void>
}

export function registerDescribeApp(
  getSpec: () => AppSpec,
  modelContext: ModelContext | undefined = document.modelContext,
): WebMcpRegistration {
  if (!modelContext) {
    return {
      available: false,
      dispose: () => undefined,
      registered: Promise.resolve(),
    }
  }

  const controller = new AbortController()
  const registered = modelContext.registerTool(
    {
      name: 'describe_app',
      description:
        'Describe the current validated AppSpec without changing it.',
      inputSchema: describeAppInputSchema,
      execute: async () => {
        const spec = getSpec()
        return {
          version: spec.version,
          rootId: spec.rootId,
          nodeCount: Object.keys(spec.nodes).length,
          nodes: Object.values(spec.nodes).map(
            ({ id, type, children = [] }) => ({ id, type, children }),
          ),
        }
      },
    },
    { signal: controller.signal },
  )

  return { available: true, dispose: () => controller.abort(), registered }
}
