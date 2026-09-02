import { useSyncExternalStore } from 'react'
import type { CommandRuntime } from '../../core'

export function useRuntime(runtime: CommandRuntime) {
  return useSyncExternalStore(
    runtime.subscribe,
    runtime.getSnapshot,
    runtime.getSnapshot,
  )
}
