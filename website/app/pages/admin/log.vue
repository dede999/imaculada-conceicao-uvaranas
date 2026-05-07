<script setup lang="ts">
definePageMeta({ layout: 'admin' })
import type { AuditEntry } from '../../server/api/admin/log.get'

const TABLE_LABELS: Record<string, string> = {
  profiles: 'Usuários',
  user_requests: 'Solicitações',
  noticias: 'Notícias',
  eventos: 'Eventos',
  pastorais: 'Pastorais',
  chapels: 'Capelas',
  masses: 'Missas',
  confessions: 'Confissões',
  catechism_groups: 'Catequese',
}

const ACTION_LABELS: Record<string, string> = {
  create: 'Criado',
  update: 'Atualizado',
  delete: 'Excluído',
  publish: 'Publicado',
  unpublish: 'Despublicado',
  approve: 'Aprovado',
  reject: 'Rejeitado',
}

const ACTION_CLASS: Record<string, string> = {
  create: 'badge--green',
  update: 'badge--blue',
  delete: 'badge--red',
  publish: 'badge--green',
  unpublish: 'badge--gray',
  approve: 'badge--green',
  reject: 'badge--red',
}

const FIELD_LABELS: Record<string, string> = {
  role: 'Função',
  published: 'Publicado',
  status: 'Status',
  title: 'Título',
  name: 'Nome',
  slug: 'Slug',
  date: 'Data',
  summary: 'Resumo',
  body: 'Conteúdo',
  category: 'Categoria',
  coordinator: 'Coordenador',
  meetings: 'Encontros',
}

const filterTable = ref('')
const filterAction = ref('')
const filterDateFrom = ref('')
const filterDateTo = ref('')
const page = ref(1)

const { data, refresh } = await useAsyncData(
  'audit-log',
  () => $fetch<{ entries: AuditEntry[]; total: number }>('/api/admin/log', {
    query: {
      page: page.value,
      table_name: filterTable.value || undefined,
      action: filterAction.value || undefined,
      date_from: filterDateFrom.value || undefined,
      date_to: filterDateTo.value || undefined,
    },
  }),
  { server: false, watch: [page, filterTable, filterAction, filterDateFrom, filterDateTo] },
)

const entries = computed(() => data.value?.entries ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / 25))

function applyFilters() {
  page.value = 1
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function diffLines(diff: Record<string, [unknown, unknown]> | null): string[] {
  if (!diff) return []
  return Object.entries(diff).map(([field, [oldVal, newVal]]) => {
    const label = FIELD_LABELS[field] ?? field
    const old = oldVal === null || oldVal === undefined ? '—' : String(oldVal)
    const nw  = newVal === null || newVal === undefined ? '—' : String(newVal)
    return `${label}: ${old} → ${nw}`
  })
}
</script>

<template>
  <div class="log-page">
    <h1 class="page-title">Log de auditoria</h1>

    <!-- ── Filtros ───────────────────────────────────────────────── -->
    <form class="filters" @submit.prevent="applyFilters">
      <div class="filter-field">
        <label>Tabela</label>
        <select v-model="filterTable">
          <option value="">Todas</option>
          <option v-for="(label, key) in TABLE_LABELS" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>

      <div class="filter-field">
        <label>Ação</label>
        <select v-model="filterAction">
          <option value="">Todas</option>
          <option v-for="(label, key) in ACTION_LABELS" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>

      <div class="filter-field">
        <label>De</label>
        <input v-model="filterDateFrom" type="date" />
      </div>

      <div class="filter-field">
        <label>Até</label>
        <input v-model="filterDateTo" type="date" />
      </div>

      <button type="submit" class="btn-filter">Filtrar</button>
    </form>

    <!-- ── Contagem ──────────────────────────────────────────────── -->
    <p class="count-label" v-if="data">
      {{ total }} {{ total === 1 ? 'entrada' : 'entradas' }}
      <span v-if="totalPages > 1"> — página {{ page }} de {{ totalPages }}</span>
    </p>

    <!-- ── Tabela ────────────────────────────────────────────────── -->
    <div class="table-wrap" v-if="entries.length > 0">
      <table class="data-table">
        <thead>
          <tr>
            <th>Data/hora</th>
            <th>Ator</th>
            <th>Ação</th>
            <th>Tabela</th>
            <th>Alterações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in entries" :key="entry.id">
            <td class="col-date">{{ formatDate(entry.created_at) }}</td>
            <td class="col-actor">{{ entry.actor_name ?? '—' }}</td>
            <td class="col-action">
              <span class="badge" :class="ACTION_CLASS[entry.action]">
                {{ ACTION_LABELS[entry.action] ?? entry.action }}
              </span>
            </td>
            <td class="col-table">
              {{ TABLE_LABELS[entry.table_name] ?? entry.table_name }}
            </td>
            <td class="col-diff">
              <template v-if="diffLines(entry.diff).length > 0">
                <span
                  v-for="line in diffLines(entry.diff)"
                  :key="line"
                  class="diff-line"
                >{{ line }}</span>
              </template>
              <span v-else class="diff-empty">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else-if="data" class="empty">Nenhuma entrada encontrada.</p>

    <!-- ── Paginação ─────────────────────────────────────────────── -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="btn-page" :disabled="page <= 1" @click="page--">← Anterior</button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button class="btn-page" :disabled="page >= totalPages" @click="page++">Próxima →</button>
    </div>
  </div>
</template>

<style scoped>
.log-page { max-width: 1100px; }

.page-title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  color: var(--fr-950);
  margin: 0 0 24px;
}

/* ── Filtros ────────────────────────────────────────────────────── */

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 16px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e4ddd0;
  border-radius: 8px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-field label {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--fr-600);
}

.filter-field select,
.filter-field input {
  border: 1px solid #d4c9b8;
  border-radius: 6px;
  padding: 7px 10px;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--fr-950);
  background: #fff;
  outline: none;
}

.filter-field select:focus,
.filter-field input:focus { border-color: var(--fr-600); }

.btn-filter {
  background: var(--fr-600);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-end;
  transition: background 0.12s;
}
.btn-filter:hover { background: var(--fr-800); }

.count-label {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 12px;
}

/* ── Tabela ─────────────────────────────────────────────────────── */

.table-wrap { overflow-x: auto; }

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-sans);
  font-size: 13px;
}

.data-table th {
  text-align: left;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--fr-600);
  border-bottom: 2px solid #e4ddd0;
  white-space: nowrap;
}

.data-table td {
  padding: 9px 12px;
  border-bottom: 1px solid #ede8e0;
  color: var(--fr-950);
  vertical-align: top;
}

.col-date { white-space: nowrap; color: var(--text-muted); font-size: 12px; }
.col-actor { white-space: nowrap; font-weight: 500; }
.col-table { white-space: nowrap; color: var(--text-muted); }

/* ── Badges ─────────────────────────────────────────────────────── */

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.badge--green  { background: #e6f4ea; color: #1e6e34; }
.badge--blue   { background: #e8f0fe; color: #1a56a4; }
.badge--red    { background: #fde8e8; color: #b91c1c; }
.badge--gray   { background: #f0ede8; color: #6b6560; }

/* ── Diff ───────────────────────────────────────────────────────── */

.col-diff {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.diff-line {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-sans);
}

.diff-empty { color: #c8c0b0; }

/* ── Paginação ──────────────────────────────────────────────────── */

.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
}

.btn-page {
  background: #fff;
  border: 1px solid #d4c9b8;
  border-radius: 6px;
  padding: 7px 14px;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--fr-800);
  cursor: pointer;
  transition: border-color 0.12s;
}
.btn-page:hover:not(:disabled) { border-color: var(--fr-400); }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }

.page-info {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
}

.empty {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 32px;
  text-align: center;
}

/* ── Mobile ─────────────────────────────────────────────────────── */

@media (max-width: 767px) {
  .filters { flex-direction: column; }
  .filter-field { width: 100%; }
  .filter-field select, .filter-field input { width: 100%; }
  .btn-filter { width: 100%; text-align: center; }
}
</style>
