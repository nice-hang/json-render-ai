import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import { chromium } from '@playwright/test'

const demoUrl = process.env.DEMO_URL ?? 'http://127.0.0.1:4173/'
const outputPath = resolve(
  process.env.DEMO_VIDEO_OUTPUT ??
    'deliverables/.work/json-render-ai-demo-silent.webm',
)

await mkdir(dirname(outputPath), { recursive: true })

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: [
    '--enable-experimental-web-platform-features',
    '--enable-features=WebMCPTesting,DevToolsWebMCPSupport',
  ],
})

const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: {
    dir: dirname(outputPath),
    size: { width: 1280, height: 720 },
  },
})

const page = await context.newPage()
const video = page.video()
const fatalErrors = []

page.on('pageerror', (error) => fatalErrors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') fatalErrors.push(message.text())
})

const wait = (milliseconds) => page.waitForTimeout(milliseconds)

async function caption(title, detail) {
  await page.evaluate(
    ({ title, detail }) => {
      let overlay = document.querySelector('#recording-caption')
      if (!overlay) {
        overlay = document.createElement('aside')
        overlay.id = 'recording-caption'
        overlay.setAttribute('aria-live', 'polite')
        Object.assign(overlay.style, {
          position: 'fixed',
          zIndex: '2147483647',
          left: '50%',
          bottom: '18px',
          transform: 'translateX(-50%)',
          width: 'min(720px, calc(100vw - 48px))',
          padding: '10px 16px',
          border: '1px solid rgba(93, 210, 255, 0.8)',
          borderRadius: '12px',
          background: 'rgba(8, 17, 27, 0.94)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
          color: '#f7fbff',
          font: '500 14px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace',
          pointerEvents: 'none',
          textAlign: 'center',
        })
        document.body.append(overlay)
      }
      overlay.replaceChildren()
      const heading = document.createElement('strong')
      heading.textContent = title
      heading.style.color = '#5dd2ff'
      const description = document.createElement('span')
      description.textContent = ` — ${detail}`
      overlay.append(heading, description)
    },
    { title, detail },
  )
}

async function callNativeTool(name, input = {}) {
  return page.evaluate(
    async ({ name, input }) => {
      const modelContext = document.modelContext
      if (!modelContext) throw new Error('document.modelContext is unavailable')
      const tools = await modelContext.getTools()
      const tool = tools.find((candidate) => candidate.name === name)
      if (!tool) throw new Error(`${name} was not discovered`)
      if (typeof modelContext.executeTool !== 'function')
        throw new Error('Native executeTool testing interface is unavailable')
      const raw = await modelContext.executeTool(tool, JSON.stringify(input))
      return raw ? JSON.parse(raw) : null
    },
    { name, input },
  )
}

try {
  await page.goto(demoUrl)
  await page.getByTestId('webmcp-status').waitFor()
  await caption('SHARED WORKSPACE', 'Human UI + native WebMCP + one AppSpec')
  await wait(8_000)

  await page.getByRole('button', { name: 'Reset demo' }).click()
  await caption('RESET DEMO', 'Deterministic 15-node Northstar CRM')
  await wait(10_000)

  await page.getByRole('button', { name: 'Text crm-intro' }).click()
  await page
    .getByRole('textbox', { name: 'Content' })
    .fill('Human prepared this CRM for the agent.')
  await caption(
    'HUMAN UPDATE',
    'The visible inspector dispatches Runtime.update',
  )
  await wait(5_000)
  await page.getByRole('button', { name: 'Save properties' }).click()
  await page
    .getByTestId('live-canvas')
    .getByText('Human prepared this CRM for the agent.')
    .waitFor()
  await caption(
    'REVISION 1',
    'Canvas, tree, Undo, persistence, and Activity synchronize',
  )
  await wait(10_000)

  const discovered = await page.evaluate(async () =>
    (await document.modelContext.getTools()).map((tool) => tool.name).sort(),
  )
  if (discovered.length !== 8) throw new Error('Expected exactly eight tools')
  await caption('NATIVE WEBMCP DISCOVERY', discovered.join(' · '))
  await wait(9_000)

  const described = await callNativeTool('describe_app')
  await caption(
    'AGENT → describe_app',
    `${described.nodeCount} stable nodes at revision ${described.revision}`,
  )
  await wait(6_000)
  const listed = await callNativeTool('list_components')
  await caption(
    'AGENT → list_components',
    `${listed.components.length} nodes; state unchanged`,
  )
  await wait(6_000)

  const added = await callNativeTool('add_component', {
    parentId: 'metrics-grid',
    componentType: 'Metric',
    props: { label: 'Agent forecast', value: '$525K' },
  })
  const agentNodeId = added.changedNodeIds.at(-1)
  await page.getByTestId('live-canvas').getByText('Agent forecast').waitFor()
  await caption(
    'AGENT → add_component',
    `${agentNodeId} appears on the real json-render canvas`,
  )
  await wait(8_000)

  await callNativeTool('update_component', {
    nodeId: agentNodeId,
    props: { value: '$530K' },
  })
  await page.getByTestId('live-canvas').getByText('$530K').waitFor()
  await caption('AGENT → update_component', `${agentNodeId}.value = $530K`)
  await wait(7_000)

  await callNativeTool('move_component', {
    nodeId: agentNodeId,
    newParentId: 'metrics-grid',
    index: 0,
  })
  await caption(
    'AGENT → move_component',
    `${agentNodeId} moves to index 0 atomically`,
  )
  await wait(7_000)

  await page.getByRole('button', { name: `Metric ${agentNodeId}` }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await caption(
    'HUMAN DELETE PREVIEW',
    'Exact impact: 1 component; Cancel keeps state unchanged',
  )
  await wait(6_000)
  await page.getByRole('button', { name: 'Cancel' }).click()
  await caption('CANCELLED', 'Agent forecast remains visible')
  await wait(5_000)

  const preview = await callNativeTool('remove_component', {
    nodeId: agentNodeId,
  })
  await caption(
    'AGENT → remove_component',
    'Preview only; revision-bound confirmation required',
  )
  await wait(7_000)

  await callNativeTool('remove_component', {
    nodeId: agentNodeId,
    confirmationToken: preview.confirmationToken,
  })
  await caption('CONFIRMED REMOVE', `Only ${agentNodeId} is removed`)
  await wait(6_000)

  await callNativeTool('undo_last_change')
  await page.getByTestId('live-canvas').getByText('Agent forecast').waitFor()
  await caption(
    'AGENT → undo_last_change',
    'The exact prior AppSpec is restored',
  )
  await wait(6_000)

  await callNativeTool('validate_app')
  await caption(
    'AGENT → validate_app',
    'Valid AppSpec; shared human / agent Activity trail',
  )
  await wait(8_000)

  await caption(
    'JSON-RENDER-AI',
    'Reliable agent tools · visible human control · one shared state',
  )
  await wait(8_000)

  if (fatalErrors.length > 0) throw new Error(fatalErrors.join('\n'))
} finally {
  await page.close()
  if (video) await video.saveAs(outputPath)
  await context.close()
  await browser.close()
}

console.log(outputPath)
