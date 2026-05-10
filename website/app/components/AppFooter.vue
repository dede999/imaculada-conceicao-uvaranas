<script setup lang="ts">
import type { FooterConfig } from '~/server/api/parish-config.get'

const props = defineProps<FooterConfig>()

const showLatin      = computed(() => props.footer_display_mode !== 'translation_only')
const showTranslation = computed(() => props.footer_display_mode !== 'latin_only')
</script>

<template>
  <footer v-if="footer_show" class="app-footer">
    <div class="footer-inner">
      <p class="footer-motto">
        <em v-if="showLatin" class="motto-latin">{{ footer_motto_latin }}</em>
        <span v-if="showLatin && showTranslation" class="motto-sep" aria-hidden="true">—</span>
        <span v-if="showTranslation" class="motto-translation">{{ footer_motto_pt }}</span>
      </p>
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
  justify-content: center;
}

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
