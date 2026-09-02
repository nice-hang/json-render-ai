import type { AppSpec } from '../spec/types'

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value)) deepFreeze(child)
  }
  return value
}

export type InternalAppSpecStore = {
  get: () => AppSpec
  commit: (next: AppSpec) => void
}

export function createInternalAppSpecStore(
  initialSpec: AppSpec,
): InternalAppSpecStore {
  let current = deepFreeze(structuredClone(initialSpec))
  return {
    get: () => current,
    commit: (next) => {
      current = deepFreeze(structuredClone(next))
    },
  }
}
