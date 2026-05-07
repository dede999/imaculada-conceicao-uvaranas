import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'
import { getParishId } from '../../../utils/getParishId'

export interface HistoryEntry {
  id: number
  parish_id: string
  snapshot: Record<string, unknown>
  actor_name: string | null
  created_at: string
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parishId = getParishId(event)
  const supabase = serverSupabaseServiceRole(event)

  const { data, error } = await supabase
    .from('parish_config_history')
    .select('id, parish_id, snapshot, actor_name, created_at')
    .eq('parish_id', parishId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return (data ?? []) as HistoryEntry[]
})
