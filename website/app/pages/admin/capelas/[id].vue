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
  } catch (e: any) {
    metaError.value = e?.data?.statusMessage ?? 'Erro ao salvar.'
  } finally {
    metaSaving.value = false
  }
}

// ── Contacts ───────────────────────────────────────────────────────
const CONTACT_TYPES = ['phone', 'whatsapp', 'email', 'instagram', 'facebook', 'youtube', 'tiktok']
const CONTACT_LABELS: Record<string, string> = {
  phone: 'Telefone', whatsapp: 'WhatsApp', email: 'E-mail',
  instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube', tiktok: 'TikTok',
}

const contactForm = reactive({ type: 'phone', value: '' })
const addingContact = ref(false)
const contactSaving = ref(false)
const deleting = ref<string | null>(null)
const actionError = ref('')
const { open: confirmOpen, message: confirmMsg, confirm: showConfirm, onConfirm, onCancel } = useAdminConfirm()

async function addContact() {
  if (!contactForm.value) { actionError.value = 'Valor obrigatório.'; return }
  contactSaving.value = true; actionError.value = ''
  try {
    await $fetch('/api/admin/contacts', {
      method: 'POST',
      body: { chapel_id: chapelId, type: contactForm.type, value: contactForm.value },
    })
    addingContact.value = false
    contactForm.type = 'phone'; contactForm.value = ''
    await refresh()
  } catch (e: any) {
    actionError.value = e?.data?.statusMessage ?? 'Erro ao adicionar.'
  } finally {
    contactSaving.value = false
  }
}

async function deleteContact(id: string) {
  if (!await showConfirm('Excluir este contato?')) return
  deleting.value = id
  await $fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' })
  deleting.value = null
  await refresh()
}

// ── Images ─────────────────────────────────────────────────────────
const imageForm = reactive({ url: '', caption: '' })
const addingImage = ref(false)
const imageSaving = ref(false)

async function addImage() {
  if (!imageForm.url) { actionError.value = 'URL obrigatória.'; return }
  imageSaving.value = true; actionError.value = ''
  try {
    await $fetch('/api/admin/images', {
      method: 'POST',
      body: { chapel_id: chapelId, url: imageForm.url, caption: imageForm.caption || '' },
    })
    addingImage.value = false
    imageForm.url = ''; imageForm.caption = ''
    await refresh()
  } catch (e: any) {
    actionError.value = e?.data?.statusMessage ?? 'Erro ao adicionar.'
  } finally {
    imageSaving.value = false
  }
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

      <!-- ── Contacts ───────────────────────────────────────── -->
      <section class="card">
        <div class="card-header">
          <h2 class="card-title">Contatos</h2>
          <button class="btn-add-inline" @click="addingContact = !addingContact">
            {{ addingContact ? 'Cancelar' : '+ Adicionar' }}
          </button>
        </div>

        <div v-if="chapel.contacts.length" class="rows-list">
          <div v-for="c in chapel.contacts" :key="c.id" class="contact-row">
            <span class="contact-type">{{ CONTACT_LABELS[c.type] ?? c.type }}</span>
            <span class="contact-value">{{ c.value }}</span>
            <button
              class="btn-delete"
              :disabled="deleting === c.id"
              @click="deleteContact(c.id)"
            >✕</button>
          </div>
        </div>
        <p v-else class="empty-hint">Nenhum contato cadastrado. Capelas sem contatos herdam os contatos da matriz.</p>

        <form v-if="addingContact" class="inline-form" @submit.prevent="addContact">
          <select v-model="contactForm.type" class="form-select">
            <option v-for="ct in CONTACT_TYPES" :key="ct" :value="ct">{{ CONTACT_LABELS[ct] }}</option>
          </select>
          <input
            v-model="contactForm.value"
            type="text"
            class="form-input form-input--wide"
            placeholder="Valor (ex: +55 83 99999-9999)"
            required
          />
          <button type="submit" class="btn-save" :disabled="contactSaving">Salvar</button>
        </form>
      </section>

      <!-- ── Images ─────────────────────────────────────────── -->
      <section class="card">
        <div class="card-header">
          <h2 class="card-title">Imagens</h2>
          <button class="btn-add-inline" @click="addingImage = !addingImage">
            {{ addingImage ? 'Cancelar' : '+ Adicionar' }}
          </button>
        </div>

        <div v-if="chapel.images.length" class="images-list">
          <div v-for="img in chapel.images" :key="img.id" class="image-row">
            <img :src="img.url" :alt="img.caption" class="image-thumb" />
            <div class="image-meta">
              <span class="image-url">{{ img.url }}</span>
              <span v-if="img.caption" class="image-caption">{{ img.caption }}</span>
            </div>
            <button
              class="btn-delete"
              :disabled="deleting === img.id"
              @click="deleteImage(img.id)"
            >✕</button>
          </div>
        </div>
        <p v-else class="empty-hint">Nenhuma imagem cadastrada.</p>

        <form v-if="addingImage" class="inline-form inline-form--col" @submit.prevent="addImage">
          <input
            v-model="imageForm.url"
            type="url"
            class="form-input form-input--wide"
            placeholder="URL da imagem"
            required
          />
          <input
            v-model="imageForm.caption"
            type="text"
            class="form-input form-input--wide"
            placeholder="Legenda (opcional)"
          />
          <button type="submit" class="btn-save" :disabled="imageSaving">Salvar</button>
        </form>
      </section>

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

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--fr-950);
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

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
.form-input--wide { flex: 1; min-width: 200px; }

.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.success-msg {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #166534;
}

.error-msg {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #b91c1c;
}

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

.rows-list { display: flex; flex-direction: column; gap: 6px; }

.contact-row, .image-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #fafaf8;
  border: 1px solid var(--border-default);
  border-radius: 6px;
}

.contact-type {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--fr-600);
  min-width: 80px;
}

.contact-value {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-primary);
  flex: 1;
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

.inline-form--col { flex-direction: column; align-items: stretch; }

.form-select {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--fr-950);
  background: #fff;
  border: 1px solid #d4c9b8;
  border-radius: 5px;
  padding: 5px 9px;
  outline: none;
}

.form-select:focus { border-color: var(--fr-400); }

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
  align-self: flex-end;
}

.btn-save:hover:not(:disabled) { background: var(--fr-800); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

.images-list { display: flex; flex-direction: column; gap: 8px; }

.image-thumb {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  border: 1px solid var(--border-default);
}

.image-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.image-url {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-caption {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-primary);
}

@media (max-width: 639px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>
