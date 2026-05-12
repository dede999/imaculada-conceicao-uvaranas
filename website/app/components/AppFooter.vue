<script setup lang="ts">
const props = defineProps<{
  footerShow: boolean
  footerMottoLatin: string
  footerMottoPt: string
  footerDisplayMode: 'latin_only' | 'both' | 'translation_only'
}>()

const showLatin       = computed(() => props.footerDisplayMode !== 'translation_only')
const showTranslation = computed(() => props.footerDisplayMode !== 'latin_only')
</script>

<template>
  <footer v-if="footerShow" class="app-footer">
    <div class="footer-inner">
      <p class="footer-motto">
        <em v-if="showLatin" class="motto-latin">{{ footerMottoLatin }}</em>
        <span v-if="showLatin && showTranslation" class="motto-sep" aria-hidden="true">—</span>
        <span v-if="showTranslation" class="motto-translation">{{ footerMottoPt }}</span>
      </p>
      <NuxtLink to="/admin/login" class="footer-admin-link">Área restrita</NuxtLink>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: var(--fr-50);
  border-top: 1px solid var(--fr-200);
  padding: var(--space-16) var(--space-24);
  margin-top: auto;
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
}

.footer-admin-link {
  font-family: var(--font-sans);
  font-size: 11px;
  color: var(--fr-400);
  text-decoration: none;
  opacity: 0.5;
  transition: opacity 0.15s;
}

.footer-admin-link:hover { opacity: 1; }

.footer-motto {
  font-family: var(--font-serif);
  font-size: var(--text-sm);
  color: var(--fr-600);
  display: flex;
  align-items: center;
  gap: var(--space-8);
  flex-wrap: wrap;
  justify-content: center;
  text-align: center;
  margin: 0;
}

.motto-latin {
  font-style: italic;
  letter-spacing: 0.01em;
}

.motto-sep {
  color: var(--fr-400);
}

.motto-translation {
  color: var(--fr-800);
}
</style>
