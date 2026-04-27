import { readFileSync } from 'fs'
import { parse as parseYaml } from 'yaml'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '../..')

// Load parish configuration from root
const parishConfigPath = join(projectRoot, 'parish.config.yaml')
const parishConfig = parseYaml(readFileSync(parishConfigPath, 'utf-8'))

export default defineNuxtPlugin(() => {
  // Provide parish config to entire app
  return {
    provide: {
      parishConfig: {
        timezone: parishConfig.location.timezone,
        name: parishConfig.name,
        diocese: parishConfig.diocese,
        order: parishConfig.order,
      },
    },
  }
})
