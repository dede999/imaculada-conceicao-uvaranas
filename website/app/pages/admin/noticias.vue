<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>

<template>
  <div class="stub">
    <h1 class="page-title">Notícias</h1>
    <div class="stub-card">
      <Icon name="lucide:newspaper" class="stub-icon" />
      <p class="stub-label">Em construção</p>
      <p class="stub-desc">Publicação e edição de notícias e comunicados da paróquia.</p>
    </div>
  </div>
</template>

<style scoped>
.stub { max-width: 600px; }

.page-title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  color: var(--fr-950);
  margin: 0 0 24px;
}

.stub-card {
  background: #fff;
  border: 1px dashed #d4c9b8;
  border-radius: 10px;
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.stub-icon { font-size: 36px; color: #c8baa0; }

.stub-label {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--fr-800);
  margin: 0;
}

.stub-desc {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}
</style>
