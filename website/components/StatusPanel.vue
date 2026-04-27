<template>
  <div class="status-panel" v-if="currentChapel">
    <!-- Current Mass Status -->
    <div class="status-block mass-status">
      <div class="status-header">
        <span class="status-label">Missa</span>
        <span class="status-badge" :class="massBadgeClass">
          {{ massStatus }}
        </span>
      </div>
      <div v-if="nextMass" class="status-details">
        <p class="status-info">{{ nextMassLabel }}</p>
      </div>
      <div v-else class="status-details">
        <p class="status-info">Nenhuma missa agendada</p>
      </div>
    </div>

    <!-- Confession Status -->
    <div v-if="currentChapel.confession && currentChapel.confession.length > 0" class="status-block confession-status">
      <div class="status-header">
        <span class="status-label">Confissão</span>
        <span class="status-badge" :class="confessionBadgeClass">
          {{ confessionStatus }}
        </span>
      </div>
      <div v-if="nextConfession" class="status-details">
        <p class="status-info">{{ nextConfessionLabel }}</p>
      </div>
      <div v-else class="status-details">
        <p class="status-info">Próxima confissão em breve</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useParishTime } from '../composables/useParishTime'

interface Chapel {
  name: string
  type: 'matriz' | 'branch'
  address: string
  images: string[]
  masses: Array<{
    day: number
    time: string
  }>
  confession: Array<{
    time_start: string
    time_end: string
    days: number[]
  }>
  catechism: Array<{
    group: string
    days: number[]
    time: string
  }>
}

interface Props {
  chapel: Chapel
}

const props = defineProps<Props>()

const { currentDay, currentTime } = useParishTime()

const currentChapel = computed(() => props.chapel)

// Parse time string (HH:MM) to minutes since midnight
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

// Current time in minutes since midnight
const currentMinutes = computed(() => {
  return timeToMinutes(currentTime.value)
})

// Check if mass is currently happening
const isMassNow = computed(() => {
  if (!currentChapel.value?.masses || currentChapel.value.masses.length === 0) return false

  const todaysMasses = currentChapel.value.masses.filter((mass: any) => mass.day === currentDay.value)

  return todaysMasses.some((mass: any) => {
    const massStart = timeToMinutes(mass.time)
    // Assume mass lasts 60 minutes
    const massEnd = massStart + 60
    return currentMinutes.value >= massStart && currentMinutes.value < massEnd
  })
})

// Get next mass
const nextMass = computed(() => {
  if (!currentChapel.value?.masses || currentChapel.value.masses.length === 0) return null

  const allMasses = currentChapel.value.masses.map((mass: any) => ({
    ...mass,
    minutes: timeToMinutes(mass.time),
  }))

  // Look for mass today after current time
  const todayMasses = allMasses.filter((m: any) => m.day === currentDay.value && m.minutes > currentMinutes.value)

  if (todayMasses.length > 0) {
    return todayMasses.sort((a: any, b: any) => a.minutes - b.minutes)[0]
  }

  // Look for mass in next 6 days
  for (let daysAhead = 1; daysAhead <= 6; daysAhead++) {
    const futureDay = (currentDay.value + daysAhead) % 7
    const futureMasses = allMasses.filter((m: any) => m.day === futureDay)
    if (futureMasses.length > 0) {
      return futureMasses.sort((a: any, b: any) => a.minutes - b.minutes)[0]
    }
  }

  return null
})

const massStatus = computed(() => {
  return isMassNow.value ? 'Agora' : 'Próxima'
})

const massBadgeClass = computed(() => {
  return isMassNow.value ? 'badge-active' : 'badge-upcoming'
})

const nextMassLabel = computed(() => {
  if (!nextMass.value) return 'Nenhuma missa agendada'
  return `${nextMass.value.time}`
})

// Check if confession is currently happening
const isConfessionNow = computed(() => {
  if (!currentChapel.value?.confession || currentChapel.value.confession.length === 0) return false

  const todaysConfessions = currentChapel.value.confession.filter((conf: any) =>
    conf.days.includes(currentDay.value)
  )

  return todaysConfessions.some((conf: any) => {
    const confStart = timeToMinutes(conf.time_start)
    const confEnd = timeToMinutes(conf.time_end)
    return currentMinutes.value >= confStart && currentMinutes.value < confEnd
  })
})

// Get next confession
const nextConfession = computed(() => {
  if (!currentChapel.value?.confession || currentChapel.value.confession.length === 0) return null

  const allConfessions = currentChapel.value.confession.map((conf: any) => ({
    ...conf,
    startMinutes: timeToMinutes(conf.time_start),
  }))

  // Look for confession today after current time
  const todayConfessions = allConfessions.filter(
    (c: any) => c.days.includes(currentDay.value) && c.startMinutes > currentMinutes.value
  )

  if (todayConfessions.length > 0) {
    return todayConfessions.sort((a: any, b: any) => a.startMinutes - b.startMinutes)[0]
  }

  // Look for confession in next 6 days
  for (let daysAhead = 1; daysAhead <= 6; daysAhead++) {
    const futureDay = (currentDay.value + daysAhead) % 7
    const futureConfessions = allConfessions.filter((c: any) => c.days.includes(futureDay))
    if (futureConfessions.length > 0) {
      return futureConfessions.sort((a: any, b: any) => a.startMinutes - b.startMinutes)[0]
    }
  }

  return null
})

const confessionStatus = computed(() => {
  return isConfessionNow.value ? 'Agora' : 'Próxima'
})

const confessionBadgeClass = computed(() => {
  return isConfessionNow.value ? 'badge-active' : 'badge-upcoming'
})

const nextConfessionLabel = computed(() => {
  if (!nextConfession.value) return 'Próxima confissão em breve'
  return `${nextConfession.value.time_start}–${nextConfession.value.time_end}`
})
</script>

<style scoped>
.status-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  padding: var(--space-24);
  background-color: var(--bg-page);
  border-left: 4px solid var(--fr-600);
}

.status-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-12);
}

.status-label {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-12);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-active {
  background-color: var(--cv-50);
  color: var(--cv-600);
}

.badge-upcoming {
  background-color: var(--fr-50);
  color: var(--fr-600);
}

.status-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.status-info {
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: var(--line-height-normal);
  color: var(--text-secondary);
  margin: 0;
}
</style>
