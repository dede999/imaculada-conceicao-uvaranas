import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = serverSupabaseServiceRole(event)
  const { data, error } = await supabase
    .from('pastorais')
    .select('id, slug, name, category, summary, coordinator, meetings, body')
    .order('name')

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data ?? []
})
