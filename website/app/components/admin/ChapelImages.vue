<script setup lang="ts">
interface ImageRow { id: string; url: string; caption: string; sort: number }

const props = defineProps<{
  images: ImageRow[]
  deleting: string | null
  chapelId: string
}>()

const emit = defineEmits<{
  delete: [id: string]
  added: []
  error: [msg: string]
}>()

const adding = ref(false)
const saving = ref(false)
const form   = reactive({ url: '', caption: '' })

async function add() {
  if (!form.url) { emit('error', 'URL obrigatória.'); return }
  saving.value = true
  try {
    await $fetch('/api/admin/images', {
      method: 'POST',
      body: { chapel_id: props.chapelId, url: form.url, caption: form.caption || '' },
    })
    adding.value  = false
    form.url      = ''
    form.caption  = ''
    emit('added')
  }
  catch (e: unknown) {
    emit('error', (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Erro ao adicionar.')
  }
  finally { saving.value = false }
}
</script>

<template>
  <section class="card">
    <div class="card-header">
      <h2 class="card-title">Imagens</h2>
      <button class="btn-add-inline" @click="adding = !adding">
        {{ adding ? 'Cancelar' : '+ Adicionar' }}
      </button>
    </div>

    <div v-if="images.length" class="images-list">
      <div v-for="img in images" :key="img.id" class="image-row">
        <img :src="img.url" :alt="img.caption" class="image-thumb" />
        <div class="image-meta">
          <span class="image-url">{{ img.url }}</span>
          <span v-if="img.caption" class="image-caption">{{ img.caption }}</span>
        </div>
        <button class="btn-delete" :disabled="deleting === img.id" @click="emit('delete', img.id)">✕</button>
      </div>
    </div>
    <p v-else class="empty-hint">Nenhuma imagem cadastrada.</p>

    <form v-if="adding" class="inline-form inline-form--col" @submit.prevent="add">
      <input
        v-model="form.url"
        type="url"
        class="form-input form-input--wide"
        placeholder="URL da imagem"
        required
      />
      <input
        v-model="form.caption"
        type="text"
        class="form-input form-input--wide"
        placeholder="Legenda (opcional)"
      />
      <button type="submit" class="btn-save" :disabled="saving">Salvar</button>
    </form>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header { display: flex; align-items: center; justify-content: space-between; }

.card-title {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--fr-950);
  margin: 0;
}

.images-list { display: flex; flex-direction: column; gap: 8px; }

.image-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #fafaf8;
  border: 1px solid var(--border-default);
  border-radius: 6px;
}

.image-thumb {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  border: 1px solid var(--border-default);
}

.image-meta { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }

.image-url {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-caption { font-family: var(--font-sans); font-size: 13px; color: var(--text-primary); }

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

.empty-hint { font-family: var(--font-sans); font-size: 13px; color: var(--text-muted); margin: 0; }

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

.form-input {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--fr-950);
  background: #fff;
  border: 1px solid #d4c9b8;
  border-radius: 5px;
  padding: 5px 9px;
  outline: none;
  transition: border-color 0.1s;
}

.form-input:focus { border-color: var(--fr-400); }
.form-input--wide { flex: 1; min-width: 200px; }

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
</style>
