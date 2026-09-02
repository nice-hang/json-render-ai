import { expect, test } from '@playwright/test'

test('property inspector rejects invalid input and delete requires confirmation', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Stack metrics-grid' }).click()
  await page.getByRole('spinbutton', { name: 'Gap' }).fill('99')
  await page.getByRole('button', { name: 'Save properties' }).click()
  await expect(page.getByRole('alert')).toContainText(
    '/nodes/metrics-grid/props/gap',
  )
  await expect(page.getByText('Revision 0')).toBeVisible()

  await page.getByRole('button', { name: 'Card pipeline-card' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByRole('alertdialog')).toContainText('5 components')
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(
    page.getByRole('button', { name: 'Card pipeline-card' }),
  ).toBeVisible()
  await expect(page.getByText('Revision 0')).toBeVisible()

  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm delete' }).click()
  await expect(
    page.getByRole('button', { name: 'Card pipeline-card' }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Stack crm-layout' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Undo (1)' }).click()
  await expect(
    page.getByRole('button', { name: 'Card pipeline-card' }),
  ).toBeVisible()
})

test('refresh restores the last valid AppSpec', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Text crm-intro' }).click()
  await page
    .getByRole('textbox', { name: 'Content' })
    .fill('Persisted across a browser refresh.')
  await page.getByRole('button', { name: 'Save properties' }).click()
  await expect(
    page
      .getByTestId('live-canvas')
      .getByText('Persisted across a browser refresh.'),
  ).toBeVisible()
  await page.waitForTimeout(150)
  await page.reload()
  await expect(
    page
      .getByTestId('live-canvas')
      .getByText('Persisted across a browser refresh.'),
  ).toBeVisible()
})

test('human move uses the shared Runtime and updates component order', async ({
  page,
}) => {
  await page.goto('/')
  const treeButtons = page
    .getByLabel('AppSpec component tree')
    .getByRole('button')
  const labels = () =>
    treeButtons.evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute('aria-label')),
    )
  const before = await labels()
  expect(before.indexOf('Card revenue-card')).toBeLessThan(
    before.indexOf('Card deals-card'),
  )
  await page.getByRole('button', { name: 'Card deals-card' }).click()
  await page.getByRole('button', { name: 'Move up' }).click()
  await expect(page.getByText('Revision 1')).toBeVisible()
  const after = await labels()
  expect(after.indexOf('Card deals-card')).toBeLessThan(
    after.indexOf('Card revenue-card'),
  )
})

test('20 step undo restores the original AppSpec through the human UI', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Text crm-intro' }).click()
  const content = page.getByRole('textbox', { name: 'Content' })
  const original = await content.inputValue()
  for (let index = 1; index <= 20; index += 1) {
    await content.fill(`Human undo step ${index}`)
    await page.getByRole('button', { name: 'Save properties' }).click()
    await expect(
      page.getByRole('button', { name: `Undo (${index})` }),
    ).toBeVisible()
  }
  for (let depth = 20; depth >= 1; depth -= 1) {
    await page.getByRole('button', { name: `Undo (${depth})` }).click()
  }
  await expect(content).toHaveValue(original)
  await expect(page.getByRole('button', { name: 'Undo (0)' })).toBeDisabled()
})

test('damaged storage is preserved until explicit template recovery', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('json-render-ai:last-valid-app-spec', '{damaged')
  })
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText(
    'Saved workspace needs recovery',
  )
  await expect(page.getByTestId('live-canvas')).toContainText('Northstar CRM')
  await page.waitForTimeout(150)
  expect(
    await page.evaluate(() =>
      localStorage.getItem('json-render-ai:last-valid-app-spec'),
    ),
  ).toBe('{damaged')

  await page.getByRole('button', { name: 'Restore blank' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByTestId('live-canvas')).toContainText('Blank workspace')
  expect(
    await page.evaluate(() =>
      localStorage.getItem('json-render-ai:last-valid-app-spec'),
    ),
  ).toContain('"rootId":"page"')
})
