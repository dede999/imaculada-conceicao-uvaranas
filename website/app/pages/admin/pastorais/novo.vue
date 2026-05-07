<script setup lang="ts">
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
const saving = ref(false)
const error = ref('')

function slugify(text: string) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

watch(name, (val) => {
  if (!slugLocked.value) slug.value = slugify(val)
})

async function save() {
  if (!name.value || !slug.value || !category.value) {
    error.value = 'Nome, slug e categoria são obrigatórios'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const { id } = await $fetch<{ id: string }>('/api/admin/pastorais', {
      method: 'POST',
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
    await navigateTo(`/admin/pastorais/${id}`)
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
.field input[readonly] { background: #faf7f2; color: var(--text-muted); }

.slug-wrap { display: flex; gap: 6px; }
.slug-wrap input { flex: 1; }

.btn-lock {
  background: none;
  border: 1px solid #d4c9b8;
  border-radius: 6px;
  padding: 0 10px;
  cursor: pointer;
  font-size: 14px;
}

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
