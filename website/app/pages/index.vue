<script setup lang="ts">
import tauRaw from '~/assets/tau.svg?raw'

const { t } = useI18n()
const config = useRuntimeConfig()

const parishName = config.public.parishName as string
const parishShortName = (config.public as any).parishShortName as string
const parishDiocese = config.public.parishDiocese as string
const parishOrder = config.public.parishOrder as string

const { data: chapels } = await useAsyncData('capelas', () =>
  queryCollection('capelas').order('type', 'DESC').all()
)

const events = ref<any[]>([])
const latestNews = ref<any>(null)
const latestAnnouncement = ref<any>(null)

const showEvent = computed(() =>
  events.value.some((e) => e.status === 'active' && new Date(e.date) > new Date())
)
const nextEvent = computed(() =>
  events.value.find((e) => e.status === 'active' && new Date(e.date) > new Date()) ?? null
)

const dayLabel = (day: number): string => t(`w_day.${day}`)
const formatMasses = (masses: Array<{ day: number; time: string }> | undefined): string =>
  masses?.length ? masses.map((m) => `${dayLabel(m.day)} ${m.time}`).join(' · ') : '—'

const { currentDay, currentTime } = useParishTime()
const currentMinutes = computed(() => {
  const parts = currentTime.value.split(':').map(Number)
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0)
})

function isConfessionNow(chapel: any): boolean {
  if (!chapel.confession?.length) return false
  return chapel.confession.some((c: any) => {
    if (!c.days.includes(currentDay.value)) return false
    const parts = (s: string) => s.split(':').map(Number)
    const start = (parts(c.time_start)[0] ?? 0) * 60 + (parts(c.time_start)[1] ?? 0)
    const end   = (parts(c.time_end)[0]   ?? 0) * 60 + (parts(c.time_end)[1]   ?? 0)
    return currentMinutes.value >= start && currentMinutes.value < end
  })
}

useHead({ title: parishName })
</script>

<template>
  <main class="home">
    <div class="bento">

      <article class="card card-hero">
        <span class="tau-mark" v-html="tauRaw" aria-hidden="true" />
        <p class="eyebrow">{{ parishOrder }}</p>
        <h1 class="hero-title">{{ parishShortName }}</h1>
        <p class="hero-subtitle">{{ parishDiocese }}</p>
        <nav class="hero-links" aria-label="Atalhos">
          <NuxtLink to="/capelas" class="hero-link hero-link--outline">
            {{ t('home.hero.link_masses') }}
          </NuxtLink>
          <NuxtLink to="/capelas" class="hero-link hero-link--outline">
            {{ t('home.hero.link_location') }}
          </NuxtLink>
        </nav>
      </article>

      <article class="card card-status">
        <StatusPanel />
      </article>

      <article v-if="showEvent" class="card card-event">
        <p class="eyebrow">{{ t('home.event.eyebrow') }}</p>
        <h2 class="heading-section card-title">{{ nextEvent?.title }}</h2>
        <p class="body-text card-body">{{ nextEvent?.summary }}</p>
        <NuxtLink to="/eventos" class="card-link">{{ t('home.event.link') }}</NuxtLink>
      </article>

      <article class="card card-news" :class="showEvent ? 'news--with-event' : 'news--solo'">
        <p class="eyebrow">{{ t('home.news.eyebrow') }}</p>
        <template v-if="latestNews">
          <h2 class="heading-section card-title">{{ latestNews.title }}</h2>
          <p class="body-text card-body">{{ latestNews.summary }}</p>
          <NuxtLink to="/noticias" class="card-link">{{ t('home.news.link') }}</NuxtLink>
        </template>
        <template v-else>
          <h2 class="heading-section card-title">{{ t('home.news.empty_title') }}</h2>
          <p class="body-text card-body">{{ t('home.news.empty_body') }}</p>
        </template>
      </article>

      <article class="card card-announcement" :class="showEvent ? 'ann--with-event' : 'ann--solo'">
        <p class="eyebrow">{{ t('home.announcement.eyebrow') }}</p>
        <template v-if="latestAnnouncement">
          <h2 class="heading-section card-title">{{ latestAnnouncement.title }}</h2>
          <p class="body-text card-body">{{ latestAnnouncement.summary }}</p>
          <NuxtLink to="/eventos" class="card-link">{{ t('home.announcement.link') }}</NuxtLink>
        </template>
        <template v-else>
          <h2 class="heading-section card-title">{{ t('home.announcement.empty_title') }}</h2>
          <p class="body-text card-body">{{ t('home.announcement.empty_body') }}</p>
        </template>
      </article>

      <article class="card card-chapels">
        <p class="eyebrow">{{ t('home.chapels.eyebrow') }}</p>
        <div class="table-wrap chapels-table">
          <table class="chapel-table">
            <thead>
              <tr>
                <th>{{ t('home.chapels.col_chapel') }}</th>
                <th>{{ t('home.chapels.col_masses') }}</th>
                <th>{{ t('home.chapels.col_confession') }}</th>
                <th>{{ t('home.chapels.col_catechism') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="chapel in chapels"
                :key="chapel.path"
                :class="chapel.type === 'matriz' ? 'row-matriz' : 'row-branch'"
              >
                <td class="cell-name">
                  <span class="type-dot" :class="chapel.type === 'matriz' ? 'dot-matriz' : 'dot-branch'" />
                  {{ chapel.name }}
                </td>
                <td class="cell-masses">{{ formatMasses(chapel.masses) }}</td>
                <td class="cell-confession">
                  <span v-if="isConfessionNow(chapel)" class="confession-dot" aria-label="Sim" />
                  <span v-else class="text-muted">{{ t('home.chapels.confession_none') }}</span>
                </td>
                <td class="cell-catechism">
                  <template v-if="chapel.catechism?.length">
                    <span
                      v-for="cat in chapel.catechism"
                      :key="cat.group"
                      class="cat-pill"
                    >{{ cat.group }}</span>
                  </template>
                  <span v-else class="text-muted">{{ t('home.chapels.catechism_none') }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="chapels-carousel">
          <ChapelCard
            v-for="chapel in chapels"
            :key="chapel.path"
            :chapel="(chapel as any)"
            class="carousel-item"
          />
        </div>
      </article>

      <article class="card card-tithe">
        <p class="eyebrow eyebrow-tithe">{{ t('home.tithe.eyebrow') }}</p>
        <h2 class="tithe-title">{{ t('home.tithe.title') }}</h2>
        <p class="tithe-body">{{ t('home.tithe.body') }}</p>
        <NuxtLink to="/dizimo" class="tithe-cta">{{ t('home.tithe.cta') }}</NuxtLink>
      </article>

      <article class="card card-instagram">
        <p class="eyebrow">{{ t('home.instagram.eyebrow') }}</p>
        <div class="instagram-placeholder">
          <p class="body-text text-muted">{{ t('home.instagram.placeholder') }}</p>
        </div>
      </article>

      <article class="card card-ministries">
        <p class="eyebrow">{{ t('home.ministries.eyebrow') }}</p>
        <p class="body-text text-muted">{{ t('home.ministries.empty') }}</p>
      </article>

    </div>
  </main>
</template>

<style scoped>
/* ── Layout ────────────────────────────────────────────────────── */

.home {
  background-color: var(--bg-alt);
  min-height: 100vh;
  overflow-x: clip;
}

.bento {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--space-16);
  padding: var(--space-24);
  max-width: 1440px;
  margin: 0 auto;
}

/* ── Base card ─────────────────────────────────────────────────── */

.card {
  background-color: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-24);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ── Desktop column placements (12-col) ────────────────────────── */

.card-hero        { grid-column: 1 / 9; }
.card-status      { grid-column: 9 / 13; padding: 0; overflow: hidden; }
.card-event       { grid-column: 1 / 5; }
.news--with-event { grid-column: 5 / 9; }
.news--solo       { grid-column: 1 / 7; }
.ann--with-event  { grid-column: 9 / 13; }
.ann--solo        { grid-column: 7 / 13; }
.card-chapels     { grid-column: 1 / 9; }
.card-tithe       { grid-column: 9 / 13; }
.card-instagram   { grid-column: 1 / 7; }
.card-ministries  { grid-column: 7 / 13; }

/* ── Tablet (6-col, 640px–1023px) ──────────────────────────────── */

@media (min-width: 640px) and (max-width: 1023px) {
  .bento { grid-template-columns: repeat(6, minmax(0, 1fr)); }

  .card-hero        { grid-column: 1 / 7; }
  .card-status      { grid-column: 1 / 7; }
  .card-event       { grid-column: 1 / 7; }
  .news--with-event,
  .news--solo       { grid-column: 1 / 4; }
  .ann--with-event,
  .ann--solo        { grid-column: 4 / 7; }
  .card-chapels     { grid-column: 1 / 7; }
  .card-tithe       { grid-column: 1 / 4; }
  .card-instagram   { grid-column: 4 / 7; }
  .card-ministries  { grid-column: 1 / 7; }
}

/* ── Mobile (1-col, <640px) ────────────────────────────────────── */

@media (max-width: 639px) {
  .bento { grid-template-columns: 1fr; gap: var(--space-12); padding: var(--space-16); }

  .card-hero, .card-status,
  .card-event,
  .news--with-event, .news--solo,
  .ann--with-event, .ann--solo,
  .card-chapels, .card-tithe,
  .card-instagram, .card-ministries { grid-column: 1 / -1; }
}

/* ── Hero internals ────────────────────────────────────────────── */

.tau-mark {
  display: block;
  width: 28px;
  height: 36px;
  color: var(--fr-400);
  margin-bottom: var(--space-16);
}

.tau-mark :deep(svg) {
  width: 100%;
  height: 100%;
}

.card-hero .eyebrow {
  margin-bottom: var(--space-12);
}

.hero-title {
  font-family: var(--font-serif);
  font-size: var(--text-4xl);
  font-weight: 500;
  color: var(--fr-950);
  line-height: var(--line-height-tight);
  margin: 0 0 var(--space-4);
}

.hero-subtitle {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0 0 var(--space-16);
}

.diocese-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-4) var(--space-12);
  border: 1px solid var(--fr-400);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--fr-800);
  margin-bottom: var(--space-24);
  align-self: flex-start;
}

.hero-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
  margin-top: auto;
}

.hero-link {
  display: inline-flex;
  align-items: center;
  padding: var(--space-8) var(--space-16);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  text-decoration: none;
  transition: opacity 0.15s;
}

.hero-link:hover { opacity: 0.85; }

.hero-link--outline {
  background-color: transparent;
  color: var(--fr-600);
  border: 1px solid var(--fr-600);
}

/* ── Card shared internals ─────────────────────────────────────── */

.card-title {
  margin: var(--space-8) 0 var(--space-12);
}

.card-body {
  flex: 1;
  color: var(--text-muted);
}

.card-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-16);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--fr-600);
  text-decoration: none;
}

.card-link:hover { text-decoration: underline; }

/* ── Chapel table ──────────────────────────────────────────────── */

.table-wrap {
  overflow-x: auto;
  margin-top: var(--space-16);
}

.chapel-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
}

.chapel-table th {
  text-align: left;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fr-600);
  padding: var(--space-8) var(--space-12);
  border-bottom: 1px solid var(--border-default);
}

.chapel-table td {
  padding: var(--space-12);
  border-bottom: 1px solid var(--border-default);
  color: var(--text-primary);
  vertical-align: middle;
}

.row-matriz td { background-color: var(--fr-50); }
.row-branch td { background-color: var(--bg-page); }

.chapel-table tbody tr:last-child td { border-bottom: none; }

.cell-name {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  font-weight: 500;
  white-space: nowrap;
}

.type-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-matriz { background-color: var(--fr-400); }
.dot-branch { background-color: var(--border-default); }

.cell-masses { color: var(--text-muted); white-space: nowrap; }

.confession-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--cv-400);
}

.cell-catechism {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.cat-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-8);
  border-radius: var(--radius-sm);
  background-color: var(--cv-50);
  color: var(--cv-600);
  font-size: var(--text-xs);
  font-weight: 500;
  white-space: nowrap;
}

.text-muted { color: var(--text-muted); }

/* ── Chapel carousel (tablet + mobile) ─────────────────────────── */

.chapels-carousel {
  display: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  gap: var(--space-16);
  margin-top: var(--space-16);
  padding-bottom: var(--space-4);
}

.carousel-item {
  flex-shrink: 0;
  width: 260px;
  scroll-snap-align: start;
}

@media (max-width: 1023px) {
  .chapels-table { display: none; }
  .chapels-carousel { display: flex; }
}

/* ── Tithe card ────────────────────────────────────────────────── */

.card-tithe {
  background-color: var(--fr-100);
  border-color: var(--fr-400);
}

.eyebrow-tithe { color: var(--fr-800); }

.tithe-title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  font-weight: 500;
  color: var(--fr-950);
  line-height: var(--line-height-tight);
  margin: var(--space-8) 0 var(--space-12);
}

.tithe-body {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  line-height: var(--line-height-relaxed);
  color: var(--fr-800);
  flex: 1;
}

.tithe-cta {
  display: inline-flex;
  align-items: center;
  margin-top: var(--space-24);
  padding: var(--space-8) var(--space-20);
  background-color: var(--fr-950);
  color: #fff;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  text-decoration: none;
  align-self: flex-start;
  transition: opacity 0.15s;
}

.tithe-cta:hover { opacity: 0.85; }

/* ── Instagram placeholder ─────────────────────────────────────── */

.instagram-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--space-16);
  border: 2px dashed var(--border-default);
  border-radius: var(--radius-md);
  min-height: 180px;
}
</style>
