<script setup lang="ts">
import type { ParishConfig } from '~/server/api/parish-config.get'

const route = useRoute()

const { data: parishConfig } = await useAsyncData(
  'parish-config',
  () => $fetch<ParishConfig>('/api/parish-config'),
)

const colorOverrides = computed<Record<string, string> | undefined>(() => {
  const colors = parishConfig.value?.colors ?? {}
  return Object.keys(colors).length ? colors : undefined
})

const isPublic = computed(() => !route.path.startsWith('/admin'))
</script>

<template>
  <div :style="colorOverrides" class="site-shell">
    <NuxtRouteAnnouncer />
    <AppNav v-if="isPublic" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AppFooter
      v-if="isPublic && parishConfig"
      :footer-show="parishConfig.footer_show"
      :footer-motto-latin="parishConfig.footer_motto_latin"
      :footer-motto-pt="parishConfig.footer_motto_pt"
      :footer-display-mode="parishConfig.footer_display_mode"
    />
  </div>
</template>
