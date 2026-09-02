import {
  bindRuntimePersistence,
  createCommandRuntime,
  loadPersistedAppSpec,
  persistValidAppSpec,
  type PersistenceLoadResult,
} from './core'
import { blankSpec, crmSpec } from './templates'

const loaded = loadPersistedAppSpec(window.localStorage)
export const appRecovery =
  loaded.status === 'recovery_required' ? loaded : undefined
export const appRuntime = createCommandRuntime(
  loaded.status === 'restored' ? loaded.spec : crmSpec,
)
let stopPersistence =
  loaded.status === 'recovery_required'
    ? undefined
    : bindRuntimePersistence(appRuntime, window.localStorage)

export type AppRecovery = Extract<
  PersistenceLoadResult,
  { status: 'recovery_required' }
>

export async function recoverApp(template: 'crm' | 'blank') {
  const spec = template === 'crm' ? crmSpec : blankSpec
  const result = await appRuntime.dispatch({
    type: 'restore',
    source: 'human',
    template,
    spec,
  })
  if (result.success) {
    persistValidAppSpec(window.localStorage, appRuntime.getSpec())
    stopPersistence?.()
    stopPersistence = bindRuntimePersistence(appRuntime, window.localStorage)
  }
  return result
}
