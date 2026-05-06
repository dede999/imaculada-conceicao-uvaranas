<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface Evento {
  id: string; slug: string; title: string; type: string
  date: string; end_date: string | null; status: string
  summary: string; body: string; published: boolean
}

const route = useRoute()
const id = route.params.id as string

const { data: original } = await useAsyncData(`evento-edit-${id}`,
  () => $fetch<Evento>(`/api/admin/eventos/${id}`),
  { server: false },
)

const title = ref('')
const slug = ref('')
const type = ref<'event' | 'announcement'>('event')
const date = ref('')
const endDate = ref('')
const status = ref<'active' | 'cancelled' | 'postponed'>('active')
const summary = ref('')
const body = ref('')
const published = ref(false)
const slugLocked = ref(true)

watch(original, (val) => {
  if (!val) return
  title.value = val.title
  slug.value = val.slug
  type.value = val.type as 'event' | 'announcement'
  date.value = val.date
  endDate.value = val.end_date ?? ''
  status.value = val.status as 'active' | 'cancelled' | 'postponed'
  summary.value = val.summary
  body.value = val.body
  published.value = val.published
}, { immediate: true })

const saving = ref(false)
const error = ref('')

async function save() {
  saving.value = true
  error.value = ''
  try {
    await $fetch(`/api/admin/eventos/${id}`, {
      method: 'PATCH',
      body: {
        title: title.value,
        slug: slug.value,
        type: type.value,
        date: date.value,
        end_date: endDate.value || null,
        status: status.value,
        summary: summary.value,
        body: body.value,
        published: published.value,
      },
    })
  }
  catch (e: unknown) {
    error.value = (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Erro ao salvar'
  }
  finally { saving.value = false }
}
</script>

<template>
  <div class="evento-form">
    <div class="form-header">
      <NuxtLink to="/admin/eventos" class="back-link">← Eventos</NuxtLink>
      <h1 class="page-title">Editar evento</h1>
    </div>

    <p v-if="error" class="form-error">{{ error }}</p>

    <form v-if="original" class="form" @submit.prevent="save">
      <div class="field">
        <label>Título</label>
        <input v-model="title" type="text" required placeholder="Título do evento" />
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
          Publicado
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
.evento-form { max-width: 760px; }
.form-header { margin-bottom: 20px; }
.back-link { font-family: var(--font-sans); font-size: 13px; color: var(--fr-600); text-decoration: none; display: block; margin-bottom: 6px; }
.page-title { font-family: var(--font-serif); font-size: var(--text-2xl); color: var(--fr-950); margin: 0; }
.form-error { background: #fde8e8; color: #c0392b; border-radius: 6px; padding: 10px 14px; font-family: var(--font-sans); font-size: 13px; margin-bottom: 16px; }
.form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.field-row { flex-direction: row; gap: 16px; }
.field label { font-family: var(--font-sans); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--fr-600); }
.optional { font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--text-muted); }
.field input, .field textarea, .field select { border: 1px solid #d4c9b8; border-radius: 6px; padding: 9px 12px; font-family: var(--font-sans); font-size: 14px; color: var(--fr-950); outline: none; resize: vertical; transition: border-color 0.15s; background: #fff; }
.field input:focus, .field textarea:focus, .field select:focus { border-color: var(--fr-600); }
.field input[readonly] { background: #faf7f2; color: var(--text-muted); }
.slug-wrap { display: flex; gap: 6px; }
.slug-wrap input { flex: 1; }
.btn-lock { background: none; border: 1px solid #d4c9b8; border-radius: 6px; padding: 0 10px; cursor: pointer; font-size: 14px; }
.form-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid #e4ddd0; }
.publish-toggle { display: flex; align-items: center; gap: 8px; font-family: var(--font-sans); font-size: 14px; color: var(--fr-950); cursor: pointer; }
.btn-save { background: var(--fr-600); color: #fff; border: none; border-radius: 6px; padding: 9px 24px; font-family: var(--font-sans); font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-save:hover:not(:disabled) { background: var(--fr-800); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.loading { font-family: var(--font-sans); font-size: 14px; color: var(--text-muted); }
</style>
