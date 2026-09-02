import { catalog } from '../catalog/catalog'
import {
  commandSchema,
  type Command,
  type CommandResult,
} from '../commands/contracts'
import type { AppSpec, ComponentType, ValidationIssue } from '../spec/types'
import { validateAppSpec } from '../spec/schema'
import { createInternalAppSpecStore } from '../store/internal'
import type { ActivityEntry, CommandRuntime, RuntimeSnapshot } from './types'

const MAX_HISTORY = 20
const MAX_ACTIVITY = 50
const MAX_SUMMARY_LENGTH = 160

function commandId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `command-${Date.now()}-${Math.random().toString(16).slice(2)}`
  )
}

function failure(
  id: string,
  message: string,
  errors: ValidationIssue[],
  undoAvailable: boolean,
): CommandResult {
  return {
    success: false,
    commandId: id,
    changedNodeIds: [],
    message,
    undoAvailable,
    errors,
  }
}

function newNodeId(type: ComponentType, spec: AppSpec): string {
  const prefix = type.toLowerCase()
  let index = Object.keys(spec.nodes).length + 1
  while (spec.nodes[`${prefix}-${index}`]) index += 1
  return `${prefix}-${index}`
}

function summarize(command: Command): string {
  switch (command.type) {
    case 'validate':
      return 'Validate current AppSpec'
    case 'add':
      return `Add ${command.componentType} to ${command.parentId}`
    case 'update':
      return `Update ${command.nodeId}: ${Object.keys(command.props).join(', ')}`
    case 'move':
      return `Move ${command.nodeId} to ${command.newParentId} at ${command.index}`
    case 'remove':
      return `Remove ${command.nodeId}`
    case 'undo':
      return 'Undo last committed change'
    case 'restore':
      return `Restore ${command.template} template`
  }
}

function safeSummary(value: string): string {
  const redacted = value.replace(
    /(authorization|cookie|token|signature)(\s*[:=]\s*)[^\s,]+/gi,
    '$1$2[redacted]',
  )
  return redacted.length > MAX_SUMMARY_LENGTH
    ? `${redacted.slice(0, MAX_SUMMARY_LENGTH - 1)}…`
    : redacted
}

function sourceFromInput(input: unknown): 'human' | 'agent' {
  if (
    typeof input === 'object' &&
    input !== null &&
    'source' in input &&
    input.source === 'agent'
  )
    return 'agent'
  return 'human'
}

function findParentId(spec: AppSpec, nodeId: string): string | undefined {
  return Object.values(spec.nodes).find((node) =>
    node.children?.includes(nodeId),
  )?.id
}

function subtreeIds(spec: AppSpec, nodeId: string): string[] {
  const ids: string[] = []
  const visit = (id: string) => {
    const node = spec.nodes[id]
    if (!node) return
    ids.push(id)
    node.children?.forEach(visit)
  }
  visit(nodeId)
  return ids
}

function changedIds(before: AppSpec, after: AppSpec): string[] {
  const ids = new Set([
    ...Object.keys(before.nodes),
    ...Object.keys(after.nodes),
  ])
  return [...ids].filter(
    (id) =>
      JSON.stringify(before.nodes[id]) !== JSON.stringify(after.nodes[id]),
  )
}

export function createCommandRuntime(initialSpec: AppSpec): CommandRuntime {
  const initialValidation = validateAppSpec(initialSpec)
  if (!initialValidation.success) {
    throw new Error(
      `Cannot create runtime with invalid AppSpec: ${initialValidation.errors[0]?.message}`,
    )
  }

  const store = createInternalAppSpecStore(initialValidation.data)
  const listeners = new Set<() => void>()
  const history: AppSpec[] = []
  const pendingConfirmations = new Map<
    string,
    { nodeId: string; revision: number; affectedNodeIds: string[] }
  >()
  let activity: ActivityEntry[] = []
  let revision = 0
  let snapshot: RuntimeSnapshot = {
    spec: store.get(),
    activity,
    revision,
    historyDepth: 0,
  }
  let queue: Promise<void> = Promise.resolve()

  const publish = () => {
    snapshot = {
      spec: store.get(),
      activity,
      revision,
      historyDepth: history.length,
    }
    listeners.forEach((listener) => listener())
  }

  const record = (
    source: 'human' | 'agent',
    command: ActivityEntry['command'],
    result: CommandResult,
    summary: string,
  ) => {
    const entry: ActivityEntry = {
      id: result.commandId,
      source,
      command,
      status: result.success ? 'success' : 'failed',
      timestamp: new Date().toISOString(),
      summary,
      message: result.message,
      changedNodeIds: result.changedNodeIds,
    }
    entry.summary = safeSummary(entry.summary)
    activity = [entry, ...activity].slice(0, MAX_ACTIVITY)
  }

  const execute = async (input: unknown): Promise<CommandResult> => {
    const id = commandId()
    const parsed = commandSchema.safeParse(input)
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        path: issue.path.length ? `/${issue.path.map(String).join('/')}` : '/',
        code: issue.code,
        message: issue.message,
      }))
      const result = failure(
        id,
        'Command input is invalid',
        errors,
        history.length > 0,
      )
      record(
        sourceFromInput(input),
        'invalid',
        result,
        'Reject invalid command input',
      )
      publish()
      return result
    }

    const command = parsed.data
    const current = store.get()
    if (command.type === 'validate') {
      const validation = validateAppSpec(current)
      const result: CommandResult = validation.success
        ? {
            success: true,
            commandId: id,
            changedNodeIds: [],
            message: 'AppSpec is valid',
            undoAvailable: history.length > 0,
          }
        : failure(
            id,
            'AppSpec is invalid',
            validation.errors,
            history.length > 0,
          )
      record(command.source, command.type, result, summarize(command))
      publish()
      return result
    }

    if (command.type === 'undo') {
      const previous = history.pop()
      if (!previous) {
        const result = failure(
          id,
          'There is no committed change to undo',
          [
            {
              path: '/',
              code: 'empty_history',
              message: 'Undo history is empty',
            },
          ],
          false,
        )
        record(command.source, command.type, result, summarize(command))
        publish()
        return result
      }
      const currentBeforeUndo = store.get()
      store.commit(previous)
      revision += 1
      pendingConfirmations.clear()
      const result: CommandResult = {
        success: true,
        commandId: id,
        changedNodeIds: changedIds(currentBeforeUndo, previous),
        message: 'Last committed change was undone',
        undoAvailable: history.length > 0,
      }
      record(command.source, command.type, result, summarize(command))
      publish()
      return result
    }

    if (command.type === 'remove' && !command.confirmationToken) {
      if (!current.nodes[command.nodeId]) {
        const result = failure(
          id,
          'Node was not found',
          [
            {
              path: '/nodeId',
              code: 'unknown_id',
              message: `Unknown node ${command.nodeId}`,
            },
          ],
          history.length > 0,
        )
        record(command.source, command.type, result, summarize(command))
        publish()
        return result
      }
      if (command.nodeId === current.rootId) {
        const result = failure(
          id,
          'The root Page cannot be removed',
          [
            {
              path: '/nodeId',
              code: 'root_remove',
              message: 'Root Page cannot be removed',
            },
          ],
          history.length > 0,
        )
        record(command.source, command.type, result, summarize(command))
        publish()
        return result
      }
      const affectedNodeIds = subtreeIds(current, command.nodeId)
      const confirmationToken = commandId()
      pendingConfirmations.set(confirmationToken, {
        nodeId: command.nodeId,
        revision,
        affectedNodeIds,
      })
      const result: CommandResult = {
        success: false,
        commandId: id,
        changedNodeIds: [],
        affectedNodeIds,
        confirmationToken,
        message: `Confirm removal of ${affectedNodeIds.length} node(s)`,
        requiresConfirmation: true,
        undoAvailable: history.length > 0,
      }
      record(command.source, command.type, result, summarize(command))
      publish()
      return result
    }

    const draft =
      command.type === 'restore'
        ? structuredClone(command.spec)
        : structuredClone(current)
    let changedNodeIds: string[] = []
    let earlyFailure: CommandResult | undefined

    if (command.type === 'restore') {
      changedNodeIds = changedIds(current, draft)
    } else if (command.type === 'add') {
      const parent = draft.nodes[command.parentId]
      if (!parent) {
        earlyFailure = failure(
          id,
          'Parent node was not found',
          [
            {
              path: '/parentId',
              code: 'unknown_id',
              message: `Unknown node ${command.parentId}`,
            },
          ],
          history.length > 0,
        )
      } else if (
        !catalog[parent.type].allowedChildren.includes(
          command.componentType as never,
        )
      ) {
        earlyFailure = failure(
          id,
          `${parent.type} cannot contain ${command.componentType}`,
          [
            {
              path: '/componentType',
              code: 'invalid_child_type',
              message: `${parent.type} cannot contain ${command.componentType}`,
            },
          ],
          history.length > 0,
        )
      } else {
        const children = [...(parent.children ?? [])]
        const index = command.index ?? children.length
        if (index > children.length) {
          earlyFailure = failure(
            id,
            'Insert index is out of bounds',
            [
              {
                path: '/index',
                code: 'out_of_bounds',
                message: `Index must be between 0 and ${children.length}`,
              },
            ],
            history.length > 0,
          )
        } else {
          const nodeId = newNodeId(command.componentType, draft)
          draft.nodes[nodeId] = {
            id: nodeId,
            type: command.componentType,
            props: {
              ...catalog[command.componentType].defaults,
              ...command.props,
            },
            children: [],
          }
          children.splice(index, 0, nodeId)
          parent.children = children
          changedNodeIds = [command.parentId, nodeId]
        }
      }
    } else if (command.type === 'update') {
      const node = draft.nodes[command.nodeId]
      if (!node) {
        earlyFailure = failure(
          id,
          'Node was not found',
          [
            {
              path: '/nodeId',
              code: 'unknown_id',
              message: `Unknown node ${command.nodeId}`,
            },
          ],
          history.length > 0,
        )
      } else {
        node.props = { ...node.props, ...command.props }
        changedNodeIds = [command.nodeId]
      }
    } else if (command.type === 'move') {
      const node = draft.nodes[command.nodeId]
      const newParent = draft.nodes[command.newParentId]
      const oldParentId = findParentId(draft, command.nodeId)
      const oldParent = oldParentId ? draft.nodes[oldParentId] : undefined
      if (!node) {
        earlyFailure = failure(
          id,
          'Node was not found',
          [
            {
              path: '/nodeId',
              code: 'unknown_id',
              message: `Unknown node ${command.nodeId}`,
            },
          ],
          history.length > 0,
        )
      } else if (command.nodeId === draft.rootId) {
        earlyFailure = failure(
          id,
          'The root Page cannot be moved',
          [
            {
              path: '/nodeId',
              code: 'root_move',
              message: 'Root Page cannot be moved',
            },
          ],
          history.length > 0,
        )
      } else if (!newParent) {
        earlyFailure = failure(
          id,
          'New parent was not found',
          [
            {
              path: '/newParentId',
              code: 'unknown_id',
              message: `Unknown node ${command.newParentId}`,
            },
          ],
          history.length > 0,
        )
      } else if (
        subtreeIds(draft, command.nodeId).includes(command.newParentId)
      ) {
        earlyFailure = failure(
          id,
          'Move would create a cycle',
          [
            {
              path: '/newParentId',
              code: 'cycle',
              message: 'A node cannot move into its own subtree',
            },
          ],
          history.length > 0,
        )
      } else if (
        !catalog[newParent.type].allowedChildren.includes(node.type as never)
      ) {
        earlyFailure = failure(
          id,
          `${newParent.type} cannot contain ${node.type}`,
          [
            {
              path: '/newParentId',
              code: 'invalid_child_type',
              message: `${newParent.type} cannot contain ${node.type}`,
            },
          ],
          history.length > 0,
        )
      } else if (!oldParent) {
        earlyFailure = failure(
          id,
          'Current parent was not found',
          [
            {
              path: '/nodeId',
              code: 'orphan',
              message: 'Node has no current parent',
            },
          ],
          history.length > 0,
        )
      } else {
        oldParent.children = (oldParent.children ?? []).filter(
          (childId) => childId !== command.nodeId,
        )
        const targetChildren =
          oldParent.id === newParent.id
            ? [...(oldParent.children ?? [])]
            : [...(newParent.children ?? [])]
        if (command.index > targetChildren.length) {
          earlyFailure = failure(
            id,
            'Move index is out of bounds',
            [
              {
                path: '/index',
                code: 'out_of_bounds',
                message: `Index must be between 0 and ${targetChildren.length}`,
              },
            ],
            history.length > 0,
          )
        } else {
          targetChildren.splice(command.index, 0, command.nodeId)
          newParent.children = targetChildren
          changedNodeIds = [
            ...new Set([command.nodeId, oldParent.id, newParent.id]),
          ]
        }
      }
    } else if (command.type === 'remove') {
      const confirmation = pendingConfirmations.get(
        command.confirmationToken ?? '',
      )
      if (
        !confirmation ||
        confirmation.nodeId !== command.nodeId ||
        confirmation.revision !== revision
      ) {
        earlyFailure = failure(
          id,
          'Confirmation token is invalid or expired',
          [
            {
              path: '/confirmationToken',
              code: 'invalid_confirmation',
              message:
                'Request removal again to obtain a fresh confirmation token',
            },
          ],
          history.length > 0,
        )
      } else {
        pendingConfirmations.delete(command.confirmationToken ?? '')
        const parentId = findParentId(draft, command.nodeId)
        const parent = parentId ? draft.nodes[parentId] : undefined
        if (!parent) {
          earlyFailure = failure(
            id,
            'Parent node was not found',
            [
              {
                path: '/nodeId',
                code: 'orphan',
                message: 'Node has no parent',
              },
            ],
            history.length > 0,
          )
        } else {
          parent.children = (parent.children ?? []).filter(
            (childId) => childId !== command.nodeId,
          )
          confirmation.affectedNodeIds.forEach(
            (affectedId) => delete draft.nodes[affectedId],
          )
          changedNodeIds = [parent.id, ...confirmation.affectedNodeIds]
        }
      }
    }

    if (earlyFailure) {
      record(command.source, command.type, earlyFailure, summarize(command))
      publish()
      return earlyFailure
    }

    const validation = validateAppSpec(draft)
    if (!validation.success) {
      const result = failure(
        id,
        'Command would create an invalid AppSpec',
        validation.errors,
        history.length > 0,
      )
      record(command.source, command.type, result, summarize(command))
      publish()
      return result
    }

    history.push(current)
    if (history.length > MAX_HISTORY) history.shift()
    store.commit(validation.data)
    revision += 1
    pendingConfirmations.clear()
    const result: CommandResult = {
      success: true,
      commandId: id,
      changedNodeIds,
      message: `${command.type} committed`,
      undoAvailable: true,
    }
    record(command.source, command.type, result, summarize(command))
    publish()
    return result
  }

  const reset = async (spec: AppSpec): Promise<CommandResult> => {
    const id = commandId()
    const validation = validateAppSpec(spec)
    if (!validation.success)
      return failure(
        id,
        'Demo reset AppSpec is invalid',
        validation.errors,
        history.length > 0,
      )
    const current = store.get()
    store.commit(validation.data)
    history.splice(0)
    pendingConfirmations.clear()
    activity = []
    revision = 0
    const result: CommandResult = {
      success: true,
      commandId: id,
      changedNodeIds: changedIds(current, validation.data),
      message: 'Demo workspace reset',
      undoAvailable: false,
    }
    publish()
    return result
  }

  const enqueue = (task: () => Promise<CommandResult>) => {
    const pending = queue.then(task, task)
    queue = pending.then(
      () => undefined,
      () => undefined,
    )
    return pending
  }

  return {
    dispatch: (input) => enqueue(() => execute(input)),
    reset: (spec) => enqueue(() => reset(spec)),
    getSnapshot: () => snapshot,
    getSpec: () => store.get(),
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
