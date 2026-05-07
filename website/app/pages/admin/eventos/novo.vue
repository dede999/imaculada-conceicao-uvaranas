<script setup lang="ts">
import { slugify } from '~/utils/slugify'
definePageMeta({ layout: 'admin' })

const title = ref('')
const slug = ref('')
const type = ref<'event' | 'announcement'>('event')
const date = ref(new Date().toISOString().slice(0, 10))
const endDate = ref('')
const status = ref<'active' | 'cancelled' | 'postponed'>('active')
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
    const { id } = await $fetch<{ id: string }>('/api/admin/eventos', {
      method: 'POST',
      body: {
        title: title.value, slug: slug.value, type: type.value,
        date: date.value, end_date: endDate.value || null,
        status: status.value, summary: summary.value,
        body: body.value, published: published.value,
      },
    })
    await navigateTo(`/admin/eventos/${id}`)
  })
}
</script>

<template>
  <div class="evento-form">
    <div class="form-header">
      <NuxtLink to="/admin/eventos" class="back-link">← Eventos</NuxtLink>
      <h1 class="page-title">Novo evento</h1>
    </div>

    <p v-if="error" class="form-error">{{ error }}</p>

    <form class="form" @submit.prevent="save">
      <div class="field">
        <label>Título</label>
        <input v-model="title" type="text" required placeholder="Título do evento" />
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
          <label>Tipo</label>
          <select v-model="type">
            <option value="event">Evento</option>
            <option value="announcement">Comunicado</option>
          </select>
        </div>
        <div class="field">
          <label>Status</label>
          <select v-model="status">
            <option value="active">Ativo</option>
            <option value="postponed">Adiado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <div class="field field-row">
        <div class="field">
          <label>Data</label>
          <input v-model="date" type="date" required />
        </div>
        <div class="field">
          <label>Data fim <span class="optional">(opcional)</span></label>
          <input v-model="endDate" type="date" />
        </div>
      </div>

      <div class="field">
        <label>Resumo</label>
        <textarea v-model="summary" rows="2" placeholder="Uma linha descrevendo o evento" />
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
.evento-form { max-width: 760px; }
.optional { font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--text-muted); }
</style>
