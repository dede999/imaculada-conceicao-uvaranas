<script setup lang="ts">
definePageMeta({ layout: 'admin' })
import type { DashboardData } from '../../server/api/admin/dashboard.get'

const ACTION_LABELS: Record<string, string> = {
  create: 'Criado', update: 'Atualizado', delete: 'Excluído',
  publish: 'Publicado', unpublish: 'Despublicado',
  approve: 'Aprovado', reject: 'Rejeitado',
}

const TABLE_LABELS: Record<string, string> = {
  profiles: 'Usuários', user_requests: 'Solicitações',
  noticias: 'Notícias', eventos: 'Eventos',
  pastorais: 'Pastorais', chapels: 'Capelas',
  masses: 'Missas', confessions: 'Confissões',
}

const ACTION_CLASS: Record<string, string> = {
  create: 'badge--green', update: 'badge--blue', delete: 'badge--red',
  publish: 'badge--green', unpublish: 'badge--gray',
  approve: 'badge--green', reject: 'badge--red',
}

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

function formatEventDate(date: string, time: string | null) {
  const d = new Date(date + 'T00:00:00')
  const dateStr = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  return time ? `${dateStr} · ${time.slice(0, 5)}` : dateStr
}

function formatLogTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <div class="dashboard">

    <!-- ── Saudação ───────────────────────────────────────────────── -->
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

      <!-- ── Stats ─────────────────────────────────────────────────── -->
      <section class="stats-grid">
        <NuxtLink to="/admin/noticias" class="stat-card">
          <span class="stat-value">{{ data.stats.noticias_published }}</span>
          <span class="stat-label">Notícias publicadas</span>
        </NuxtLink>
        <NuxtLink to="/admin/noticias" class="stat-card stat-card--muted">
          <span class="stat-value">{{ data.stats.noticias_drafts }}</span>
          <span class="stat-label">Rascunhos</span>
        </NuxtLink>
        <NuxtLink to="/admin/eventos" class="stat-card">
          <span class="stat-value">{{ data.stats.eventos_upcoming }}</span>
          <span class="stat-label">Eventos futuros</span>
        </NuxtLink>
        <NuxtLink to="/admin/pastorais" class="stat-card">
          <span class="stat-value">{{ data.stats.pastorais }}</span>
          <span class="stat-label">Pastorais</span>
        </NuxtLink>
        <NuxtLink to="/admin/capelas" class="stat-card">
          <span class="stat-value">{{ data.stats.chapels }}</span>
          <span class="stat-label">Capelas</span>
        </NuxtLink>
        <NuxtLink
          v-if="isAdmin && data.stats.pending_requests !== null"
          to="/admin/usuarios"
          class="stat-card"
          :class="data.stats.pending_requests > 0 ? 'stat-card--alert' : 'stat-card--muted'"
        >
          <span class="stat-value">{{ data.stats.pending_requests }}</span>
          <span class="stat-label">Solicitações pendentes</span>
        </NuxtLink>
      </section>

      <!-- ── Próximos eventos + Atividade recente ──────────────────── -->
      <div class="content-row">

        <!-- Próximos eventos -->
        <section class="panel">
          <h2 class="panel-title">
            <Icon name="lucide:calendar" />
            Próximos eventos
          </h2>
          <ul class="event-list" v-if="data.upcoming_eventos.length > 0">
            <li v-for="ev in data.upcoming_eventos" :key="ev.id" class="event-item">
              <NuxtLink :to="`/admin/eventos/${ev.id}`" class="event-link">
                <span class="event-title">{{ ev.title }}</span>
                <span class="event-meta">
                  {{ formatEventDate(ev.date, ev.time) }}
                  <template v-if="ev.location"> · {{ ev.location }}</template>
                </span>
              </NuxtLink>
            </li>
          </ul>
          <p v-else class="panel-empty">Nenhum evento futuro.</p>
          <NuxtLink to="/admin/eventos" class="panel-link">Ver todos →</NuxtLink>
        </section>

        <!-- Atividade recente (admin only) -->
        <section class="panel" v-if="isAdmin && data.recent_log">
          <h2 class="panel-title">
            <Icon name="lucide:scroll-text" />
            Atividade recente
          </h2>
          <ul class="log-list" v-if="data.recent_log.length > 0">
            <li v-for="entry in data.recent_log" :key="entry.id" class="log-item">
              <span class="badge" :class="ACTION_CLASS[entry.action]">
                {{ ACTION_LABELS[entry.action] ?? entry.action }}
              </span>
              <span class="log-detail">
                {{ TABLE_LABELS[entry.table_name] ?? entry.table_name }}
                <span class="log-meta">
                  {{ entry.actor_name ?? '—' }} · {{ formatLogTime(entry.created_at) }}
                </span>
              </span>
            </li>
          </ul>
          <p v-else class="panel-empty">Nenhuma atividade registrada.</p>
          <NuxtLink to="/admin/log" class="panel-link">Ver log completo →</NuxtLink>
        </section>

      </div>

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

/* ── Header ─────────────────────────────────────────────────────── */

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

.page-sub {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
}

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

.role-badge--editor {
  background: #f0ede8;
  border-color: #d4c9b8;
  color: #6b6560;
}

/* ── Stats ──────────────────────────────────────────────────────── */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 28px;
}

.stat-card {
  background: #fff;
  border: 1px solid #e4ddd0;
  border-radius: 10px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-decoration: none;
  transition: border-color 0.12s, box-shadow 0.12s;
}

.stat-card:hover {
  border-color: var(--fr-400);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-card--muted { background: #faf7f2; }

.stat-card--alert {
  border-color: #f0c0b8;
  background: #fff8f7;
}

.stat-value {
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 500;
  color: var(--fr-950);
  line-height: 1;
}

.stat-label {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-muted);
}

/* ── Content row ────────────────────────────────────────────────── */

.content-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 28px;
}

/* ── Panel ──────────────────────────────────────────────────────── */

.panel {
  background: #fff;
  border: 1px solid #e4ddd0;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

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

.panel-empty {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.panel-link {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--fr-600);
  text-decoration: none;
  margin-top: auto;
}
.panel-link:hover { text-decoration: underline; }

/* ── Event list ─────────────────────────────────────────────────── */

.event-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-decoration: none;
  padding: 8px 10px;
  border-radius: 6px;
  transition: background 0.1s;
}
.event-link:hover { background: #faf7f2; }

.event-title {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--fr-950);
}

.event-meta {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-muted);
}

/* ── Log list ───────────────────────────────────────────────────── */

.log-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.log-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--fr-950);
}

.log-meta {
  font-size: 11px;
  color: var(--text-muted);
}

/* ── Badges ─────────────────────────────────────────────────────── */

.badge {
  flex-shrink: 0;
  display: inline-block;
  padding: 2px 7px;
  border-radius: 4px;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  margin-top: 2px;
}

.badge--green  { background: #e6f4ea; color: #1e6e34; }
.badge--blue   { background: #e8f0fe; color: #1a56a4; }
.badge--red    { background: #fde8e8; color: #b91c1c; }
.badge--gray   { background: #f0ede8; color: #6b6560; }

/* ── Quick access ───────────────────────────────────────────────── */

.quick-access {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.quick-card:hover {
  border-color: var(--fr-400);
  background: var(--fr-50);
  color: var(--fr-950);
}

/* ── Mobile ─────────────────────────────────────────────────────── */

@media (max-width: 767px) {
  .content-row { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
