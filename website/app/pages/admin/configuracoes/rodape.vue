<script setup lang="ts">
definePageMeta({ layout: 'admin' })

import type { FooterConfig } from '~/server/api/parish-config.get'

const { data, refresh } = await useAsyncData<FooterConfig>(
  'admin-rodape',
  () => $fetch('/api/parish-config'),
  { server: false },
)

const form = reactive<FooterConfig>({
  footer_show:         true,
  footer_motto_latin:  'Instaurare omnia in Christo',
  footer_motto_pt:     'Restaurar todas as coisas em Cristo',
  footer_display_mode: 'both',
})

watch(data, (d) => {
  if (!d) return
  form.footer_show         = d.footer_show
  form.footer_motto_latin  = d.footer_motto_latin
  form.footer_motto_pt     = d.footer_motto_pt
  form.footer_display_mode = d.footer_display_mode
}, { immediate: true })

const saving      = ref(false)
const saveMsg     = ref('')
const saveError   = ref('')

async function save() {
  saving.value = true; saveMsg.value = ''; saveError.value = ''
  try {
    await $fetch('/api/admin/configuracoes/rodape', { method: 'PATCH', body: { ...form } })
    saveMsg.value = 'Salvo com sucesso!'
    await refresh()
    setTimeout(() => { saveMsg.value = '' }, 3000)
  } catch (e: unknown) {
    saveError.value = (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Erro ao salvar.'
  } finally {
    saving.value = false
  }
}

const showLatin       = computed(() => form.footer_display_mode !== 'translation_only')
const showTranslation = computed(() => form.footer_display_mode !== 'latin_only')
</script>

<template>
  <div class="rodape-admin">
    <h1 class="page-title">Rodapé</h1>

    <section class="card">
      <h2 class="card-title">Lema do rodapé</h2>

      <label class="field">
        <span class="field-label">Exibir rodapé</span>
        <div class="toggle-row">
          <input id="footer-show" v-model="form.footer_show" type="checkbox" class="toggle-check" />
          <label for="footer-show" class="toggle-label">{{ form.footer_show ? 'Sim' : 'Não' }}</label>
        </div>
      </label>

      <label class="field">
        <span class="field-label">Lema em latim</span>
        <input v-model="form.footer_motto_latin" type="text" class="form-input" placeholder="Instaurare omnia in Christo" />
      </label>

      <label class="field">
        <span class="field-label">Tradução</span>
        <input v-model="form.footer_motto_pt" type="text" class="form-input" placeholder="Restaurar todas as coisas em Cristo" />
      </label>

      <fieldset class="field">
        <legend class="field-label">Modo de exibição</legend>
        <div class="radio-group">
          <label class="radio-option">
            <input v-model="form.footer_display_mode" type="radio" value="latin_only" />
            Só latim
          </label>
          <label class="radio-option">
            <input v-model="form.footer_display_mode" type="radio" value="both" />
            Latim e tradução
          </label>
          <label class="radio-option">
            <input v-model="form.footer_display_mode" type="radio" value="translation_only" />
            Só tradução
          </label>
        </div>
      </fieldset>

      <!-- Live preview -->
      <div class="preview-wrap">
        <p class="preview-label">Pré-visualização</p>
        <div class="preview-footer">
          <p v-if="form.footer_show" class="preview-motto">
            <em v-if="showLatin" class="preview-latin">{{ form.footer_motto_latin || 'Lema em latim' }}</em>
            <span v-if="showLatin && showTranslation" class="preview-sep" aria-hidden="true">—</span>
            <span v-if="showTranslation">{{ form.footer_motto_pt || 'Tradução' }}</span>
          </p>
          <p v-else class="preview-hidden">(rodapé oculto)</p>
        </div>
      </div>

      <div class="form-actions">
        <span v-if="saveMsg" class="success-msg">{{ saveMsg }}</span>
        <span v-if="saveError" class="error-msg">{{ saveError }}</span>
        <button class="btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'Salvando…' : 'Salvar' }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.rodape-admin { max-width: 640px; }

.page-title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  color: var(--fr-950);
  margin: 0 0 24px;
}

.card {
  background: #fff;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-title {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--fr-950);
  margin: 0;
}

.field { display: flex; flex-direction: column; gap: 6px; }

.field-label {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  color: var(--fr-600);
  letter-spacing: 0.04em;
}

.form-input {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--fr-950);
  background: #fff;
  border: 1px solid #d4c9b8;
  border-radius: 5px;
  padding: 7px 10px;
  outline: none;
  transition: border-color 0.1s;
}

.form-input:focus { border-color: var(--fr-400); }

.toggle-row { display: flex; align-items: center; gap: 8px; }

.toggle-check { width: 16px; height: 16px; accent-color: var(--fr-600); cursor: pointer; }

.toggle-label {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--fr-800);
  cursor: pointer;
}

.radio-group { display: flex; flex-direction: column; gap: 8px; margin-top: 2px; }

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--fr-800);
  cursor: pointer;
}

.radio-option input { accent-color: var(--fr-600); cursor: pointer; }

.preview-wrap { border-top: 1px solid var(--fr-200); padding-top: 14px; }

.preview-label {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  color: var(--fr-600);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0 0 10px;
}

.preview-footer {
  background: var(--fr-50);
  border: 1px solid var(--fr-200);
  border-radius: 6px;
  padding: 14px 20px;
  text-align: center;
}

.preview-motto {
  font-family: var(--font-serif);
  font-size: 14px;
  color: var(--fr-600);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 0;
}

.preview-latin { font-style: italic; }

.preview-sep { color: var(--fr-400); }

.preview-hidden {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #b0a090;
  margin: 0;
  font-style: italic;
}

.form-actions { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }

.success-msg { font-family: var(--font-sans); font-size: 13px; color: #166534; }
.error-msg   { font-family: var(--font-sans); font-size: 13px; color: #b91c1c; }

.btn-primary {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: var(--fr-600);
  border: none;
  border-radius: 5px;
  padding: 8px 18px;
  cursor: pointer;
  transition: background 0.1s;
}

.btn-primary:hover:not(:disabled) { background: var(--fr-800); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
