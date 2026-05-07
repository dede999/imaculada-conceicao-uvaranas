export type { Pastoral } from '../../server/api/pastorais/index.get'
import type { Pastoral } from '../../server/api/pastorais/index.get'

export function usePastorais() {
  return useAsyncData<Pastoral[]>('pastorais', () => $fetch<Pastoral[]>('/api/pastorais'))
}
