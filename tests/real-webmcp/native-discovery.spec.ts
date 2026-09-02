import { expect, type Page, test } from '@playwright/test'

const expectedTools = [
  'add_component',
  'describe_app',
  'list_components',
  'move_component',
  'remove_component',
  'undo_last_change',
  'update_component',
  'validate_app',
]

async function callNativeTool(
  page: Page,
  name: string,
  input: Record<string, unknown> = {},
) {
  return page.evaluate(
    async ({ name, input }) => {
      const context = document.modelContext
      if (!context) throw new Error('document.modelContext is unavailable')
      const tools = await context.getTools()
      const tool = tools.find((candidate) => candidate.name === name)
      if (!tool) throw new Error(`${name} was not discovered`)
      const executable = context as typeof context & {
        executeTool: (
          tool: (typeof tools)[number],
          input: string,
        ) => Promise<string | null>
      }
      if (typeof executable.executeTool !== 'function')
        throw new Error('Native executeTool testing interface is unavailable')
      const raw = await executable.executeTool(tool, JSON.stringify(input))
      return raw ? JSON.parse(raw) : null
    },
    { name, input },
  )
}

async function runCompetitionDemo(page: Page, rehearsal: number) {
  const started = Date.now()
  const fatalErrors: string[] = []
  page.on('pageerror', (error) => fatalErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') fatalErrors.push(message.text())
  })
  await page.goto('./')
  await expect(page.getByTestId('webmcp-status')).toHaveText(
    'WebMCP registered',
  )

  const metadata = await page.evaluate(async () => {
    const tools = await document.modelContext?.getTools()
    return tools?.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }))
  })
  expect(metadata?.map((tool) => tool.name).sort()).toEqual(expectedTools)
  for (const tool of metadata ?? []) {
    expect(tool.description.length).toBeGreaterThan(20)
    expect(tool.inputSchema).toBeDefined()
  }

  await page.getByRole('button', { name: 'Reset demo' }).click()
  await expect(page.getByText('Revision 0')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Undo (0)' })).toBeDisabled()

  await page.getByRole('button', { name: 'Text crm-intro' }).click()
  await page
    .getByRole('textbox', { name: 'Content' })
    .fill('Human prepared this CRM for the agent.')
  await page.getByRole('button', { name: 'Save properties' }).click()
  await expect(
    page
      .getByTestId('live-canvas')
      .getByText('Human prepared this CRM for the agent.'),
  ).toBeVisible()

  const described = await callNativeTool(page, 'describe_app')
  expect(described).toMatchObject({
    version: 1,
    rootId: 'crm-page',
    nodeCount: 15,
    revision: 1,
  })
  const listed = await callNativeTool(page, 'list_components')
  expect(listed.components).toHaveLength(15)

  const added = await callNativeTool(page, 'add_component', {
    parentId: 'metrics-grid',
    componentType: 'Metric',
    props: { label: 'Agent forecast', value: '$525K' },
  })
  expect(added.success).toBe(true)
  const agentNodeId = added.changedNodeIds.at(-1)
  await expect(
    page.getByTestId('live-canvas').getByText('Agent forecast'),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: `Metric ${agentNodeId}` }),
  ).toBeVisible()

  const updated = await callNativeTool(page, 'update_component', {
    nodeId: agentNodeId,
    props: { value: '$530K' },
  })
  expect(updated.success).toBe(true)
  await expect(page.getByTestId('live-canvas').getByText('$530K')).toBeVisible()

  const moved = await callNativeTool(page, 'move_component', {
    nodeId: agentNodeId,
    newParentId: 'metrics-grid',
    index: 0,
  })
  expect(moved.success).toBe(true)
  const afterMove = await callNativeTool(page, 'list_components')
  expect(
    afterMove.components.find(
      (node: { id: string }) => node.id === 'metrics-grid',
    ).children[0],
  ).toBe(agentNodeId)

  await page.getByRole('button', { name: `Metric ${agentNodeId}` }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByRole('alertdialog')).toContainText('1 component')
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(
    page.getByTestId('live-canvas').getByText('Agent forecast'),
  ).toBeVisible()

  const preview = await callNativeTool(page, 'remove_component', {
    nodeId: agentNodeId,
  })
  expect(preview).toMatchObject({
    success: false,
    requiresConfirmation: true,
    affectedNodeIds: [agentNodeId],
  })
  await expect(
    page.getByTestId('live-canvas').getByText('Agent forecast'),
  ).toBeVisible()

  const removed = await callNativeTool(page, 'remove_component', {
    nodeId: agentNodeId,
    confirmationToken: preview.confirmationToken,
  })
  expect(removed.success).toBe(true)
  await expect(
    page.getByTestId('live-canvas').getByText('Agent forecast'),
  ).toHaveCount(0)

  const undone = await callNativeTool(page, 'undo_last_change')
  expect(undone.success).toBe(true)
  await expect(
    page.getByTestId('live-canvas').getByText('Agent forecast'),
  ).toBeVisible()
  const validated = await callNativeTool(page, 'validate_app')
  expect(validated.success).toBe(true)

  await expect(page.getByLabel('Command activity')).toContainText('human')
  await expect(page.getByLabel('Command activity')).toContainText('agent')
  expect(fatalErrors).toEqual([])
  const elapsedMs = Date.now() - started
  expect(elapsedMs).toBeLessThan(180_000)
  console.log(`REHEARSAL ${rehearsal}: ${elapsedMs}ms, passed`)
  return elapsedMs
}

test('competition demo succeeds 3 consecutive times through native WebMCP', async ({
  browser,
}) => {
  expect(browser.browserType().name()).toBe('chromium')
  const durations: number[] = []
  for (let rehearsal = 1; rehearsal <= 3; rehearsal += 1) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    })
    try {
      durations.push(
        await runCompetitionDemo(await context.newPage(), rehearsal),
      )
    } finally {
      await context.close()
    }
  }
  expect(durations).toHaveLength(3)
})
