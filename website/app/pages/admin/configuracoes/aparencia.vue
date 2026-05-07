<script setup lang="ts">
import type { ParishConfig } from '~/server/api/parish-config.get'
import type { HistoryEntry } from '~/server/api/admin/configuracoes/historico.get'

definePageMeta({ layout: 'admin' })

const { t } = useI18n()

// ── Default token values (mirrors tokens.css) ─────────────────────────────
const DEFAULT_COLORS: Record<string, string> = {
  '--fr-950': '#412402',
  '--fr-800': '#633806',
  '--fr-600': '#854F0B',
  '--fr-400': '#BA7517',
  '--fr-200': '#EF9F27',
  '--fr-50':  '#FAEEDA',
  '--cv-950': '#04342C',
  '--cv-600': '#0F6E56',
  '--cv-400': '#1D9E75',
  '--cv-50':  '#E1F5EE',
}

const AMBER_TOKENS = [
  { key: '--fr-950', label: () => t('admin.aparencia.colors.fr_950') },
  { key: '--fr-800', label: () => t('admin.aparencia.colors.fr_800') },
  { key: '--fr-600', label: () => t('admin.aparencia.colors.fr_600') },
  { key: '--fr-400', label: () => t('admin.aparencia.colors.fr_400') },
  { key: '--fr-200', label: () => t('admin.aparencia.colors.fr_200') },
  { key: '--fr-50',  label: () => t('admin.aparencia.colors.fr_50') },
]

const TEAL_TOKENS = [
  { key: '--cv-950', label: () => t('admin.aparencia.colors.cv_950') },
  { key: '--cv-600', label: () => t('admin.aparencia.colors.cv_600') },
  { key: '--cv-400', label: () => t('admin.aparencia.colors.cv_400') },
  { key: '--cv-50',  label: () => t('admin.aparencia.colors.cv_50') },
]

// ── Load data ──────────────────────────────────────────────────────────────
const { data: remote, refresh: refreshConfig } = await useAsyncData(
  'admin-aparencia',
  () => $fetch<ParishConfig>('/api/admin/configuracoes/aparencia'),
  { server: false },
)

const { data: history, refresh: refreshHistory } = await useAsyncData(
  'admin-aparencia-history',
  () => $fetch<HistoryEntry[]>('/api/admin/configuracoes/historico'),
  { server: false },
)

// ── Editable state (deep copy from remote) ────────────────────────────────
const colors   = ref<Record<string, string>>({ ...DEFAULT_COLORS })
const iconType = ref<'tau' | 'sacred_heart' | 'custom'>('tau')
const iconUrl  = ref<string>('')
const sections = ref({ instagram: true, ministries: true })

watch(remote, (cfg) => {
  if (!cfg) return
  colors.value   = { ...DEFAULT_COLORS, ...cfg.colors }
  iconType.value = cfg.icon_type
  iconUrl.value  = cfg.icon_url ?? ''
  sections.value = { ...cfg.sections }
}, { immediate: true })

// ── Live preview CSS ───────────────────────────────────────────────────────
const previewStyle = computed(() => {
  return Object.entries(colors.value)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ')
})

// ── Save ──────────────────────────────────────────────────────────────────
const saving      = ref(false)
const saveMessage = ref<{ type: 'ok' | 'err'; text: string } | null>(null)
let   saveTimer:  ReturnType<typeof setTimeout> | null = null

async function save() {
  saving.value = true
  saveMessage.value = null
  try {
    // Only store non-default overrides
    const overrides: Record<string, string> = {}
    for (const [k, v] of Object.entries(colors.value)) {
      if (v !== DEFAULT_COLORS[k]) overrides[k] = v
    }

    await $fetch('/api/admin/configuracoes/aparencia', {
      method: 'PATCH',
      body: {
        colors: overrides,
        icon_type: iconType.value,
        icon_url: iconUrl.value || null,
        home_layout: remote.value?.home_layout ?? 'standard',
        sections: sections.value,
      },
    })
    saveMessage.value = { type: 'ok', text: t('admin.aparencia.saved') }
    await Promise.all([refreshConfig(), refreshHistory()])
  }
  catch {
    saveMessage.value = { type: 'err', text: t('admin.aparencia.save_error') }
  }
  finally {
    saving.value = false
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => { saveMessage.value = null }, 4000)
  }
}

// ── Reset to defaults ─────────────────────────────────────────────────────
function resetColors() {
  colors.value = { ...DEFAULT_COLORS }
}

// ── Undo ──────────────────────────────────────────────────────────────────
const restoring      = ref<number | null>(null)
const restoreMessage = ref<{ type: 'ok' | 'err'; text: string } | null>(null)

async function restore(id: number) {
  restoring.value = id
  restoreMessage.value = null
  try {
    await $fetch('/api/admin/configuracoes/desfazer', {
      method: 'POST',
      body: { history_id: id },
    })
    restoreMessage.value = { type: 'ok', text: t('admin.aparencia.history.restored') }
    await Promise.all([refreshConfig(), refreshHistory()])
  }
  catch {
    restoreMessage.value = { type: 'err', text: t('admin.aparencia.history.restore_error') }
  }
  finally {
    restoring.value = null
    setTimeout(() => { restoreMessage.value = null }, 4000)
  }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <div class="aparencia-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('admin.aparencia.title') }}</h1>
        <p class="page-subtitle">{{ $t('admin.aparencia.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <span v-if="saveMessage" :class="['save-msg', saveMessage.type]">
          {{ saveMessage.text }}
        </span>
        <button class="btn-save" :disabled="saving" @click="save">
          {{ saving ? '…' : $t('admin.aparencia.save') }}
        </button>
      </div>
    </div>

    <div class="layout">
      <!-- ── Left column: controls ───────────────────────────────────── -->
      <div class="controls">

        <!-- Colors -->
        <section class="card">
          <div class="card-header">
            <h2 class="card-title">{{ $t('admin.aparencia.colors.title') }}</h2>
            <button class="btn-ghost" @click="resetColors">
              {{ $t('admin.aparencia.colors.reset_all') }}
            </button>
          </div>

          <div class="palette-group">
            <p class="palette-label">{{ $t('admin.aparencia.colors.amber_label') }}</p>
            <div class="swatches">
              <label v-for="token in AMBER_TOKENS" :key="token.key" class="swatch">
                <span class="swatch-preview" :style="{ background: colors[token.key] }" />
                <input
                  type="color"
                  :value="colors[token.key]"
                  class="swatch-input"
                  @input="colors[token.key] = ($event.target as HTMLInputElement).value"
                />
                <span class="swatch-name">{{ token.label() }}</span>
                <span class="swatch-hex">{{ colors[token.key] }}</span>
              </label>
            </div>
          </div>

          <div class="palette-group">
            <p class="palette-label">{{ $t('admin.aparencia.colors.teal_label') }}</p>
            <div class="swatches">
              <label v-for="token in TEAL_TOKENS" :key="token.key" class="swatch">
                <span class="swatch-preview" :style="{ background: colors[token.key] }" />
                <input
                  type="color"
                  :value="colors[token.key]"
                  class="swatch-input"
                  @input="colors[token.key] = ($event.target as HTMLInputElement).value"
                />
                <span class="swatch-name">{{ token.label() }}</span>
                <span class="swatch-hex">{{ colors[token.key] }}</span>
              </label>
            </div>
          </div>
        </section>

        <!-- Icon -->
        <section class="card">
          <h2 class="card-title">{{ $t('admin.aparencia.icon.title') }}</h2>
          <div class="icon-options">
            <label :class="['icon-option', { selected: iconType === 'tau' }]">
              <input v-model="iconType" type="radio" value="tau" class="sr-only" />
              <span class="icon-preview" :style="previewStyle">
                <img src="~/assets/tau.svg" alt="Tau" class="icon-svg" />
              </span>
              <span class="icon-name">{{ $t('admin.aparencia.icon.tau') }}</span>
              <span class="icon-desc">{{ $t('admin.aparencia.icon.tau_desc') }}</span>
            </label>

            <label :class="['icon-option', { selected: iconType === 'sacred_heart' }]">
              <input v-model="iconType" type="radio" value="sacred_heart" class="sr-only" />
              <span class="icon-preview" :style="previewStyle">
                <img src="~/assets/sacred-heart.svg" alt="Sagrado Coração" class="icon-svg" />
              </span>
              <span class="icon-name">{{ $t('admin.aparencia.icon.sacred_heart') }}</span>
              <span class="icon-desc">{{ $t('admin.aparencia.icon.sacred_heart_desc') }}</span>
            </label>

            <label :class="['icon-option', { selected: iconType === 'custom' }]">
              <input v-model="iconType" type="radio" value="custom" class="sr-only" />
              <span class="icon-preview icon-preview--custom">
                <img v-if="iconUrl" :src="iconUrl" alt="Custom" class="icon-svg" />
                <span v-else class="icon-placeholder">URL</span>
              </span>
              <span class="icon-name">{{ $t('admin.aparencia.icon.custom') }}</span>
              <span class="icon-desc">{{ $t('admin.aparencia.icon.custom_desc') }}</span>
            </label>
          </div>

          <div v-if="iconType === 'custom'" class="custom-url-wrap">
            <label class="field-label">{{ $t('admin.aparencia.icon.custom_url_label') }}</label>
            <input v-model="iconUrl" type="url" class="field-input" placeholder="https://…" />
          </div>
        </section>

        <!-- Sections -->
        <section class="card">
          <h2 class="card-title">{{ $t('admin.aparencia.sections.title') }}</h2>
          <div class="section-toggles">
            <label class="toggle-row">
              <div class="toggle-info">
                <span class="toggle-name">{{ $t('admin.aparencia.sections.instagram') }}</span>
                <span class="toggle-desc">{{ $t('admin.aparencia.sections.instagram_desc') }}</span>
              </div>
              <button
                :class="['toggle-btn', { on: sections.instagram }]"
                type="button"
                @click="sections.instagram = !sections.instagram"
              >
                <span class="toggle-knob" />
              </button>
            </label>

            <label class="toggle-row">
              <div class="toggle-info">
                <span class="toggle-name">{{ $t('admin.aparencia.sections.ministries') }}</span>
                <span class="toggle-desc">{{ $t('admin.aparencia.sections.ministries_desc') }}</span>
              </div>
              <button
                :class="['toggle-btn', { on: sections.ministries }]"
                type="button"
                @click="sections.ministries = !sections.ministries"
              >
                <span class="toggle-knob" />
              </button>
            </label>
          </div>
        </section>
      </div>

      <!-- ── Right column: preview + history ────────────────────────── -->
      <div class="aside">

        <!-- Live preview -->
        <section class="card preview-card">
          <h2 class="card-title">{{ $t('admin.aparencia.preview.title') }}</h2>
          <div class="preview-shell" :style="previewStyle">
            <div class="preview-sidebar">
              <span class="preview-icon">
                <img
                  v-if="iconType === 'tau'"
                  src="~/assets/tau.svg"
                  alt="τ"
                  class="preview-svg"
                />
                <img
                  v-else-if="iconType === 'sacred_heart'"
                  src="~/assets/sacred-heart.svg"
                  alt="♡"
                  class="preview-svg"
                />
                <img
                  v-else-if="iconUrl"
                  :src="iconUrl"
                  alt="icon"
                  class="preview-svg"
                />
                <span v-else class="preview-svg-fallback">τ</span>
              </span>
              <span class="preview-label">Painel</span>
              <div class="preview-links">
                <span class="preview-link preview-link--active" />
                <span class="preview-link" />
                <span class="preview-link" />
              </div>
            </div>
            <div class="preview-main">
              <div class="preview-bar" />
              <div class="preview-bar preview-bar--short" />
              <div class="preview-cards">
                <span class="preview-stat" />
                <span class="preview-stat" />
                <span class="preview-stat" />
              </div>
            </div>
          </div>
        </section>

        <!-- History -->
        <section class="card">
          <h2 class="card-title">{{ $t('admin.aparencia.history.title') }}</h2>
          <span v-if="restoreMessage" :class="['restore-msg', restoreMessage.type]">
            {{ restoreMessage.text }}
          </span>
          <p v-if="!history?.length" class="history-empty">
            {{ $t('admin.aparencia.history.empty') }}
          </p>
          <ul v-else class="history-list">
            <li v-for="entry in history" :key="entry.id" class="history-item">
              <div class="history-meta">
                <span class="history-date">{{ fmtDate(entry.created_at) }}</span>
                <span v-if="entry.actor_name" class="history-actor">
                  {{ $t('admin.aparencia.history.by') }} {{ entry.actor_name }}
                </span>
              </div>
              <button
                class="btn-restore"
                :disabled="restoring === entry.id"
                @click="restore(entry.id)"
              >
                {{ restoring === entry.id ? '…' : $t('admin.aparencia.history.restore') }}
              </button>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aparencia-page { max-width: 1100px; }

/* ── Header ──────────────────────────────────────────────────────────────── */

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.page-title {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 500;
  color: var(--fr-950);
  margin: 0 0 4px;
}

.page-subtitle {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* ── Layout ──────────────────────────────────────────────────────────────── */

.layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  align-items: start;
}

@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
}

/* ── Cards ───────────────────────────────────────────────────────────────── */

.card {
  background: #fff;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 20px;
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-title {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--fr-600);
  margin: 0 0 16px;
}

.card-header .card-title { margin: 0; }

/* ── Buttons ─────────────────────────────────────────────────────────────── */

.btn-save {
  background: var(--fr-400);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 18px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-save:hover:not(:disabled) { background: var(--fr-600); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-ghost {
  background: none;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 5px 10px;
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  transition: border-color 0.1s;
}

.btn-ghost:hover { border-color: var(--fr-400); color: var(--fr-400); }

.btn-restore {
  background: none;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 4px 10px;
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-restore:hover:not(:disabled) { border-color: var(--fr-400); color: var(--fr-400); }
.btn-restore:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Messages ────────────────────────────────────────────────────────────── */

.save-msg, .restore-msg {
  font-family: var(--font-sans);
  font-size: 13px;
  padding: 5px 10px;
  border-radius: var(--radius-sm);
}

.save-msg.ok, .restore-msg.ok {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.save-msg.err, .restore-msg.err {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* ── Color swatches ──────────────────────────────────────────────────────── */

.palette-group { margin-bottom: 20px; }
.palette-group:last-child { margin-bottom: 0; }

.palette-label {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin: 0 0 10px;
}

.swatches {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.swatch {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: background 0.1s;
}

.swatch:hover { background: var(--bg-alt); }

.swatch-preview {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.1);
  flex-shrink: 0;
  cursor: pointer;
}

.swatch-input {
  position: absolute;
  opacity: 0;
  width: 28px;
  height: 28px;
  cursor: pointer;
  margin-left: -38px;
}

.swatch-name {
  flex: 1;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-primary);
}

.swatch-hex {
  font-family: monospace;
  font-size: 12px;
  color: var(--text-muted);
}

/* ── Icon options ────────────────────────────────────────────────────────── */

.icon-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.icon-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 2px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: center;
  transition: border-color 0.15s;
}

.icon-option.selected {
  border-color: var(--fr-400);
  background: var(--fr-50);
}

.icon-preview {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fr-400);
}

.icon-preview--custom {
  border: 1px dashed var(--border-default);
  border-radius: 6px;
}

.icon-svg { width: 100%; height: 100%; object-fit: contain; }

.icon-placeholder {
  font-family: var(--font-sans);
  font-size: 11px;
  color: var(--text-muted);
}

.icon-name {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.icon-desc {
  font-family: var(--font-sans);
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.3;
}

.custom-url-wrap { margin-top: 4px; }

.field-label {
  display: block;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.field-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}

.field-input:focus { border-color: var(--fr-400); }

/* ── Section toggles ─────────────────────────────────────────────────────── */

.section-toggles { display: flex; flex-direction: column; gap: 14px; }

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.toggle-info { flex: 1; }

.toggle-name {
  display: block;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.toggle-desc {
  display: block;
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.toggle-btn {
  width: 42px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: var(--border-default);
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}

.toggle-btn.on { background: var(--cv-400); }

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle-btn.on .toggle-knob { transform: translateX(18px); }

/* ── Preview ─────────────────────────────────────────────────────────────── */

.preview-card { margin-bottom: 16px; }

.preview-shell {
  display: flex;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.08);
  height: 180px;
  margin-top: 12px;
}

.preview-sidebar {
  width: 70px;
  background: var(--fr-950);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 6px;
  gap: 8px;
  flex-shrink: 0;
}

.preview-icon {
  width: 24px;
  height: 24px;
  color: var(--fr-200);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-svg { width: 100%; height: 100%; object-fit: contain; filter: brightness(0) saturate(100%) invert(85%) sepia(20%) saturate(400%) hue-rotate(10deg); }
.preview-svg-fallback { font-size: 18px; color: var(--fr-200); }

.preview-label {
  font-size: 9px;
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.5);
}

.preview-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 0 4px;
  margin-top: 4px;
}

.preview-link {
  height: 6px;
  border-radius: 3px;
  background: rgba(255,255,255,0.15);
}

.preview-link--active {
  background: var(--fr-200);
  opacity: 0.8;
}

.preview-main {
  flex: 1;
  background: #f5f5f0;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-bar {
  height: 8px;
  border-radius: 4px;
  background: var(--fr-400);
  opacity: 0.3;
  width: 60%;
}

.preview-bar--short { width: 40%; opacity: 0.2; }

.preview-cards {
  display: flex;
  gap: 6px;
  margin-top: auto;
}

.preview-stat {
  flex: 1;
  height: 36px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
}

/* ── History ─────────────────────────────────────────────────────────────── */

.history-empty {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.history-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.history-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.history-date {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-primary);
}

.history-actor {
  font-family: var(--font-sans);
  font-size: 11px;
  color: var(--text-muted);
}

/* ── Utility ─────────────────────────────────────────────────────────────── */

.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
</style>
