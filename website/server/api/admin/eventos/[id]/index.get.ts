import { requireAuth } from '../../../../utils/requireAuth'
import { applyParishFilter } from '../../../../utils/parishGuard'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const supabase = useServiceRole()

  let q = supabase
    .from('eventos')
    .select('id, slug, title, type, date, end_date, status, summary, body, published')
    .eq('id', id as never)
  q = applyParishFilter(q, profile)
  const { data, error } = await q.single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Evento não encontrado' })
  return data as unknown as object
})
