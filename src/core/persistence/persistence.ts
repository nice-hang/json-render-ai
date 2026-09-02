import type { CommandRuntime } from '../runtime'
import type { AppSpec } from '../spec/types'
import { validateAppSpec } from '../spec/schema'

export const APP_SPEC_STORAGE_KEY = 'json-render-ai:last-valid-app-spec'
export const APP_SPEC_STORAGE_VERSION = 1

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

export type PersistenceLoadResult =
  | { status: 'missing' }
  | { status: 'restored'; spec: AppSpec }
  | {
      status: 'recovery_required'
      reason: 'invalid_json' | 'unknown_version' | 'invalid_spec'
      message: string
    }

export function loadPersistedAppSpec(
  storage: StorageLike,
): PersistenceLoadResult {
  const raw = storage.getItem(APP_SPEC_STORAGE_KEY)
  if (raw === null) return { status: 'missing' }
  let envelope: unknown
  try {
    envelope = JSON.parse(raw)
  } catch {
    return {
      status: 'recovery_required',
      reason: 'invalid_json',
      message: 'Saved data is not valid JSON. Choose a template to recover.',
    }
  }
  if (
    typeof envelope !== 'object' ||
    envelope === null ||
    !('storageVersion' in envelope) ||
    envelope.storageVersion !== APP_SPEC_STORAGE_VERSION
  )
    return {
      status: 'recovery_required',
      reason: 'unknown_version',
      message: 'Saved data uses an unsupported version. Choose a template.',
    }
  const validation = validateAppSpec(
    'spec' in envelope ? (envelope.spec as AppSpec) : (undefined as never),
  )
  if (!validation.success)
    return {
      status: 'recovery_required',
      reason: 'invalid_spec',
      message: 'Saved AppSpec is damaged. The original data was preserved.',
    }
  return { status: 'restored', spec: validation.data }
}

export function persistValidAppSpec(
  storage: StorageLike,
  spec: AppSpec,
): boolean {
  const validation = validateAppSpec(spec)
  if (!validation.success) return false
  try {
    storage.setItem(
      APP_SPEC_STORAGE_KEY,
      JSON.stringify({
        storageVersion: APP_SPEC_STORAGE_VERSION,
        spec: validation.data,
      }),
    )
    return true
  } catch {
    return false
  }
}

export function bindRuntimePersistence(
  runtime: CommandRuntime,
  storage: StorageLike,
  delay = 100,
): () => void {
  let lastSpec = runtime.getSpec()
  let timer: ReturnType<typeof setTimeout> | undefined
  const unsubscribe = runtime.subscribe(() => {
    const nextSpec = runtime.getSpec()
    if (nextSpec === lastSpec) return
    lastSpec = nextSpec
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => persistValidAppSpec(storage, nextSpec), delay)
  })
  return () => {
    unsubscribe()
    if (timer) clearTimeout(timer)
  }
}
