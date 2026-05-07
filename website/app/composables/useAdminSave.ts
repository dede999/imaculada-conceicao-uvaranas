export function useAdminSave() {
  const saving = ref(false)
  const error = ref('')

  async function handleSave(fn: () => Promise<void>) {
    saving.value = true
    error.value = ''
    try {
      await fn()
    }
    catch (e: unknown) {
      error.value = (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Erro ao salvar'
    }
    finally {
      saving.value = false
    }
  }

  return { saving, error, handleSave }
}
