import { z } from 'zod'
import type { ComponentType } from '../spec/types'

type FieldKind = 'text' | 'number' | 'select'

export type CatalogEntry = {
  propsSchema: z.ZodType<Record<string, unknown>>
  defaults: Record<string, unknown>
  fields: Array<{ name: string; label: string; kind: FieldKind }>
  allowedChildren: readonly ComponentType[]
}

const containers = [
  'Stack',
  'Card',
  'Text',
  'Metric',
  'Button',
  'Input',
  'Select',
] as const
const stackChildren = [
  'Stack',
  'Card',
  'Text',
  'Metric',
  'Button',
  'Input',
  'Select',
] as const
const cardChildren = [
  'Stack',
  'Text',
  'Metric',
  'Button',
  'Input',
  'Select',
] as const

export const catalog = {
  Page: {
    propsSchema: z.object({ title: z.string().min(1).max(120) }).strict(),
    defaults: { title: 'Untitled app' },
    fields: [{ name: 'title', label: 'Title', kind: 'text' }],
    allowedChildren: containers,
  },
  Stack: {
    propsSchema: z
      .object({
        direction: z.enum(['row', 'column']),
        gap: z.number().int().min(0).max(48),
      })
      .strict(),
    defaults: { direction: 'column', gap: 16 },
    fields: [
      { name: 'direction', label: 'Direction', kind: 'select' },
      { name: 'gap', label: 'Gap', kind: 'number' },
    ],
    allowedChildren: stackChildren,
  },
  Card: {
    propsSchema: z.object({ title: z.string().max(120) }).strict(),
    defaults: { title: 'Card' },
    fields: [{ name: 'title', label: 'Title', kind: 'text' }],
    allowedChildren: cardChildren,
  },
  Text: {
    propsSchema: z
      .object({
        content: z.string().max(2000),
        tone: z.enum(['default', 'muted', 'accent']),
      })
      .strict(),
    defaults: { content: 'Text', tone: 'default' },
    fields: [
      { name: 'content', label: 'Content', kind: 'text' },
      { name: 'tone', label: 'Tone', kind: 'select' },
    ],
    allowedChildren: [],
  },
  Metric: {
    propsSchema: z
      .object({ label: z.string().max(80), value: z.string().max(80) })
      .strict(),
    defaults: { label: 'Metric', value: '0' },
    fields: [
      { name: 'label', label: 'Label', kind: 'text' },
      { name: 'value', label: 'Value', kind: 'text' },
    ],
    allowedChildren: [],
  },
  Button: {
    propsSchema: z
      .object({
        label: z.string().min(1).max(80),
        variant: z.enum(['primary', 'secondary']),
      })
      .strict(),
    defaults: { label: 'Button', variant: 'primary' },
    fields: [
      { name: 'label', label: 'Label', kind: 'text' },
      { name: 'variant', label: 'Variant', kind: 'select' },
    ],
    allowedChildren: [],
  },
  Input: {
    propsSchema: z
      .object({ label: z.string().max(80), placeholder: z.string().max(160) })
      .strict(),
    defaults: { label: 'Input', placeholder: '' },
    fields: [
      { name: 'label', label: 'Label', kind: 'text' },
      { name: 'placeholder', label: 'Placeholder', kind: 'text' },
    ],
    allowedChildren: [],
  },
  Select: {
    propsSchema: z
      .object({
        label: z.string().max(80),
        options: z.array(z.string().max(80)).min(1).max(20),
      })
      .strict(),
    defaults: { label: 'Select', options: ['Option'] },
    fields: [{ name: 'label', label: 'Label', kind: 'text' }],
    allowedChildren: [],
  },
} satisfies Record<ComponentType, CatalogEntry>
