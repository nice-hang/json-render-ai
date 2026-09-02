import {
  appRecovery,
  appRuntime,
  recoverApp,
  type AppRecovery,
} from './app-runtime'
import type { CommandRuntime } from './core'
import { Studio } from './features/studio/Studio'

export function App({
  runtime = appRuntime,
  recovery = appRecovery,
  onRecover = recoverApp,
}: {
  runtime?: CommandRuntime
  recovery?: AppRecovery
  onRecover?: (template: 'crm' | 'blank') => Promise<unknown>
}) {
  return <Studio runtime={runtime} recovery={recovery} onRecover={onRecover} />
}
