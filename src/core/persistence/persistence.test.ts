import { describe, expect, it, vi } from 'vitest'
import { crmSpec } from '../../templates'
import { createCommandRuntime } from '../runtime'
import {
  APP_SPEC_STORAGE_KEY,
  bindRuntimePersistence,
  loadPersistedAppSpec,
  persistValidAppSpec,
  type StorageLike,
} from './persistence'

function memoryStorage(initial?: string) {
  let value = initial ?? null
  const storage: StorageLike = {
    getItem: () => value,
    setItem: (_key, next) => {
      value = next
    },
  }
  return { storage, value: () => value }
}

describe('last valid AppSpec persistence', () => {
  it.each([
    ['invalid_json', '{broken'],
    ['unknown_version', JSON.stringify({ storageVersion: 99, spec: crmSpec })],
    [
      'invalid_spec',
      JSON.stringify({
        storageVersion: 1,
        spec: { ...crmSpec, rootId: 'gone' },
      }),
    ],
  ])('preserves %s data and requests recovery', (reason, raw) => {
    const memory = memoryStorage(raw)
    expect(loadPersistedAppSpec(memory.storage)).toMatchObject({
      status: 'recovery_required',
      reason,
    })
    expect(memory.value()).toBe(raw)
  })

  it('round-trips a valid versioned AppSpec', () => {
    const memory = memoryStorage()
    expect(persistValidAppSpec(memory.storage, crmSpec)).toBe(true)
    expect(loadPersistedAppSpec(memory.storage)).toEqual({
      status: 'restored',
      spec: crmSpec,
    })
  })

  it('throttles writes and ignores read-only Runtime publications', async () => {
    vi.useFakeTimers()
    const memory = memoryStorage()
    const setItem = vi.spyOn(memory.storage, 'setItem')
    const runtime = createCommandRuntime(crmSpec)
    const dispose = bindRuntimePersistence(runtime, memory.storage)
    await runtime.dispatch({ type: 'validate', source: 'agent' })
    expect(setItem).not.toHaveBeenCalled()
    await runtime.dispatch({
      type: 'update',
      source: 'human',
      nodeId: 'crm-intro',
      props: { content: 'Persist me' },
    })
    expect(setItem).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(100)
    expect(setItem).toHaveBeenCalledTimes(1)
    expect(memory.storage.getItem(APP_SPEC_STORAGE_KEY)).toContain('Persist me')
    dispose()
    vi.useRealTimers()
  })
})
