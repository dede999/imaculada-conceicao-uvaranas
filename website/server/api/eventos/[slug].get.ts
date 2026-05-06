import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const supabase = serverSupabaseServiceRole(event)

  const { data, error } = await supabase
    .from('eventos')
    .select('id, slug, title, type, date, end_date, status, summary, body')
    .eq('slug', slug as never)
    .eq('published', true)
    .single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Evento não encontrado' })
  return data as unknown as object
})
