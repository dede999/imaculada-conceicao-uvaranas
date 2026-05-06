import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ chapel_id: string; day_of_week: number; time_start: string; time_end: string }>(event)
  const supabase = serverSupabaseServiceRole(event)
  const { data, error } = await supabase.from('confessions').insert(body as never).select('id').single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as unknown as { id: string }
})
