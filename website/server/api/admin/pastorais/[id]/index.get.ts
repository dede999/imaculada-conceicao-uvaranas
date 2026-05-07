import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const supabase = serverSupabaseServiceRole(event)
  const { data, error } = await supabase
    .from('pastorais')
    .select('id, slug, name, category, summary, coordinator, meetings, body')
    .eq('id', id as never)
    .single()

  if (error) throw createError({ statusCode: 404, statusMessage: error.message })
  return data
})
