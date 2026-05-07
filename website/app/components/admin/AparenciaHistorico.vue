<script setup lang="ts">
import type { HistoryEntry } from '~/server/api/admin/configuracoes/historico.get'

defineProps<{
  history: HistoryEntry[] | null
  restoring: number | null
  restoreMessage: { type: 'ok' | 'err'; text: string } | null
}>()

defineEmits<{ restore: [id: number] }>()

function fmtHistoryDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <section class="card">
    <h2 class="card-title">{{ $t('admin.aparencia.history.title') }}</h2>
    <span v-if="restoreMessage" :class="['restore-msg', restoreMessage.type]">
      {{ restoreMessage.text }}
    </span>
    <p v-if="!history?.length" class="history-empty">
      {{ $t('admin.aparencia.history.empty') }}
    </p>
    <ul v-else class="history-list">
      <li v-for="entry in history" :key="entry.id" class="history-item">
        <div class="history-meta">
          <span class="history-date">{{ fmtHistoryDate(entry.created_at) }}</span>
          <span v-if="entry.actor_name" class="history-actor">
            {{ $t('admin.aparencia.history.by') }} {{ entry.actor_name }}
          </span>
        </div>
        <button
          class="btn-restore"
          :disabled="restoring === entry.id"
          @click="$emit('restore', entry.id)"
        >
          {{ restoring === entry.id ? '…' : $t('admin.aparencia.history.restore') }}
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 20px;
}

.card-title {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--fr-600);
  margin: 0 0 16px;
}

.restore-msg {
  display: block;
  font-family: var(--font-sans);
  font-size: 13px;
  padding: 5px 10px;
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.restore-msg.ok  { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.restore-msg.err { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

.btn-restore {
  background: none;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 4px 10px;
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-restore:hover:not(:disabled) { border-color: var(--fr-400); color: var(--fr-400); }
.btn-restore:disabled { opacity: 0.5; cursor: not-allowed; }

.history-empty {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.history-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.history-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

.history-date { font-family: var(--font-sans); font-size: 12px; color: var(--text-primary); }
.history-actor { font-family: var(--font-sans); font-size: 11px; color: var(--text-muted); }
</style>
