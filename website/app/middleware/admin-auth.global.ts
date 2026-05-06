const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/confirm', '/admin/solicitar']

export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/admin')) return
  if (PUBLIC_ADMIN_PATHS.includes(to.path)) return

  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/admin/login')
  }
})
