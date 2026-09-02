import { expect, test } from '@playwright/test'

test('Reset Demo restores the deterministic CRM fixture', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Text crm-intro' }).click()
  await page
    .getByRole('textbox', { name: 'Content' })
    .fill('Temporary rehearsal state')
  await page.getByRole('button', { name: 'Save properties' }).click()
  await expect(page.getByText('Revision 1')).toBeVisible()

  await page.getByRole('button', { name: 'Reset demo' }).click()
  await expect(page.getByText('Revision 0')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Undo (0)' })).toBeDisabled()
  await expect(page.getByLabel('Command activity')).toHaveCount(0)
  await expect(page.getByText('Commands from people and agents')).toBeVisible()
  await expect(page.getByText('Northstar CRM')).toBeVisible()
  await expect(page.getByText('Good morning, Maya.')).toBeVisible()
  await expect(
    page.getByLabel('AppSpec component tree').getByRole('button'),
  ).toHaveCount(15)
})

test('studio clarity and keyboard focus pass at 1280x720', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/')
  for (const heading of ['Components', 'Canvas', 'Properties', 'Activity'])
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()

  const regions = await page
    .locator('.tree-panel, .canvas-panel, .inspector-panel, .log-panel')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
        }
      }),
    )
  expect(regions).toHaveLength(4)
  expect(
    regions.every(
      (region) =>
        region.left >= 0 &&
        region.top >= 0 &&
        region.right <= 1280 &&
        region.bottom <= 720,
    ),
  ).toBe(true)

  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeFocused()
  const outline = await page
    .getByRole('button', { name: 'Reset demo' })
    .evaluate((element) => getComputedStyle(element).outlineStyle)
  expect(outline).not.toBe('none')
})

test('cyclic Agent move fails atomically in the adapter E2E fixture', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const tools: Array<Record<string, unknown>> = []
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: {
        registerTool: async (tool: Record<string, unknown>) => tools.push(tool),
        getTools: async () => tools,
      },
    })
  })
  await page.goto('/')
  const result = await page.evaluate(async () => {
    const tools = await document.modelContext?.getTools()
    const move = tools?.find(
      (tool) => tool.name === 'move_component',
    ) as unknown as {
      execute: (input: Record<string, unknown>) => Promise<unknown>
    }
    return move.execute({
      nodeId: 'crm-layout',
      newParentId: 'filter-row',
      index: 0,
    })
  })
  expect(result).toMatchObject({
    success: false,
    changedNodeIds: [],
    errors: [{ path: '/newParentId', code: 'cycle' }],
  })
  await expect(page.getByText('Revision 0')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Stack crm-layout' }),
  ).toBeVisible()
})
