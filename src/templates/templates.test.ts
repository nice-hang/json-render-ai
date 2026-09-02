import { describe, expect, it } from 'vitest'
import { componentTypes, validateAppSpec } from '../core'
import { blankSpec, crmSpec } from './index'

describe('built-in templates', () => {
  it.each([
    ['CRM', crmSpec],
    ['blank', blankSpec],
  ])('%s template passes full AppSpec validation', (_name, spec) => {
    expect(validateAppSpec(spec)).toEqual({ success: true, data: spec })
  })

  it('CRM demonstrates all eight catalog component types', () => {
    const types = new Set(Object.values(crmSpec.nodes).map((node) => node.type))
    expect([...types].sort()).toEqual([...componentTypes].sort())
  })
})
