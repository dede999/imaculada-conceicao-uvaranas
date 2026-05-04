<script setup lang="ts">
import tauRaw from '~/assets/tau.svg?raw'

const { t } = useI18n()
const config = useRuntimeConfig()

useHead({ title: `${t('dizimo.page_title')} — ${config.public.parishShortName as string}` })
</script>

<template>
  <main class="dizimo-page">
    <div class="page-container">

      <header class="page-header">
        <span class="tau-mark" v-html="tauRaw" aria-hidden="true" />
        <p class="eyebrow">{{ t('dizimo.eyebrow') }}</p>
        <h1 class="heading-page page-title">{{ t('dizimo.title') }}</h1>
        <p class="body-text page-subtitle">{{ t('dizimo.subtitle') }}</p>
      </header>

      <div class="content-grid">

        <div class="main-col">

          <!-- O que é o dízimo -->
          <section class="content-section">
            <h2 class="section-heading">{{ t('dizimo.section_what') }}</h2>
            <p class="body-text">
              O dízimo é a prática bíblica e eclesial de destinar uma parte do que se recebe —
              tradicionalmente um décimo — para sustentar a missão da Igreja. Mais do que uma
              obrigação, é um gesto de gratidão e confiança na providência de Deus: ao devolver
              uma fração do que recebemos, reconhecemos que tudo vem d'Ele e que somos
              administradores, não donos, dos bens que possuímos.
            </p>
            <p class="body-text">
              Na tradição franciscana, o dízimo é vivido com especial alegria, como expressão
              da pobreza evangélica e da partilha fraterna. Dar não empobrece — liberta.
            </p>
          </section>

          <!-- As dimensões -->
          <section class="content-section">
            <h2 class="section-heading">{{ t('dizimo.section_dimensions') }}</h2>
            <div class="dimensions-grid">
              <article class="dimension-card">
                <p class="dim-eyebrow">01</p>
                <h3 class="dim-title">{{ t('dizimo.dim_financial_title') }}</h3>
                <p class="dim-body">{{ t('dizimo.dim_financial_body') }}</p>
              </article>
              <article class="dimension-card">
                <p class="dim-eyebrow">02</p>
                <h3 class="dim-title">{{ t('dizimo.dim_time_title') }}</h3>
                <p class="dim-body">{{ t('dizimo.dim_time_body') }}</p>
              </article>
              <article class="dimension-card">
                <p class="dim-eyebrow">03</p>
                <h3 class="dim-title">{{ t('dizimo.dim_talent_title') }}</h3>
                <p class="dim-body">{{ t('dizimo.dim_talent_body') }}</p>
              </article>
            </div>
          </section>

        </div>

        <!-- Como contribuir -->
        <aside class="side-col">
          <div class="how-card">
            <h2 class="section-heading how-heading">{{ t('dizimo.section_how') }}</h2>

            <div class="how-method">
              <p class="method-label">{{ t('dizimo.pix_label') }}</p>
              <p class="method-detail-label">{{ t('dizimo.pix_key_label') }}</p>
              <p class="method-value">paroquia.imaculada@exemplo.com.br</p>
            </div>

            <div class="how-method">
              <p class="method-label">{{ t('dizimo.bank_label') }}</p>
              <dl class="bank-details">
                <div class="bank-row">
                  <dt>{{ t('dizimo.bank_name') }}</dt>
                  <dd>Paróquia Imaculada Conceição</dd>
                </div>
                <div class="bank-row">
                  <dt>{{ t('dizimo.bank_agency') }}</dt>
                  <dd>0001</dd>
                </div>
                <div class="bank-row">
                  <dt>{{ t('dizimo.bank_account') }}</dt>
                  <dd>00000-0</dd>
                </div>
              </dl>
            </div>

            <div class="how-method">
              <p class="method-label">{{ t('dizimo.inperson_label') }}</p>
              <p class="method-body">{{ t('dizimo.inperson_body') }}</p>
            </div>
          </div>
        </aside>

      </div>
    </div>
  </main>
</template>

<style scoped>
.dizimo-page {
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
  gap: var(--space-48);
}

/* ── Header ──────────────────────────────────────────────────────── */

.tau-mark {
  display: block;
  width: 24px;
  height: 32px;
  color: var(--fr-400);
  margin-bottom: var(--space-16);
}

.tau-mark :deep(svg) {
  width: 100%;
  height: 100%;
}

.page-title {
  margin: var(--space-8) 0 var(--space-12);
}

.page-subtitle {
  color: var(--text-muted);
}

/* ── Content grid ────────────────────────────────────────────────── */

.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-40);
  align-items: flex-start;
}

@media (max-width: 1023px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

/* ── Main column ─────────────────────────────────────────────────── */

.main-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-48);
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
}

.section-heading {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  font-weight: 500;
  color: var(--fr-950);
  line-height: var(--line-height-tight);
  margin: 0;
  padding-bottom: var(--space-12);
  border-bottom: 1px solid var(--fr-200);
}

.body-text {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
  margin: 0;
}

/* ── Dimensions grid ─────────────────────────────────────────────── */

.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-16);
  margin-top: var(--space-8);
}

@media (max-width: 767px) {
  .dimensions-grid {
    grid-template-columns: 1fr;
  }
}

.dimension-card {
  background-color: var(--bg-page);
  border: 1px solid var(--border-default);
  border-top: 3px solid var(--fr-400);
  border-radius: var(--radius-lg);
  padding: var(--space-20);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.dim-eyebrow {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--fr-400);
  margin: 0;
}

.dim-title {
  font-family: var(--font-serif);
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--fr-950);
  margin: 0;
}

.dim-body {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  line-height: var(--line-height-relaxed);
  color: var(--text-muted);
  margin: 0;
}

/* ── How to contribute (sidebar) ─────────────────────────────────── */

.side-col {
  position: sticky;
  top: var(--space-24);
}

.how-card {
  background-color: var(--fr-50);
  border: 1px solid var(--fr-400);
  border-left: 4px solid var(--fr-600);
  border-radius: var(--radius-lg);
  padding: var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-24);
}

.how-heading {
  border-bottom-color: var(--fr-200);
}

.how-method {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding-top: var(--space-4);
}

.method-label {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fr-600);
  margin: 0;
}

.method-detail-label {
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin: 0;
}

.method-value {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--fr-950);
  margin: 0;
}

.method-body {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
  margin: 0;
}

.bank-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin: 0;
}

.bank-row {
  display: flex;
  gap: var(--space-8);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
}

.bank-row dt {
  color: var(--text-muted);
  min-width: 80px;
  flex-shrink: 0;
}

.bank-row dd {
  color: var(--fr-950);
  font-weight: 500;
  margin: 0;
}
</style>
