<script setup lang="ts">
interface UserRequest {
  id: string; name: string; email: string
  parish_role: string; status: 'pending' | 'approved' | 'rejected'; created_at: string
}

defineProps<{
  pending: UserRequest[]
  reviewed: UserRequest[]
  loading: string | null
}>()

const emit = defineEmits<{
  approve: [id: string]
  reject: [id: string]
}>()

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <section class="section">
    <h2 class="section-title">
      Solicitações pendentes
      <span v-if="pending.length" class="badge">{{ pending.length }}</span>
    </h2>

    <div v-if="pending.length" class="request-list">
      <div v-for="req in pending" :key="req.id" class="request-card">
        <div class="request-info">
          <p class="request-name">{{ req.name }}</p>
          <p class="request-email">{{ req.email }}</p>
          <p class="request-role">{{ req.parish_role }}</p>
          <p class="request-date">{{ fmtDate(req.created_at) }}</p>
        </div>
        <div class="request-actions">
          <button class="btn-approve" :disabled="loading === req.id" @click="emit('approve', req.id)">
            {{ loading === req.id ? '…' : 'Aprovar' }}
          </button>
          <button class="btn-reject" :disabled="loading === req.id" @click="emit('reject', req.id)">
            Rejeitar
          </button>
        </div>
      </div>
    </div>
    <p v-else class="empty-msg">Nenhuma solicitação pendente.</p>
  </section>

  <section v-if="reviewed.length" class="section">
    <h2 class="section-title">Histórico de solicitações</h2>
    <div class="history-list">
      <div v-for="req in reviewed" :key="req.id" class="history-row">
        <span class="history-name">{{ req.name }}</span>
        <span class="history-email">{{ req.email }}</span>
        <span :class="['history-status', req.status]">{{ req.status }}</span>
        <span class="history-date">{{ fmtDate(req.created_at) }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section { margin-bottom: 40px; }

.section-title {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fr-600);
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  background: var(--fr-200);
  color: var(--fr-950);
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 10px;
}

.empty-msg { font-family: var(--font-sans); font-size: 14px; color: var(--text-muted); }

.request-list { display: flex; flex-direction: column; gap: 10px; }

.request-card {
  background: #fff;
  border: 1px solid #e4ddd0;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.request-info { display: flex; flex-direction: column; gap: 2px; }

.request-name { font-family: var(--font-sans); font-size: 15px; font-weight: 600; color: var(--fr-950); margin: 0; }
.request-email, .request-role, .request-date { font-family: var(--font-sans); font-size: 13px; color: var(--text-muted); margin: 0; }

.request-actions { display: flex; gap: 8px; flex-shrink: 0; }

.btn-approve, .btn-reject {
  border: none;
  border-radius: 6px;
  padding: 7px 14px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-approve { background: #d1f5e0; color: #1a7a4a; }
.btn-reject  { background: #fde8e8; color: #c0392b; }
.btn-approve:disabled, .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

.history-list { display: flex; flex-direction: column; gap: 6px; }

.history-row {
  display: flex;
  gap: 16px;
  align-items: center;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
}

.history-name { font-weight: 500; color: var(--fr-950); min-width: 140px; }
.history-email { flex: 1; }

.history-status {
  font-size: 12px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 10px;
}

.history-status.approved { background: #d1f5e0; color: #1a7a4a; }
.history-status.rejected { background: #fde8e8; color: #c0392b; }
</style>
