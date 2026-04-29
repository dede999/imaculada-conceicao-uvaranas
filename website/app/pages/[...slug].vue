<script setup lang="ts">
const route = useRoute()

// Rotas com prefixo gerenciado por pages/ específicas nunca chegam aqui
const managed = ['/capelas', '/eventos', '/noticias', '/pastorais', '/dizimo', '/transparencia']
if (managed.some(p => route.path === p || route.path.startsWith(p + '/'))) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: page } = await useAsyncData('page-' + route.path, () => {
  return queryCollection('content').path(route.path).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
</script>

<template>
  <ContentRenderer
    v-if="page"
    :value="page"
  />
</template>
