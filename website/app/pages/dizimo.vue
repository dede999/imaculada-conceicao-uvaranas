<script setup lang="ts">
import tauRaw from '~/assets/tau.svg?raw'

const { t } = useI18n()
const config = useRuntimeConfig()

const dimensions = ['caritativa', 'religiosa', 'missionaria', 'eclesial'] as const

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
            <ol class="what-list">
              <li>{{ t('dizimo.what_bullet_1') }}</li>
              <li>{{ t('dizimo.what_bullet_2') }}</li>
              <li>{{ t('dizimo.what_bullet_3') }}</li>
            </ol>
          </section>

          <!-- As dimensões -->
          <section class="content-section">
            <h2 class="section-heading">{{ t('dizimo.section_dimensions') }}</h2>

            <div class="accordion">
              <details
                v-for="(dim, i) in dimensions"
                :key="dim"
                class="accordion-item"
                :open="i === 0"
              >
                <summary class="accordion-summary">
                  <span class="dim-number">0{{ i + 1 }}</span>
                  <span class="dim-title">{{ t(`dizimo.dim_${dim}_title`) }}</span>
                  <span class="accordion-icon" aria-hidden="true" />
                </summary>
                <div class="accordion-body">
                  <p class="dim-body">{{ t(`dizimo.dim_${dim}_body`) }}</p>
                </div>
              </details>
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

.tau-mark :deep(svg) { width: 100%; height: 100%; }

.page-title { margin: var(--space-8) 0 var(--space-12); }

.page-subtitle { color: var(--text-muted); }

/* ── Content grid ────────────────────────────────────────────────── */

.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-40);
  align-items: flex-start;
}

@media (max-width: 1023px) {
  .content-grid { grid-template-columns: 1fr; }
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
  gap: var(--space-20);
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

/* ── What-is list ────────────────────────────────────────────────── */

.what-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
  counter-reset: what-counter;
}

.what-list li {
  counter-increment: what-counter;
  display: flex;
  align-items: baseline;
  gap: var(--space-12);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
}

.what-list li::before {
  content: counter(what-counter) '.';
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--fr-400);
  flex-shrink: 0;
  width: 20px;
}

/* ── Accordion ───────────────────────────────────────────────────── */

.accordion {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--fr-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.accordion-item {
  border-bottom: 1px solid var(--fr-200);
}

.accordion-item:last-child {
  border-bottom: none;
}

.accordion-summary {
  display: flex;
  align-items: center;
  gap: var(--space-12);
  padding: var(--space-16) var(--space-20);
  cursor: pointer;
  list-style: none;
  background-color: var(--bg-page);
  user-select: none;
  transition: background-color 0.15s;
}

.accordion-summary::-webkit-details-marker { display: none; }

.accordion-summary:hover {
  background-color: var(--fr-50);
}

details[open] > .accordion-summary {
  background-color: var(--fr-50);
  border-bottom: 1px solid var(--fr-200);
}

.dim-number {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--fr-400);
  flex-shrink: 0;
}

.dim-title {
  flex: 1;
  font-family: var(--font-serif);
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--fr-950);
}

.accordion-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  position: relative;
  color: var(--fr-400);
}

.accordion-icon::before,
.accordion-icon::after {
  content: '';
  position: absolute;
  background-color: currentColor;
  border-radius: 1px;
}

.accordion-icon::before {
  width: 10px;
  height: 2px;
  top: 7px;
  left: 3px;
}

.accordion-icon::after {
  width: 2px;
  height: 10px;
  top: 3px;
  left: 7px;
  transition: transform 0.2s, opacity 0.2s;
}

details[open] > .accordion-summary .accordion-icon::after {
  transform: scaleY(0);
  opacity: 0;
}

.accordion-body {
  padding: var(--space-20);
  background-color: var(--bg-page);
}

.dim-body {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
  margin: 0;
}

/* ── Sidebar ─────────────────────────────────────────────────────── */

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

.how-heading { border-bottom-color: var(--fr-200); }

.how-method {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
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
