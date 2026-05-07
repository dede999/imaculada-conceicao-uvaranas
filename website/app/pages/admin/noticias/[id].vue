<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface Noticia {
  id: string; slug: string; title: string; date: string
  summary: string; body: string; published: boolean
}

const route = useRoute()
const id = route.params.id as string

const { data: original } = await useAsyncData(`noticia-${id}`,
  () => $fetch<Noticia>(`/api/admin/noticias/${id}`),
  { server: false },
)

const title = ref('')
const slug = ref('')
const date = ref('')
const summary = ref('')
const body = ref('')
const published = ref(false)
const slugLocked = ref(true)

watch(original, (val) => {
  if (!val) return
  title.value = val.title
  slug.value = val.slug
  date.value = val.date
  summary.value = val.summary
  body.value = val.body
  published.value = val.published
}, { immediate: true })

const { saving, error, handleSave } = useAdminSave()

async function save() {
  await handleSave(async () => {
    await $fetch(`/api/admin/noticias/${id}`, {
      method: 'PATCH',
      body: { title: title.value, slug: slug.value, date: date.value, summary: summary.value, body: body.value, published: published.value },
    })
  })
}
</script>

<template>
  <div class="noticia-form">
    <div class="form-header">
      <NuxtLink to="/admin/noticias" class="back-link">← Notícias</NuxtLink>
      <h1 class="page-title">Editar notícia</h1>
    </div>

    <p v-if="error" class="form-error">{{ error }}</p>

    <form v-if="original" class="form" @submit.prevent="save">
      <div class="field">
        <label>Título</label>
        <input v-model="title" type="text" required placeholder="Título da notícia" />
      </div>

      <div class="field field-row">
        <div class="field">
          <label>Slug (URL)</label>
          <div class="slug-wrap">
            <input v-model="slug" type="text" required :readonly="slugLocked" />
            <button type="button" class="btn-lock" :title="slugLocked ? 'Desbloquear slug' : 'Bloquear slug'" @click="slugLocked = !slugLocked">
              {{ slugLocked ? '🔒' : '🔓' }}
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
          Publicada
        </label>
        <button type="submit" class="btn-save" :disabled="saving">
          {{ saving ? 'Salvando…' : 'Salvar alterações' }}
        </button>
      </div>
    </form>

    <p v-else class="loading">Carregando…</p>
  </div>
</template>

<style scoped>
.noticia-form { max-width: 760px; }
</style>
