import { createCommandRuntime } from './core'
import { crmSpec } from './templates'

export const appRuntime = createCommandRuntime(crmSpec)
