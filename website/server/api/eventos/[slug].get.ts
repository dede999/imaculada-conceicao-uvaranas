import { serverSupabaseServiceRole } from '#supabase/server'
import { getParishId } from '../../utils/getParishId'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const supabase = serverSupabaseServiceRole(event)

  const { data, error } = await supabase
    .from('eventos')
    .select('id, slug, title, type, date, end_date, status, summary, body')
    .eq('parish_id', getParishId(event))
    .eq('slug', slug as never)
    .eq('published', true)
    .single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Evento não encontrado' })
  return data as unknown as object
})
