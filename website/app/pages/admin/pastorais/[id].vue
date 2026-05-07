<script setup lang="ts">
definePageMeta({ layout: 'admin' })
import type { Pastoral } from '../../../composables/usePastorais'

const CATEGORIES = [
  { value: 'liturgia', label: 'Liturgia' },
  { value: 'formacao', label: 'Formação' },
  { value: 'social', label: 'Social' },
  { value: 'movimentos', label: 'Movimentos' },
  { value: 'comunicacao', label: 'Comunicação' },
]

const route = useRoute()
const id = route.params.id as string

const { data: original } = await useAsyncData<Pastoral>(
  `pastoral-${id}`,
  () => $fetch<Pastoral>(`/api/admin/pastorais/${id}`),
  { server: false },
)

const name = ref('')
const slug = ref('')
const category = ref('liturgia')
const summary = ref('')
const coordinator = ref('')
const meetings = ref('')
const body = ref('')

watch(original, (val) => {
  if (!val) return
  name.value = val.name
  slug.value = val.slug
  category.value = val.category
  summary.value = val.summary ?? ''
  coordinator.value = val.coordinator ?? ''
  meetings.value = val.meetings ?? ''
  body.value = val.body ?? ''
}, { immediate: true })

const saving = ref(false)
const saved = ref(false)
const error = ref('')

async function save() {
  saving.value = true
  saved.value = false
  error.value = ''
  try {
    await $fetch(`/api/admin/pastorais/${id}`, {
      method: 'PATCH',
      body: {
        name: name.value,
        slug: slug.value,
        category: category.value,
        summary: summary.value,
        coordinator: coordinator.value,
        meetings: meetings.value,
        body: body.value,
      },
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 2500)
  }
  catch (e: unknown) {
    error.value = (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Erro ao salvar'
  }
  finally { saving.value = false }
}
</script>

<template>
  <div class="pastoral-form">
    <div class="form-header">
      <NuxtLink to="/admin/pastorais" class="back-link">← Pastorais</NuxtLink>
      <h1 class="page-title">Editar pastoral</h1>
    </div>

    <p v-if="error" class="form-error">{{ error }}</p>
    <p v-if="saved" class="form-success">Alterações salvas.</p>

    <form class="form" @submit.prevent="save">
      <div class="field">
        <label>Nome</label>
        <input v-model="name" type="text" required />
      </div>

      <div class="field field-row">
        <div class="field">
          <label>Slug (URL)</label>
          <input v-model="slug" type="text" required />
        </div>
        <div class="field">
          <label>Categoria</label>
          <select v-model="category">
            <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label>Resumo</label>
        <textarea v-model="summary" rows="2" />
      </div>

      <div class="field field-row">
        <div class="field">
          <label>Coordenador(a)</label>
          <input v-model="coordinator" type="text" />
        </div>
        <div class="field">
          <label>Encontros</label>
          <input v-model="meetings" type="text" />
        </div>
      </div>

      <div class="field">
        <label>Conteúdo</label>
        <AdminEditor v-model="body" />
      </div>

      <div class="form-footer">
        <button type="submit" class="btn-save" :disabled="saving">
          {{ saving ? 'Salvando…' : 'Salvar alterações' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.pastoral-form { max-width: 760px; }

.form-header { margin-bottom: 20px; }

.back-link {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--fr-600);
  text-decoration: none;
  display: block;
  margin-bottom: 6px;
}

.page-title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  color: var(--fr-950);
  margin: 0;
}

.form-error {
  background: #fde8e8;
  color: #c0392b;
  border-radius: 6px;
  padding: 10px 14px;
  font-family: var(--font-sans);
  font-size: 13px;
  margin-bottom: 16px;
}

.form-success {
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 6px;
  padding: 10px 14px;
  font-family: var(--font-sans);
  font-size: 13px;
  margin-bottom: 16px;
}

.form { display: flex; flex-direction: column; gap: 16px; }

.field { display: flex; flex-direction: column; gap: 5px; flex: 1; }

.field-row { flex-direction: row; gap: 16px; }

.field label {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--fr-600);
}

.field input, .field textarea, .field select {
  border: 1px solid #d4c9b8;
  border-radius: 6px;
  padding: 9px 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--fr-950);
  outline: none;
  resize: vertical;
  transition: border-color 0.15s;
  background: #fff;
}

.field input:focus, .field textarea:focus, .field select:focus { border-color: var(--fr-600); }

.form-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #e4ddd0;
}

.btn-save {
  background: var(--fr-600);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 9px 24px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-save:hover:not(:disabled) { background: var(--fr-800); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
