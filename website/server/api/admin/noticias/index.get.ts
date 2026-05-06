import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = serverSupabaseServiceRole(event)

  const { data, error } = await supabase
    .from('noticias')
    .select('id, slug, title, date, summary, published, updated_at')
    .order('date', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as unknown as object[]
})
