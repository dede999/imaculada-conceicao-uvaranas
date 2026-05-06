import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const supabase = serverSupabaseServiceRole(event)

  const { data, error } = await supabase
    .from('noticias')
    .select('*')
    .eq('slug', slug as never)
    .eq('published', true as never)
    .single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Não encontrado' })
  return data as unknown as object
})
