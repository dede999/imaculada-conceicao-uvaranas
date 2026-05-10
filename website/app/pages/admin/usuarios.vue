<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface UserRequest {
  id: string; name: string; email: string
  parish_role: string; status: 'pending' | 'approved' | 'rejected'; created_at: string
}

interface Profile {
  id: string; name: string; parish_role: string
  role: 'admin' | 'editor'; created_at: string
}

const { data, refresh, error: fetchError } = await useAsyncData('admin-usuarios', () =>
  $fetch<{ requests: UserRequest[]; users: Profile[] }>('/api/admin/usuarios'),
  { server: false },
)

const pending  = computed(() => (data.value?.requests ?? []).filter(r => r.status === 'pending'))
const reviewed = computed(() => (data.value?.requests ?? []).filter(r => r.status !== 'pending'))
const users    = computed(() => data.value?.users ?? [])

const currentUser   = useSupabaseUser()
const actionLoading = ref<string | null>(null)
const actionError   = ref('')
const { confirm: showConfirm } = useAdminConfirm()

async function approve(id: string) {
  actionLoading.value = id; actionError.value = ''
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
  actionLoading.value = id; actionError.value = ''
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
  actionLoading.value = id; actionError.value = ''
  try {
    await $fetch('/api/admin/usuarios/role', { method: 'PATCH', body: { id, role } })
    await refresh()
  }
  catch (e: unknown) {
    actionError.value = (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Erro'
  }
  finally { actionLoading.value = null }
}

async function deleteUser(id: string, name: string) {
  if (!await showConfirm(`Excluir o usuário "${name || 'sem nome'}"? Esta ação não pode ser desfeita.`)) return
  actionLoading.value = id; actionError.value = ''
  try {
    await $fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE' })
    await refresh()
  }
  catch (e: unknown) {
    actionError.value = (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Erro ao excluir'
  }
  finally { actionLoading.value = null }
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

    <AdminUserRequests
      :pending="pending"
      :reviewed="reviewed"
      :loading="actionLoading"
      @approve="approve"
      @reject="reject"
    />

    <AdminUserActive
      :users="users"
      :current-user-id="currentUser?.id"
      :loading="actionLoading"
      @toggle-role="toggleRole"
      @delete="deleteUser"
    />

    <AdminUserSearch
      @added="refresh"
      @error="actionError = $event"
    />

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
</style>
