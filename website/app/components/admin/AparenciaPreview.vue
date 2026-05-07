<script setup lang="ts">
defineProps<{
  previewStyle: string
  iconType: 'tau' | 'sacred_heart' | 'custom'
  iconUrl: string
}>()
</script>

<template>
  <section class="card">
    <h2 class="card-title">{{ $t('admin.aparencia.preview.title') }}</h2>
    <div class="preview-shell" :style="previewStyle">
      <div class="preview-sidebar">
        <span class="preview-icon">
          <img v-if="iconType === 'tau'" src="~/assets/tau.svg" alt="τ" class="preview-svg" />
          <img v-else-if="iconType === 'sacred_heart'" src="~/assets/sacred-heart.svg" alt="♡" class="preview-svg" />
          <img v-else-if="iconUrl" :src="iconUrl" alt="icon" class="preview-svg" />
          <span v-else class="preview-svg-fallback">τ</span>
        </span>
        <span class="preview-label">Painel</span>
        <div class="preview-links">
          <span class="preview-link preview-link--active" />
          <span class="preview-link" />
          <span class="preview-link" />
        </div>
      </div>
      <div class="preview-main">
        <div class="preview-bar" />
        <div class="preview-bar preview-bar--short" />
        <div class="preview-cards">
          <span class="preview-stat" />
          <span class="preview-stat" />
          <span class="preview-stat" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 20px;
  margin-bottom: 16px;
}

.card-title {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--fr-600);
  margin: 0 0 16px;
}

.preview-shell {
  display: flex;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.08);
  height: 180px;
  margin-top: 12px;
}

.preview-sidebar {
  width: 70px;
  background: var(--fr-950);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 6px;
  gap: 8px;
  flex-shrink: 0;
}

.preview-icon {
  width: 24px;
  height: 24px;
  color: var(--fr-200);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-svg { width: 100%; height: 100%; object-fit: contain; filter: brightness(0) saturate(100%) invert(85%) sepia(20%) saturate(400%) hue-rotate(10deg); }
.preview-svg-fallback { font-size: 18px; color: var(--fr-200); }

.preview-label {
  font-size: 9px;
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.5);
}

.preview-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 0 4px;
  margin-top: 4px;
}

.preview-link {
  height: 6px;
  border-radius: 3px;
  background: rgba(255,255,255,0.15);
}

.preview-link--active { background: var(--fr-200); opacity: 0.8; }

.preview-main {
  flex: 1;
  background: #f5f5f0;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-bar {
  height: 8px;
  border-radius: 4px;
  background: var(--fr-400);
  opacity: 0.3;
  width: 60%;
}

.preview-bar--short { width: 40%; opacity: 0.2; }

.preview-cards { display: flex; gap: 6px; margin-top: auto; }

.preview-stat {
  flex: 1;
  height: 36px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
}
</style>
