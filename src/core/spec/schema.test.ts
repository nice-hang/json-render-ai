import { describe, expect, it } from 'vitest'
import { spikeSpec } from '../../templates/spike'
import { validateAppSpec } from './schema'

const clone = <T>(value: T): T => structuredClone(value)

describe('validateAppSpec', () => {
  it('accepts the minimal real-renderer spike spec', () => {
    expect(validateAppSpec(spikeSpec)).toEqual({
      success: true,
      data: spikeSpec,
    })
  })

  it.each([
    [
      'unknown type',
      (spec: any) => (spec.nodes.welcome.type = 'Video'),
      '/nodes/welcome/type',
    ],
    [
      'duplicate/mismatched id',
      (spec: any) => (spec.nodes.welcome.id = 'stack'),
      '/nodes/welcome/id',
    ],
    [
      'orphan',
      (spec: any) => spec.nodes.page.children.splice(0),
      '/nodes/stack',
    ],
    [
      'cycle',
      (spec: any) => spec.nodes.stack.children.push('page'),
      '/nodes/page',
    ],
    [
      'invalid props',
      (spec: any) =>
        (spec.nodes.welcome.props = { content: 42, tone: 'accent' }),
      '/nodes/welcome/props/content',
    ],
  ])('rejects %s with a path-level error', (_name, mutate, expectedPath) => {
    const spec = clone(spikeSpec)
    mutate(spec)
    const result = validateAppSpec(spec)
    expect(result.success).toBe(false)
    if (!result.success)
      expect(result.errors.map((error) => error.path)).toContain(expectedPath)
  })
})
