import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ chapel_id: string; type: string; value: string; sort?: number }>(event)
  const supabase = serverSupabaseServiceRole(event)
  const { data, error } = await supabase.from('chapel_contacts').insert(body as never).select('id').single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as unknown as { id: string }
})
