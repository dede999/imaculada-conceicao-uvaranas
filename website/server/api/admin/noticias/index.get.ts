import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAuth } from '../../../utils/requireAuth'
import { applyParishFilter } from '../../../utils/parishGuard'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const supabase = serverSupabaseServiceRole(event)

  let q = supabase
    .from('noticias')
    .select('id, slug, title, date, summary, published, updated_at')
    .order('date', { ascending: false })
  q = applyParishFilter(q, profile)
  const { data, error } = await q

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as unknown as object[]
})
