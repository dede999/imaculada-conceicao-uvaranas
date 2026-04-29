export function useChapels() {
  return useAsyncData('capelas', () =>
    queryCollection('capelas').order('type', 'DESC').all()
  )
}
