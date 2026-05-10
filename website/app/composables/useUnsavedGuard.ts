export function useUnsavedGuard(isDirty: Ref<boolean>) {
  function beforeUnload(e: BeforeUnloadEvent) {
    if (!isDirty.value) return
    e.preventDefault()
    e.returnValue = ''
  }

  onMounted(() => window.addEventListener('beforeunload', beforeUnload))
  onUnmounted(() => window.removeEventListener('beforeunload', beforeUnload))

  const { confirm } = useAdminConfirm()

  onBeforeRouteLeave(async () => {
    if (!isDirty.value) return
    return await confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')
  })
}
