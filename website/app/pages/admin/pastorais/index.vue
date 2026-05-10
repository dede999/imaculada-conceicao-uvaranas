<script setup lang="ts">
definePageMeta({ layout: 'admin' })
import type { Pastoral } from '../../../composables/usePastorais'

const { data: pastorais, refresh } = await useAsyncData<Pastoral[]>(
  'admin-pastorais',
  () => $fetch<Pastoral[]>('/api/admin/pastorais'),
  { server: false },
)

const CATEGORY_LABELS: Record<string, string> = {
  liturgia: 'Liturgia', formacao: 'Formação', social: 'Social',
  movimentos: 'Movimentos', comunicacao: 'Comunicação',
}

const deleting = ref<string | null>(null)
const { confirm: showConfirm } = useAdminConfirm()

async function deletePastoral(p: Pastoral) {
  if (!await showConfirm(`Excluir "${p.name}"? Esta ação não pode ser desfeita.`)) return
  deleting.value = p.id
  try {
    await $fetch(`/api/admin/pastorais/${p.id}`, { method: 'DELETE' })
    await refresh()
  }
  finally { deleting.value = null }
}
</script>

<template>
  <div class="pastorais-admin">
    <div class="page-header">
      <h1 class="page-title">Pastorais</h1>
      <NuxtLink to="/admin/pastorais/novo" class="btn-new">+ Nova pastoral</NuxtLink>
    </div>

    <table v-if="(pastorais ?? []).length > 0" class="data-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Categoria</th>
          <th>Coordenador</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in pastorais" :key="p.id">
          <td class="col-name">{{ p.name }}</td>
          <td><span class="cat-badge">{{ CATEGORY_LABELS[p.category] ?? p.category }}</span></td>
          <td class="col-coordinator">{{ p.coordinator || '—' }}</td>
          <td class="col-actions">
            <NuxtLink :to="`/admin/pastorais/${p.id}`" class="btn-edit">Editar</NuxtLink>
            <button class="btn-delete" :disabled="deleting === p.id" @click="deletePastoral(p)">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else-if="pastorais !== null" class="empty">Nenhuma pastoral cadastrada.</p>
  </div>
</template>

<style scoped>
.pastorais-admin { max-width: 900px; }

.data-table { width: 100%; border-collapse: collapse; font-family: var(--font-sans); font-size: 14px; }

.data-table th {
  text-align: left;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--fr-600);
  border-bottom: 2px solid #e4ddd0;
}

.data-table td { padding: 10px 12px; border-bottom: 1px solid #ede8e0; color: var(--fr-950); vertical-align: middle; }

.col-name { font-weight: 500; }
.col-coordinator { color: var(--text-muted); font-size: 13px; }
.col-actions { display: flex; gap: 8px; justify-content: flex-end; }

.cat-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--fr-50);
  border: 1px solid var(--fr-200);
  font-size: 12px;
  color: var(--fr-800);
}
</style>
