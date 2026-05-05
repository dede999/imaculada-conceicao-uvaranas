<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

const { data: events } = await useAsyncData('events-list', () =>
  queryCollection('events').all()
)

const todayStr = new Date().toISOString().slice(0, 10)

const upcoming = computed(() =>
  (events.value ?? [])
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
)

const past = computed(() =>
  (events.value ?? [])
    .filter(e => e.date < todayStr)
    .sort((a, b) => b.date.localeCompare(a.date))
)

function itemSlug(path: string): string {
  return path.split('/').pop() ?? ''
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(Date.UTC(year!, month! - 1, day!)))
}

useHead({ title: `${t('eventos.page_title')} — ${config.public.parishShortName}` })
</script>

<template>
  <main class="eventos-page">
    <div class="page-container">

      <header class="page-header">
        <p class="page-eyebrow">{{ t('eventos.eyebrow') }}</p>
        <h1 class="page-title">{{ t('eventos.page_title') }}</h1>
      </header>

      <section class="events-section">
        <h2 class="section-heading">{{ t('eventos.upcoming') }}</h2>
        <div v-if="upcoming.length" class="events-list">
          <NuxtLink
            v-for="event in upcoming"
            :key="event.path"
            :to="`/eventos/${itemSlug(event.path)}`"
            class="event-card"
            :class="{ 'event-card--cancelled': event.status === 'cancelled' }"
          >
            <div class="card-meta">
              <span
                class="type-badge"
                :class="event.type === 'event' ? 'badge--event' : 'badge--announcement'"
              >
                {{ t(event.type === 'event' ? 'eventos.badge_event' : 'eventos.badge_announcement') }}
              </span>
              <span v-if="event.status !== 'active'" class="status-badge">
                {{ t(event.status === 'cancelled' ? 'eventos.status_cancelled' : 'eventos.status_postponed') }}
              </span>
              <time class="event-date" :datetime="event.date">{{ formatDate(event.date) }}</time>
            </div>
            <h3 class="event-title" :class="{ 'title--cancelled': event.status === 'cancelled' }">
              {{ event.title }}
            </h3>
            <p class="event-summary">{{ event.summary }}</p>
            <span class="read-more">{{ t('eventos.read_more') }}</span>
          </NuxtLink>
        </div>
        <p v-else class="empty-text">{{ t('eventos.empty_upcoming') }}</p>
      </section>

      <section v-if="past.length" class="events-section events-section--past">
        <h2 class="section-heading">{{ t('eventos.past') }}</h2>
        <div class="events-list">
          <NuxtLink
            v-for="event in past"
            :key="event.path"
            :to="`/eventos/${itemSlug(event.path)}`"
            class="event-card event-card--past"
          >
            <div class="card-meta">
              <span
                class="type-badge"
                :class="event.type === 'event' ? 'badge--event' : 'badge--announcement'"
              >
                {{ t(event.type === 'event' ? 'eventos.badge_event' : 'eventos.badge_announcement') }}
              </span>
              <time class="event-date" :datetime="event.date">{{ formatDate(event.date) }}</time>
            </div>
            <h3 class="event-title">{{ event.title }}</h3>
            <p class="event-summary">{{ event.summary }}</p>
            <span class="read-more">{{ t('eventos.read_more') }}</span>
          </NuxtLink>
        </div>
      </section>

    </div>
  </main>
</template>

<style scoped>
.eventos-page {
  background-color: var(--bg-alt);
  min-height: 100vh;
  padding: var(--space-32) 0 var(--space-64);
}

.page-container {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-40);
}

/* ── Header ─────────────────────────────────────────────────────── */

.page-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.page-eyebrow {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fr-600);
  margin: 0;
}

.page-title {
  font-family: var(--font-serif);
  font-size: var(--text-3xl);
  font-weight: 500;
  color: var(--fr-950);
  line-height: var(--line-height-tight);
  margin: 0;
}

/* ── Section ────────────────────────────────────────────────────── */

.events-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
}

.section-heading {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fr-600);
  margin: 0;
}

.events-section--past .section-heading {
  color: var(--text-muted);
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

/* ── Card ───────────────────────────────────────────────────────── */

.event-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding: var(--space-24);
  background-color: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-shadow: var(--shadow-sm);
}

.event-card:hover {
  border-color: var(--fr-400);
  box-shadow: var(--shadow-md);
}

.event-card--cancelled {
  opacity: 0.65;
}

.event-card--past {
  background-color: var(--bg-page);
  opacity: 0.8;
}

.event-card--past:hover {
  opacity: 1;
}

/* ── Card meta row ──────────────────────────────────────────────── */

.card-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-8);
}

.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-8);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge--event {
  background-color: var(--fr-50);
  border: 1px solid var(--fr-200);
  color: var(--fr-800);
}

.badge--announcement {
  background-color: var(--cv-50);
  border: 1px solid var(--cv-100);
  color: var(--cv-600);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-8);
  border-radius: var(--radius-sm);
  background-color: var(--fr-100);
  border: 1px solid var(--fr-200);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--fr-800);
  white-space: nowrap;
}

.event-date {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-left: auto;
}

/* ── Card content ───────────────────────────────────────────────── */

.event-title {
  font-family: var(--font-serif);
  font-size: var(--text-xl);
  font-weight: 500;
  color: var(--fr-950);
  line-height: var(--line-height-tight);
  margin: 0;
}

.title--cancelled {
  text-decoration: line-through;
  color: var(--text-muted);
}

.event-summary {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.read-more {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--fr-600);
  align-self: flex-end;
  margin-top: var(--space-4);
}

/* ── Empty ──────────────────────────────────────────────────────── */

.empty-text {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
}
</style>
