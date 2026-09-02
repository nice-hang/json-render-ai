import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../../App'
import { createCommandRuntime } from '../../core'
import { crmSpec } from '../../templates'

describe('human vertical slice', () => {
  it('updates Text and adds Metric through the shared Command Runtime', async () => {
    const runtime = createCommandRuntime(crmSpec)
    render(<App runtime={runtime} />)

    const canvas = screen.getByTestId('live-canvas')
    expect(within(canvas).getByText('Northstar CRM')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Text crm-intro/ }))
    const content = screen.getByRole('textbox', { name: 'Content' })
    fireEvent.change(content, {
      target: { value: 'Human updated the CRM overview.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save properties' }))

    expect(
      await within(canvas).findByText('Human updated the CRM overview.'),
    ).toBeInTheDocument()
    expect(runtime.getSnapshot()).toMatchObject({
      revision: 1,
      historyDepth: 1,
    })

    fireEvent.change(screen.getByRole('textbox', { name: 'Label' }), {
      target: { value: 'Forecast' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Value' }), {
      target: { value: '$510K' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add to metrics' }))

    expect(await within(canvas).findByText('Forecast')).toBeInTheDocument()
    expect(within(canvas).getByText('$510K')).toBeInTheDocument()
    expect(runtime.getSnapshot()).toMatchObject({
      revision: 2,
      historyDepth: 2,
    })
    expect(screen.getByLabelText('Command activity')).toHaveTextContent(
      /human.*update.*success/s,
    )
  })

  it('shows Catalog fields for all eight component types', () => {
    const runtime = createCommandRuntime(crmSpec)
    render(<App runtime={runtime} />)
    const cases = [
      ['Page crm-page', ['Title']],
      ['Stack metrics-grid', ['Direction', 'Gap']],
      ['Card revenue-card', ['Title']],
      ['Text crm-intro', ['Content', 'Tone']],
      ['Metric revenue-metric', ['Label', 'Value']],
      ['Button apply-button', ['Label', 'Variant']],
      ['Input search-input', ['Label', 'Placeholder']],
      ['Select stage-select', ['Label', 'Options']],
    ] as const
    for (const [nodeName, labels] of cases) {
      fireEvent.click(screen.getByRole('button', { name: nodeName }))
      const inspector = screen.getByRole('form', {
        name: 'Selected component properties',
      })
      for (const label of labels)
        expect(within(inspector).getByLabelText(label)).toBeInTheDocument()
    }
  })

  it('rejects invalid properties inline without changing the canvas', async () => {
    const runtime = createCommandRuntime(crmSpec)
    const before = structuredClone(runtime.getSpec())
    render(<App runtime={runtime} />)
    fireEvent.click(screen.getByRole('button', { name: 'Stack metrics-grid' }))
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Gap' }), {
      target: { value: '99' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save properties' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '/nodes/metrics-grid/props/gap',
    )
    expect(runtime.getSpec()).toEqual(before)
    expect(runtime.getSnapshot().revision).toBe(0)
  })

  it('cancels, confirms, and undoes a recursive delete', async () => {
    const runtime = createCommandRuntime(crmSpec)
    const before = structuredClone(runtime.getSpec())
    render(<App runtime={runtime} />)
    fireEvent.click(screen.getByRole('button', { name: 'Card pipeline-card' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(await screen.findByRole('alertdialog')).toHaveTextContent(
      '5 components',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(runtime.getSpec()).toEqual(before)
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Confirm delete' }),
    )
    expect(
      await screen.findByRole('button', { name: 'Stack crm-layout' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(runtime.getSpec().nodes['pipeline-card']).toBeUndefined()
    fireEvent.click(screen.getByRole('button', { name: 'Undo (1)' }))
    expect(
      await screen.findByRole('button', { name: 'Card pipeline-card' }),
    ).toBeInTheDocument()
    expect(runtime.getSpec()).toEqual(before)
  })

  it('shows WebMCP loading and registration error states without crashing', async () => {
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: {
        registerTool: vi.fn(async () => {
          throw new Error('registration unavailable')
        }),
      },
    })
    try {
      render(<App runtime={createCommandRuntime(crmSpec)} />)
      expect(screen.getByTestId('webmcp-status')).toHaveTextContent(
        'WebMCP checking',
      )
      expect(await screen.findByText('WebMCP error')).toBeInTheDocument()
      expect(screen.getByTestId('live-canvas')).toHaveTextContent(
        'Northstar CRM',
      )
    } finally {
      Reflect.deleteProperty(document, 'modelContext')
    }
  })
})
