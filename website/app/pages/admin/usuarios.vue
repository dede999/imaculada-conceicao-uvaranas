<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface UserRequest {
  id: string
  name: string
  email: string
  parish_role: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

interface Profile {
  id: string
  name: string
  parish_role: string
  role: 'admin' | 'editor'
  created_at: string
}

const { data, refresh, error: fetchError } = await useAsyncData('admin-usuarios', () =>
  $fetch<{ requests: UserRequest[]; users: Profile[] }>('/api/admin/usuarios'),
  { server: false },
)

const pending = computed(() => (data.value?.requests ?? []).filter(r => r.status === 'pending'))
const reviewed = computed(() => (data.value?.requests ?? []).filter(r => r.status !== 'pending'))
const users = computed(() => data.value?.users ?? [])

const currentUser = useSupabaseUser()
const actionLoading = ref<string | null>(null)
const actionError = ref('')

async function approve(id: string) {
  actionLoading.value = id
  actionError.value = ''
  try {
    await $fetch('/api/admin/usuarios/aprovar', { method: 'POST', body: { id } })
    await refresh()
  }
  catch (e: unknown) {
    actionError.value = (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Erro'
  }
  finally { actionLoading.value = null }
}

async function reject(id: string) {
  actionLoading.value = id
  actionError.value = ''
  try {
    await $fetch('/api/admin/usuarios/rejeitar', { method: 'POST', body: { id } })
    await refresh()
  }
  catch (e: unknown) {
    actionError.value = (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Erro'
  }
  finally { actionLoading.value = null }
}

async function toggleRole(id: string, currentRole: string) {
  const role = currentRole === 'admin' ? 'editor' : 'admin'
  actionLoading.value = id
  actionError.value = ''
  try {
    await $fetch('/api/admin/usuarios/role', { method: 'PATCH', body: { id, role } })
    await refresh()
  }
  catch (e: unknown) {
    actionError.value = (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Erro'
  }
  finally { actionLoading.value = null }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="usuarios">
    <h1 class="page-title">Usuários</h1>
    <p v-if="fetchError" class="action-error">
      Erro ao carregar dados: {{ fetchError.message }}
      <span v-if="(fetchError as { statusCode?: number }).statusCode === 403">
        — seu usuário precisa ter role <strong>admin</strong> no Supabase.
      </span>
    </p>
    <p v-if="actionError" class="action-error">{{ actionError }}</p>

    <!-- ── Solicitações pendentes ────────────────────────────── -->
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
            <p class="request-date">{{ formatDate(req.created_at) }}</p>
          </div>
          <div class="request-actions">
            <button
              class="btn-approve"
              :disabled="actionLoading === req.id"
              @click="approve(req.id)"
            >
              {{ actionLoading === req.id ? '…' : 'Aprovar' }}
            </button>
            <button
              class="btn-reject"
              :disabled="actionLoading === req.id"
              @click="reject(req.id)"
            >
              Rejeitar
            </button>
          </div>
        </div>
      </div>

      <p v-else class="empty-msg">Nenhuma solicitação pendente.</p>
    </section>

    <!-- ── Usuários ativos ───────────────────────────────────── -->
    <section class="section">
      <h2 class="section-title">Usuários com acesso</h2>

      <div v-if="users.length" class="user-table-wrap">
        <table class="user-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Função na paróquia</th>
              <th>Papel</th>
              <th>Desde</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td class="td-name">{{ u.name || '—' }}</td>
              <td>{{ u.parish_role || '—' }}</td>
              <td>
                <span :class="['role-badge', u.role]">{{ u.role }}</span>
              </td>
              <td class="td-date">{{ formatDate(u.created_at) }}</td>
              <td class="td-action">
                <button
                  v-if="u.id !== currentUser?.id"
                  class="btn-role"
                  :disabled="actionLoading === u.id"
                  @click="toggleRole(u.id, u.role)"
                >
                  {{ u.role === 'admin' ? 'Tornar editor' : 'Tornar admin' }}
                </button>
                <span v-else class="you-label">você</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="empty-msg">Nenhum usuário cadastrado ainda.</p>
    </section>

    <!-- ── Histórico de solicitações ─────────────────────────── -->
    <section v-if="reviewed.length" class="section">
      <h2 class="section-title">Histórico de solicitações</h2>
      <div class="history-list">
        <div v-for="req in reviewed" :key="req.id" class="history-row">
          <span class="history-name">{{ req.name }}</span>
          <span class="history-email">{{ req.email }}</span>
          <span :class="['history-status', req.status]">{{ req.status }}</span>
          <span class="history-date">{{ formatDate(req.created_at) }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.usuarios { max-width: 860px; }

.page-title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  color: var(--fr-950);
  margin: 0 0 24px;
}

.action-error {
  background: #fde8e8;
  color: #c0392b;
  border-radius: 6px;
  padding: 10px 14px;
  font-family: var(--font-sans);
  font-size: 13px;
  margin-bottom: 16px;
}

/* ── Sections ────────────────────────────────────────────────── */

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

.empty-msg {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
}

/* ── Request cards ───────────────────────────────────────────── */

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

.request-name {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--fr-950);
  margin: 0;
}

.request-email, .request-role, .request-date {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

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

/* ── User table ──────────────────────────────────────────────── */

.user-table-wrap { overflow-x: auto; }

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-sans);
  font-size: 14px;
}

.user-table th {
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--fr-600);
  padding: 6px 12px;
  border-bottom: 2px solid #e4ddd0;
}

.user-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f0ebe2;
  color: var(--fr-950);
  vertical-align: middle;
}

.td-name { font-weight: 500; }
.td-date { color: var(--text-muted); white-space: nowrap; }

.role-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.role-badge.admin  { background: var(--fr-50); color: var(--fr-800); }
.role-badge.editor { background: var(--cv-50); color: var(--cv-600); }

.btn-role {
  background: none;
  border: 1px solid #d4c9b8;
  border-radius: 5px;
  padding: 4px 10px;
  font-family: var(--font-sans);
  font-size: 12px;
  cursor: pointer;
  color: var(--fr-800);
  transition: background 0.1s;
}

.btn-role:hover:not(:disabled) { background: #f5efe4; }
.btn-role:disabled { opacity: 0.5; cursor: not-allowed; }

.you-label {
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
}

/* ── History ─────────────────────────────────────────────────── */

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
