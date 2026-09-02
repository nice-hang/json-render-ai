import { defineCatalog } from '@json-render/core'
import { schema } from '@json-render/react/schema'
import { catalog } from '../../core'

export const jsonRenderCatalog = defineCatalog(schema, {
  components: {
    Page: {
      props: catalog.Page.propsSchema,
      slots: ['default'],
      description: 'Root application page',
    },
    Stack: {
      props: catalog.Stack.propsSchema,
      slots: ['default'],
      description: 'Row or column layout',
    },
    Card: {
      props: catalog.Card.propsSchema,
      slots: ['default'],
      description: 'Titled content card',
    },
    Text: {
      props: catalog.Text.propsSchema,
      slots: [],
      description: 'Text content',
    },
    Metric: {
      props: catalog.Metric.propsSchema,
      slots: [],
      description: 'Labelled metric value',
    },
    Button: {
      props: catalog.Button.propsSchema,
      slots: [],
      description: 'Action button',
    },
    Input: {
      props: catalog.Input.propsSchema,
      slots: [],
      description: 'Labelled text input',
    },
    Select: {
      props: catalog.Select.propsSchema,
      slots: [],
      description: 'Labelled select input',
    },
  },
  actions: {},
})
