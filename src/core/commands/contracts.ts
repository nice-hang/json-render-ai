import { z } from 'zod'
import { componentTypes, type ValidationIssue } from '../spec/types'

const sourceSchema = z.enum(['human', 'agent'])

export const commandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('validate'), source: sourceSchema }).strict(),
  z
    .object({
      type: z.literal('add'),
      source: sourceSchema,
      parentId: z.string().min(1),
      componentType: z.enum(componentTypes),
      props: z.record(z.string(), z.unknown()).optional(),
      index: z.number().int().nonnegative().optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal('update'),
      source: sourceSchema,
      nodeId: z.string().min(1),
      props: z.record(z.string(), z.unknown()),
    })
    .strict(),
  z
    .object({
      type: z.literal('move'),
      source: sourceSchema,
      nodeId: z.string().min(1),
      newParentId: z.string().min(1),
      index: z.number().int().nonnegative(),
    })
    .strict(),
  z
    .object({
      type: z.literal('remove'),
      source: sourceSchema,
      nodeId: z.string().min(1),
      confirmationToken: z.string().min(1).optional(),
    })
    .strict(),
  z.object({ type: z.literal('undo'), source: sourceSchema }).strict(),
])

export type Command = z.infer<typeof commandSchema>

export type CommandResult = {
  success: boolean
  commandId: string
  changedNodeIds: string[]
  message: string
  requiresConfirmation?: boolean
  confirmationToken?: string
  affectedNodeIds?: string[]
  undoAvailable: boolean
  errors?: ValidationIssue[]
}
