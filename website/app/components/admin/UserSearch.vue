<script setup lang="ts">
interface SearchedProfile {
  id: string; name: string; email: string
  role: 'admin' | 'editor'; parish_role: string
}

const emit = defineEmits<{
  added: []
  error: [msg: string]
}>()

const searchQuery   = ref('')
const searchResults = ref<SearchedProfile[]>([])
const searchLoading = ref(false)
const addingId      = ref<string | null>(null)
const addedIds      = ref<Set<string>>(new Set())

let searchTimer: ReturnType<typeof setTimeout>

watch(searchQuery, (q) => {
  clearTimeout(searchTimer)
  if (q.trim().length < 2) { searchResults.value = []; return }
  searchTimer = setTimeout(async () => {
    searchLoading.value = true
    try {
      searchResults.value = await $fetch<SearchedProfile[]>('/api/admin/usuarios/search', {
        query: { q: q.trim() },
      })
    }
    finally { searchLoading.value = false }
  }, 300)
})

async function addToParish(profile: SearchedProfile) {
  addingId.value = profile.id
  try {
    await $fetch('/api/admin/usuarios/parish', { method: 'POST', body: { profile_id: profile.id } })
    addedIds.value = new Set([...addedIds.value, profile.id])
    searchResults.value = searchResults.value.filter(r => r.id !== profile.id)
    emit('added')
  }
  catch (e: unknown) {
    emit('error', (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Erro ao adicionar')
  }
  finally { addingId.value = null }
}
</script>

<template>
  <section class="section">
    <h2 class="section-title">Adicionar editor de outra paróquia</h2>
    <p class="search-hint">
      Para alguém já cadastrado em outra paróquia no mesmo sistema. Para convidar alguém novo, use
      <NuxtLink to="/admin/solicitar" class="inline-link">Solicitar acesso</NuxtLink>.
    </p>

    <div class="search-wrap">
      <input
        v-model="searchQuery"
        type="search"
        class="search-input"
        placeholder="Buscar por nome ou e-mail…"
        autocomplete="off"
      />
      <span v-if="searchLoading" class="search-spinner">…</span>
    </div>

    <ul v-if="searchResults.length > 0" class="search-results">
      <li v-for="r in searchResults" :key="r.id" class="search-result">
        <div class="result-info">
          <span class="result-name">{{ r.name || '—' }}</span>
          <span class="result-email">{{ r.email }}</span>
          <span class="result-role">{{ r.parish_role }}</span>
        </div>
        <button class="btn-add" :disabled="addingId === r.id" @click="addToParish(r)">
          {{ addingId === r.id ? '…' : 'Adicionar' }}
        </button>
      </li>
    </ul>

    <p v-else-if="searchQuery.trim().length >= 2 && !searchLoading" class="empty-msg">
      Nenhum editor encontrado fora desta paróquia.
    </p>
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

.search-hint { font-family: var(--font-sans); font-size: 13px; color: var(--text-muted); margin: 0 0 12px; }

.inline-link { color: var(--fr-600); text-decoration: underline; }

.search-wrap { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }

.search-input {
  width: 100%;
  max-width: 380px;
  border: 1px solid #d4c9b8;
  border-radius: 6px;
  padding: 9px 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--fr-950);
  outline: none;
  transition: border-color 0.15s;
}

.search-input:focus { border-color: var(--fr-600); }

.search-spinner { font-family: var(--font-sans); font-size: 13px; color: var(--text-muted); }

.search-results {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 580px;
}

.search-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #fff;
  border: 1px solid #e4ddd0;
  border-radius: 8px;
  padding: 10px 14px;
}

.result-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }

.result-name { font-family: var(--font-sans); font-size: 14px; font-weight: 600; color: var(--fr-950); }
.result-email, .result-role { font-family: var(--font-sans); font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.btn-add {
  flex-shrink: 0;
  background: var(--cv-400);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;
}

.btn-add:hover:not(:disabled) { background: var(--cv-600); }
.btn-add:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
