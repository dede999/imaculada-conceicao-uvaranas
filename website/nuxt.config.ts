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
    '@nuxtjs/i18n',
  ],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  runtimeConfig: {
    public: {
      parishTimezone: parishConfig.location.timezone,
      parishName: parishConfig.name,
      parishShortName: parishConfig.short_name,
      parishDiocese: parishConfig.diocese,
      parishOrder: parishConfig.order,
      massDurationMinutes: parishConfig.mass_duration_minutes as number,
    },
  },
  i18n: {
    defaultLocale: 'pt-BR',
    locales: [
      { code: 'pt-BR', language: 'pt-BR', file: 'pt-BR.json' },
    ],
    langDir: 'locales/',
  },
})