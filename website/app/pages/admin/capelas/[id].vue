<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface ContactRow { id: string; type: string; value: string; sort: number }
interface ImageRow   { id: string; url: string; caption: string; sort: number }

interface ChapelFull {
  id: string; slug: string; name: string; type: string
  address: string; pastor: string; lat: number | null; lng: number | null; body: string
  contacts: ContactRow[]; images: ImageRow[]
}

const route = useRoute()
const chapelId = route.params.id as string

const { data, refresh } = await useAsyncData<ChapelFull[]>(
  'admin-capelas-detail',
  () => $fetch('/api/admin/chapels'),
  { server: false },
)

const chapel = computed<ChapelFull | null>(() =>
  data.value?.find(c => c.id === chapelId) ?? null
)

// ── Metadata form ──────────────────────────────────────────────────
const metaForm = reactive({ name: '', address: '', pastor: '', lat: '', lng: '' })
const bodyValue = ref('')
const metaSaving = ref(false)
const metaSuccess = ref(false)
const metaError = ref('')

watch(chapel, (c) => {
  if (!c) return
  metaForm.name    = c.name
  metaForm.address = c.address
  metaForm.pastor  = c.pastor
  metaForm.lat     = c.lat != null ? String(c.lat) : ''
  metaForm.lng     = c.lng != null ? String(c.lng) : ''
  bodyValue.value  = c.body ?? ''
}, { immediate: true })

async function saveMeta() {
  metaSaving.value = true; metaError.value = ''; metaSuccess.value = false
  try {
    await $fetch(`/api/admin/chapels/${chapelId}`, {
      method: 'PATCH',
      body: {
        name:    metaForm.name,
        address: metaForm.address,
        pastor:  metaForm.pastor,
        lat:     metaForm.lat ? Number(metaForm.lat) : null,
        lng:     metaForm.lng ? Number(metaForm.lng) : null,
        body:    bodyValue.value,
      },
    })
    metaSuccess.value = true
    await refresh()
    setTimeout(() => { metaSuccess.value = false }, 3000)
  } catch (e: unknown) {
    metaError.value = (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Erro ao salvar.'
  } finally {
    metaSaving.value = false
  }
}

// ── Delete handlers (shared deleting state + confirm) ──────────────
const deleting    = ref<string | null>(null)
const actionError = ref('')
const { open: confirmOpen, message: confirmMsg, confirm: showConfirm, onConfirm, onCancel } = useAdminConfirm()

async function deleteContact(id: string) {
  if (!await showConfirm('Excluir este contato?')) return
  deleting.value = id
  await $fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' })
  deleting.value = null
  await refresh()
}

async function deleteImage(id: string) {
  if (!await showConfirm('Excluir esta imagem?')) return
  deleting.value = id
  await $fetch(`/api/admin/images/${id}`, { method: 'DELETE' })
  deleting.value = null
  await refresh()
}
</script>

<template>
  <div class="chapel-edit">
    <div class="page-header">
      <NuxtLink to="/admin/capelas" class="back-link">← Capelas</NuxtLink>
      <h1 class="page-title">{{ chapel?.name ?? 'Carregando…' }}</h1>
    </div>

    <p v-if="actionError" class="action-error">{{ actionError }}</p>

    <template v-if="chapel">

      <!-- ── Metadata ────────────────────────────────────────── -->
      <section class="card">
        <h2 class="card-title">Informações gerais</h2>

        <div class="form-grid">
          <label class="field">
            <span class="field-label">Nome</span>
            <input v-model="metaForm.name" type="text" class="form-input" />
          </label>
          <label class="field">
            <span class="field-label">Pároco</span>
            <input v-model="metaForm.pastor" type="text" class="form-input" />
          </label>
          <label class="field field--full">
            <span class="field-label">Endereço</span>
            <input v-model="metaForm.address" type="text" class="form-input" />
          </label>
          <label class="field">
            <span class="field-label">Latitude</span>
            <input v-model="metaForm.lat" type="number" step="any" class="form-input" placeholder="ex: -7.1234" />
          </label>
          <label class="field">
            <span class="field-label">Longitude</span>
            <input v-model="metaForm.lng" type="number" step="any" class="form-input" placeholder="ex: -37.5678" />
          </label>
        </div>

        <div class="field field--full">
          <span class="field-label">Texto descritivo</span>
          <AdminEditor v-model="bodyValue" />
        </div>

        <div class="form-actions">
          <span v-if="metaSuccess" class="success-msg">Salvo com sucesso!</span>
          <span v-if="metaError" class="error-msg">{{ metaError }}</span>
          <button class="btn-primary" :disabled="metaSaving" @click="saveMeta">
            {{ metaSaving ? 'Salvando…' : 'Salvar informações' }}
          </button>
        </div>
      </section>

      <ChapelContacts
        :contacts="chapel.contacts"
        :deleting="deleting"
        :chapel-id="chapelId"
        @delete="deleteContact"
        @added="refresh"
        @error="actionError = $event"
      />

      <ChapelImages
        :images="chapel.images"
        :deleting="deleting"
        :chapel-id="chapelId"
        @delete="deleteImage"
        @added="refresh"
        @error="actionError = $event"
      />

    </template>

    <AdminConfirmModal :open="confirmOpen" :message="confirmMsg" @confirm="onConfirm" @cancel="onCancel" />
  </div>
</template>

<style scoped>
.chapel-edit { max-width: 760px; display: flex; flex-direction: column; gap: 24px; }

.page-header { display: flex; flex-direction: column; gap: 6px; }

.back-link {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--fr-600);
  text-decoration: none;
  display: inline-flex;
  align-self: flex-start;
}

.back-link:hover { text-decoration: underline; }

.page-title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  color: var(--fr-950);
  margin: 0;
}

.action-error {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 10px 14px;
}

.card {
  background: #fff;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-title {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--fr-950);
  margin: 0;
}

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.field { display: flex; flex-direction: column; gap: 5px; }
.field--full { grid-column: 1 / -1; }

.field-label {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  color: var(--fr-600);
  letter-spacing: 0.04em;
}

.form-input {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--fr-950);
  background: #fff;
  border: 1px solid #d4c9b8;
  border-radius: 5px;
  padding: 7px 10px;
  outline: none;
  transition: border-color 0.1s;
}

.form-input:focus { border-color: var(--fr-400); }

.form-actions { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }

.success-msg { font-family: var(--font-sans); font-size: 13px; color: #166534; }
.error-msg   { font-family: var(--font-sans); font-size: 13px; color: #b91c1c; }

.btn-primary {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: var(--fr-600);
  border: none;
  border-radius: 5px;
  padding: 8px 18px;
  cursor: pointer;
  transition: background 0.1s;
}

.btn-primary:hover:not(:disabled) { background: var(--fr-800); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 639px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>
