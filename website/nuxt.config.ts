/// <reference types="node" />
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
  css: ['~/assets/css/tokens.css'],
  vite: {
    optimizeDeps: {
      include: ['@vueuse/core'],
    },
  },
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
    defaultLocale: parishConfig.i18n.default_locale,
    strategy: 'prefix_except_default',
    customRoutes: 'config',
    locales: (parishConfig.i18n.locales as string[]).map((code: string) => ({
      code,
      language: code,
      file: `${code}.json`,
    })),
    pages: {
      'capelas/index':  { 'pt-BR': '/capelas',          'es': '/capillas',          'en': '/chapels',          'fr': '/chapelles'         },
      dizimo:           { 'pt-BR': '/dizimo',            'es': '/diezmo',            'en': '/tithe',            'fr': '/dime'              },
      pastorais:        { 'pt-BR': '/pastorais',         'es': '/pastorales',        'en': '/ministries',       'fr': '/ministeres'        },
      eventos:          { 'pt-BR': '/eventos',           'es': '/eventos',           'en': '/events',           'fr': '/evenements'        },
      noticias:         { 'pt-BR': '/noticias',          'es': '/noticias',          'en': '/news',             'fr': '/actualites'        },
      transparencia:    { 'pt-BR': '/transparencia',     'es': '/transparencia',     'en': '/transparency',     'fr': '/transparence'      },
    },
  },
})