<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const user = useSupabaseUser()
</script>

<template>
  <div class="dashboard">
    <h1 class="page-title">Painel</h1>
    <p class="welcome">Bem-vindo, {{ user?.email }}</p>

    <div class="cards">
      <NuxtLink to="/admin/noticias" class="dash-card">
        <Icon name="lucide:newspaper" class="card-icon" />
        <span class="card-label">Notícias</span>
        <span class="card-hint">Publicar e editar comunicados</span>
      </NuxtLink>

      <NuxtLink to="/admin/eventos" class="dash-card">
        <Icon name="lucide:calendar" class="card-icon" />
        <span class="card-label">Eventos</span>
        <span class="card-hint">Gerenciar agenda da paróquia</span>
      </NuxtLink>

      <NuxtLink to="/admin/missas" class="dash-card">
        <Icon name="lucide:clock" class="card-icon" />
        <span class="card-label">Missas</span>
        <span class="card-hint">Horários por capela</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 800px;
}

.page-title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  color: var(--fr-950);
  margin: 0 0 4px;
}

.welcome {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0 0 32px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.dash-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #fff;
  border: 1px solid #e4ddd0;
  border-radius: 10px;
  padding: 24px 20px;
  text-decoration: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.dash-card:hover {
  border-color: var(--fr-400);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
}

.card-icon {
  font-size: 24px;
  color: var(--fr-600);
}

.card-label {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--fr-950);
}

.card-hint {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
}
</style>
