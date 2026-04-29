<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()
const massDurationMinutes = (config.public.massDurationMinutes as number) || 60

const { currentDay, currentTime } = useParishTime()

// Reuses the same cache key as index.vue — no duplicate fetch
const { data: chapels } = useAsyncData('capelas', () =>
  queryCollection('capelas').all()
)

function timeToMinutes(s: string): number {
  const parts = s.split(':').map(Number)
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0)
}

function addMins(time: string, mins: number): string {
  const total = timeToMinutes(time) + mins
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const currentMinutes = computed(() => timeToMinutes(currentTime.value))

const currentMasses = computed(() => {
  if (!chapels.value?.length) return []
  const result: Array<{ chapelName: string; endTime: string }> = []
  for (const chapel of chapels.value) {
    for (const mass of (chapel.masses as Array<{ days: number[]; times: string[] }> | undefined) ?? []) {
      if (mass.days.includes(currentDay.value)) {
        for (const time of mass.times) {
          const start = timeToMinutes(time)
          if (currentMinutes.value >= start && currentMinutes.value < start + massDurationMinutes) {
            result.push({ chapelName: chapel.name, endTime: addMins(time, massDurationMinutes) })
          }
        }
      }
    }
  }
  return result
})

const nextMass = computed(() => {
  if (currentMasses.value.length) return null
  if (!chapels.value?.length) return null

  type Candidate = { chapelName: string; time: string; daysAhead: number; minutesOfDay: number }
  let best: Candidate | null = null

  for (const chapel of chapels.value) {
    for (const mass of (chapel.masses as Array<{ day: number; time: string }> | undefined) ?? []) {
      const minutesOfDay = timeToMinutes(mass.time)
      let daysAhead: number

      if (mass.day === currentDay.value && minutesOfDay > currentMinutes.value) {
        daysAhead = 0
      } else if (mass.day !== currentDay.value) {
        daysAhead = (mass.day - currentDay.value + 7) % 7
      } else {
        continue
      }

      const isBetter =
        !best ||
        daysAhead < best.daysAhead ||
        (daysAhead === best.daysAhead && minutesOfDay < best.minutesOfDay)

      if (isBetter) {
        best = { chapelName: chapel.name, time: mass.time, daysAhead, minutesOfDay }
      }
    }
  }
  return best
})

const currentConfessions = computed(() => {
  if (!chapels.value?.length) return []
  const result: Array<{ chapelName: string; time_start: string; time_end: string }> = []
  for (const chapel of chapels.value) {
    for (const conf of (chapel.confession as Array<{ time_start: string; time_end: string; days: number[] }> | undefined) ?? []) {
      if (conf.days.includes(currentDay.value)) {
        const start = timeToMinutes(conf.time_start)
        const end = timeToMinutes(conf.time_end)
        if (currentMinutes.value >= start && currentMinutes.value < end) {
          result.push({ chapelName: chapel.name, time_start: conf.time_start, time_end: conf.time_end })
        }
      }
    }
  }
  return result
})
</script>

<template>
  <div class="status-panel">
    <div class="status-section mass-section">
      <p class="section-eyebrow">{{ t('status_panel.mass_label') }}</p>

      <div v-if="currentMasses.length" class="status-rows">
        <div v-for="entry in currentMasses" :key="entry.chapelName" class="status-row">
          <span class="status-dot dot--active" aria-hidden="true" />
          <span class="row-name">{{ entry.chapelName }}</span>
          <span class="row-meta">{{ t('status_panel.in_progress_until') }} {{ entry.endTime }}</span>
        </div>
      </div>

      <div v-else-if="nextMass" class="status-rows">
        <div class="status-row">
          <span class="status-dot dot--upcoming" aria-hidden="true" />
          <span class="row-name">{{ nextMass.chapelName }}</span>
          <span class="row-meta">{{ nextMass.time }}</span>
        </div>
      </div>

      <p v-else class="empty-text">{{ t('status_panel.no_mass_scheduled') }}</p>
    </div>

    <div v-if="currentConfessions.length" class="status-section confession-section">
      <p class="section-eyebrow">{{ t('status_panel.confession_label') }}</p>
      <div class="status-rows">
        <div v-for="entry in currentConfessions" :key="entry.chapelName" class="status-row">
          <span class="status-dot dot--active" aria-hidden="true" />
          <span class="row-name">{{ entry.chapelName }}</span>
          <span class="row-meta">{{ entry.time_start }}–{{ entry.time_end }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: var(--bg-page);
  border-left: 4px solid var(--fr-600);
}

.status-section {
  padding: var(--space-20) var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

.mass-section {
  flex: 1;
}

.confession-section {
  border-top: 1px solid var(--border-default);
}

.section-eyebrow {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fr-600);
  margin: 0;
}

.status-rows {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

.status-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-8);
}

.status-dot {
  flex-shrink: 0;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 4px;
}

.dot--active   { background-color: var(--cv-400); }
.dot--upcoming { background-color: var(--fr-400); }

.row-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.row-meta {
  flex-shrink: 0;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
  white-space: nowrap;
}

.empty-text {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
}
</style>
