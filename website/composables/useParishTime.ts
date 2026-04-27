import { useNow } from '@vueuse/core'
import { computed } from 'vue'

/**
 * Composable for time tracking in the parish timezone
 * Uses VueUse's useNow with 60-second intervals
 * Exposes currentDay (0-6) and currentTime (HH:MM) in parish timezone
 */
export const useParishTime = () => {
  // Default to São Paulo timezone (Ponta Grossa, PR is in this timezone)
  const timezone = 'America/Sao_Paulo'

  // Update every 60 seconds
  const now = useNow({ interval: 60000 })

  /**
   * Current day of week (0 = Sunday, 6 = Saturday)
   */
  const currentDay = computed(() => {
    const date = new Date(now.value)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
    })

    // Get the day name and map to numeric value
    const dayName = formatter.format(date)
    const days: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    }

    return days[dayName] ?? 0
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
