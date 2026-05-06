<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <NuxtRouteAnnouncer />
  <AppNav v-if="!route.path.startsWith('/admin')" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
