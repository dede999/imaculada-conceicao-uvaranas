<template>
  <div class="status-panel" v-if="currentChapel">
    <div class="status-block mass-status">
      <div class="status-header">
        <span class="status-label">{{ t('status_panel.mass_label') }}</span>
        <span class="status-badge" :class="massBadgeClass">
          {{ massStatus }}
        </span>
      </div>
      <div v-if="nextMass" class="status-details">
        <p class="status-info">{{ nextMassLabel }}</p>
      </div>
      <div v-else class="status-details">
        <p class="status-info">{{ t('status_panel.no_mass_scheduled') }}</p>
      </div>
    </div>

    <div v-if="currentChapel.confession && currentChapel.confession.length > 0" class="status-block confession-status">
      <div class="status-header">
        <span class="status-label">{{ t('status_panel.confession_label') }}</span>
        <span class="status-badge" :class="confessionBadgeClass">
          {{ confessionStatus }}
        </span>
      </div>
      <div v-if="nextConfession" class="status-details">
        <p class="status-info">{{ nextConfessionLabel }}</p>
      </div>
      <div v-else class="status-details">
        <p class="status-info">{{ t('status_panel.no_next_confession') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()
const massDurationMinutes = (config.public.massDurationMinutes as number) || 60

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

const props = defineProps<{ chapel: Chapel }>()

const { currentDay, currentTime } = useParishTime()
const currentChapel = computed(() => props.chapel)

const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

const currentMinutes = computed(() => timeToMinutes(currentTime.value))

const isMassNow = computed(() => {
  if (!currentChapel.value?.masses?.length) return false
  return currentChapel.value.masses
    .filter((m: any) => m.day === currentDay.value)
    .some((m: any) => {
      const start = timeToMinutes(m.time)
      return currentMinutes.value >= start && currentMinutes.value < start + massDurationMinutes
    })
})

const nextMass = computed(() => {
  if (!currentChapel.value?.masses?.length) return null
  const all = currentChapel.value.masses.map((m: any) => ({ ...m, minutes: timeToMinutes(m.time) }))

  const today = all.filter((m: any) => m.day === currentDay.value && m.minutes > currentMinutes.value)
  if (today.length) return today.sort((a: any, b: any) => a.minutes - b.minutes)[0]

  for (let d = 1; d <= 6; d++) {
    const future = all.filter((m: any) => m.day === (currentDay.value + d) % 7)
    if (future.length) return future.sort((a: any, b: any) => a.minutes - b.minutes)[0]
  }
  return null
})

const massStatus = computed(() => t(isMassNow.value ? 'status_panel.now' : 'status_panel.next'))
const massBadgeClass = computed(() => isMassNow.value ? 'badge-active' : 'badge-upcoming')
const nextMassLabel = computed(() =>
  nextMass.value ? nextMass.value.time : t('status_panel.no_mass_scheduled')
)

const isConfessionNow = computed(() => {
  if (!currentChapel.value?.confession?.length) return false
  return currentChapel.value.confession
    .filter((c: any) => c.days.includes(currentDay.value))
    .some((c: any) =>
      currentMinutes.value >= timeToMinutes(c.time_start) &&
      currentMinutes.value < timeToMinutes(c.time_end)
    )
})

const nextConfession = computed(() => {
  if (!currentChapel.value?.confession?.length) return null
  const all = currentChapel.value.confession.map((c: any) => ({
    ...c,
    startMinutes: timeToMinutes(c.time_start),
  }))

  const today = all.filter((c: any) => c.days.includes(currentDay.value) && c.startMinutes > currentMinutes.value)
  if (today.length) return today.sort((a: any, b: any) => a.startMinutes - b.startMinutes)[0]

  for (let d = 1; d <= 6; d++) {
    const future = all.filter((c: any) => c.days.includes((currentDay.value + d) % 7))
    if (future.length) return future.sort((a: any, b: any) => a.startMinutes - b.startMinutes)[0]
  }
  return null
})

const confessionStatus = computed(() => t(isConfessionNow.value ? 'status_panel.now' : 'status_panel.next'))
const confessionBadgeClass = computed(() => isConfessionNow.value ? 'badge-active' : 'badge-upcoming')
const nextConfessionLabel = computed(() =>
  nextConfession.value
    ? `${nextConfession.value.time_start}–${nextConfession.value.time_end}`
    : t('status_panel.no_next_confession')
)
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
