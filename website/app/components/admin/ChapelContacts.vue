<script setup lang="ts">
interface ContactRow { id: string; type: string; value: string; sort: number }

const props = defineProps<{
  contacts: ContactRow[]
  deleting: string | null
  chapelId: string
}>()

const emit = defineEmits<{
  delete: [id: string]
  added: []
  error: [msg: string]
}>()

const CONTACT_TYPES = ['phone', 'whatsapp', 'email', 'instagram', 'facebook', 'youtube', 'tiktok']
const CONTACT_LABELS: Record<string, string> = {
  phone: 'Telefone', whatsapp: 'WhatsApp', email: 'E-mail',
  instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube', tiktok: 'TikTok',
}

const adding  = ref(false)
const saving  = ref(false)
const form    = reactive({ type: 'phone', value: '' })

async function add() {
  if (!form.value) { emit('error', 'Valor obrigatório.'); return }
  saving.value = true
  try {
    await $fetch('/api/admin/contacts', {
      method: 'POST',
      body: { chapel_id: props.chapelId, type: form.type, value: form.value },
    })
    adding.value  = false
    form.type     = 'phone'
    form.value    = ''
    emit('added')
  }
  catch (e: unknown) {
    emit('error', (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Erro ao adicionar.')
  }
  finally { saving.value = false }
}
</script>

<template>
  <section class="card">
    <div class="card-header">
      <h2 class="card-title">Contatos</h2>
      <button class="btn-add-inline" @click="adding = !adding">
        {{ adding ? 'Cancelar' : '+ Adicionar' }}
      </button>
    </div>

    <div v-if="contacts.length" class="rows-list">
      <div v-for="c in contacts" :key="c.id" class="contact-row">
        <span class="contact-type">{{ CONTACT_LABELS[c.type] ?? c.type }}</span>
        <span class="contact-value">{{ c.value }}</span>
        <button class="btn-delete" :disabled="deleting === c.id" @click="emit('delete', c.id)">✕</button>
      </div>
    </div>
    <p v-else class="empty-hint">Nenhum contato cadastrado. Capelas sem contatos herdam os contatos da matriz.</p>

    <form v-if="adding" class="inline-form" @submit.prevent="add">
      <select v-model="form.type" class="form-select">
        <option v-for="ct in CONTACT_TYPES" :key="ct" :value="ct">{{ CONTACT_LABELS[ct] }}</option>
      </select>
      <input
        v-model="form.value"
        type="text"
        class="form-input form-input--wide"
        placeholder="Valor (ex: +55 83 99999-9999)"
        required
      />
      <button type="submit" class="btn-save" :disabled="saving">Salvar</button>
    </form>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header { display: flex; align-items: center; justify-content: space-between; }

.card-title {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--fr-950);
  margin: 0;
}

.rows-list { display: flex; flex-direction: column; gap: 6px; }

.contact-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #fafaf8;
  border: 1px solid var(--border-default);
  border-radius: 6px;
}

.contact-type {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--fr-600);
  min-width: 80px;
}

.contact-value { font-family: var(--font-sans); font-size: 13px; color: var(--text-primary); flex: 1; }

.btn-delete {
  margin-left: auto;
  background: none;
  border: none;
  color: #b91c1c;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.5;
  padding: 2px 6px;
  border-radius: 4px;
  transition: opacity 0.1s, background 0.1s;
}

.btn-delete:hover:not(:disabled) { opacity: 1; background: #fef2f2; }
.btn-delete:disabled { opacity: 0.2; cursor: not-allowed; }

.empty-hint { font-family: var(--font-sans); font-size: 13px; color: var(--text-muted); margin: 0; }

.btn-add-inline {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  color: var(--fr-600);
  background: none;
  border: 1px solid var(--fr-400);
  border-radius: 4px;
  padding: 3px 10px;
  cursor: pointer;
  transition: background 0.1s;
}

.btn-add-inline:hover { background: var(--fr-50); }

.inline-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 14px;
  background: #f5f4f0;
  border: 1px dashed #d4c9b8;
  border-radius: 6px;
}

.form-select, .form-input {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--fr-950);
  background: #fff;
  border: 1px solid #d4c9b8;
  border-radius: 5px;
  padding: 5px 9px;
  outline: none;
  transition: border-color 0.1s;
}

.form-select:focus, .form-input:focus { border-color: var(--fr-400); }
.form-input--wide { flex: 1; min-width: 200px; }

.btn-save {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: var(--fr-600);
  border: none;
  border-radius: 5px;
  padding: 6px 14px;
  cursor: pointer;
  transition: background 0.1s;
  white-space: nowrap;
  align-self: flex-end;
}

.btn-save:hover:not(:disabled) { background: var(--fr-800); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
