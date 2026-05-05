<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

const { data: pastorais } = await useAsyncData('pastorais-list', () =>
  queryCollection('pastorais').all()
)

const CATEGORIES = ['liturgia', 'formacao', 'social', 'movimentos', 'comunicacao'] as const

const grouped = computed(() =>
  CATEGORIES
    .map(cat => ({
      key: cat,
      items: (pastorais.value ?? []).filter((p: any) => p.category === cat),
    }))
    .filter(g => g.items.length > 0)
)

function slugOf(path: string): string {
  return path.split('/').pop() ?? ''
}

useHead({ title: `${t('pastorais.page_title')} — ${config.public.parishShortName}` })
</script>

<template>
  <main class="pastorais-page">
    <div class="page-container">

      <!-- ── Header ─────────────────────────────────────────────── -->
      <header class="page-header">
        <p class="page-eyebrow">{{ t('pastorais.eyebrow') }}</p>
        <h1 class="page-title">{{ t('pastorais.page_title') }}</h1>
        <p class="page-subtitle">{{ t('pastorais.subtitle') }}</p>
      </header>

      <!-- ── Navigation grid ───────────────────────────────────── -->
      <nav id="pastorais-nav" class="nav-grid" aria-label="Lista de pastorais">
        <div v-for="group in grouped" :key="group.key" class="nav-category">
          <p class="nav-category-label">{{ t(`pastorais.categories.${group.key}`) }}</p>
          <div class="nav-pills">
            <a
              v-for="pastoral in group.items"
              :key="pastoral.path"
              :href="`#${slugOf(pastoral.path)}`"
              class="nav-pill"
            >
              {{ (pastoral as any).name }}
            </a>
          </div>
        </div>
      </nav>

      <!-- ── Full content sections ─────────────────────────────── -->
      <div class="content-sections">
        <div v-for="group in grouped" :key="group.key" class="category-block">

          <p class="category-eyebrow">{{ t(`pastorais.categories.${group.key}`) }}</p>

          <article
            v-for="pastoral in group.items"
            :key="pastoral.path"
            :id="slugOf(pastoral.path)"
            class="pastoral-card"
          >
            <div class="card-header">
              <h2 class="pastoral-name">{{ (pastoral as any).name }}</h2>
              <a href="#pastorais-nav" class="back-link" :aria-label="t('pastorais.back')">
                {{ t('pastorais.back') }}
              </a>
            </div>

            <div v-if="(pastoral as any).coordinator || (pastoral as any).meetings" class="pastoral-meta">
              <span v-if="(pastoral as any).coordinator" class="meta-item">
                <span class="meta-label">{{ t('pastorais.coordinator') }}</span>
                {{ (pastoral as any).coordinator }}
              </span>
              <span v-if="(pastoral as any).meetings" class="meta-item meta-item--meetings">
                <span class="meta-label">{{ t('pastorais.meetings') }}</span>
                {{ (pastoral as any).meetings }}
              </span>
            </div>

            <ContentRenderer :value="pastoral" class="prose" />
          </article>

        </div>
      </div>

    </div>
  </main>
</template>

<style scoped>
.pastorais-page {
  background-color: var(--bg-alt);
  min-height: 100vh;
  padding: var(--space-32) 0 var(--space-64);
  scroll-behavior: smooth;
}

.page-container {
  max-width: 1024px;
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

.page-subtitle {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--text-muted);
  margin: 0;
}

/* ── Navigation grid ────────────────────────────────────────────── */

.nav-grid {
  background-color: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-20);
  box-shadow: var(--shadow-sm);
}

.nav-category {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.nav-category-label {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fr-600);
  margin: 0;
}

.nav-pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
}

.nav-pill {
  display: inline-flex;
  align-items: center;
  padding: var(--space-8) var(--space-12);
  border-radius: var(--radius-sm);
  background-color: var(--bg-alt);
  border: 1px solid var(--border-default);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--fr-800);
  text-decoration: none;
  transition: background-color 0.12s, border-color 0.12s, color 0.12s;
  white-space: nowrap;
}

.nav-pill:hover {
  background-color: var(--fr-50);
  border-color: var(--fr-400);
  color: var(--fr-950);
}

/* ── Content sections ───────────────────────────────────────────── */

.content-sections {
  display: flex;
  flex-direction: column;
  gap: var(--space-40);
}

.category-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
}

.category-eyebrow {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fr-600);
  margin: 0;
  padding-bottom: var(--space-8);
  border-bottom: 1px solid var(--fr-200);
}

/* ── Pastoral card ──────────────────────────────────────────────── */

.pastoral-card {
  background-color: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  box-shadow: var(--shadow-sm);
  scroll-margin-top: 80px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-16);
}

.pastoral-name {
  font-family: var(--font-serif);
  font-size: var(--text-xl);
  font-weight: 500;
  color: var(--fr-950);
  line-height: var(--line-height-tight);
  margin: 0;
}

.back-link {
  flex-shrink: 0;
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  padding: var(--space-4) var(--space-8);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-default);
  white-space: nowrap;
  transition: border-color 0.12s, color 0.12s;
}

.back-link:hover {
  border-color: var(--fr-400);
  color: var(--fr-800);
}

/* ── Meta row ───────────────────────────────────────────────────── */

.pastoral-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-16);
  padding: var(--space-12) var(--space-16);
  background-color: var(--bg-alt);
  border-radius: var(--radius-sm);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.meta-item--meetings {
  flex: 1;
}

.meta-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fr-600);
}

/* ── Prose ──────────────────────────────────────────────────────── */

.prose {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
}

.prose :deep(p) { margin: 0 0 var(--space-12); }
.prose :deep(p:last-child) { margin-bottom: 0; }

.prose :deep(strong) { font-weight: 600; color: var(--fr-950); }
.prose :deep(em) { font-style: italic; }

.prose :deep(ul),
.prose :deep(ol) {
  padding-left: var(--space-20);
  margin: 0 0 var(--space-12);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.prose :deep(a) { color: var(--fr-600); }
.prose :deep(a:hover) { text-decoration: underline; }

/* ── Responsive ─────────────────────────────────────────────────── */

@media (max-width: 767px) {
  .card-header { flex-direction: column-reverse; align-items: flex-start; }
  .back-link { align-self: flex-end; }
  .pastoral-meta { flex-direction: column; gap: var(--space-12); }
}
</style>
