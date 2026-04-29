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

interface ChapelContact {
  phone?: string
  whatsapp?: string
  email?: string
}

interface ChapelSocial {
  instagram?: string
  facebook?: string
  youtube?: string
}

const { t } = useI18n()
const config = useRuntimeConfig()
const route = useRoute()
const slug = route.params.slug as string

const { data: chapel } = await useAsyncData(`chapel-${slug}`, () =>
  queryCollectionItemByPath('capelas', `/capelas/${slug}`)
)

if (!chapel.value) {
  throw createError({ statusCode: 404, statusMessage: 'Chapel not found' })
}

const isMatriz = computed(() => chapel.value?.type === 'matriz')

const contact = computed((): ChapelContact => (chapel.value as any)?.contact ?? {})
const social = computed((): ChapelSocial => (chapel.value as any)?.social ?? {})
const pastor = computed((): string | undefined => (chapel.value as any)?.pastor)
const coordinates = computed(() => (chapel.value as any)?.coordinates as { lat: number; lng: number } | undefined)

const mapSrc = computed(() => {
  if (coordinates.value) {
    return `https://maps.google.com/maps?q=${coordinates.value.lat},${coordinates.value.lng}&z=16&output=embed`
  }
  const address = chapel.value?.address ?? ''
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`
})

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

const instagramUrl = computed(() =>
  social.value.instagram
    ? `https://instagram.com/${social.value.instagram.replace('@', '')}`
    : null
)
const facebookUrl = computed(() =>
  social.value.facebook
    ? `https://facebook.com/${social.value.facebook}`
    : null
)
const youtubeUrl = computed(() =>
  social.value.youtube
    ? `https://youtube.com/@${social.value.youtube.replace('@', '')}`
    : null
)
const whatsappUrl = computed(() =>
  contact.value.whatsapp
    ? `https://wa.me/${contact.value.whatsapp.replace(/\D/g, '')}`
    : null
)

useHead({ title: `${chapel.value?.name} — ${config.public.parishShortName as string}` })
</script>

<template>
  <main class="chapel-detail-page">
    <div class="detail-container">

      <NuxtLink to="/capelas" class="back-link">{{ t('capelas.back') }}</NuxtLink>

      <!-- ── Header ──────────────────────────────────────────────── -->
      <header class="detail-header" :class="isMatriz ? 'header--matriz' : 'header--branch'">
        <div class="header-brand">
          <span v-if="isMatriz" class="tau-mark" v-html="tauRaw" aria-hidden="true" />
          <div>
            <span class="type-badge" :class="isMatriz ? 'badge--matriz' : 'badge--branch'">
              {{ t(isMatriz ? 'chapel.type.matriz' : 'chapel.type.branch') }}
            </span>
            <h1 class="chapel-name">{{ chapel!.name }}</h1>
            <p v-if="pastor" class="pastor-text">{{ t('capelas.pastor') }}: {{ pastor }}</p>
          </div>
        </div>

        <div class="header-info">
          <div class="contact-block">
            <p v-if="chapel!.address" class="contact-row">
              <span class="contact-label">{{ t('capelas.address_label') }}</span>
              <span>{{ chapel!.address }}</span>
            </p>
            <p v-if="contact.phone" class="contact-row">
              <span class="contact-label">{{ t('capelas.contact_phone') }}</span>
              <a :href="`tel:${contact.phone}`" class="contact-link">{{ contact.phone }}</a>
            </p>
            <p v-if="contact.whatsapp" class="contact-row">
              <span class="contact-label">{{ t('capelas.contact_whatsapp') }}</span>
              <a :href="whatsappUrl!" class="contact-link" target="_blank" rel="noopener">{{ contact.whatsapp }}</a>
            </p>
            <p v-if="contact.email" class="contact-row">
              <span class="contact-label">{{ t('capelas.contact_email') }}</span>
              <a :href="`mailto:${contact.email}`" class="contact-link">{{ contact.email }}</a>
            </p>
          </div>

          <div v-if="instagramUrl || facebookUrl || youtubeUrl" class="social-block">
            <p class="contact-label">{{ t('capelas.social_links') }}</p>
            <div class="social-links">
              <a v-if="instagramUrl" :href="instagramUrl" target="_blank" rel="noopener" class="social-link">Instagram</a>
              <a v-if="facebookUrl" :href="facebookUrl" target="_blank" rel="noopener" class="social-link">Facebook</a>
              <a v-if="youtubeUrl" :href="youtubeUrl" target="_blank" rel="noopener" class="social-link">YouTube</a>
            </div>
          </div>
        </div>
      </header>

      <!-- ── Schedule + Map ─────────────────────────────────────── -->
      <div class="detail-grid">

        <section class="schedule-card">
          <p class="section-eyebrow">{{ t('capelas.schedule_section') }}</p>

          <div class="schedule-block">
            <p class="section-label">{{ t('capelas.masses_label') }}</p>
            <template v-if="(chapel!.masses as MassEntry[] | undefined)?.length">
              <div v-for="(entry, i) in (chapel!.masses as MassEntry[])" :key="i" class="mass-entry">
                <div class="pills-row">
                  <template v-for="day in entry.days" :key="day">
                    <span
                      v-for="time in entry.times"
                      :key="`${day}-${time}`"
                      class="mass-pill"
                      :class="{ 'mass-pill--noted': massNoteApplies(entry, day) }"
                    >{{ dayLabel(day) }} {{ time }}<em v-if="massNoteApplies(entry, day)" class="pill-note"> {{ entry.note }}</em>
                    </span>
                  </template>
                </div>
              </div>
            </template>
            <p v-else class="empty-text">{{ t('capelas.no_masses') }}</p>
          </div>

          <div v-if="(chapel!.confession as ConfessionSlot[] | undefined)?.length" class="schedule-block">
            <p class="section-label">{{ t('capelas.confession_label') }}</p>
            <div
              v-for="(slot, i) in (chapel!.confession as ConfessionSlot[])"
              :key="i"
              class="conf-row"
            >
              <span class="conf-dot" aria-hidden="true" />
              <span class="conf-text">{{ formatConfessionDays(slot) }} · {{ slot.time_start }}–{{ slot.time_end }}</span>
            </div>
          </div>

          <div v-if="(chapel!.catechism as CatechismGroup[] | undefined)?.length" class="schedule-block">
            <p class="section-label">{{ t('capelas.catechism_label') }}</p>
            <div
              v-for="group in (chapel!.catechism as CatechismGroup[])"
              :key="group.group"
              class="cat-row"
            >
              <span class="cat-name">{{ group.group }}</span>
              <span class="cat-schedule">{{ formatCatechismDays(group) }} · {{ group.time }}</span>
            </div>
          </div>
        </section>

        <section class="map-card">
          <p class="section-eyebrow">{{ t('capelas.map_section') }}</p>
          <div class="map-wrapper">
            <iframe
              :src="mapSrc"
              class="map-iframe"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              allowfullscreen
              :title="`Mapa — ${chapel!.name}`"
            />
          </div>
        </section>

      </div>

      <!-- ── Body content ───────────────────────────────────────── -->
      <section v-if="chapel!.body" class="content-section">
        <p class="section-eyebrow">{{ t('capelas.content_section') }}</p>
        <ContentRenderer :value="chapel!" class="prose" />
      </section>

    </div>
  </main>
</template>

<style scoped>
/* ── Page shell ─────────────────────────────────────────────────── */

.chapel-detail-page {
  background-color: var(--bg-alt);
  min-height: 100vh;
  padding: var(--space-32) 0 var(--space-64);
}

.detail-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-32);
}

/* ── Back link ──────────────────────────────────────────────────── */

.back-link {
  display: inline-flex;
  align-self: flex-start;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--fr-600);
  text-decoration: none;
}

.back-link:hover { text-decoration: underline; }

/* ── Header card ────────────────────────────────────────────────── */

.detail-header {
  background-color: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-32);
  display: flex;
  flex-direction: column;
  gap: var(--space-24);
  box-shadow: var(--shadow-sm);
}

.header--matriz {
  background-color: var(--fr-50);
  border-color: var(--fr-400);
  border-left: 4px solid var(--fr-600);
}

.header-brand {
  display: flex;
  align-items: flex-start;
  gap: var(--space-20);
}

.tau-mark {
  flex-shrink: 0;
  display: block;
  width: 28px;
  height: 36px;
  color: var(--fr-400);
  margin-top: var(--space-4);
}

.tau-mark :deep(svg) { width: 100%; height: 100%; }

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
  margin-bottom: var(--space-8);
}

.badge--matriz { background-color: var(--fr-200); color: var(--fr-950); }
.badge--branch { background-color: var(--bg-alt); color: var(--text-muted); }

.chapel-name {
  font-family: var(--font-serif);
  font-size: var(--text-3xl);
  font-weight: 500;
  color: var(--fr-950);
  line-height: var(--line-height-tight);
  margin: 0 0 var(--space-4);
}

.pastor-text {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
}

/* ── Contact + social ───────────────────────────────────────────── */

.header-info {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-24);
  padding-top: var(--space-20);
  border-top: 1px solid var(--fr-200);
}

.header--branch .header-info {
  border-top-color: var(--border-default);
}

.contact-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.contact-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-8);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-primary);
  margin: 0;
}

.contact-label {
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fr-600);
  white-space: nowrap;
}

.contact-link {
  color: var(--fr-600);
  text-decoration: none;
}

.contact-link:hover { text-decoration: underline; }

.social-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
}

.social-link {
  display: inline-flex;
  padding: 4px var(--space-12);
  border-radius: var(--radius-sm);
  background-color: var(--bg-page);
  border: 1px solid var(--border-default);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  transition: border-color 0.12s;
}

.header--matriz .social-link { background-color: var(--fr-50); }

.social-link:hover { border-color: var(--fr-400); color: var(--fr-800); }

/* ── Schedule + Map grid ────────────────────────────────────────── */

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-16);
}

@media (max-width: 767px) {
  .detail-grid { grid-template-columns: 1fr; }
}

/* ── Schedule card ──────────────────────────────────────────────── */

.schedule-card {
  background-color: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-20);
  box-shadow: var(--shadow-sm);
}

.schedule-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
  gap: 10px;
  padding-top: var(--space-16);
  border-top: 1px solid var(--border-default);
}

.schedule-block:first-of-type {
  padding-top: 0;
  border-top: none;
}

/* ── Map card ───────────────────────────────────────────────────── */

.map-card {
  background-color: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  box-shadow: var(--shadow-sm);
}

.map-wrapper {
  flex: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  min-height: 280px;
}

.map-iframe {
  width: 100%;
  height: 100%;
  min-height: 280px;
  border: none;
  display: block;
}

/* ── Section labels ─────────────────────────────────────────────── */

.section-eyebrow {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fr-600);
  margin: 0;
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

.empty-text {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
}

/* ── Mass pills ─────────────────────────────────────────────────── */

.mass-entry { display: flex; flex-direction: column; gap: var(--space-4); }

.pills-row { display: flex; flex-wrap: wrap; gap: var(--space-4); }

.mass-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px var(--space-8);
  border-radius: var(--radius-sm);
  background-color: var(--fr-50);
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

.conf-row { display: flex; align-items: center; gap: var(--space-8); }

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

.cat-row { display: flex; flex-direction: column; gap: 2px; }

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

/* ── Body content ───────────────────────────────────────────────── */

.content-section {
  background-color: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-32);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-20);
}

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
</style>
