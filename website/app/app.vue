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
</script>

<template>
  <div :style="colorOverrides">
    <NuxtRouteAnnouncer />
    <AppNav v-if="!route.path.startsWith('/admin')" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
