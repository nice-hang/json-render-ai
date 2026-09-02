import { appRuntime } from './app-runtime'
import type { CommandRuntime } from './core'
import { Studio } from './features/studio/Studio'

export function App({ runtime = appRuntime }: { runtime?: CommandRuntime }) {
  return <Studio runtime={runtime} />
}
