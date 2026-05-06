<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface ChapelRow {
  id: string; slug: string; name: string; type: string; address: string; pastor: string
  masses: { id: string }[]
  contacts: { id: string }[]
}

const { data, refresh } = await useAsyncData<ChapelRow[]>(
  'admin-capelas-list',
  () => $fetch('/api/admin/chapels'),
  { server: false },
)

const chapels = computed<ChapelRow[]>(() => data.value ?? [])
</script>

<template>
  <div class="capelas-admin">
    <h1 class="page-title">Capelas</h1>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Endereço</th>
            <th>Missas</th>
            <th>Contatos</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="chapel in chapels" :key="chapel.id">
            <td class="cell-name">{{ chapel.name }}</td>
            <td>
              <span class="type-badge" :class="chapel.type === 'matriz' ? 'badge--matriz' : 'badge--branch'">
                {{ chapel.type === 'matriz' ? 'Matriz' : 'Filial' }}
              </span>
            </td>
            <td class="cell-address">{{ chapel.address || '—' }}</td>
            <td class="cell-count">{{ chapel.masses.length }}</td>
            <td class="cell-count">{{ chapel.contacts.length }}</td>
            <td class="cell-actions">
              <NuxtLink :to="`/admin/capelas/${chapel.id}`" class="btn-edit">Editar</NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="help-text">
      Para editar horários de missas e confissão, use a página
      <NuxtLink to="/admin/missas" class="help-link">Missas e Horários</NuxtLink>.
    </p>
  </div>
</template>

<style scoped>
.capelas-admin { max-width: 860px; }

.page-title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  color: var(--fr-950);
  margin: 0 0 24px;
}

.table-wrap {
  background: #fff;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 16px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 10px 16px;
  background: #fafaf8;
  border-bottom: 1px solid var(--border-default);
  text-align: left;
}

.data-table td {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-primary);
  padding: 12px 16px;
  border-bottom: 1px solid #f0ede6;
  vertical-align: middle;
}

.data-table tr:last-child td { border-bottom: none; }

.cell-name { font-weight: 500; color: var(--fr-950); }
.cell-address { color: var(--text-muted); font-size: 13px; }
.cell-count { text-align: center; color: var(--text-muted); }
.cell-actions { text-align: right; }

.type-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.badge--matriz { background: var(--fr-200); color: var(--fr-950); }
.badge--branch { background: #e5e5e0; color: #6b6b5e; }

.btn-edit {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--fr-600);
  background: none;
  border: 1px solid var(--fr-400);
  border-radius: 5px;
  padding: 5px 12px;
  text-decoration: none;
  transition: background 0.1s;
}

.btn-edit:hover { background: var(--fr-50); }

.help-text {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
}

.help-link {
  color: var(--fr-600);
  text-decoration: none;
}

.help-link:hover { text-decoration: underline; }
</style>
