import type { AppSpec } from '../core'

export const blankSpec: AppSpec = {
  version: 1,
  rootId: 'page',
  nodes: {
    page: {
      id: 'page',
      type: 'Page',
      props: { title: 'Blank workspace' },
      children: ['content'],
    },
    content: {
      id: 'content',
      type: 'Stack',
      props: { direction: 'column', gap: 16 },
      children: ['empty-message'],
    },
    'empty-message': {
      id: 'empty-message',
      type: 'Text',
      props: { content: 'Select a component to begin.', tone: 'muted' },
      children: [],
    },
  },
}
