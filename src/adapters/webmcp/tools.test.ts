import type { ModelContext } from '@mcp-b/webmcp-types'
import { describe, expect, it, vi } from 'vitest'
import { createCommandRuntime } from '../../core'
import { crmSpec } from '../../templates'
import {
  createWebMcpTools,
  registerWebMcpTools,
  webMcpToolMetadata,
} from './tools'

function toolsForRuntime() {
  const runtime = createCommandRuntime(crmSpec)
  const tools = Object.fromEntries(
    createWebMcpTools(runtime).map((tool) => [tool.name, tool]),
  )
  const execute = (name: string, input: Record<string, unknown> = {}) =>
    tools[name].execute(input)
  return { runtime, tools, execute }
}

describe('eight WebMCP tools', () => {
  it('publishes the exact documented names and JSON Schemas', () => {
    expect(webMcpToolMetadata.map((tool) => tool.name)).toEqual([
      'describe_app',
      'list_components',
      'add_component',
      'update_component',
      'move_component',
      'remove_component',
      'validate_app',
      'undo_last_change',
    ])
    for (const tool of webMcpToolMetadata) {
      expect(tool.description.length).toBeGreaterThan(20)
      expect(tool.inputSchema).toMatchObject({
        type: 'object',
        additionalProperties: false,
      })
    }
  })

  it('registers all tools through the standard ModelContext lifecycle', async () => {
    const registered: Array<{ name: string }> = []
    const signals: AbortSignal[] = []
    const modelContext = {
      registerTool: vi.fn(async (tool, options) => {
        registered.push(tool)
        signals.push(options.signal)
      }),
    } as unknown as ModelContext

    const registration = registerWebMcpTools(
      createCommandRuntime(crmSpec),
      modelContext,
    )
    await registration.registered

    expect(registered.map((tool) => tool.name)).toEqual(
      webMcpToolMetadata.map((tool) => tool.name),
    )
    expect(signals).toHaveLength(8)
    expect(signals.every((signal) => !signal.aborted)).toBe(true)
    registration.dispose()
    expect(signals.every((signal) => signal.aborted)).toBe(true)
  })

  it('keeps repeated describe/list calls read-only and JSON serializable', async () => {
    const { runtime, execute } = toolsForRuntime()
    const beforeSpec = structuredClone(runtime.getSpec())
    const beforeSnapshot = runtime.getSnapshot()
    for (let index = 0; index < 10; index += 1) {
      const described = await execute('describe_app')
      const listed = await execute('list_components')
      expect(() => JSON.stringify(described)).not.toThrow()
      expect(() => JSON.stringify(listed)).not.toThrow()
    }
    expect(runtime.getSpec()).toEqual(beforeSpec)
    expect(runtime.getSnapshot()).toBe(beforeSnapshot)
  })

  it('routes add/update/move/remove/undo through one Runtime', async () => {
    const { runtime, execute } = toolsForRuntime()
    const initial = structuredClone(runtime.getSpec())
    const added = (await execute('add_component', {
      parentId: 'metrics-grid',
      componentType: 'Metric',
      props: { label: 'Agent forecast', value: '$525K' },
    })) as any
    expect(added.success).toBe(true)
    const nodeId = added.changedNodeIds.at(-1)

    const updated = (await execute('update_component', {
      nodeId,
      props: { value: '$530K' },
    })) as any
    expect(updated).toMatchObject({ success: true, changedNodeIds: [nodeId] })
    expect(runtime.getSpec().nodes[nodeId].props.value).toBe('$530K')

    const moved = (await execute('move_component', {
      nodeId,
      newParentId: 'metrics-grid',
      index: 0,
    })) as any
    expect(moved.success).toBe(true)
    expect(runtime.getSpec().nodes['metrics-grid'].children?.[0]).toBe(nodeId)

    const preview = (await execute('remove_component', { nodeId })) as any
    expect(preview).toMatchObject({
      success: false,
      requiresConfirmation: true,
      affectedNodeIds: [nodeId],
    })
    expect(runtime.getSpec().nodes[nodeId]).toBeDefined()
    const removed = (await execute('remove_component', {
      nodeId,
      confirmationToken: preview.confirmationToken,
    })) as any
    expect(removed.success).toBe(true)
    expect(runtime.getSpec().nodes[nodeId]).toBeUndefined()

    const undone = (await execute('undo_last_change')) as any
    expect(undone.success).toBe(true)
    expect(runtime.getSpec().nodes[nodeId]).toBeDefined()
    expect(runtime.getSpec()).not.toEqual(initial)
    expect(
      runtime.getSnapshot().activity.every((entry) => entry.source === 'agent'),
    ).toBe(true)
  })

  it('returns atomic path errors for invalid agent input', async () => {
    const { runtime, execute } = toolsForRuntime()
    const before = structuredClone(runtime.getSpec())
    const result = (await execute('update_component', {
      nodeId: 'missing',
      props: { value: 'x' },
    })) as any
    expect(result.success).toBe(false)
    expect(result.errors[0]).toMatchObject({
      path: '/nodeId',
      code: 'unknown_id',
    })
    expect(runtime.getSpec()).toEqual(before)
  })
})
