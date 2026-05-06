<script setup lang="ts">
import tauRaw from '~/assets/tau.svg?raw'
import type { ChapelListItem, Mass, Confession, CatechismGroup, ChapelContact } from '~/server/api/chapels/index.get'

const { t } = useI18n()
const config = useRuntimeConfig()

const { data: chapels } = await useChapels()

const matrizChapel = computed(() => chapels.value?.find(c => c.type === 'matriz') ?? null)
const branchChapels = computed(() => chapels.value?.filter(c => c.type === 'branch') ?? [])

function dayLabel(day: number): string {
  return t(`w_day.${day}`)
}

function contactUrl(contact: ChapelContact): string | null {
  if (contact.type === 'phone') return `tel:${contact.value}`
  if (contact.type === 'whatsapp') return `https://wa.me/${contact.value.replace(/\D/g, '')}`
  if (contact.type === 'email') return `mailto:${contact.value}`
  if (contact.type === 'instagram') return `https://instagram.com/${contact.value.replace('@', '')}`
  if (contact.type === 'facebook') return `https://facebook.com/${contact.value}`
  if (contact.type === 'youtube') return `https://youtube.com/@${contact.value.replace('@', '')}`
  return null
}

function contactLabel(type: string): string {
  const map: Record<string, string> = {
    phone: 'Telefone', whatsapp: 'WhatsApp', email: 'E-mail',
    instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube', tiktok: 'TikTok',
  }
  return map[type] ?? type
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

function chapelaSlug(slug: string): string { return slug }

useHead({ title: `${t('capelas.page_title')} — ${config.public.parishShortName as string}` })
</script>

<template>
  <main class="capelas-page">
    <div class="page-container">

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
              <div v-if="matrizChapel.masses.length" class="pills-row">
                <span
                  v-for="mass in (matrizChapel.masses as Mass[])"
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

            <div class="schedule-col">
              <p class="section-label">{{ t('capelas.confession_label') }}</p>
              <template v-if="matrizChapel.confessions.length">
                <div
                  v-for="slot in groupConfessions(matrizChapel.confessions as Confession[])"
                  :key="slot.key"
                  class="conf-row"
                >
                  <span class="conf-dot" aria-hidden="true" />
                  <span class="conf-text">
                    {{ slot.days.map(dayLabel).join(', ') }} · {{ slot.time_start }}–{{ slot.time_end }}
                  </span>
                </div>
              </template>
              <p v-else class="empty-text">{{ t('capelas.no_confession') }}</p>
            </div>

            <div class="schedule-col">
              <p class="section-label">{{ t('capelas.catechism_label') }}</p>
              <template v-if="matrizChapel.catechism_groups.length">
                <div
                  v-for="group in (matrizChapel.catechism_groups as CatechismGroup[])"
                  :key="group.id"
                  class="cat-row"
                >
                  <span class="cat-name">{{ group.group_name }}</span>
                  <span class="cat-schedule">
                    {{ group.day_of_week != null ? dayLabel(group.day_of_week) : '—' }}
                    {{ group.time ? `· ${group.time}` : '' }}
                  </span>
                </div>
              </template>
              <p v-else class="empty-text">{{ t('capelas.catechism_label') }}</p>
            </div>

          </div>

          <NuxtLink :to="`/capelas/${chapelaSlug(matrizChapel.slug)}`" class="detail-link">
            {{ t('capelas.view_detail') }}
          </NuxtLink>
        </div>
      </section>

      <!-- ── Branch chapels ─────────────────────────────────────── -->
      <section v-if="branchChapels.length" class="branches-section">
        <p class="eyebrow branches-eyebrow">{{ t('capelas.branch_section') }}</p>

        <div class="branches-grid">
          <article
            v-for="chapel in (branchChapels as ChapelListItem[])"
            :key="chapel.slug"
            class="branch-card"
          >
            <div class="branch-header">
              <span class="type-badge badge--branch">{{ t('chapel.type.branch') }}</span>
              <h2 class="chapel-name">{{ chapel.name }}</h2>
              <p v-if="chapel.address" class="chapel-address">{{ chapel.address }}</p>
            </div>

            <div class="schedule-section">
              <p class="section-label">{{ t('capelas.masses_label') }}</p>
              <div v-if="chapel.masses.length" class="pills-row">
                <span
                  v-for="mass in (chapel.masses as Mass[])"
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

            <div v-if="chapel.confessions.length" class="schedule-section">
              <p class="section-label">{{ t('capelas.confession_label') }}</p>
              <div
                v-for="slot in groupConfessions(chapel.confessions as Confession[])"
                :key="slot.key"
                class="conf-row"
              >
                <span class="conf-dot" aria-hidden="true" />
                <span class="conf-text">
                  {{ slot.days.map(dayLabel).join(', ') }} · {{ slot.time_start }}–{{ slot.time_end }}
                </span>
              </div>
            </div>

            <div v-if="chapel.catechism_groups.length" class="schedule-section">
              <p class="section-label">{{ t('capelas.catechism_label') }}</p>
              <div
                v-for="group in (chapel.catechism_groups as CatechismGroup[])"
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

            <NuxtLink :to="`/capelas/${chapelaSlug(chapel.slug)}`" class="detail-link">
              {{ t('capelas.view_detail') }}
            </NuxtLink>

          </article>
        </div>
      </section>

    </div>
  </main>
</template>

<style scoped>
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

.page-title { margin: var(--space-8) 0 var(--space-12); }
.page-subtitle { color: var(--text-muted); max-width: 560px; }

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

.matriz-top { display: flex; align-items: flex-start; gap: var(--space-20); }

.tau-mark {
  flex-shrink: 0;
  display: block;
  width: 24px;
  height: 32px;
  color: var(--fr-400);
  margin-top: var(--space-4);
}

.tau-mark :deep(svg) { width: 100%; height: 100%; }

.matriz-identity { display: flex; flex-direction: column; gap: var(--space-8); }

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

.badge--matriz { background-color: var(--fr-200); color: var(--fr-950); }
.badge--branch { background-color: var(--bg-alt); color: var(--text-muted); }

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

.address-label { font-weight: 500; color: var(--text-primary); }

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-24);
  padding-top: var(--space-24);
  border-top: 1px solid var(--fr-200);
}

@media (max-width: 767px) { .schedule-grid { grid-template-columns: 1fr; } }

.schedule-col { display: flex; flex-direction: column; gap: var(--space-12); }

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

.pills-row { display: flex; flex-wrap: wrap; gap: var(--space-4); }

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
  margin-left: var(--space-4);
}

.conf-row { display: flex; align-items: center; gap: var(--space-8); }

.conf-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--cv-400);
}

.conf-text { font-family: var(--font-sans); font-size: var(--text-sm); color: var(--text-primary); }

.cat-row { display: flex; flex-direction: column; gap: 2px; }
.cat-name { font-family: var(--font-sans); font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); }
.cat-schedule { font-family: var(--font-sans); font-size: var(--text-sm); color: var(--text-muted); }

.branches-eyebrow { margin-bottom: var(--space-16); }

.branches-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-16);
}

@media (max-width: 639px) { .branches-grid { grid-template-columns: 1fr; } }

.branch-card {
  background-color: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
}

.branch-header { display: flex; flex-direction: column; gap: var(--space-8); }

.schedule-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding-top: var(--space-16);
  border-top: 1px solid var(--border-default);
}

.detail-link {
  display: inline-flex;
  align-self: flex-start;
  margin-top: auto;
  padding: var(--space-8) var(--space-16);
  border: 1px solid var(--fr-400);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--fr-800);
  text-decoration: none;
  transition: background-color 0.15s, border-color 0.15s;
}

.detail-link:hover {
  background-color: var(--fr-50);
  border-color: var(--fr-600);
}
</style>
