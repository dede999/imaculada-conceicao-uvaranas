// Module-level singleton — safe for admin-only (client-rendered) routes
const _open    = ref(false)
const _message = ref('')
let _resolver: ((v: boolean) => void) | null = null

export function useAdminConfirm() {
  function confirm(msg: string): Promise<boolean> {
    _message.value = msg
    _open.value = true
    return new Promise(resolve => { _resolver = resolve })
  }

  function onConfirm() { _open.value = false; _resolver?.(true);  _resolver = null }
  function onCancel()  { _open.value = false; _resolver?.(false); _resolver = null }

  return { open: _open, message: _message, confirm, onConfirm, onCancel }
}
