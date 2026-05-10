<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface MassRow    { id: string; chapel_id: string; day_of_week: number; time: string; note: string | null; active: boolean }
interface ConfRow    { id: string; chapel_id: string; day_of_week: number; time_start: string; time_end: string; active: boolean }
interface CatRow     { id: string; chapel_id: string; group_name: string; day_of_week: number | null; time: string | null; active: boolean }

interface ChapelSchedule {
  id: string; slug: string; name: string; type: string
  masses: MassRow[]; confessions: ConfRow[]; catechism_groups: CatRow[]
}

const { data, refresh } = await useAsyncData<ChapelSchedule[]>(
  'admin-missas',
  () => $fetch('/api/admin/chapels'),
  { server: false },
)

const chapels = computed<ChapelSchedule[]>(() => data.value ?? [])

const deleting    = ref<string | null>(null)
const actionError = ref('')
const { confirm: showConfirm } = useAdminConfirm()

async function deleteMass(id: string) {
  if (!await showConfirm('Excluir este horário de missa?')) return
  deleting.value = id
  await $fetch(`/api/admin/masses/${id}`, { method: 'DELETE' })
  deleting.value = null
  await refresh()
}

async function deleteConfession(id: string) {
  if (!await showConfirm('Excluir este horário de confissão?')) return
  deleting.value = id
  await $fetch(`/api/admin/confessions/${id}`, { method: 'DELETE' })
  deleting.value = null
  await refresh()
}

async function deleteCatechism(id: string) {
  if (!await showConfirm('Excluir esta turma de catequese?')) return
  deleting.value = id
  await $fetch(`/api/admin/catechism/${id}`, { method: 'DELETE' })
  deleting.value = null
  await refresh()
}
</script>

<template>
  <div class="missas-admin">
    <h1 class="page-title">Missas e Horários</h1>

    <p v-if="actionError" class="action-error">{{ actionError }}</p>

    <div class="chapels-list">
      <section v-for="chapel in chapels" :key="chapel.id" class="chapel-section">
        <div class="chapel-header">
          <span class="chapel-type-badge" :class="chapel.type === 'matriz' ? 'badge--matriz' : 'badge--branch'">
            {{ chapel.type === 'matriz' ? 'Matriz' : 'Filial' }}
          </span>
          <h2 class="chapel-name">{{ chapel.name }}</h2>
        </div>

        <AdminChapelMasses
          :masses="chapel.masses"
          :chapel-id="chapel.id"
          :deleting="deleting"
          @delete="deleteMass"
          @added="refresh"
          @error="actionError = $event"
        />
        <AdminChapelConfessions
          :confessions="chapel.confessions"
          :chapel-id="chapel.id"
          :deleting="deleting"
          @delete="deleteConfession"
          @added="refresh"
          @error="actionError = $event"
        />
        <AdminChapelCatechism
          :groups="chapel.catechism_groups"
          :chapel-id="chapel.id"
          :deleting="deleting"
          @delete="deleteCatechism"
          @added="refresh"
          @error="actionError = $event"
        />
      </section>
    </div>

  </div>
</template>

<style scoped>
.missas-admin { max-width: 840px; }

.page-title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  color: var(--fr-950);
  margin: 0 0 24px;
}

.action-error {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 16px;
}

.chapels-list { display: flex; flex-direction: column; gap: 24px; }

.chapel-section {
  background: #fff;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  overflow: hidden;
}

.chapel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: var(--fr-50);
  border-bottom: 1px solid var(--fr-200);
}

.chapel-type-badge {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
}

.badge--matriz { background: var(--fr-200); color: var(--fr-950); }
.badge--branch { background: #e5e5e0; color: #6b6b5e; }

.chapel-name {
  font-family: var(--font-serif);
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--fr-950);
  margin: 0;
}
</style>
