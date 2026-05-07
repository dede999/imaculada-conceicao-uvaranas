<script setup lang="ts">
import { slugify } from '~/utils/slugify'
definePageMeta({ layout: 'admin' })

const title = ref('')
const slug = ref('')
const date = ref(new Date().toISOString().slice(0, 10))
const summary = ref('')
const body = ref('')
const published = ref(false)
const slugLocked = ref(false)

const { saving, error, handleSave } = useAdminSave()

watch(title, (val) => {
  if (!slugLocked.value) slug.value = slugify(val)
})

async function save() {
  if (!title.value || !slug.value || !date.value) {
    error.value = 'Título, slug e data são obrigatórios'
    return
  }
  await handleSave(async () => {
    const { id } = await $fetch<{ id: string }>('/api/admin/noticias', {
      method: 'POST',
      body: { title: title.value, slug: slug.value, date: date.value, summary: summary.value, body: body.value, published: published.value },
    })
    await navigateTo(`/admin/noticias/${id}`)
  })
}
</script>

<template>
  <div class="noticia-form">
    <div class="form-header">
      <NuxtLink to="/admin/noticias" class="back-link">← Notícias</NuxtLink>
      <h1 class="page-title">Nova notícia</h1>
    </div>

    <p v-if="error" class="form-error">{{ error }}</p>

    <form class="form" @submit.prevent="save">
      <div class="field">
        <label>Título</label>
        <input v-model="title" type="text" required placeholder="Título da notícia" />
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
          <label>Data</label>
          <input v-model="date" type="date" required />
        </div>
      </div>

      <div class="field">
        <label>Resumo</label>
        <textarea v-model="summary" rows="2" placeholder="Uma linha descrevendo a notícia" />
      </div>

      <div class="field">
        <label>Conteúdo</label>
        <AdminEditor v-model="body" />
      </div>

      <div class="form-footer">
        <label class="publish-toggle">
          <input v-model="published" type="checkbox" />
          Publicar imediatamente
        </label>
        <button type="submit" class="btn-save" :disabled="saving">
          {{ saving ? 'Salvando…' : 'Salvar' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.noticia-form { max-width: 760px; }
</style>
