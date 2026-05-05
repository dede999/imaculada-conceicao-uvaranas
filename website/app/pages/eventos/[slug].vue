<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()
const route = useRoute()
const slug = route.params.slug as string

const { data: event } = await useAsyncData(`event-${slug}`, () =>
  queryCollection('events').path(`/events/${slug}`).first()
)

if (!event.value) {
  throw createError({ statusCode: 404, statusMessage: 'Event not found' })
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(Date.UTC(year!, month! - 1, day!)))
}

const isCancelled = computed(() => event.value?.status === 'cancelled')
const isPostponed = computed(() => event.value?.status === 'postponed')

useHead({ title: `${event.value?.title} — ${config.public.parishShortName}` })
</script>

<template>
  <main class="evento-page">
    <div class="page-container">

      <NuxtLink to="/eventos" class="back-link">{{ t('eventos.back') }}</NuxtLink>

      <article class="evento-article">

        <div v-if="isCancelled || isPostponed" class="status-banner" :class="isCancelled ? 'banner--cancelled' : 'banner--postponed'">
          {{ t(isCancelled ? 'eventos.status_cancelled' : 'eventos.status_postponed') }}
        </div>

        <header class="article-header">
          <div class="header-meta">
            <span
              class="type-badge"
              :class="event!.type === 'event' ? 'badge--event' : 'badge--announcement'"
            >
              {{ t(event!.type === 'event' ? 'eventos.badge_event' : 'eventos.badge_announcement') }}
            </span>
            <time class="event-date" :datetime="event!.date">{{ formatDate(event!.date) }}</time>
            <time v-if="event!.end_date && event!.end_date !== event!.date" class="event-date">
              — {{ formatDate(event!.end_date!) }}
            </time>
          </div>
          <h1 class="article-title" :class="{ 'title--cancelled': isCancelled }">
            {{ event!.title }}
          </h1>
          <p class="article-summary">{{ event!.summary }}</p>
        </header>

        <div class="article-divider" />

        <ContentRenderer :value="event!" class="prose" />

      </article>

    </div>
  </main>
</template>

<style scoped>
.evento-page {
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
  gap: var(--space-24);
}

/* ── Back link ──────────────────────────────────────────────────── */

.back-link {
  display: inline-flex;
  align-self: flex-start;
  padding: var(--space-8) var(--space-16);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-default);
  background-color: var(--bg-page);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  transition: border-color 0.12s, color 0.12s;
}

.back-link:hover {
  border-color: var(--fr-400);
  color: var(--fr-800);
}

/* ── Status banner ──────────────────────────────────────────────── */

.status-banner {
  padding: var(--space-12) var(--space-20);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.banner--cancelled {
  background-color: var(--fr-50);
  border: 1px solid var(--fr-200);
  color: var(--fr-800);
}

.banner--postponed {
  background-color: var(--fr-100);
  border: 1px solid var(--fr-200);
  color: var(--fr-800);
}

/* ── Article ────────────────────────────────────────────────────── */

.evento-article {
  background-color: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-40);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-24);
}

.article-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

.header-meta {
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

.event-date {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.article-title {
  font-family: var(--font-serif);
  font-size: var(--text-3xl);
  font-weight: 500;
  color: var(--fr-950);
  line-height: var(--line-height-tight);
  margin: 0;
}

.title--cancelled {
  text-decoration: line-through;
  color: var(--text-muted);
}

.article-summary {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--text-muted);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.article-divider {
  height: 1px;
  background-color: var(--border-default);
}

/* ── Prose ──────────────────────────────────────────────────────── */

.prose {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
  max-width: 72ch;
}

.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3) {
  font-family: var(--font-serif);
  font-weight: 500;
  color: var(--fr-950);
  line-height: var(--line-height-tight);
  margin: var(--space-24) 0 var(--space-8);
}

.prose :deep(h1) { font-size: var(--text-2xl); }
.prose :deep(h2) { font-size: var(--text-xl); }
.prose :deep(h3) { font-size: var(--text-lg); }

.prose :deep(p) { margin: 0 0 var(--space-16); }

.prose :deep(ul),
.prose :deep(ol) {
  padding-left: var(--space-20);
  margin: 0 0 var(--space-16);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.prose :deep(strong) { font-weight: 600; color: var(--fr-950); }
.prose :deep(a) { color: var(--fr-600); }
.prose :deep(a:hover) { text-decoration: underline; }

@media (max-width: 767px) {
  .evento-article { padding: var(--space-24); }
  .article-title { font-size: var(--text-2xl); }
}
</style>
