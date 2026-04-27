import { useNow } from '@vueuse/core'
import { computed } from 'vue'

/**
 * Composable for time tracking in the parish timezone
 * Uses VueUse's useNow with 60-second intervals
 * Exposes currentDay (0-6) and currentTime (HH:MM) in parish timezone
 * Timezone and locale read from parish.config.yaml via nuxt.config
 */
export const useParishTime = () => {
  // @ts-expect-error auto-import in Nuxt 3
  const config = useRuntimeConfig()
  const timezone = (config.public as any).parishTimezone || 'America/Sao_Paulo'
  const locale = (config.public as any).parishLocale || 'pt-BR'

  // Update every 60 seconds
  const now = useNow({ interval: 60000 })

  /**
   * Current day of week (0 = Sunday, 6 = Saturday)
   */
  const currentDay = computed(() => {
    const date = new Date(now.value)
    // Get day name in configured locale
    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      weekday: 'long',
    })

    const dayName = formatter.format(date)
    
    // Map Portuguese day names to numbers
    const daysMap: Record<string, number> = {
      domingo: 0,
      segunda: 1,
      'segunda-feira': 1,
      terça: 2,
      'terça-feira': 2,
      quarta: 3,
      'quarta-feira': 3,
      quinta: 4,
      'quinta-feira': 4,
      sexta: 5,
      'sexta-feira': 5,
      sábado: 6,
    }

    return daysMap[dayName.toLowerCase()] ?? 0
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
