import { expect, type Page, test } from '@playwright/test'
import path from 'node:path'

const assets = path.resolve('docs/assets')

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
          descriptor: (typeof tools)[number],
          input: string,
        ) => Promise<string | null>
      }
      const raw = await executable.executeTool(tool, JSON.stringify(input))
      return raw ? JSON.parse(raw) : null
    },
    { name, input },
  )
}

test('capture three truthful submission screenshots', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('webmcp-status')).toHaveText(
    'WebMCP registered',
  )
  await page.getByRole('button', { name: 'Reset demo' }).click()
  await page.screenshot({ path: path.join(assets, 'workspace-overview.png') })

  await page.getByRole('button', { name: 'Card pipeline-card' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByRole('alertdialog')).toContainText('5 components')
  await page.screenshot({ path: path.join(assets, 'delete-confirmation.png') })
  await page.getByRole('button', { name: 'Cancel' }).click()

  await page.getByRole('button', { name: 'Text crm-intro' }).click()
  await page
    .getByRole('textbox', { name: 'Content' })
    .fill('Human prepared this CRM for the agent.')
  await page.getByRole('button', { name: 'Save properties' }).click()
  const added = await callNativeTool(page, 'add_component', {
    parentId: 'metrics-grid',
    componentType: 'Metric',
    props: { label: 'Agent forecast', value: '$525K' },
  })
  const nodeId = added.changedNodeIds.at(-1)
  await callNativeTool(page, 'update_component', {
    nodeId,
    props: { value: '$530K' },
  })
  await expect(page.getByLabel('Command activity')).toContainText('human')
  await expect(page.getByLabel('Command activity')).toContainText('agent')
  await expect(page.getByTestId('live-canvas')).toContainText('Agent forecast')
  await page.screenshot({ path: path.join(assets, 'shared-activity.png') })
})
