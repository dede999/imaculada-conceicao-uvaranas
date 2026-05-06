<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface EventoRow {
  id: string
  slug: string
  title: string
  type: string
  date: string
  status: string
  published: boolean
  updated_at: string
}

const { data, refresh } = await useAsyncData('admin-eventos',
  () => $fetch<EventoRow[]>('/api/admin/eventos'),
  { server: false },
)

const list = computed(() => data.value ?? [])

const deleting = ref<string | null>(null)

async function togglePublish(item: EventoRow) {
  await $fetch(`/api/admin/eventos/${item.id}`, {
    method: 'PATCH',
    body: { published: !item.published },
  })
  await refresh()
}

async function remove(id: string) {
  if (!confirm('Excluir este evento?')) return
  deleting.value = id
  await $fetch(`/api/admin/eventos/${id}`, { method: 'DELETE' })
  deleting.value = null
  await refresh()
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function typeBadge(type: string) {
  return type === 'event' ? 'Evento' : 'Comunicado'
}

function statusLabel(status: string) {
  if (status === 'cancelled') return 'Cancelado'
  if (status === 'postponed') return 'Adiado'
  return ''
}
</script>

<template>
  <div class="eventos-admin">
    <div class="page-header">
      <h1 class="page-title">Eventos</h1>
      <NuxtLink to="/admin/eventos/novo" class="btn-new">+ Novo evento</NuxtLink>
    </div>

    <div v-if="list.length" class="evento-list">
      <div v-for="item in list" :key="item.id" class="evento-row">
        <div class="evento-info">
          <div class="evento-title-row">
            <span class="type-badge" :class="item.type === 'event' ? 'badge--event' : 'badge--announcement'">
              {{ typeBadge(item.type) }}
            </span>
            <p class="evento-title">{{ item.title }}</p>
            <span v-if="statusLabel(item.status)" class="status-badge">{{ statusLabel(item.status) }}</span>
          </div>
          <p class="evento-meta">{{ fmtDate(item.date) }} · /eventos/{{ item.slug }}</p>
        </div>
        <div class="evento-actions">
          <span :class="['status', item.published ? 'published' : 'draft']">
            {{ item.published ? 'Publicado' : 'Rascunho' }}
          </span>
          <NuxtLink :to="`/admin/eventos/${item.id}`" class="btn-edit">Editar</NuxtLink>
          <button class="btn-toggle" @click="togglePublish(item)">
            {{ item.published ? 'Despublicar' : 'Publicar' }}
          </button>
          <button class="btn-delete" :disabled="deleting === item.id" @click="remove(item.id)">
            Excluir
          </button>
        </div>
      </div>
    </div>

    <p v-else class="empty">Nenhum evento cadastrado ainda.</p>
  </div>
</template>

<style scoped>
.eventos-admin { max-width: 900px; }

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

.evento-list { display: flex; flex-direction: column; gap: 8px; }

.evento-row {
  background: #fff;
  border: 1px solid #e4ddd0;
  border-radius: 8px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.evento-info { flex: 1; min-width: 0; }

.evento-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.evento-title {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--fr-950);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.evento-meta {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.type-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 4px;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge--event {
  background: var(--fr-50);
  border: 1px solid var(--fr-200);
  color: var(--fr-800);
}

.badge--announcement {
  background: var(--cv-50);
  border: 1px solid var(--cv-100);
  color: var(--cv-600);
}

.status-badge {
  flex-shrink: 0;
  display: inline-flex;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--fr-100);
  border: 1px solid var(--fr-200);
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 600;
  color: var(--fr-800);
}

.evento-actions {
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
