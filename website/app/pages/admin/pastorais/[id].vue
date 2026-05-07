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
const saved = ref(false)

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

const { saving, error, handleSave } = useAdminSave()

async function save() {
  await handleSave(async () => {
    await $fetch(`/api/admin/pastorais/${id}`, {
      method: 'PATCH',
      body: { name: name.value, slug: slug.value, category: category.value, summary: summary.value, coordinator: coordinator.value, meetings: meetings.value, body: body.value },
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 2500)
  })
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
.form-success { background: #e8f5e9; color: #2e7d32; border-radius: 6px; padding: 10px 14px; font-family: var(--font-sans); font-size: 13px; margin-bottom: 16px; }
</style>
