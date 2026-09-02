import { describe, expect, it } from 'vitest'
import { crmSpec } from '../../templates'
import { createCommandRuntime } from './runtime'

describe('Command Runtime', () => {
  it('commits a successful update exactly once', async () => {
    const runtime = createCommandRuntime(crmSpec)
    let notifications = 0
    runtime.subscribe(() => notifications++)

    const result = await runtime.dispatch({
      type: 'update',
      source: 'human',
      nodeId: 'crm-intro',
      props: { content: 'Pipeline updated by a human.' },
    })

    expect(result.success).toBe(true)
    expect(result.changedNodeIds).toEqual(['crm-intro'])
    expect(runtime.getSpec().nodes['crm-intro'].props.content).toBe(
      'Pipeline updated by a human.',
    )
    expect(runtime.getSnapshot()).toMatchObject({
      revision: 1,
      historyDepth: 1,
    })
    expect(notifications).toBe(1)
  })

  it('adds a component from Catalog defaults and serializes concurrent dispatches', async () => {
    const runtime = createCommandRuntime(crmSpec)
    const [first, second] = await Promise.all([
      runtime.dispatch({
        type: 'add',
        source: 'human',
        parentId: 'metrics-grid',
        componentType: 'Metric',
        props: { label: 'Forecast', value: '$510K' },
      }),
      runtime.dispatch({
        type: 'add',
        source: 'agent',
        parentId: 'metrics-grid',
        componentType: 'Metric',
        props: { label: 'At risk', value: '3' },
      }),
    ])

    expect(first.success).toBe(true)
    expect(second.success).toBe(true)
    expect(runtime.getSpec().nodes['metrics-grid'].children).toHaveLength(5)
    expect(runtime.getSnapshot()).toMatchObject({
      revision: 2,
      historyDepth: 2,
    })
  })

  it.each([
    [
      'unknown id',
      {
        type: 'update',
        source: 'human',
        nodeId: 'missing',
        props: { content: 'x' },
      },
      '/nodeId',
    ],
    [
      'invalid type',
      {
        type: 'add',
        source: 'human',
        parentId: 'metrics-grid',
        componentType: 'Video',
      },
      '/componentType',
    ],
    [
      'invalid property',
      {
        type: 'update',
        source: 'human',
        nodeId: 'crm-intro',
        props: { content: 42 },
      },
      '/nodes/crm-intro/props/content',
    ],
    [
      'unknown property',
      {
        type: 'update',
        source: 'human',
        nodeId: 'crm-intro',
        props: { secret: true },
      },
      '/nodes/crm-intro/props',
    ],
    [
      'out-of-bounds index',
      {
        type: 'add',
        source: 'human',
        parentId: 'metrics-grid',
        componentType: 'Metric',
        index: 99,
      },
      '/index',
    ],
  ])('rejects %s atomically', async (_name, command, expectedPath) => {
    const runtime = createCommandRuntime(crmSpec)
    const before = structuredClone(runtime.getSpec())
    const result = await runtime.dispatch(command)

    expect(result.success).toBe(false)
    expect(result.errors?.map((error) => error.path)).toContain(expectedPath)
    expect(runtime.getSpec()).toEqual(before)
    expect(runtime.getSnapshot()).toMatchObject({
      revision: 0,
      historyDepth: 0,
    })
  })

  it('does not allow consumers to mutate the Store snapshot', () => {
    const runtime = createCommandRuntime(crmSpec)
    expect(Object.isFrozen(runtime.getSpec())).toBe(true)
    expect(Object.isFrozen(runtime.getSpec().nodes['crm-intro'].props)).toBe(
      true,
    )
    expect(() => {
      runtime.getSpec().nodes['crm-intro'].props.content = 'bypass'
    }).toThrow()
  })

  it('validates without changing state or history', async () => {
    const runtime = createCommandRuntime(crmSpec)
    const result = await runtime.dispatch({ type: 'validate', source: 'agent' })
    expect(result).toMatchObject({
      success: true,
      changedNodeIds: [],
      undoAvailable: false,
    })
    expect(runtime.getSnapshot()).toMatchObject({
      revision: 0,
      historyDepth: 0,
    })
  })

  it('restores a validated built-in template through the Runtime', async () => {
    const runtime = createCommandRuntime(crmSpec)
    const result = await runtime.dispatch({
      type: 'restore',
      source: 'human',
      template: 'blank',
      spec: {
        version: 1,
        rootId: 'blank-page',
        nodes: {
          'blank-page': {
            id: 'blank-page',
            type: 'Page',
            props: { title: 'Blank app' },
            children: [],
          },
        },
      },
    })
    expect(result.success).toBe(true)
    expect(runtime.getSpec().rootId).toBe('blank-page')
    expect(runtime.getSnapshot().historyDepth).toBe(1)
    expect(
      (await runtime.dispatch({ type: 'undo', source: 'human' })).success,
    ).toBe(true)
    expect(runtime.getSpec()).toEqual(crmSpec)
  })

  it('restores 20 mixed committed changes in exact reverse order', async () => {
    const runtime = createCommandRuntime(crmSpec)
    const initial = structuredClone(runtime.getSpec())
    for (let index = 0; index < 20; index += 1) {
      const result = await runtime.dispatch({
        type: 'update',
        source: index % 2 ? 'agent' : 'human',
        nodeId: 'crm-intro',
        props: { content: `Mixed change ${index + 1}` },
      })
      expect(result.success).toBe(true)
    }
    expect(runtime.getSnapshot().historyDepth).toBe(20)
    for (let index = 0; index < 20; index += 1) {
      expect(
        (await runtime.dispatch({ type: 'undo', source: 'human' })).success,
      ).toBe(true)
    }
    expect(runtime.getSpec()).toEqual(initial)
    expect(runtime.getSnapshot().historyDepth).toBe(0)
  })

  it('caps activity at 50 safe summaries and preserves invalid Agent source', async () => {
    const runtime = createCommandRuntime(crmSpec)
    for (let index = 0; index < 55; index += 1) {
      await runtime.dispatch({
        type: 'update',
        source: index % 2 ? 'agent' : 'human',
        nodeId: 'crm-intro',
        props: { content: `cookie=secret-${index}` },
      })
    }
    await runtime.dispatch({
      type: 'update',
      source: 'agent',
      nodeId: 'token=secret-credential',
      props: { content: 42 },
    })
    const snapshot = runtime.getSnapshot()
    expect(snapshot.activity).toHaveLength(50)
    expect(snapshot.activity[0]).toMatchObject({
      source: 'agent',
      status: 'failed',
    })
    expect(JSON.stringify(snapshot.activity)).not.toContain('secret-')
    expect(snapshot.historyDepth).toBe(20)
    expect(
      snapshot.activity.every((entry) => entry.summary.length <= 160),
    ).toBe(true)
  })

  it('moves a node while preserving one parent and supports undo', async () => {
    const runtime = createCommandRuntime(crmSpec)
    const before = structuredClone(runtime.getSpec())
    const result = await runtime.dispatch({
      type: 'move',
      source: 'agent',
      nodeId: 'win-rate-card',
      newParentId: 'metrics-grid',
      index: 0,
    })
    expect(result.success).toBe(true)
    expect(runtime.getSpec().nodes['metrics-grid'].children?.[0]).toBe(
      'win-rate-card',
    )
    expect(
      (await runtime.dispatch({ type: 'undo', source: 'agent' })).success,
    ).toBe(true)
    expect(runtime.getSpec()).toEqual(before)
  })

  it.each([
    [
      'root move',
      { nodeId: 'crm-page', newParentId: 'crm-layout', index: 0 },
      '/nodeId',
    ],
    [
      'cyclic move',
      { nodeId: 'crm-layout', newParentId: 'filter-row', index: 0 },
      '/newParentId',
    ],
    [
      'out-of-bounds move',
      { nodeId: 'win-rate-card', newParentId: 'metrics-grid', index: 99 },
      '/index',
    ],
  ])('rejects %s atomically', async (_name, move, expectedPath) => {
    const runtime = createCommandRuntime(crmSpec)
    const before = structuredClone(runtime.getSpec())
    const result = await runtime.dispatch({
      type: 'move',
      source: 'agent',
      ...move,
    })
    expect(result.success).toBe(false)
    expect(result.errors?.map((error) => error.path)).toContain(expectedPath)
    expect(runtime.getSpec()).toEqual(before)
    expect(runtime.getSnapshot().historyDepth).toBe(0)
  })

  it('requires a current confirmation token before deleting exactly one subtree', async () => {
    const runtime = createCommandRuntime(crmSpec)
    const before = structuredClone(runtime.getSpec())
    const preview = await runtime.dispatch({
      type: 'remove',
      source: 'agent',
      nodeId: 'pipeline-card',
    })
    expect(preview).toMatchObject({
      success: false,
      requiresConfirmation: true,
    })
    expect(preview.affectedNodeIds).toEqual([
      'pipeline-card',
      'filter-row',
      'search-input',
      'stage-select',
      'apply-button',
    ])
    expect(runtime.getSpec()).toEqual(before)
    expect(runtime.getSnapshot().historyDepth).toBe(0)

    const removed = await runtime.dispatch({
      type: 'remove',
      source: 'agent',
      nodeId: 'pipeline-card',
      confirmationToken: preview.confirmationToken,
    })
    expect(removed.success).toBe(true)
    expect(runtime.getSpec().nodes['pipeline-card']).toBeUndefined()
    expect(runtime.getSpec().nodes['filter-row']).toBeUndefined()
    expect(runtime.getSpec().nodes['crm-layout'].children).not.toContain(
      'pipeline-card',
    )
    expect(
      (await runtime.dispatch({ type: 'undo', source: 'agent' })).success,
    ).toBe(true)
    expect(runtime.getSpec()).toEqual(before)
  })

  it('rejects incorrect and expired confirmation tokens', async () => {
    const runtime = createCommandRuntime(crmSpec)
    const preview = await runtime.dispatch({
      type: 'remove',
      source: 'agent',
      nodeId: 'pipeline-card',
    })
    const incorrect = await runtime.dispatch({
      type: 'remove',
      source: 'agent',
      nodeId: 'pipeline-card',
      confirmationToken: 'wrong-token',
    })
    expect(incorrect.success).toBe(false)
    expect(incorrect.errors?.[0]?.path).toBe('/confirmationToken')
    await runtime.dispatch({
      type: 'update',
      source: 'human',
      nodeId: 'crm-intro',
      props: { content: 'A newer revision' },
    })
    const expired = await runtime.dispatch({
      type: 'remove',
      source: 'agent',
      nodeId: 'pipeline-card',
      confirmationToken: preview.confirmationToken,
    })
    expect(expired.success).toBe(false)
    expect(expired.errors?.[0]?.code).toBe('invalid_confirmation')
    expect(runtime.getSpec().nodes['pipeline-card']).toBeDefined()
  })

  it.each([
    [
      'add',
      {
        type: 'add',
        source: 'agent',
        parentId: 'metrics-grid',
        componentType: 'Metric',
      },
    ],
    [
      'update',
      {
        type: 'update',
        source: 'agent',
        nodeId: 'crm-intro',
        props: { content: 'Updated' },
      },
    ],
    [
      'move',
      {
        type: 'move',
        source: 'agent',
        nodeId: 'win-rate-card',
        newParentId: 'metrics-grid',
        index: 0,
      },
    ],
  ])('undo restores a committed %s', async (_name, command) => {
    const runtime = createCommandRuntime(crmSpec)
    const before = structuredClone(runtime.getSpec())
    expect((await runtime.dispatch(command)).success).toBe(true)
    expect(
      (await runtime.dispatch({ type: 'undo', source: 'agent' })).success,
    ).toBe(true)
    expect(runtime.getSpec()).toEqual(before)
  })
})
