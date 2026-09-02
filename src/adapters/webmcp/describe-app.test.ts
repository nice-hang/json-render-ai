import type { ModelContext } from '@mcp-b/webmcp-types'
import { describe, expect, it, vi } from 'vitest'
import { spikeSpec } from '../../templates/spike'
import { describeAppInputSchema, registerDescribeApp } from './describe-app'

describe('describe_app WebMCP adapter', () => {
  it('registers the standard descriptor and disposes through AbortSignal', async () => {
    let descriptor: any
    let signal: AbortSignal | undefined
    const modelContext = {
      registerTool: vi.fn(async (tool, options) => {
        descriptor = tool
        signal = options?.signal
      }),
    } as unknown as ModelContext

    const registration = registerDescribeApp(() => spikeSpec, modelContext)
    await registration.registered

    expect(registration.available).toBe(true)
    expect(descriptor.name).toBe('describe_app')
    expect(descriptor.inputSchema).toEqual(describeAppInputSchema)
    await expect(descriptor.execute({})).resolves.toMatchObject({
      version: 1,
      rootId: 'page',
      nodeCount: 3,
    })
    expect(signal?.aborted).toBe(false)
    registration.dispose()
    expect(signal?.aborted).toBe(true)
  })

  it('reports unavailable without installing a production shim', () => {
    const registration = registerDescribeApp(() => spikeSpec, undefined)
    expect(registration.available).toBe(false)
  })
})
