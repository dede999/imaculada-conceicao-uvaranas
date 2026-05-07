import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAuth } from '../../../../utils/requireAuth'
import { applyParishFilter } from '../../../../utils/parishGuard'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const supabase = serverSupabaseServiceRole(event)
  let q = supabase
    .from('pastorais')
    .select('id, slug, name, category, summary, coordinator, meetings, body')
    .eq('id', id as never)
  q = applyParishFilter(q, profile)
  const { data, error } = await q.single()

  if (error) throw createError({ statusCode: 404, statusMessage: error.message })
  return data
})
