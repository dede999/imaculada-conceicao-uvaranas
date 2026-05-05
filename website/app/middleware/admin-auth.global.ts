export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/admin')) return
  if (to.path === '/admin/login' || to.path === '/admin/confirm') return

  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/admin/login')
  }
})
