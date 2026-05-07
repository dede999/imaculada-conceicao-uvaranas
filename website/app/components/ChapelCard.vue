<script setup lang="ts">
interface MassRow { day_of_week: number; time: string; note: string | null }
interface ConfessionRow { day_of_week: number; time_start: string; time_end: string }
interface CatechismGroup { id: string; group_name: string; day_of_week: number | null; time: string | null }

interface Chapel {
  name: string
  type: string
  masses?: MassRow[]
  confessions?: ConfessionRow[]
  catechism_groups?: CatechismGroup[]
}

const props = defineProps<{ chapel: Chapel }>()

const { t } = useI18n()

const activeGroupId = ref<string | null>(null)
let autoCloseTimer: ReturnType<typeof setTimeout> | null = null

function openSheet(id: string) {
  if (autoCloseTimer) clearTimeout(autoCloseTimer)
  activeGroupId.value = id
  autoCloseTimer = setTimeout(() => {
    activeGroupId.value = null
    autoCloseTimer = null
  }, 4000)
}

function closeSheet() {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }
  activeGroupId.value = null
}

const activeGroupData = computed(() =>
  props.chapel.catechism_groups?.find((c) => c.id === activeGroupId.value) ?? null
)

function dayLabel(day: number): string {
  return t(`w_day.${day}`)
}

const massesByDay = computed(() => {
  const map = new Map<number, string[]>()
  for (const m of props.chapel.masses ?? []) {
    if (!map.has(m.day_of_week)) map.set(m.day_of_week, [])
    map.get(m.day_of_week)!.push(m.time)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([day, times]) => ({ day, times }))
})

function formatConfession(slot: ConfessionRow): string {
  return `${dayLabel(slot.day_of_week)} · ${slot.time_start}–${slot.time_end}`
}
</script>

<template>
  <article
    class="chapel-card"
    :class="chapel.type === 'matriz' ? 'chapel-card--matriz' : 'chapel-card--branch'"
  >
    <span
      class="type-badge"
      :class="chapel.type === 'matriz' ? 'badge--matriz' : 'badge--branch'"
    >
      {{ t(chapel.type === 'matriz' ? 'chapel.type.matriz' : 'chapel.type.branch') }}
    </span>

    <h3 class="chapel-name">{{ chapel.name }}</h3>

    <div class="card-section">
      <p class="section-label">{{ t('home.chapels.col_masses') }}</p>
      <div v-if="chapel.masses?.length" class="pills-row">
        <span
          v-for="group in massesByDay"
          :key="group.day"
          class="mass-pill"
        >{{ dayLabel(group.day) }} ({{ group.times.join(' · ') }})</span>
      </div>
      <span v-else class="no-data">{{ t('home.chapels.confession_none') }}</span>
    </div>

    <div class="card-section">
      <p class="section-label">{{ t('home.chapels.col_confession') }}</p>
      <template v-if="chapel.confessions?.length">
        <div
          v-for="(slot, i) in chapel.confessions"
          :key="i"
          class="conf-row"
        >
          <span class="conf-dot" />
          <span class="conf-text">{{ formatConfession(slot) }}</span>
        </div>
      </template>
      <span v-else class="no-data">{{ t('home.chapels.confession_none') }}</span>
    </div>

    <div class="card-section">
      <p class="section-label">{{ t('home.chapels.col_catechism') }}</p>
      <div v-if="chapel.catechism_groups?.length" class="pills-row">
        <button
          v-for="cat in chapel.catechism_groups"
          :key="cat.id"
          type="button"
          class="cat-pill"
          @click="openSheet(cat.id)"
        >
          {{ cat.group_name }}
        </button>
      </div>
      <span v-else class="no-data">{{ t('home.chapels.catechism_none') }}</span>
    </div>

    <Teleport to="body">
      <div v-if="activeGroupId" class="sheet-backdrop" @click="closeSheet">
        <div class="bottom-sheet" @click.stop>
          <div class="sheet-handle" aria-hidden="true" />
          <p class="sheet-group-name">{{ activeGroupData?.group_name }}</p>
          <ul class="sheet-schedule">
            <li v-if="activeGroupData?.day_of_week != null" class="sheet-row">
              <span class="sheet-day">{{ dayLabel(activeGroupData.day_of_week) }}</span>
              <span v-if="activeGroupData.time" class="sheet-time">{{ t('home.chapels.card_at') }} {{ activeGroupData.time }}</span>
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </article>
</template>

<style scoped>
/* ── Card shell ─────────────────────────────────────────────────── */

.chapel-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  border-radius: var(--radius-lg);
  padding: var(--space-20);
  border: 1px solid var(--border-default);
}

.chapel-card--matriz {
  background-color: var(--fr-50);
  border-color: var(--fr-400);
}

.chapel-card--branch {
  background-color: var(--bg-page);
}

/* ── Badge ──────────────────────────────────────────────────────── */

.type-badge {
  display: inline-flex;
  align-self: flex-start;
  padding: 2px var(--space-8);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.badge--matriz {
  background-color: var(--fr-200);
  color: var(--fr-950);
}

.badge--branch {
  background-color: var(--bg-alt);
  color: var(--text-muted);
}

/* ── Name ───────────────────────────────────────────────────────── */

.chapel-name {
  font-family: var(--font-serif);
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--fr-950);
  line-height: var(--line-height-tight);
  margin: 0;
}

/* ── Sections ───────────────────────────────────────────────────── */

.card-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.section-label {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fr-600);
  margin: 0;
}

.no-data {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* ── Mass pills ─────────────────────────────────────────────────── */

.pills-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.mass-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-8);
  border-radius: var(--radius-sm);
  background-color: var(--fr-50);
  border: 1px solid var(--fr-200);
  color: var(--fr-800);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: 500;
  white-space: nowrap;
}

.chapel-card--matriz .mass-pill {
  background-color: var(--bg-page);
}

/* ── Confession ─────────────────────────────────────────────────── */

.conf-row {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.conf-dot {
  flex-shrink: 0;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--cv-400);
}

.conf-text {
  min-width: 0;
  overflow-wrap: break-word;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-primary);
}

/* ── Catechism pills ────────────────────────────────────────────── */

.cat-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-8);
  border-radius: var(--radius-sm);
  background-color: var(--cv-50);
  border: 1px solid var(--cv-100);
  color: var(--cv-600);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.12s;
}

.cat-pill:hover {
  background-color: var(--cv-100);
}

/* ── Bottom sheet ───────────────────────────────────────────────── */

.sheet-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(4, 52, 44, 0.4);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.bottom-sheet {
  width: 100%;
  background-color: var(--bg-page);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--space-12) var(--space-24) var(--space-32);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
}

.sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background-color: var(--border-default);
  margin: 0 auto var(--space-20);
}

.sheet-group-name {
  font-family: var(--font-serif);
  font-size: var(--text-xl);
  font-weight: 500;
  color: var(--fr-950);
  margin: 0 0 var(--space-16);
}

.sheet-schedule {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

.sheet-row {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
}

.sheet-day {
  font-weight: 500;
  color: var(--text-primary);
}

.sheet-time {
  color: var(--text-muted);
}
</style>
