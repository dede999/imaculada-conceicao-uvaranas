import { useNow } from '@vueuse/core'
import { computed } from 'vue'

/**
 * Composable for time tracking in the parish timezone.
 * Exposes currentDay (0–6) and currentTime (HH:MM) in the parish timezone.
 * Timezone is read from runtimeConfig.public.parishTimezone (set at build time from parish.config.yaml).
 *
 * Day numbers are locale-agnostic — components translate them via i18n keys (e.g. "w_day_0").
 */
export const useParishTime = () => {
  const config = useRuntimeConfig()
  const timezone = (config.public.parishTimezone as string) || 'America/Sao_Paulo'

  const now = useNow({ interval: 60000 })

  const currentDay = computed(() => {
    const date = new Date(now.value)
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
    return new Date(Date.UTC(year, month, day)).getUTCDay()
  })

  const currentTime = computed(() => {
    const date = new Date(now.value)
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date)
  })

  return { currentDay, currentTime, now }
}
