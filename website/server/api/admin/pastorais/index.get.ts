import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAuth } from '../../../utils/requireAuth'
import { applyParishFilter } from '../../../utils/parishGuard'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const supabase = serverSupabaseServiceRole(event)
  let q = supabase
    .from('pastorais')
    .select('id, slug, name, category, summary, coordinator, meetings, body')
    .order('name')
  q = applyParishFilter(q, profile)
  const { data, error } = await q

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data ?? []
})
