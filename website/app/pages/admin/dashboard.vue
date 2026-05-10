<script setup lang="ts">
definePageMeta({ layout: 'admin' })
import type { DashboardData } from '../../server/api/admin/dashboard.get'

const { data } = await useAsyncData<DashboardData>(
  'admin-dashboard',
  () => $fetch<DashboardData>('/api/admin/dashboard'),
  { server: false },
)

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
})

const isAdmin = computed(() => data.value?.profile.role === 'admin')
</script>

<template>
  <div class="dashboard">

    <header class="dash-header">
      <div>
        <h1 class="page-title">
          {{ greeting }}<template v-if="data?.profile.name">, {{ data.profile.name }}</template>
        </h1>
        <p class="page-sub">Aqui está o resumo de hoje.</p>
      </div>
      <span v-if="isAdmin" class="role-badge">Admin</span>
      <span v-else class="role-badge role-badge--editor">Editor</span>
    </header>

    <template v-if="data">

      <AdminDashboardStats :stats="data.stats" :is-admin="isAdmin" />

      <AdminDashboardActivity
        :upcoming-eventos="data.upcoming_eventos"
        :recent-log="data.recent_log"
        :is-admin="isAdmin"
      />

      <!-- ── Acesso rápido ──────────────────────────────────────────── -->
      <section class="quick-access">
        <h2 class="panel-title">
          <Icon name="lucide:layout-grid" />
          Acesso rápido
        </h2>
        <div class="quick-grid">
          <NuxtLink to="/admin/noticias/nova" class="quick-card">
            <Icon name="lucide:file-plus" />
            Nova notícia
          </NuxtLink>
          <NuxtLink to="/admin/eventos/novo" class="quick-card">
            <Icon name="lucide:calendar-plus" />
            Novo evento
          </NuxtLink>
          <NuxtLink to="/admin/pastorais/novo" class="quick-card">
            <Icon name="lucide:heart-handshake" />
            Nova pastoral
          </NuxtLink>
          <NuxtLink to="/admin/missas" class="quick-card">
            <Icon name="lucide:clock" />
            Editar missas
          </NuxtLink>
          <NuxtLink v-if="isAdmin" to="/admin/usuarios" class="quick-card">
            <Icon name="lucide:users" />
            Usuários
          </NuxtLink>
          <NuxtLink v-if="isAdmin" to="/admin/log" class="quick-card">
            <Icon name="lucide:scroll-text" />
            Auditoria
          </NuxtLink>
        </div>
      </section>

    </template>

  </div>
</template>

<style scoped>
.dashboard { max-width: 960px; }

.dash-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 16px;
}

.page-title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  color: var(--fr-950);
  margin: 0 0 4px;
}

.page-sub { font-family: var(--font-sans); font-size: var(--text-sm); color: var(--text-muted); margin: 0; }

.role-badge {
  flex-shrink: 0;
  display: inline-block;
  padding: 3px 10px;
  border-radius: 4px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: var(--fr-50);
  border: 1px solid var(--fr-200);
  color: var(--fr-800);
}

.role-badge--editor { background: #f0ede8; border-color: #d4c9b8; color: #6b6560; }

.quick-access { display: flex; flex-direction: column; gap: 12px; }

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--fr-600);
  margin: 0;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}

.quick-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #e4ddd0;
  border-radius: 8px;
  padding: 12px 14px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--fr-800);
  text-decoration: none;
  transition: border-color 0.12s, background 0.12s;
}

.quick-card:hover { border-color: var(--fr-400); background: var(--fr-50); color: var(--fr-950); }
</style>
