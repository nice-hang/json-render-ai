import { expect, test } from '@playwright/test'

test('human vertical slice updates tree and real canvas within 500ms', async ({
  page,
}) => {
  const fatalErrors: string[] = []
  page.on('pageerror', (error) => fatalErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') fatalErrors.push(message.text())
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Components' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Canvas' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Properties' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Activity' })).toBeVisible()

  await page.getByRole('button', { name: /Text crm-intro/ }).click()
  await page
    .getByRole('textbox', { name: 'Content' })
    .fill('Human updated the CRM overview.')
  const updateStarted = Date.now()
  await page.getByRole('button', { name: 'Save text' }).click()
  await expect(
    page
      .getByTestId('live-canvas')
      .getByText('Human updated the CRM overview.'),
  ).toBeVisible()
  expect(Date.now() - updateStarted).toBeLessThan(500)

  await page.getByRole('textbox', { name: 'Label' }).fill('Forecast')
  await page.getByRole('textbox', { name: 'Value' }).fill('$510K')
  const addStarted = Date.now()
  await page.getByRole('button', { name: 'Add to metrics' }).click()
  await expect(
    page.getByTestId('live-canvas').getByText('Forecast'),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: /Metric metric-/ }),
  ).toBeVisible()
  expect(Date.now() - addStarted).toBeLessThan(500)
  await expect(page.getByLabel('Command activity')).toContainText('human')
  expect(fatalErrors).toEqual([])
})

test('WebMCP adapter contract reads the same current runtime state', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const tools: Array<Record<string, unknown>> = []
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: {
        registerTool: async (tool: Record<string, unknown>) => {
          tools.push(tool)
        },
        getTools: async () => tools,
      },
    })
  })
  await page.goto('/')
  await expect(page.getByTestId('webmcp-status')).toHaveText(
    'WebMCP registered',
  )
  const result = await page.evaluate(async () => {
    const tools = await document.modelContext?.getTools()
    const tool = tools?.find(
      (candidate) => candidate.name === 'describe_app',
    ) as unknown as { execute: (input: object) => Promise<unknown> }
    return {
      names: tools?.map((candidate) => candidate.name),
      described: await tool.execute({}),
    }
  })
  expect(result.names).toEqual([
    'describe_app',
    'list_components',
    'add_component',
    'update_component',
    'move_component',
    'remove_component',
    'validate_app',
    'undo_last_change',
  ])
  expect(result.described).toMatchObject({
    version: 1,
    rootId: 'crm-page',
    nodeCount: 15,
  })
})
