import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  const { data, error } = await supabase
    .from('noticias')
    .select('id, slug, title, date, summary')
    .eq('published', true as never)
    .order('date', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as unknown as object[]
})
