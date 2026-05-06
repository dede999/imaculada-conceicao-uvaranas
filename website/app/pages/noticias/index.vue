<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

interface NoticiaItem { id: string; slug: string; title: string; date: string; summary: string }

const { data: noticias } = await useAsyncData('noticias-list',
  () => $fetch<NoticiaItem[]>('/api/noticias'),
)

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(Date.UTC(year!, month! - 1, day!)))
}

useHead({ title: `${t('noticias.page_title')} — ${config.public.parishShortName}` })
</script>

<template>
  <main class="noticias-page">
    <div class="page-container">

      <header class="page-header">
        <p class="page-eyebrow">{{ t('noticias.eyebrow') }}</p>
        <h1 class="page-title">{{ t('noticias.page_title') }}</h1>
      </header>

      <div v-if="noticias?.length" class="noticias-list">
        <NuxtLink
          v-for="noticia in noticias"
          :key="noticia.slug"
          :to="`/noticias/${noticia.slug}`"
          class="noticia-card"
        >
          <time class="noticia-date" :datetime="noticia.date">{{ formatDate(noticia.date) }}</time>
          <h2 class="noticia-title">{{ noticia.title }}</h2>
          <p class="noticia-summary">{{ noticia.summary }}</p>
          <span class="read-more">{{ t('noticias.read_more') }}</span>
        </NuxtLink>
      </div>

      <p v-else class="empty-text">{{ t('noticias.empty') }}</p>

    </div>
  </main>
</template>

<style scoped>
.noticias-page {
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
  gap: var(--space-32);
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

/* ── List ───────────────────────────────────────────────────────── */

.noticias-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

/* ── Card ───────────────────────────────────────────────────────── */

.noticia-card {
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

.noticia-card:hover {
  border-color: var(--fr-400);
  box-shadow: var(--shadow-md);
}

.noticia-date {
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fr-600);
}

.noticia-title {
  font-family: var(--font-serif);
  font-size: var(--text-xl);
  font-weight: 500;
  color: var(--fr-950);
  line-height: var(--line-height-tight);
  margin: 0;
}

.noticia-summary {
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
