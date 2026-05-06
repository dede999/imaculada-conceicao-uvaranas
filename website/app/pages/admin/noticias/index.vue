<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface NoticiaRow {
  id: string
  slug: string
  title: string
  date: string
  summary: string
  published: boolean
  updated_at: string
}

const { data, refresh } = await useAsyncData('admin-noticias',
  () => $fetch<NoticiaRow[]>('/api/admin/noticias'),
  { server: false },
)

const list = computed(() => data.value ?? [])

const deleting = ref<string | null>(null)

async function togglePublish(item: NoticiaRow) {
  await $fetch(`/api/admin/noticias/${item.id}`, {
    method: 'PATCH',
    body: { published: !item.published },
  })
  await refresh()
}

async function remove(id: string) {
  if (!confirm('Excluir esta notícia?')) return
  deleting.value = id
  await $fetch(`/api/admin/noticias/${id}`, { method: 'DELETE' })
  deleting.value = null
  await refresh()
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="noticias-admin">
    <div class="page-header">
      <h1 class="page-title">Notícias</h1>
      <NuxtLink to="/admin/noticias/nova" class="btn-new">+ Nova notícia</NuxtLink>
    </div>

    <div v-if="list.length" class="noticia-list">
      <div v-for="item in list" :key="item.id" class="noticia-row">
        <div class="noticia-info">
          <p class="noticia-title">{{ item.title }}</p>
          <p class="noticia-meta">{{ fmtDate(item.date) }} · /noticias/{{ item.slug }}</p>
        </div>
        <div class="noticia-actions">
          <span :class="['status', item.published ? 'published' : 'draft']">
            {{ item.published ? 'Publicada' : 'Rascunho' }}
          </span>
          <NuxtLink :to="`/admin/noticias/${item.id}`" class="btn-edit">Editar</NuxtLink>
          <button class="btn-toggle" @click="togglePublish(item)">
            {{ item.published ? 'Despublicar' : 'Publicar' }}
          </button>
          <button class="btn-delete" :disabled="deleting === item.id" @click="remove(item.id)">
            Excluir
          </button>
        </div>
      </div>
    </div>

    <p v-else class="empty">Nenhuma notícia cadastrada ainda.</p>
  </div>
</template>

<style scoped>
.noticias-admin { max-width: 860px; }

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  color: var(--fr-950);
  margin: 0;
}

.btn-new {
  background: var(--fr-600);
  color: #fff;
  border-radius: 6px;
  padding: 8px 16px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s;
}

.btn-new:hover { background: var(--fr-800); }

.noticia-list { display: flex; flex-direction: column; gap: 8px; }

.noticia-row {
  background: #fff;
  border: 1px solid #e4ddd0;
  border-radius: 8px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.noticia-info { flex: 1; min-width: 0; }

.noticia-title {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--fr-950);
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.noticia-meta {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.noticia-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.status {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.status.published { background: #d1f5e0; color: #1a7a4a; }
.status.draft     { background: #f0ebe2; color: #8a7a60; }

.btn-edit, .btn-toggle, .btn-delete {
  border: 1px solid #d4c9b8;
  border-radius: 5px;
  padding: 4px 10px;
  font-family: var(--font-sans);
  font-size: 12px;
  cursor: pointer;
  background: none;
  transition: background 0.1s;
  text-decoration: none;
  color: var(--fr-800);
}

.btn-edit:hover, .btn-toggle:hover { background: #f5efe4; }
.btn-delete { color: #c0392b; border-color: #f0c0b8; }
.btn-delete:hover { background: #fde8e8; }
.btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

.empty {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
}
</style>
