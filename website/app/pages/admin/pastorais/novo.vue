<script setup lang="ts">
import { slugify } from '~/utils/slugify'
definePageMeta({ layout: 'admin' })

const CATEGORIES = [
  { value: 'liturgia', label: 'Liturgia' },
  { value: 'formacao', label: 'Formação' },
  { value: 'social', label: 'Social' },
  { value: 'movimentos', label: 'Movimentos' },
  { value: 'comunicacao', label: 'Comunicação' },
]

const name = ref('')
const slug = ref('')
const category = ref('liturgia')
const summary = ref('')
const coordinator = ref('')
const meetings = ref('')
const body = ref('')
const slugLocked = ref(false)

const { saving, error, handleSave } = useAdminSave()

watch(name, (val) => {
  if (!slugLocked.value) slug.value = slugify(val)
})

async function save() {
  if (!name.value || !slug.value || !category.value) {
    error.value = 'Nome, slug e categoria são obrigatórios'
    return
  }
  await handleSave(async () => {
    const { id } = await $fetch<{ id: string }>('/api/admin/pastorais', {
      method: 'POST',
      body: { name: name.value, slug: slug.value, category: category.value, summary: summary.value, coordinator: coordinator.value, meetings: meetings.value, body: body.value },
    })
    await navigateTo(`/admin/pastorais/${id}`)
  })
}
</script>

<template>
  <div class="pastoral-form">
    <div class="form-header">
      <NuxtLink to="/admin/pastorais" class="back-link">← Pastorais</NuxtLink>
      <h1 class="page-title">Nova pastoral</h1>
    </div>

    <p v-if="error" class="form-error">{{ error }}</p>

    <form class="form" @submit.prevent="save">
      <div class="field">
        <label>Nome</label>
        <input v-model="name" type="text" required placeholder="Nome da pastoral" />
      </div>

      <div class="field field-row">
        <div class="field">
          <label>Slug (URL)</label>
          <div class="slug-wrap">
            <input v-model="slug" type="text" required :readonly="!slugLocked" />
            <button type="button" class="btn-lock" @click="slugLocked = !slugLocked">
              {{ slugLocked ? '🔓' : '🔒' }}
            </button>
          </div>
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
        <textarea v-model="summary" rows="2" placeholder="Uma frase descrevendo a pastoral" />
      </div>

      <div class="field field-row">
        <div class="field">
          <label>Coordenador(a)</label>
          <input v-model="coordinator" type="text" placeholder="Nome do(a) coordenador(a)" />
        </div>
        <div class="field">
          <label>Encontros</label>
          <input v-model="meetings" type="text" placeholder="Ex: Quintas-feiras, 19h30" />
        </div>
      </div>

      <div class="field">
        <label>Conteúdo</label>
        <AdminEditor v-model="body" />
      </div>

      <div class="form-footer">
        <button type="submit" class="btn-save" :disabled="saving">
          {{ saving ? 'Salvando…' : 'Criar pastoral' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.pastoral-form { max-width: 760px; }
</style>
