<script setup lang="ts">
interface Profile {
  id: string; name: string; email: string; parish_role: string
  role: 'admin' | 'editor'; created_at: string
}

defineProps<{
  users: Profile[]
  currentUserId: string | undefined
  loading: string | null
}>()

const emit = defineEmits<{
  toggleRole:  [id: string, currentRole: string]
  delete:      [id: string, name: string]
  sendReset:   [email: string]
}>()

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <section class="section">
    <h2 class="section-title">Usuários com acesso</h2>

    <div v-if="users.length" class="user-table-wrap">
      <table class="user-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Função na paróquia</th>
            <th>Papel</th>
            <th>Desde</th>
            <th />
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td class="td-name">{{ u.name || '—' }}</td>
            <td class="td-email">{{ u.email || '—' }}</td>
            <td>{{ u.parish_role || '—' }}</td>
            <td>
              <span :class="['role-badge', u.role]">{{ u.role }}</span>
            </td>
            <td class="td-date">{{ fmtDate(u.created_at) }}</td>
            <td class="td-action">
              <template v-if="u.id !== currentUserId">
                <button class="btn-role" :disabled="loading === u.id" @click="emit('toggleRole', u.id, u.role)">
                  {{ u.role === 'admin' ? 'Tornar editor' : 'Tornar admin' }}
                </button>
              </template>
              <span v-else class="you-label">você</span>
            </td>
            <td class="td-action">
              <button
                v-if="u.email"
                class="btn-reset"
                :disabled="loading === u.id"
                :title="`Enviar link de redefinição de senha para ${u.email}`"
                @click="emit('sendReset', u.email)"
              >
                Redefinir senha
              </button>
            </td>
            <td class="td-action">
              <button
                v-if="u.id !== currentUserId && u.role === 'editor'"
                class="btn-delete"
                :disabled="loading === u.id"
                @click="emit('delete', u.id, u.name)"
              >
                Excluir
              </button>
              <span v-else-if="u.role === 'admin' && u.id !== currentUserId" class="admin-lock" title="Rebaixe para editor antes de excluir">🔒</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="empty-msg">Nenhum usuário cadastrado ainda.</p>
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
}

.empty-msg { font-family: var(--font-sans); font-size: 14px; color: var(--text-muted); }

.user-table-wrap { overflow-x: auto; }

.user-table { width: 100%; border-collapse: collapse; font-family: var(--font-sans); font-size: 14px; }

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

.user-table td { padding: 10px 12px; border-bottom: 1px solid #f0ebe2; color: var(--fr-950); vertical-align: middle; }

.td-name  { font-weight: 500; }
.td-email { color: var(--text-muted); font-size: 13px; }
.td-date  { color: var(--text-muted); white-space: nowrap; }

.role-badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 600; }
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

.btn-reset {
  background: none;
  border: 1px solid #bfdbfe;
  border-radius: 5px;
  padding: 4px 10px;
  font-family: var(--font-sans);
  font-size: 12px;
  cursor: pointer;
  color: #1d4ed8;
  transition: background 0.1s;
}

.btn-reset:hover:not(:disabled) { background: #eff6ff; }
.btn-reset:disabled { opacity: 0.5; cursor: not-allowed; }

.you-label { font-size: 12px; color: var(--text-muted); font-style: italic; }

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

.admin-lock { font-size: 14px; opacity: 0.4; cursor: default; }
</style>
