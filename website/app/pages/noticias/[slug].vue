<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()
const route = useRoute()
const slug = route.params.slug as string

const { data: noticia } = await useAsyncData(`noticia-${slug}`, () =>
  queryCollection('noticias').path(`/noticias/${slug}`).first()
)

if (!noticia.value) {
  throw createError({ statusCode: 404, statusMessage: 'Notícia not found' })
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(Date.UTC(year!, month! - 1, day!)))
}

useHead({ title: `${noticia.value?.title} — ${config.public.parishShortName}` })
</script>

<template>
  <main class="noticia-page">
    <div class="page-container">

      <NuxtLink to="/noticias" class="back-link">{{ t('noticias.back') }}</NuxtLink>

      <article class="noticia-article">

        <header class="article-header">
          <time class="article-date" :datetime="noticia!.date">{{ formatDate(noticia!.date) }}</time>
          <h1 class="article-title">{{ noticia!.title }}</h1>
          <p class="article-summary">{{ noticia!.summary }}</p>
        </header>

        <div class="article-divider" />

        <ContentRenderer :value="noticia!" class="prose" />

      </article>

    </div>
  </main>
</template>

<style scoped>
.noticia-page {
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

/* ── Article ────────────────────────────────────────────────────── */

.noticia-article {
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

.article-date {
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fr-600);
}

.article-title {
  font-family: var(--font-serif);
  font-size: var(--text-3xl);
  font-weight: 500;
  color: var(--fr-950);
  line-height: var(--line-height-tight);
  margin: 0;
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
  .noticia-article { padding: var(--space-24); }
  .article-title { font-size: var(--text-2xl); }
}
</style>
