import { defineConfig } from '@playwright/test'

const rawProductionUrl = process.env.PRODUCTION_URL

if (!rawProductionUrl) {
  throw new Error(
    'PRODUCTION_URL is required, for example: PRODUCTION_URL=https://example.com pnpm test:e2e:production',
  )
}

const productionUrl = new URL(rawProductionUrl)
const isLocalhost = ['127.0.0.1', 'localhost', '::1'].includes(
  productionUrl.hostname,
)

if (productionUrl.protocol !== 'https:' && !isLocalhost) {
  throw new Error('PRODUCTION_URL must use HTTPS unless it targets localhost')
}

productionUrl.hash = ''
productionUrl.search = ''
if (!productionUrl.pathname.endsWith('/')) productionUrl.pathname += '/'

export default defineConfig({
  testDir: './tests/real-webmcp',
  fullyParallel: false,
  retries: 0,
  reporter: [
    ['list'],
    [
      'html',
      { outputFolder: 'playwright-report/production-webmcp', open: 'never' },
    ],
  ],
  use: {
    baseURL: productionUrl.toString(),
    channel: 'chrome',
    headless: true,
    launchOptions: {
      args: [
        '--enable-experimental-web-platform-features',
        '--enable-features=WebMCPTesting,DevToolsWebMCPSupport',
      ],
    },
    trace: 'retain-on-failure',
  },
})
