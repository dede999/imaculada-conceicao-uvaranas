import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const supabase = serverSupabaseServiceRole(event)

  const { data, error } = await supabase
    .from('eventos')
    .select('id, slug, title, type, date, end_date, status, summary, body, published')
    .eq('id', id as never)
    .single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Evento não encontrado' })
  return data as unknown as object
})
