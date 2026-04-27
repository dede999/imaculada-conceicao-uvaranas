import { readFileSync } from 'fs'
import { parse as parseYaml } from 'yaml'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Load parish configuration from root
const parishConfigPath = join(projectRoot, 'parish.config.yaml')
const parishConfig = parseYaml(readFileSync(parishConfigPath, 'utf-8'))

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/a11y',
  ],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  runtimeConfig: {
    public: {
      parishTimezone: parishConfig.location.timezone,
      parishLocale: parishConfig.location.locale,
      parishName: parishConfig.name,
      parishDiocese: parishConfig.diocese,
      parishOrder: parishConfig.order,
    },
  },
})