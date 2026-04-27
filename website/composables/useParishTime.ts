import { useNow } from '@vueuse/core'
import { computed } from 'vue'

/**
 * Composable for time tracking in the parish timezone
 * Uses VueUse's useNow with 60-second intervals
 * Exposes currentDay (0-6) and currentTime (HH:MM) in parish timezone
 * Timezone read from parish.config.yaml via nuxt.config
 *
 * Day numbers (0-6) are locale-agnostic and ready for i18n:
 * - Components can use keys like "w_day_0", "w_day_1", etc
 * - Each locale file (locales/pt-BR.json, locales/es-EC.json, etc) defines translations
 */
export const useParishTime = () => {
  // @ts-expect-error auto-import in Nuxt 3
  const config = useRuntimeConfig()
  const timezone = (config.public as any).parishTimezone || 'America/Sao_Paulo'

  // Update every 60 seconds
  const now = useNow({ interval: 60000 })

  /**
   * Current day of week (0 = Sunday, 6 = Saturday)
   * Calculated from timezone-aware date, without dependency on locale strings
   */
  const currentDay = computed(() => {
    const date = new Date(now.value)

    // Get date components in parish timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })

    const parts = formatter.formatToParts(date)
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '2026')
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1')

    // Create date in UTC to get day of week (0-6)
    const tzDate = new Date(Date.UTC(year, month, day))
    return tzDate.getUTCDay()
  })

  /**
   * Current time in HH:MM format (parish timezone)
   */
  const currentTime = computed(() => {
    const date = new Date(now.value)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    return formatter.format(date)
  })

  return {
    currentDay,
    currentTime,
    now,
  }
}
