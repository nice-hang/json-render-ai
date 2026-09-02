import type { AppSpec } from '../core'

export const spikeSpec: AppSpec = {
  version: 1,
  rootId: 'page',
  nodes: {
    page: {
      id: 'page',
      type: 'Page',
      props: { title: 'WebMCP Builder' },
      children: ['stack'],
    },
    stack: {
      id: 'stack',
      type: 'Stack',
      props: { direction: 'column', gap: 16 },
      children: ['welcome'],
    },
    welcome: {
      id: 'welcome',
      type: 'Text',
      props: { content: 'json-render is live', tone: 'accent' },
      children: [],
    },
  },
}
