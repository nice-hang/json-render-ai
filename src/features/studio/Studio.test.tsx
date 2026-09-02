import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
    fireEvent.click(screen.getByRole('button', { name: 'Save text' }))

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
})
