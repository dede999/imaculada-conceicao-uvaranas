<script setup lang="ts">
import tauRaw from '~/assets/tau.svg?raw'
import type { ChapelContact, ChapelImage, Mass, Confession, CatechismGroup } from '~/composables/useChapels'

const SOCIAL_TYPES = new Set(['instagram', 'facebook', 'youtube', 'tiktok'])
const PRIMARY_TYPES = new Set(['phone', 'whatsapp', 'email'])

const { t } = useI18n()
const config = useRuntimeConfig()
const route = useRoute()
const slug = route.params.slug as string

const { data: chapel } = await useChapel(slug)

if (!chapel.value) {
  throw createError({ statusCode: 404, statusMessage: 'Chapel not found' })
}

const { data: allChapels } = await useChapels()
const otherChapels = computed(() =>
  allChapels.value?.filter(c => c.slug !== chapel.value?.slug) ?? []
)

const isMatriz = computed(() => chapel.value?.type === 'matriz')

const primaryContacts = computed(() =>
  (chapel.value?.contacts ?? []).filter(c => PRIMARY_TYPES.has(c.type))
)
const socialContacts = computed(() =>
  (chapel.value?.contacts ?? []).filter(c => SOCIAL_TYPES.has(c.type))
)

function contactUrl(contact: ChapelContact): string | null {
  if (contact.type === 'phone') return `tel:${contact.value}`
  if (contact.type === 'whatsapp') return `https://wa.me/${contact.value.replace(/\D/g, '')}`
  if (contact.type === 'email') return `mailto:${contact.value}`
  if (contact.type === 'instagram') return `https://instagram.com/${contact.value.replace('@', '')}`
  if (contact.type === 'facebook') return `https://facebook.com/${contact.value}`
  if (contact.type === 'youtube') return `https://youtube.com/@${contact.value.replace('@', '')}`
  if (contact.type === 'tiktok') return `https://tiktok.com/@${contact.value.replace('@', '')}`
  return null
}

function contactLabel(type: string): string {
  const map: Record<string, string> = {
    phone: 'Telefone', whatsapp: 'WhatsApp', email: 'E-mail',
    instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube', tiktok: 'TikTok',
  }
  return map[type] ?? type
}

const mapSrc = computed(() => {
  if (chapel.value?.lat && chapel.value?.lng) {
    return `https://maps.google.com/maps?q=${chapel.value.lat},${chapel.value.lng}&z=16&output=embed`
  }
  const address = chapel.value?.address ?? ''
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`
})

function dayLabel(day: number): string {
  return t(`w_day.${day}`)
}

function groupConfessions(confessions: Confession[]) {
  const map = new Map<string, number[]>()
  for (const c of confessions) {
    const key = `${c.time_start}-${c.time_end}`
    const days = map.get(key) ?? []
    days.push(c.day_of_week)
    map.set(key, days)
  }
  return Array.from(map.entries()).map(([key, days]) => {
    const [time_start, time_end] = key.split('-')
    return { key, time_start, time_end, days: [...new Set(days)].sort() }
  })
}

// ── Image gallery ──────────────────────────────────────────────────
const hasText = computed(() => !!chapel.value?.body)
const images = computed((): ChapelImage[] => chapel.value?.images ?? [])
const hasImages = computed(() => images.value.length > 0)

// ── Modal ──────────────────────────────────────────────────────────
const modalOpen = ref(false)
const modalIndex = ref(0)

function openModal(index: number) {
  modalIndex.value = index
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function prevImage() {
  modalIndex.value = (modalIndex.value - 1 + images.value.length) % images.value.length
}

function nextImage() {
  modalIndex.value = (modalIndex.value + 1) % images.value.length
}

function handleKeydown(e: KeyboardEvent) {
  if (!modalOpen.value) return
  if (e.key === 'Escape') closeModal()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
}

const touchStartX = ref(0)

function onTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX
}

function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX.value
  if (Math.abs(dx) > 50) dx < 0 ? nextImage() : prevImage()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

watch(modalOpen, (open) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
})

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
            <p v-if="chapel!.pastor" class="pastor-text">{{ t('capelas.pastor') }}: {{ chapel!.pastor }}</p>
          </div>
        </div>

        <div class="header-info">
          <div class="contact-block">
            <p v-if="chapel!.address" class="contact-row">
              <span class="contact-label">{{ t('capelas.address_label') }}</span>
              <span>{{ chapel!.address }}</span>
            </p>
            <p
              v-for="contact in primaryContacts"
              :key="contact.id"
              class="contact-row"
            >
              <span class="contact-label">{{ contactLabel(contact.type) }}</span>
              <a
                v-if="contactUrl(contact)"
                :href="contactUrl(contact)!"
                class="contact-link"
                :target="contact.type === 'email' || contact.type === 'phone' ? undefined : '_blank'"
                :rel="contact.type === 'email' || contact.type === 'phone' ? undefined : 'noopener'"
              >{{ contact.value }}</a>
              <span v-else>{{ contact.value }}</span>
            </p>
          </div>

          <div v-if="socialContacts.length" class="social-block">
            <p class="contact-label">{{ t('capelas.social_links') }}</p>
            <div class="social-links">
              <a
                v-for="contact in socialContacts"
                :key="contact.id"
                :href="contactUrl(contact) ?? '#'"
                target="_blank"
                rel="noopener"
                class="social-link"
              >{{ contactLabel(contact.type) }}</a>
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
            <div v-if="(chapel!.masses as Mass[]).length" class="pills-row">
              <span
                v-for="mass in (chapel!.masses as Mass[])"
                :key="`${mass.day_of_week}-${mass.time}`"
                class="mass-pill"
                :class="{ 'mass-pill--noted': !!mass.note }"
              >
                {{ dayLabel(mass.day_of_week) }} {{ mass.time }}
                <em v-if="mass.note" class="pill-note"> {{ mass.note }}</em>
              </span>
            </div>
            <p v-else class="empty-text">{{ t('capelas.no_masses') }}</p>
          </div>

          <div v-if="(chapel!.confessions as Confession[]).length" class="schedule-block">
            <p class="section-label">{{ t('capelas.confession_label') }}</p>
            <div
              v-for="slot in groupConfessions(chapel!.confessions as Confession[])"
              :key="slot.key"
              class="conf-row"
            >
              <span class="conf-dot" aria-hidden="true" />
              <span class="conf-text">{{ slot.days.map(dayLabel).join(', ') }} · {{ slot.time_start }}–{{ slot.time_end }}</span>
            </div>
          </div>

          <div v-if="(chapel!.catechism_groups as CatechismGroup[]).length" class="schedule-block">
            <p class="section-label">{{ t('capelas.catechism_label') }}</p>
            <div
              v-for="group in (chapel!.catechism_groups as CatechismGroup[])"
              :key="group.id"
              class="cat-row"
            >
              <span class="cat-name">{{ group.group_name }}</span>
              <span class="cat-schedule">
                {{ group.day_of_week != null ? dayLabel(group.day_of_week) : '—' }}
                {{ group.time ? `· ${group.time}` : '' }}
              </span>
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

      <!-- ── Body content + images ──────────────────────────────── -->
      <section v-if="hasText || hasImages" class="content-section">
        <p class="section-eyebrow">{{ t('capelas.content_section') }}</p>

        <!-- only images, no text -->
        <div v-if="hasImages && !hasText" class="images-only">
          <figure
            v-for="(img, i) in images"
            :key="img.id"
            class="image-figure image-figure--centered"
          >
            <img
              :src="img.url"
              :alt="img.caption ?? ''"
              class="chapel-image"
              @click="openModal(i)"
            />
            <figcaption v-if="img.caption" class="image-caption">{{ img.caption }}</figcaption>
          </figure>
        </div>

        <!-- text with images floated right -->
        <div v-else-if="hasText && hasImages" class="text-with-images">
          <div class="images-float">
            <figure
              v-for="(img, i) in images"
              :key="img.id"
              class="image-figure"
            >
              <img
                :src="img.url"
                :alt="img.caption ?? ''"
                class="chapel-image"
                @click="openModal(i)"
              />
              <figcaption v-if="img.caption" class="image-caption">{{ img.caption }}</figcaption>
            </figure>
          </div>
          <div v-html="chapel!.body" class="prose" />
          <div class="clearfix" />
        </div>

        <!-- only text -->
        <div v-else v-html="chapel!.body" class="prose" />
      </section>

      <!-- ── Other chapels ─────────────────────────────────────── -->
      <section v-if="otherChapels.length" class="other-chapels-section">
        <p class="section-eyebrow">{{ t('capelas.other_chapels') }}</p>
        <div class="other-chapels-grid">
          <NuxtLink
            v-for="other in otherChapels"
            :key="other.slug"
            :to="`/capelas/${other.slug}`"
            class="other-chapel-card"
          >
            <span
              class="other-type-badge"
              :class="other.type === 'matriz' ? 'badge--matriz' : 'badge--branch'"
            >
              {{ t(other.type === 'matriz' ? 'chapel.type.matriz' : 'chapel.type.branch') }}
            </span>
            <p class="other-chapel-name">{{ other.name }}</p>
            <p v-if="other.address" class="other-chapel-address">{{ other.address }}</p>
            <span class="other-chapel-cta">{{ t('capelas.view_detail') }} →</span>
          </NuxtLink>
        </div>
      </section>

    </div>
  </main>

  <!-- ── Image modal ────────────────────────────────────────────── -->
  <Teleport to="body">
    <div
      v-if="modalOpen"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="t('capelas.modal_label')"
      @click.self="closeModal"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <button
        class="modal-close"
        :aria-label="t('capelas.modal_close')"
        @click="closeModal"
      >
        ✕
      </button>

      <button
        v-if="images.length > 1"
        class="modal-nav modal-prev"
        :aria-label="t('capelas.modal_prev')"
        @click="prevImage"
      >
        ‹
      </button>

      <figure class="modal-content">
        <Transition name="modal-fade" mode="out-in">
          <img
            :key="modalIndex"
            :src="images[modalIndex].url"
            :alt="images[modalIndex].caption ?? ''"
            class="modal-image"
          />
        </Transition>
        <figcaption v-if="images[modalIndex].caption" class="modal-caption">
          {{ images[modalIndex].caption }}
        </figcaption>
      </figure>

      <button
        v-if="images.length > 1"
        class="modal-nav modal-next"
        :aria-label="t('capelas.modal_next')"
        @click="nextImage"
      >
        ›
      </button>
    </div>
  </Teleport>
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
  align-items: center;
  align-self: flex-start;
  gap: var(--space-4);
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
  margin-left: var(--space-4);
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

/* ── Body content card ──────────────────────────────────────────── */

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

/* ── Float image layout ─────────────────────────────────────────── */

.images-float {
  float: right;
  width: 45%;
  margin-left: 20px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
}

.images-only {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-24);
}

.image-figure {
  margin: 0;
}

.image-figure--centered {
  width: 60%;
}

.chapel-image {
  width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: block;
  transition: opacity 0.15s;
}

.chapel-image:hover { opacity: 0.85; }

.image-caption {
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-align: center;
  margin: var(--space-4) 0 0;
  font-style: italic;
}

.clearfix::after {
  content: '';
  display: table;
  clear: both;
}

@media (max-width: 767px) {
  .images-float {
    float: none;
    width: 100%;
    margin-left: 0;
    margin-bottom: var(--space-16);
  }

  .image-figure--centered { width: 100%; }
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

/* ── Other chapels ──────────────────────────────────────────────── */

.other-chapels-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
}

.other-chapels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-12);
}

.other-chapel-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding: var(--space-20);
  background-color: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.other-chapel-card:hover {
  border-color: var(--fr-400);
  box-shadow: var(--shadow-md);
}

.other-type-badge {
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

.other-chapel-name {
  font-family: var(--font-serif);
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--fr-950);
  margin: 0;
  line-height: var(--line-height-tight);
}

.other-chapel-address {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
  flex: 1;
}

.other-chapel-cta {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--fr-600);
  margin-top: var(--space-4);
}

/* ── Image modal ────────────────────────────────────────────────── */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-16);
  padding: var(--space-24);
}

.modal-close {
  position: absolute;
  top: var(--space-16);
  right: var(--space-16);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  font-size: var(--text-lg);
  cursor: pointer;
  transition: background 0.15s;
}

.modal-close:hover { background: rgba(255, 255, 255, 0.3); }

.modal-nav {
  flex-shrink: 0;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  font-size: var(--text-2xl);
  cursor: pointer;
  transition: background 0.15s;
}

.modal-nav:hover { background: rgba(255, 255, 255, 0.3); }

.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-12);
  min-width: 0;
  margin: 0;
}

.modal-image {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: var(--radius-sm);
  display: block;
}

.modal-caption {
  color: rgba(255, 255, 255, 0.8);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  text-align: center;
  margin: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.15s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
