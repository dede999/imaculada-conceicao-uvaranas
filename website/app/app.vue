<script setup lang="ts">
import type { ParishConfig } from '~/server/api/parish-config.get'

const route = useRoute()

const { data: parishConfig } = await useAsyncData(
  'parish-config',
  () => $fetch<ParishConfig>('/api/parish-config'),
)

useHead(() => {
  const colors = parishConfig.value?.colors ?? {}
  const entries = Object.entries(colors)
  if (!entries.length) return {}
  const css = `:root {\n${entries.map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`
  return { style: [{ innerHTML: css, id: 'parish-color-overrides' }] }
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <AppNav v-if="!route.path.startsWith('/admin')" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
