import { useState } from 'react'
import { catalog, type AppNode, type CommandRuntime } from '../../core'

type InspectorProps = {
  node: AppNode
  runtime: CommandRuntime
  onSelect: (id: string) => void
}

export function Inspector({ node, runtime, onSelect }: InspectorProps) {
  const [textValue, setTextValue] = useState(() =>
    node.type === 'Text' ? String(node.props.content ?? '') : '',
  )
  const [metricLabel, setMetricLabel] = useState('Forecast')
  const [metricValue, setMetricValue] = useState('$510K')
  const [error, setError] = useState('')

  const saveText = async () => {
    const result = await runtime.dispatch({
      type: 'update',
      source: 'human',
      nodeId: node.id,
      props: { content: textValue },
    })
    setError(
      result.success ? '' : (result.errors?.[0]?.message ?? result.message),
    )
  }

  const addMetric = async () => {
    const result = await runtime.dispatch({
      type: 'add',
      source: 'human',
      parentId: 'metrics-grid',
      componentType: 'Metric',
      props: { label: metricLabel, value: metricValue },
    })
    if (result.success) {
      const addedId = result.changedNodeIds.at(-1)
      if (addedId) onSelect(addedId)
      setError('')
    } else setError(result.errors?.[0]?.message ?? result.message)
  }

  return (
    <div className="inspector" data-testid="property-inspector">
      <div className="selection-card">
        <span className="node-badge">{node.type}</span>
        <strong>{node.id}</strong>
      </div>
      {node.type === 'Text' ? (
        <form
          className="field-stack"
          onSubmit={(event) => {
            event.preventDefault()
            void saveText()
          }}
        >
          <label>
            <span>Content</span>
            <textarea
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              rows={4}
            />
          </label>
          <button type="submit" className="primary-action">
            Save text
          </button>
        </form>
      ) : (
        <div className="prop-list">
          {catalog[node.type].fields.map((field) => (
            <div key={field.name}>
              <span>{field.label}</span>
              <code>{JSON.stringify(node.props[field.name])}</code>
            </div>
          ))}
        </div>
      )}
      <div className="inspector-divider" />
      <form
        className="field-stack"
        onSubmit={(event) => {
          event.preventDefault()
          void addMetric()
        }}
      >
        <div>
          <span className="section-kicker">Quick add</span>
          <h3>New metric</h3>
        </div>
        <label>
          <span>Label</span>
          <input
            value={metricLabel}
            onChange={(event) => setMetricLabel(event.target.value)}
          />
        </label>
        <label>
          <span>Value</span>
          <input
            value={metricValue}
            onChange={(event) => setMetricValue(event.target.value)}
          />
        </label>
        <button type="submit" className="secondary-action">
          Add to metrics
        </button>
      </form>
      {error ? (
        <p className="inline-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
