export const componentTypes = [
  'Page',
  'Stack',
  'Card',
  'Text',
  'Metric',
  'Button',
  'Input',
  'Select',
] as const

export type ComponentType = (typeof componentTypes)[number]

export type AppNode = {
  id: string
  type: ComponentType
  props: Record<string, unknown>
  children?: string[]
}

export type AppSpec = {
  version: 1
  rootId: string
  nodes: Record<string, AppNode>
}

export type ValidationIssue = {
  path: string
  code: string
  message: string
}
