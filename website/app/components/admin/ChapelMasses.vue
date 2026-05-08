<script setup lang="ts">
interface MassRow { id: string; chapel_id: string; day_of_week: number; time: string; note: string | null; active: boolean }

const props = defineProps<{
  masses: MassRow[]
  chapelId: string
  deleting: string | null
}>()

const emit = defineEmits<{
  delete: [id: string]
  added: []
  error: [msg: string]
}>()

const DAY_LABELS: Record<number, string> = {
  0: 'Domingo', 1: 'Segunda', 2: 'Terça', 3: 'Quarta',
  4: 'Quinta', 5: 'Sexta', 6: 'Sábado',
}
const days = [0, 1, 2, 3, 4, 5, 6]
function dayLabel(d: number) { return DAY_LABELS[d] ?? String(d) }

const open   = ref(false)
const saving = ref(false)
const form   = reactive({ day_of_week: 0, time: '', note: '' })

async function add() {
  if (!form.time) { emit('error', 'Horário obrigatório.'); return }
  saving.value = true
  try {
    await $fetch('/api/admin/masses', {
      method: 'POST',
      body: { chapel_id: props.chapelId, day_of_week: form.day_of_week, time: form.time, note: form.note || null },
    })
    open.value = false
    form.day_of_week = 0; form.time = ''; form.note = ''
    emit('added')
  }
  catch (e: unknown) {
    emit('error', (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Erro ao salvar.')
  }
  finally { saving.value = false }
}
</script>

<template>
  <div class="schedule-block">
    <div class="block-header">
      <p class="block-label">Missas</p>
      <button class="btn-add-inline" @click="open = !open">
        {{ open ? 'Cancelar' : '+ Adicionar' }}
      </button>
    </div>

    <div v-if="masses.length" class="rows-list">
      <div v-for="m in masses" :key="m.id" class="schedule-row">
        <span class="row-day">{{ dayLabel(m.day_of_week) }}</span>
        <span class="row-time">{{ m.time }}</span>
        <span v-if="m.note" class="row-note">{{ m.note }}</span>
        <span v-if="!m.active" class="row-inactive">inativo</span>
        <button class="btn-delete" :disabled="deleting === m.id" @click="emit('delete', m.id)">✕</button>
      </div>
    </div>
    <p v-else class="empty-hint">Nenhum horário cadastrado.</p>

    <form v-if="open" class="inline-form" @submit.prevent="add">
      <select v-model.number="form.day_of_week" class="form-select">
        <option v-for="d in days" :key="d" :value="d">{{ dayLabel(d) }}</option>
      </select>
      <input v-model="form.time" type="time" class="form-input" required />
      <input v-model="form.note" type="text" class="form-input form-input--wide" placeholder="Observação (ex: 1º domingo)" />
      <button type="submit" class="btn-save" :disabled="saving">Salvar</button>
    </form>
  </div>
</template>

<style scoped>
.schedule-block {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.block-header { display: flex; align-items: center; justify-content: space-between; }

.block-label {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fr-600);
  margin: 0;
}

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

.rows-list { display: flex; flex-direction: column; gap: 6px; }

.schedule-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  background: #fafaf8;
  border: 1px solid var(--border-default);
  border-radius: 6px;
}

.row-day { font-family: var(--font-sans); font-size: 13px; font-weight: 500; color: var(--fr-950); min-width: 80px; }
.row-time { font-family: var(--font-sans); font-size: 13px; color: var(--text-primary); }
.row-note { font-family: var(--font-sans); font-size: 12px; color: var(--text-muted); font-style: italic; flex: 1; }
.row-inactive { font-family: var(--font-sans); font-size: 11px; background: #fef2f2; color: #b91c1c; border-radius: 4px; padding: 1px 6px; }

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
}

.btn-save:hover:not(:disabled) { background: var(--fr-800); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
