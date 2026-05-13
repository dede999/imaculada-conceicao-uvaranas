import { requireAuth } from '../../../../utils/requireAuth'
import { applyParishFilter } from '../../../../utils/parishGuard'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const supabase = useServiceRole()

  let q = supabase
    .from('eventos')
    .delete()
    .eq('id', id as never)
  q = applyParishFilter(q, profile)
  const { error } = await q

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
