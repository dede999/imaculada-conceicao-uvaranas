import { requireAuth } from '../../../../utils/requireAuth'
import { applyParishFilter } from '../../../../utils/parishGuard'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const supabase = useServiceRole()

  let q = supabase
    .from('noticias')
    .select('*')
    .eq('id', id as never)
  q = applyParishFilter(q, profile)
  const { data, error } = await q.single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Não encontrado' })
  return data as unknown as object
})
