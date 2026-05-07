<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { t } = useI18n()

interface MassRow    { id: string; chapel_id: string; day_of_week: number; time: string; note: string | null; active: boolean }
interface ConfRow    { id: string; chapel_id: string; day_of_week: number; time_start: string; time_end: string; active: boolean }
interface CatRow     { id: string; chapel_id: string; group_name: string; day_of_week: number | null; time: string | null; active: boolean }

interface ChapelSchedule {
  id: string; slug: string; name: string; type: string
  masses: MassRow[]; confessions: ConfRow[]; catechism_groups: CatRow[]
}

const { data, refresh } = await useAsyncData<ChapelSchedule[]>(
  'admin-missas',
  () => $fetch('/api/admin/chapels'),
  { server: false },
)

const chapels = computed<ChapelSchedule[]>(() => data.value ?? [])

// ── Day options ────────────────────────────────────────────────────
const DAY_LABELS: Record<number, string> = {
  0: 'Domingo', 1: 'Segunda', 2: 'Terça', 3: 'Quarta',
  4: 'Quinta', 5: 'Sexta', 6: 'Sábado',
}
const days = [0, 1, 2, 3, 4, 5, 6]

function dayLabel(d: number) { return DAY_LABELS[d] ?? String(d) }

// ── Active form tracking ───────────────────────────────────────────
type FormType = 'mass' | 'confession' | 'catechism'
const openForm = ref<{ chapel_id: string; type: FormType } | null>(null)

function isOpen(chapel_id: string, type: FormType) {
  return openForm.value?.chapel_id === chapel_id && openForm.value?.type === type
}

function toggleForm(chapel_id: string, type: FormType) {
  if (isOpen(chapel_id, type)) {
    openForm.value = null
  } else {
    openForm.value = { chapel_id, type }
    resetForms()
  }
}

// ── Form state ─────────────────────────────────────────────────────
const massForm   = reactive({ day_of_week: 0, time: '', note: '' })
const confForm   = reactive({ day_of_week: 0, time_start: '', time_end: '' })
const catForm    = reactive({ group_name: '', day_of_week: '', time: '' })

function resetForms() {
  massForm.day_of_week = 0; massForm.time = ''; massForm.note = ''
  confForm.day_of_week = 0; confForm.time_start = ''; confForm.time_end = ''
  catForm.group_name = ''; catForm.day_of_week = ''; catForm.time = ''
}

// ── Saving state ───────────────────────────────────────────────────
const saving  = ref(false)
const deleting = ref<string | null>(null)
const actionError = ref('')
const { open: confirmOpen, message: confirmMsg, confirm: showConfirm, onConfirm, onCancel } = useAdminConfirm()

// ── Add handlers ───────────────────────────────────────────────────
async function addMass(chapel_id: string) {
  if (!massForm.time) { actionError.value = 'Horário obrigatório.'; return }
  saving.value = true; actionError.value = ''
  try {
    await $fetch('/api/admin/masses', {
      method: 'POST',
      body: { chapel_id, day_of_week: massForm.day_of_week, time: massForm.time, note: massForm.note || null },
    })
    openForm.value = null
    await refresh()
  } catch (e: any) {
    actionError.value = e?.data?.statusMessage ?? 'Erro ao salvar.'
  } finally {
    saving.value = false
  }
}

async function addConfession(chapel_id: string) {
  if (!confForm.time_start || !confForm.time_end) { actionError.value = 'Horários obrigatórios.'; return }
  saving.value = true; actionError.value = ''
  try {
    await $fetch('/api/admin/confessions', {
      method: 'POST',
      body: { chapel_id, day_of_week: confForm.day_of_week, time_start: confForm.time_start, time_end: confForm.time_end },
    })
    openForm.value = null
    await refresh()
  } catch (e: any) {
    actionError.value = e?.data?.statusMessage ?? 'Erro ao salvar.'
  } finally {
    saving.value = false
  }
}

async function addCatechism(chapel_id: string) {
  if (!catForm.group_name) { actionError.value = 'Nome do grupo obrigatório.'; return }
  saving.value = true; actionError.value = ''
  try {
    await $fetch('/api/admin/catechism', {
      method: 'POST',
      body: {
        chapel_id,
        group_name: catForm.group_name,
        day_of_week: catForm.day_of_week !== '' ? Number(catForm.day_of_week) : null,
        time: catForm.time || null,
      },
    })
    openForm.value = null
    await refresh()
  } catch (e: any) {
    actionError.value = e?.data?.statusMessage ?? 'Erro ao salvar.'
  } finally {
    saving.value = false
  }
}

// ── Delete handlers ────────────────────────────────────────────────
async function deleteMass(id: string) {
  if (!await showConfirm('Excluir este horário de missa?')) return
  deleting.value = id
  await $fetch(`/api/admin/masses/${id}`, { method: 'DELETE' })
  deleting.value = null
  await refresh()
}

async function deleteConfession(id: string) {
  if (!await showConfirm('Excluir este horário de confissão?')) return
  deleting.value = id
  await $fetch(`/api/admin/confessions/${id}`, { method: 'DELETE' })
  deleting.value = null
  await refresh()
}

async function deleteCatechism(id: string) {
  if (!await showConfirm('Excluir esta turma de catequese?')) return
  deleting.value = id
  await $fetch(`/api/admin/catechism/${id}`, { method: 'DELETE' })
  deleting.value = null
  await refresh()
}
</script>

<template>
  <div class="missas-admin">
    <h1 class="page-title">Missas e Horários</h1>

    <p v-if="actionError" class="action-error">{{ actionError }}</p>

    <div class="chapels-list">
      <section
        v-for="chapel in chapels"
        :key="chapel.id"
        class="chapel-section"
      >
        <div class="chapel-header">
          <span class="chapel-type-badge" :class="chapel.type === 'matriz' ? 'badge--matriz' : 'badge--branch'">
            {{ chapel.type === 'matriz' ? 'Matriz' : 'Filial' }}
          </span>
          <h2 class="chapel-name">{{ chapel.name }}</h2>
        </div>

        <!-- ── Masses ─────────────────────────────────────────── -->
        <div class="schedule-block">
          <div class="block-header">
            <p class="block-label">Missas</p>
            <button class="btn-add-inline" @click="toggleForm(chapel.id, 'mass')">
              {{ isOpen(chapel.id, 'mass') ? 'Cancelar' : '+ Adicionar' }}
            </button>
          </div>

          <div v-if="chapel.masses.length" class="rows-list">
            <div
              v-for="m in chapel.masses"
              :key="m.id"
              class="schedule-row"
            >
              <span class="row-day">{{ dayLabel(m.day_of_week) }}</span>
              <span class="row-time">{{ m.time }}</span>
              <span v-if="m.note" class="row-note">{{ m.note }}</span>
              <span v-if="!m.active" class="row-inactive">inativo</span>
              <button
                class="btn-delete"
                :disabled="deleting === m.id"
                @click="deleteMass(m.id)"
              >✕</button>
            </div>
          </div>
          <p v-else class="empty-hint">Nenhum horário cadastrado.</p>

          <form v-if="isOpen(chapel.id, 'mass')" class="inline-form" @submit.prevent="addMass(chapel.id)">
            <select v-model.number="massForm.day_of_week" class="form-select">
              <option v-for="d in days" :key="d" :value="d">{{ dayLabel(d) }}</option>
            </select>
            <input v-model="massForm.time" type="time" class="form-input" placeholder="Horário" required />
            <input v-model="massForm.note" type="text" class="form-input form-input--wide" placeholder="Observação (ex: 1º domingo)" />
            <button type="submit" class="btn-save" :disabled="saving">Salvar</button>
          </form>
        </div>

        <!-- ── Confessions ────────────────────────────────────── -->
        <div class="schedule-block">
          <div class="block-header">
            <p class="block-label">Confissões</p>
            <button class="btn-add-inline" @click="toggleForm(chapel.id, 'confession')">
              {{ isOpen(chapel.id, 'confession') ? 'Cancelar' : '+ Adicionar' }}
            </button>
          </div>

          <div v-if="chapel.confessions.length" class="rows-list">
            <div
              v-for="c in chapel.confessions"
              :key="c.id"
              class="schedule-row"
            >
              <span class="row-day">{{ dayLabel(c.day_of_week) }}</span>
              <span class="row-time">{{ c.time_start }}–{{ c.time_end }}</span>
              <span v-if="!c.active" class="row-inactive">inativo</span>
              <button
                class="btn-delete"
                :disabled="deleting === c.id"
                @click="deleteConfession(c.id)"
              >✕</button>
            </div>
          </div>
          <p v-else class="empty-hint">Nenhuma confissão cadastrada.</p>

          <form v-if="isOpen(chapel.id, 'confession')" class="inline-form" @submit.prevent="addConfession(chapel.id)">
            <select v-model.number="confForm.day_of_week" class="form-select">
              <option v-for="d in days" :key="d" :value="d">{{ dayLabel(d) }}</option>
            </select>
            <input v-model="confForm.time_start" type="time" class="form-input" placeholder="Início" required />
            <span class="form-sep">–</span>
            <input v-model="confForm.time_end" type="time" class="form-input" placeholder="Fim" required />
            <button type="submit" class="btn-save" :disabled="saving">Salvar</button>
          </form>
        </div>

        <!-- ── Catechism ──────────────────────────────────────── -->
        <div class="schedule-block">
          <div class="block-header">
            <p class="block-label">Catequese</p>
            <button class="btn-add-inline" @click="toggleForm(chapel.id, 'catechism')">
              {{ isOpen(chapel.id, 'catechism') ? 'Cancelar' : '+ Adicionar' }}
            </button>
          </div>

          <div v-if="chapel.catechism_groups.length" class="rows-list">
            <div
              v-for="g in chapel.catechism_groups"
              :key="g.id"
              class="schedule-row"
            >
              <span class="row-day">{{ g.group_name }}</span>
              <span v-if="g.day_of_week != null" class="row-time">{{ dayLabel(g.day_of_week) }}</span>
              <span v-if="g.time" class="row-time">{{ g.time }}</span>
              <span v-if="!g.active" class="row-inactive">inativo</span>
              <button
                class="btn-delete"
                :disabled="deleting === g.id"
                @click="deleteCatechism(g.id)"
              >✕</button>
            </div>
          </div>
          <p v-else class="empty-hint">Nenhuma turma cadastrada.</p>

          <form v-if="isOpen(chapel.id, 'catechism')" class="inline-form" @submit.prevent="addCatechism(chapel.id)">
            <input v-model="catForm.group_name" type="text" class="form-input form-input--wide" placeholder="Nome do grupo (ex: Primeira Eucaristia)" required />
            <select v-model="catForm.day_of_week" class="form-select">
              <option value="">Dia (opcional)</option>
              <option v-for="d in days" :key="d" :value="d">{{ dayLabel(d) }}</option>
            </select>
            <input v-model="catForm.time" type="time" class="form-input" placeholder="Horário" />
            <button type="submit" class="btn-save" :disabled="saving">Salvar</button>
          </form>
        </div>

      </section>
    </div>
    <AdminConfirmModal :open="confirmOpen" :message="confirmMsg" @confirm="onConfirm" @cancel="onCancel" />
  </div>
</template>

<style scoped>
.missas-admin { max-width: 840px; }

.page-title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  color: var(--fr-950);
  margin: 0 0 24px;
}

.action-error {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 16px;
}

.chapels-list { display: flex; flex-direction: column; gap: 24px; }

.chapel-section {
  background: #fff;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  overflow: hidden;
}

.chapel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: var(--fr-50);
  border-bottom: 1px solid var(--fr-200);
}

.chapel-type-badge {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
}

.badge--matriz { background: var(--fr-200); color: var(--fr-950); }
.badge--branch { background: #e5e5e0; color: #6b6b5e; }

.chapel-name {
  font-family: var(--font-serif);
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--fr-950);
  margin: 0;
}

.schedule-block {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schedule-block:last-child { border-bottom: none; }

.block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

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
  color: var(--fr-700, var(--fr-600));
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

.row-day {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--fr-950);
  min-width: 80px;
}

.row-time {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-primary);
}

.row-note {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
  flex: 1;
}

.row-inactive {
  font-family: var(--font-sans);
  font-size: 11px;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 4px;
  padding: 1px 6px;
}

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

.empty-hint {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

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

.form-select,
.form-input {
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

.form-select:focus,
.form-input:focus { border-color: var(--fr-400); }

.form-input--wide { flex: 1; min-width: 200px; }

.form-sep {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
}

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
