<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const {
  AMBER_TOKENS, TEAL_TOKENS,
  colors, iconType, iconUrl, sections, previewStyle,
  saving, saveMessage, save, resetColors,
  history, restoring, restoreMessage, restore,
} = useAparenciaConfig()
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
        <AdminAparenciaPreview :preview-style="previewStyle" :icon-type="iconType" :icon-url="iconUrl" />
        <AdminAparenciaHistorico
          :history="history"
          :restoring="restoring"
          :restore-message="restoreMessage"
          @restore="restore"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.aparencia-page { max-width: 1100px; }

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

.header-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

.layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  align-items: start;
}

@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
}

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

.save-msg {
  font-family: var(--font-sans);
  font-size: 13px;
  padding: 5px 10px;
  border-radius: var(--radius-sm);
}

.save-msg.ok  { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.save-msg.err { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

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

.swatches { display: flex; flex-direction: column; gap: 6px; }

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

.swatch-name { flex: 1; font-family: var(--font-sans); font-size: 13px; color: var(--text-primary); }
.swatch-hex  { font-family: monospace; font-size: 12px; color: var(--text-muted); }

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

.icon-option.selected { border-color: var(--fr-400); background: var(--fr-50); }

.icon-preview {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fr-400);
}

.icon-preview--custom { border: 1px dashed var(--border-default); border-radius: 6px; }

.icon-svg { width: 100%; height: 100%; object-fit: contain; }

.icon-placeholder { font-family: var(--font-sans); font-size: 11px; color: var(--text-muted); }
.icon-name { font-family: var(--font-sans); font-size: 12px; font-weight: 600; color: var(--text-primary); }
.icon-desc { font-family: var(--font-sans); font-size: 11px; color: var(--text-muted); line-height: 1.3; }

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

.section-toggles { display: flex; flex-direction: column; gap: 14px; }

.toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }

.toggle-info { flex: 1; }

.toggle-name {
  display: block;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.toggle-desc { display: block; font-family: var(--font-sans); font-size: 12px; color: var(--text-muted); margin-top: 2px; }

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
