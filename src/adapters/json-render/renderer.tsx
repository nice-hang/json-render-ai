import { defineRegistry, JSONUIProvider, Renderer } from '@json-render/react'
import type { AppSpec } from '../../core'
import { toJsonRenderSpec } from './adapter'
import { jsonRenderCatalog } from './catalog'

const { registry } = defineRegistry(jsonRenderCatalog, {
  components: {
    Page: ({ props, children }) => (
      <main className="render-page" data-component="Page">
        <header className="render-page__header">
          <span className="eyebrow">Live AppSpec</span>
          <h1>{props.title}</h1>
        </header>
        {children}
      </main>
    ),
    Stack: ({ props, children }) => (
      <div
        className={`render-stack render-stack--${props.direction}`}
        style={{ gap: `${props.gap}px` }}
        data-component="Stack"
      >
        {children}
      </div>
    ),
    Card: ({ props, children }) => (
      <section className="render-card" data-component="Card">
        <h2>{props.title}</h2>
        {children}
      </section>
    ),
    Text: ({ props }) => (
      <p
        className={`render-text render-text--${props.tone}`}
        data-component="Text"
      >
        {props.content}
      </p>
    ),
    Metric: ({ props }) => (
      <div className="render-metric" data-component="Metric">
        <span>{props.label}</span>
        <strong>{props.value}</strong>
      </div>
    ),
    Button: ({ props }) => (
      <button
        className={`render-button render-button--${props.variant}`}
        type="button"
        data-component="Button"
      >
        {props.label}
      </button>
    ),
    Input: ({ props }) => (
      <label className="render-field" data-component="Input">
        <span>{props.label}</span>
        <input placeholder={props.placeholder} readOnly />
      </label>
    ),
    Select: ({ props }) => (
      <label className="render-field" data-component="Select">
        <span>{props.label}</span>
        <select defaultValue="">
          <option value="" disabled>
            Choose…
          </option>
          {props.options.map((option: string) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    ),
  },
})

export function JsonRenderCanvas({ spec }: { spec: AppSpec }) {
  return (
    <JSONUIProvider registry={registry}>
      <Renderer spec={toJsonRenderSpec(spec)} registry={registry} />
    </JSONUIProvider>
  )
}
