import { useState } from 'react'
import {
  catalog,
  type AppNode,
  type CatalogField,
  type CommandRuntime,
} from '../../core'
import type { CommandResult } from '../../core'

type InspectorProps = {
  node: AppNode
  runtime: CommandRuntime
  onSelect: (id: string) => void
}

function inputValue(field: CatalogField, value: unknown): string {
  if (field.kind === 'text-list' && Array.isArray(value))
    return value.join('\n')
  return String(value ?? '')
}

function parentAndIndex(runtime: CommandRuntime, nodeId: string) {
  const spec = runtime.getSpec()
  const parent = Object.values(spec.nodes).find((candidate) =>
    candidate.children?.includes(nodeId),
  )
  return parent
    ? { parent, index: parent.children?.indexOf(nodeId) ?? -1 }
    : undefined
}

function resultError(result: CommandResult): string {
  const issue = result.errors?.[0]
  return issue ? `${issue.path}: ${issue.message}` : result.message
}

export function Inspector({ node, runtime, onSelect }: InspectorProps) {
  const fields = catalog[node.type].fields
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map((field) => [
        field.name,
        inputValue(field, node.props[field.name]),
      ]),
    ),
  )
  const [metricLabel, setMetricLabel] = useState('Forecast')
  const [metricValue, setMetricValue] = useState('$510K')
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState<{
    token: string
    affected: string[]
  }>()
  const location = parentAndIndex(runtime, node.id)

  const setField = (name: string, value: string) =>
    setValues((current) => ({ ...current, [name]: value }))

  const saveProperties = async () => {
    const props = Object.fromEntries(
      fields.map((field) => {
        const raw = values[field.name] ?? ''
        if (field.kind === 'number') return [field.name, Number(raw)]
        if (field.kind === 'text-list')
          return [
            field.name,
            raw
              .split(/[,\n]/)
              .map((item) => item.trim())
              .filter(Boolean),
          ]
        return [field.name, raw]
      }),
    )
    const result = await runtime.dispatch({
      type: 'update',
      source: 'human',
      nodeId: node.id,
      props,
    })
    setError(result.success ? '' : resultError(result))
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
    } else setError(resultError(result))
  }

  const move = async (index: number) => {
    if (!location) return
    const result = await runtime.dispatch({
      type: 'move',
      source: 'human',
      nodeId: node.id,
      newParentId: location.parent.id,
      index,
    })
    setError(result.success ? '' : resultError(result))
  }

  const requestRemove = async () => {
    const result = await runtime.dispatch({
      type: 'remove',
      source: 'human',
      nodeId: node.id,
    })
    if (
      result.requiresConfirmation &&
      result.confirmationToken &&
      result.affectedNodeIds
    ) {
      setConfirmation({
        token: result.confirmationToken,
        affected: result.affectedNodeIds,
      })
      setError('')
    } else setError(resultError(result))
  }

  const confirmRemove = async () => {
    if (!confirmation) return
    const fallbackId = location?.parent.id
    const result = await runtime.dispatch({
      type: 'remove',
      source: 'human',
      nodeId: node.id,
      confirmationToken: confirmation.token,
    })
    if (result.success) {
      setConfirmation(undefined)
      if (fallbackId) onSelect(fallbackId)
    } else setError(resultError(result))
  }

  return (
    <div className="inspector" data-testid="property-inspector">
      <div className="selection-card">
        <span className="node-badge">{node.type}</span>
        <strong>{node.id}</strong>
      </div>
      <form
        className="field-stack"
        aria-label="Selected component properties"
        onSubmit={(event) => {
          event.preventDefault()
          void saveProperties()
        }}
      >
        {fields.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
            {field.kind === 'select' ? (
              <select
                value={values[field.name] ?? ''}
                onChange={(event) => setField(field.name, event.target.value)}
              >
                {field.options?.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : field.name === 'content' || field.kind === 'text-list' ? (
              <textarea
                value={values[field.name] ?? ''}
                onChange={(event) => setField(field.name, event.target.value)}
                rows={field.kind === 'text-list' ? 3 : 4}
              />
            ) : (
              <input
                type={field.kind === 'number' ? 'number' : 'text'}
                value={values[field.name] ?? ''}
                onChange={(event) => setField(field.name, event.target.value)}
              />
            )}
          </label>
        ))}
        <button type="submit" className="primary-action">
          Save properties
        </button>
      </form>
      {location ? (
        <div className="structure-actions">
          <span className="section-kicker">Structure</span>
          <div>
            <button
              type="button"
              disabled={location.index <= 0}
              onClick={() => void move(location.index - 1)}
            >
              Move up
            </button>
            <button
              type="button"
              disabled={
                location.index >= (location.parent.children?.length ?? 0) - 1
              }
              onClick={() => void move(location.index + 1)}
            >
              Move down
            </button>
            <button
              type="button"
              className="danger-action"
              onClick={() => void requestRemove()}
            >
              Delete
            </button>
          </div>
        </div>
      ) : null}
      {confirmation ? (
        <div className="confirmation-card" role="alertdialog" aria-modal="true">
          <strong>Delete {node.id}?</strong>
          <p>
            This removes {confirmation.affected.length} component
            {confirmation.affected.length === 1 ? '' : 's'}, including its
            descendants.
          </p>
          <div>
            <button type="button" onClick={() => setConfirmation(undefined)}>
              Cancel
            </button>
            <button
              type="button"
              className="danger-action"
              onClick={() => void confirmRemove()}
            >
              Confirm delete
            </button>
          </div>
        </div>
      ) : null}
      {runtime.getSpec().nodes['metrics-grid'] ? (
        <>
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
        </>
      ) : null}
      {error ? (
        <p className="inline-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
