import type { Command, CommandResult } from '../commands/contracts'
import type { AppSpec } from '../spec/types'

export type ActivityEntry = {
  id: string
  source: 'human' | 'agent'
  command: Command['type'] | 'invalid'
  status: 'success' | 'failed'
  timestamp: string
  summary: string
  message: string
  changedNodeIds: string[]
}

export type RuntimeSnapshot = {
  spec: AppSpec
  activity: readonly ActivityEntry[]
  revision: number
  historyDepth: number
}

export type CommandRuntime = {
  dispatch: (input: unknown) => Promise<CommandResult>
  getSnapshot: () => RuntimeSnapshot
  getSpec: () => AppSpec
  subscribe: (listener: () => void) => () => void
}
