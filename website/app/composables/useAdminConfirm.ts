export function useAdminConfirm() {
  const open = ref(false)
  const message = ref('')
  let resolver: ((value: boolean) => void) | null = null

  function confirm(msg: string): Promise<boolean> {
    message.value = msg
    open.value = true
    return new Promise((resolve) => { resolver = resolve })
  }

  function onConfirm() {
    open.value = false
    resolver?.(true)
    resolver = null
  }

  function onCancel() {
    open.value = false
    resolver?.(false)
    resolver = null
  }

  return { open, message, confirm, onConfirm, onCancel }
}
