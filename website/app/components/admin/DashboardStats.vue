<script setup lang="ts">
import type { DashboardData } from '~/server/api/admin/dashboard.get'

defineProps<{
  stats: DashboardData['stats']
  isAdmin: boolean
}>()
</script>

<template>
  <section class="stats-grid">
    <NuxtLink to="/admin/noticias" class="stat-card">
      <span class="stat-value">{{ stats.noticias_published }}</span>
      <span class="stat-label">Notícias publicadas</span>
    </NuxtLink>
    <NuxtLink to="/admin/noticias" class="stat-card stat-card--muted">
      <span class="stat-value">{{ stats.noticias_drafts }}</span>
      <span class="stat-label">Rascunhos</span>
    </NuxtLink>
    <NuxtLink to="/admin/eventos" class="stat-card">
      <span class="stat-value">{{ stats.eventos_upcoming }}</span>
      <span class="stat-label">Eventos futuros</span>
    </NuxtLink>
    <NuxtLink to="/admin/pastorais" class="stat-card">
      <span class="stat-value">{{ stats.pastorais }}</span>
      <span class="stat-label">Pastorais</span>
    </NuxtLink>
    <NuxtLink to="/admin/capelas" class="stat-card">
      <span class="stat-value">{{ stats.chapels }}</span>
      <span class="stat-label">Capelas</span>
    </NuxtLink>
    <NuxtLink
      v-if="isAdmin && stats.pending_requests !== null"
      to="/admin/usuarios"
      class="stat-card"
      :class="stats.pending_requests > 0 ? 'stat-card--alert' : 'stat-card--muted'"
    >
      <span class="stat-value">{{ stats.pending_requests }}</span>
      <span class="stat-label">Solicitações pendentes</span>
    </NuxtLink>
  </section>
</template>

<style scoped>
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

.stat-card:hover { border-color: var(--fr-400); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
.stat-card--muted { background: #faf7f2; }
.stat-card--alert { border-color: #f0c0b8; background: #fff8f7; }

.stat-value {
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 500;
  color: var(--fr-950);
  line-height: 1;
}

.stat-label { font-family: var(--font-sans); font-size: 12px; color: var(--text-muted); }

@media (max-width: 767px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
