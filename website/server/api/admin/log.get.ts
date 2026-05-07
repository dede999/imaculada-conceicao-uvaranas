import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../utils/requireAdmin'

export interface AuditEntry {
  id: number
  table_name: string
  record_id: string | null
  action: string
  diff: Record<string, [unknown, unknown]> | null
  actor_id: string | null
  actor_name: string | null
  created_at: string
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const perPage = 25
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  const tableName = (query.table_name as string) || ''
  const action = (query.action as string) || ''
  const dateFrom = (query.date_from as string) || ''
  const dateTo = (query.date_to as string) || ''

  const supabase = serverSupabaseServiceRole(event)

  let q = supabase
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (tableName) q = q.eq('table_name', tableName) as typeof q
  if (action)    q = q.eq('action', action) as typeof q
  if (dateFrom)  q = q.gte('created_at', dateFrom) as typeof q
  if (dateTo)    q = q.lte('created_at', dateTo + 'T23:59:59') as typeof q

  const { data, error, count } = await q

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { entries: (data ?? []) as AuditEntry[], total: count ?? 0 }
})
