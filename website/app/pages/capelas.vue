<script setup lang="ts">
import tauRaw from '~/assets/tau.svg?raw'

interface MassEntry {
  days: number[]
  times: string[]
  note?: string
  note_only_on?: number[]
}

interface ConfessionSlot {
  days: number[]
  time_start: string
  time_end: string
}

interface CatechismGroup {
  group: string
  days: number[]
  time: string
}

const { t } = useI18n()
const config = useRuntimeConfig()

const { data: chapels } = await useChapels()

const matrizChapel = computed(() => chapels.value?.find(c => c.type === 'matriz') ?? null)
const branchChapels = computed(() => chapels.value?.filter(c => c.type === 'branch') ?? [])

function dayLabel(day: number): string {
  return t(`w_day.${day}`)
}

function massNoteApplies(entry: MassEntry, day: number): boolean {
  if (!entry.note) return false
  return !entry.note_only_on || entry.note_only_on.includes(day)
}

function formatConfessionDays(slot: ConfessionSlot): string {
  return slot.days.map(dayLabel).join(', ')
}

function formatCatechismDays(group: CatechismGroup): string {
  return group.days.map(dayLabel).join(', ')
}

useHead({ title: `${t('capelas.page_title')} — ${config.public.parishShortName as string}` })
</script>

<template>
  <main class="capelas-page">
    <div class="page-container">

      <!-- ── Page header ────────────────────────────────────────── -->
      <header class="page-header">
        <p class="eyebrow">{{ t('capelas.eyebrow') }}</p>
        <h1 class="heading-page page-title">{{ t('capelas.title') }}</h1>
        <p class="body-text page-subtitle">{{ t('capelas.subtitle') }}</p>
      </header>

      <!-- ── Matriz ─────────────────────────────────────────────── -->
      <section v-if="matrizChapel" class="matriz-section">
        <div class="matriz-card">

          <div class="matriz-top">
            <span class="tau-mark" v-html="tauRaw" aria-hidden="true" />
            <div class="matriz-identity">
              <span class="type-badge badge--matriz">{{ t('chapel.type.matriz') }}</span>
              <h2 class="chapel-name">{{ matrizChapel.name }}</h2>
              <p v-if="matrizChapel.address" class="chapel-address">
                <span class="address-label">{{ t('capelas.address_label') }}:</span>
                {{ matrizChapel.address }}
              </p>
            </div>
          </div>

          <div class="schedule-grid">

            <div class="schedule-col">
              <p class="section-label">{{ t('capelas.masses_label') }}</p>
              <template v-if="(matrizChapel.masses as MassEntry[] | undefined)?.length">
                <div
                  v-for="(entry, i) in (matrizChapel.masses as MassEntry[])"
                  :key="i"
                  class="mass-entry"
                >
                  <div class="pills-row">
                    <template v-for="day in entry.days" :key="day">
                      <span
                        v-for="time in entry.times"
                        :key="`${day}-${time}`"
                        class="mass-pill"
                        :class="{ 'mass-pill--noted': massNoteApplies(entry, day) }"
                      >{{ dayLabel(day) }} {{ time }}<em
                        v-if="massNoteApplies(entry, day)"
                        class="pill-note"
                      > {{ entry.note }}</em>
                      </span>
                    </template>
                  </div>
                </div>
              </template>
              <p v-else class="empty-text">{{ t('capelas.no_masses') }}</p>
            </div>

            <div class="schedule-col">
              <p class="section-label">{{ t('capelas.confession_label') }}</p>
              <template v-if="(matrizChapel.confession as ConfessionSlot[] | undefined)?.length">
                <div
                  v-for="(slot, i) in (matrizChapel.confession as ConfessionSlot[])"
                  :key="i"
                  class="conf-row"
                >
                  <span class="conf-dot" aria-hidden="true" />
                  <span class="conf-text">
                    {{ formatConfessionDays(slot) }} · {{ slot.time_start }}–{{ slot.time_end }}
                  </span>
                </div>
              </template>
              <p v-else class="empty-text">{{ t('capelas.no_confession') }}</p>
            </div>

            <div class="schedule-col">
              <p class="section-label">{{ t('capelas.catechism_label') }}</p>
              <template v-if="(matrizChapel.catechism as CatechismGroup[] | undefined)?.length">
                <div
                  v-for="group in (matrizChapel.catechism as CatechismGroup[])"
                  :key="group.group"
                  class="cat-row"
                >
                  <span class="cat-name">{{ group.group }}</span>
                  <span class="cat-schedule">{{ formatCatechismDays(group) }} · {{ group.time }}</span>
                </div>
              </template>
              <p v-else class="empty-text">{{ t('capelas.catechism_label') }}</p>
            </div>

          </div>
        </div>
      </section>

      <!-- ── Branch chapels ─────────────────────────────────────── -->
      <section v-if="branchChapels.length" class="branches-section">
        <p class="eyebrow branches-eyebrow">{{ t('capelas.branch_section') }}</p>

        <div class="branches-grid">
          <article
            v-for="chapel in branchChapels"
            :key="chapel.path"
            class="branch-card"
          >
            <div class="branch-header">
              <span class="type-badge badge--branch">{{ t('chapel.type.branch') }}</span>
              <h2 class="chapel-name">{{ chapel.name }}</h2>
              <p v-if="chapel.address" class="chapel-address">{{ chapel.address }}</p>
            </div>

            <div class="schedule-section">
              <p class="section-label">{{ t('capelas.masses_label') }}</p>
              <template v-if="(chapel.masses as MassEntry[] | undefined)?.length">
                <div
                  v-for="(entry, i) in (chapel.masses as MassEntry[])"
                  :key="i"
                  class="mass-entry"
                >
                  <div class="pills-row">
                    <template v-for="day in entry.days" :key="day">
                      <span
                        v-for="time in entry.times"
                        :key="`${day}-${time}`"
                        class="mass-pill"
                        :class="{ 'mass-pill--noted': massNoteApplies(entry, day) }"
                      >{{ dayLabel(day) }} {{ time }}<em
                        v-if="massNoteApplies(entry, day)"
                        class="pill-note"
                      > {{ entry.note }}</em>
                      </span>
                    </template>
                  </div>
                </div>
              </template>
              <p v-else class="empty-text">{{ t('capelas.no_masses') }}</p>
            </div>

            <div v-if="(chapel.confession as ConfessionSlot[] | undefined)?.length" class="schedule-section">
              <p class="section-label">{{ t('capelas.confession_label') }}</p>
              <div
                v-for="(slot, i) in (chapel.confession as ConfessionSlot[])"
                :key="i"
                class="conf-row"
              >
                <span class="conf-dot" aria-hidden="true" />
                <span class="conf-text">
                  {{ formatConfessionDays(slot) }} · {{ slot.time_start }}–{{ slot.time_end }}
                </span>
              </div>
            </div>

            <div v-if="(chapel.catechism as CatechismGroup[] | undefined)?.length" class="schedule-section">
              <p class="section-label">{{ t('capelas.catechism_label') }}</p>
              <div
                v-for="group in (chapel.catechism as CatechismGroup[])"
                :key="group.group"
                class="cat-row"
              >
                <span class="cat-name">{{ group.group }}</span>
                <span class="cat-schedule">{{ formatCatechismDays(group) }} · {{ group.time }}</span>
              </div>
            </div>

          </article>
        </div>
      </section>

    </div>
  </main>
</template>

<style scoped>
/* ── Page shell ─────────────────────────────────────────────────── */

.capelas-page {
  background-color: var(--bg-alt);
  min-height: 100vh;
  padding: var(--space-40) 0 var(--space-64);
}

.page-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-40);
}

/* ── Page header ────────────────────────────────────────────────── */

.page-title { margin: var(--space-8) 0 var(--space-12); }

.page-subtitle {
  color: var(--text-muted);
  max-width: 560px;
}

/* ── Matriz card ────────────────────────────────────────────────── */

.matriz-card {
  background-color: var(--fr-50);
  border: 1px solid var(--fr-400);
  border-left: 4px solid var(--fr-600);
  border-radius: var(--radius-lg);
  padding: var(--space-32);
  display: flex;
  flex-direction: column;
  gap: var(--space-24);
}

.matriz-top {
  display: flex;
  align-items: flex-start;
  gap: var(--space-20);
}

.tau-mark {
  flex-shrink: 0;
  display: block;
  width: 24px;
  height: 32px;
  color: var(--fr-400);
  margin-top: var(--space-4);
}

.tau-mark :deep(svg) {
  width: 100%;
  height: 100%;
}

.matriz-identity {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* ── Chapel identity shared ─────────────────────────────────────── */

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

.chapel-name {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  font-weight: 500;
  color: var(--fr-950);
  line-height: var(--line-height-tight);
  margin: 0;
}

.chapel-address {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
}

.address-label {
  font-weight: 500;
  color: var(--text-primary);
}

/* ── Schedule grid (inside matriz) ─────────────────────────────── */

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-24);
  padding-top: var(--space-24);
  border-top: 1px solid var(--fr-200);
}

@media (max-width: 767px) {
  .schedule-grid { grid-template-columns: 1fr; }
}

.schedule-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

/* ── Section labels ─────────────────────────────────────────────── */

.section-label {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fr-600);
  margin: 0;
}

.empty-text {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
}

/* ── Mass pills ─────────────────────────────────────────────────── */

.mass-entry {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.pills-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.mass-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px var(--space-8);
  border-radius: var(--radius-sm);
  background-color: var(--bg-page);
  border: 1px solid var(--fr-200);
  color: var(--fr-800);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: 500;
  white-space: nowrap;
}

.mass-pill--noted { border-color: var(--fr-400); }

.pill-note {
  font-style: italic;
  font-weight: 400;
  color: var(--fr-600);
  font-size: 11px;
}

/* ── Confession rows ────────────────────────────────────────────── */

.conf-row {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.conf-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--cv-400);
}

.conf-text {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-primary);
}

/* ── Catechism rows ─────────────────────────────────────────────── */

.cat-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cat-name {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.cat-schedule {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* ── Branches section ───────────────────────────────────────────── */

.branches-eyebrow { margin-bottom: var(--space-16); }

.branches-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-16);
}

@media (max-width: 639px) {
  .branches-grid { grid-template-columns: 1fr; }
}

.branch-card {
  background-color: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
}

.branch-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.schedule-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding-top: var(--space-16);
  border-top: 1px solid var(--border-default);
}
</style>
