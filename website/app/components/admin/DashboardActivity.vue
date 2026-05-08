<script setup lang="ts">
import type { DashboardData } from '~/server/api/admin/dashboard.get'

defineProps<{
  upcomingEventos: DashboardData['upcoming_eventos']
  recentLog: DashboardData['recent_log']
  isAdmin: boolean
}>()

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
  <div class="content-row">

    <!-- Próximos eventos -->
    <section class="panel">
      <h2 class="panel-title">
        <Icon name="lucide:calendar" />
        Próximos eventos
      </h2>
      <ul v-if="upcomingEventos.length > 0" class="event-list">
        <li v-for="ev in upcomingEventos" :key="ev.id" class="event-item">
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
    <section v-if="isAdmin && recentLog" class="panel">
      <h2 class="panel-title">
        <Icon name="lucide:scroll-text" />
        Atividade recente
      </h2>
      <ul v-if="recentLog.length > 0" class="log-list">
        <li v-for="entry in recentLog" :key="entry.id" class="log-item">
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
</template>

<style scoped>
.content-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 28px;
}

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

.panel-empty { font-family: var(--font-sans); font-size: 13px; color: var(--text-muted); margin: 0; }

.panel-link {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--fr-600);
  text-decoration: none;
  margin-top: auto;
}

.panel-link:hover { text-decoration: underline; }

.event-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }

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

.event-title { font-family: var(--font-sans); font-size: 14px; font-weight: 500; color: var(--fr-950); }
.event-meta  { font-family: var(--font-sans); font-size: 12px; color: var(--text-muted); }

.log-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }

.log-item { display: flex; align-items: flex-start; gap: 10px; }

.log-detail { display: flex; flex-direction: column; gap: 2px; font-family: var(--font-sans); font-size: 13px; color: var(--fr-950); }
.log-meta   { font-size: 11px; color: var(--text-muted); }

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

.badge--green { background: #e6f4ea; color: #1e6e34; }
.badge--blue  { background: #e8f0fe; color: #1a56a4; }
.badge--red   { background: #fde8e8; color: #b91c1c; }
.badge--gray  { background: #f0ede8; color: #6b6560; }

@media (max-width: 767px) {
  .content-row { grid-template-columns: 1fr; }
}
</style>
