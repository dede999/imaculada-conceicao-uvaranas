import { getParishId } from '../../utils/getParishId'

export default defineEventHandler(async (event) => {
  const supabase = useServiceRole()
  const { data, error } = await supabase
    .from('noticias')
    .select('id, slug, title, date, summary')
    .eq('parish_id', getParishId(event))
    .eq('published', true as never)
    .order('date', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as unknown as object[]
})
