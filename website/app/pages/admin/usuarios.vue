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

async function deleteUser(id: string, name: string) {
  if (!confirm(`Excluir o usuário "${name || 'sem nome'}"? Esta ação não pode ser desfeita.`)) return
  actionLoading.value = id
  actionError.value = ''
  try {
    await $fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE' })
    await refresh()
  }
  catch (e: unknown) {
    actionError.value = (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Erro ao excluir'
  }
  finally { actionLoading.value = null }
}

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

// ── Busca de editor já cadastrado em outra paróquia ──────────────────────────

interface SearchedProfile {
  id: string; name: string; email: string
  role: 'admin' | 'editor'; parish_role: string
}

const searchQuery = ref('')
const searchResults = ref<SearchedProfile[]>([])
const searchLoading = ref(false)
const addingId = ref<string | null>(null)
const addedIds = ref<Set<string>>(new Set())

let searchTimer: ReturnType<typeof setTimeout>

watch(searchQuery, (q) => {
  clearTimeout(searchTimer)
  if (q.trim().length < 2) { searchResults.value = []; return }
  searchTimer = setTimeout(async () => {
    searchLoading.value = true
    try {
      searchResults.value = await $fetch<SearchedProfile[]>('/api/admin/usuarios/search', {
        query: { q: q.trim() },
      })
    }
    finally { searchLoading.value = false }
  }, 300)
})

async function addToParish(profile: SearchedProfile) {
  addingId.value = profile.id
  try {
    await $fetch('/api/admin/usuarios/parish', { method: 'POST', body: { profile_id: profile.id } })
    addedIds.value = new Set([...addedIds.value, profile.id])
    searchResults.value = searchResults.value.filter(r => r.id !== profile.id)
    await refresh()
  }
  catch (e: unknown) {
    actionError.value = (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Erro ao adicionar'
  }
  finally { addingId.value = null }
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
                <template v-if="u.id !== currentUser?.id">
                  <button
                    class="btn-role"
                    :disabled="actionLoading === u.id"
                    @click="toggleRole(u.id, u.role)"
                  >
                    {{ u.role === 'admin' ? 'Tornar editor' : 'Tornar admin' }}
                  </button>
                </template>
                <span v-else class="you-label">você</span>
              </td>
              <td class="td-action">
                <button
                  v-if="u.id !== currentUser?.id && u.role === 'editor'"
                  class="btn-delete"
                  :disabled="actionLoading === u.id"
                  :title="u.role === 'admin' ? 'Rebaixe para editor antes de excluir' : ''"
                  @click="deleteUser(u.id, u.name)"
                >
                  Excluir
                </button>
                <span v-else-if="u.role === 'admin' && u.id !== currentUser?.id" class="admin-lock" title="Rebaixe para editor antes de excluir">🔒</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="empty-msg">Nenhum usuário cadastrado ainda.</p>
    </section>

    <!-- ── Adicionar editor de outra paróquia ───────────────── -->
    <section class="section">
      <h2 class="section-title">Adicionar editor de outra paróquia</h2>
      <p class="search-hint">
        Para alguém já cadastrado em outra paróquia no mesmo sistema. Para convidar alguém novo, use
        <NuxtLink to="/admin/solicitar" class="inline-link">Solicitar acesso</NuxtLink>.
      </p>

      <div class="search-wrap">
        <input
          v-model="searchQuery"
          type="search"
          class="search-input"
          placeholder="Buscar por nome ou e-mail…"
          autocomplete="off"
        />
        <span v-if="searchLoading" class="search-spinner">…</span>
      </div>

      <ul v-if="searchResults.length > 0" class="search-results">
        <li v-for="r in searchResults" :key="r.id" class="search-result">
          <div class="result-info">
            <span class="result-name">{{ r.name || '—' }}</span>
            <span class="result-email">{{ r.email }}</span>
            <span class="result-role">{{ r.parish_role }}</span>
          </div>
          <button
            class="btn-add"
            :disabled="addingId === r.id"
            @click="addToParish(r)"
          >
            {{ addingId === r.id ? '…' : 'Adicionar' }}
          </button>
        </li>
      </ul>

      <p v-else-if="searchQuery.trim().length >= 2 && !searchLoading" class="empty-msg">
        Nenhum editor encontrado fora desta paróquia.
      </p>
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

.btn-delete {
  background: none;
  border: 1px solid #fca5a5;
  border-radius: 5px;
  padding: 4px 10px;
  font-family: var(--font-sans);
  font-size: 12px;
  cursor: pointer;
  color: #b91c1c;
  transition: background 0.1s;
}

.btn-delete:hover:not(:disabled) { background: #fef2f2; }
.btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

.admin-lock {
  font-size: 14px;
  opacity: 0.4;
  cursor: default;
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

/* ── Busca de editor ─────────────────────────────────────────── */

.search-hint {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 12px;
}

.inline-link { color: var(--fr-600); text-decoration: underline; }

.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.search-input {
  width: 100%;
  max-width: 380px;
  border: 1px solid #d4c9b8;
  border-radius: 6px;
  padding: 9px 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--fr-950);
  outline: none;
  transition: border-color 0.15s;
}
.search-input:focus { border-color: var(--fr-600); }

.search-spinner {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
}

.search-results {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 580px;
}

.search-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #fff;
  border: 1px solid #e4ddd0;
  border-radius: 8px;
  padding: 10px 14px;
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.result-name {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--fr-950);
}

.result-email, .result-role {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-add {
  flex-shrink: 0;
  background: var(--cv-400);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;
}
.btn-add:hover:not(:disabled) { background: var(--cv-600); }
.btn-add:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
