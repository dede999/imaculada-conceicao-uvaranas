import type { ParishConfig } from '~/server/api/parish-config.get'

export type { ParishConfig }

export function useParishConfig() {
  const { data } = useNuxtData<ParishConfig>('parish-config')
  return data
}
