import { getParishId } from '../../utils/getParishId'

export default defineEventHandler(async (event) => {
  const supabase = useServiceRole()

  const { data, error } = await supabase
    .from('eventos')
    .select('id, slug, title, type, date, end_date, status, summary')
    .eq('parish_id', getParishId(event))
    .eq('published', true)
    .order('date', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as unknown as object[]
})
