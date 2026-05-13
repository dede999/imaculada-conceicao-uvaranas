import { requireAuth } from '../../../../utils/requireAuth'
import { applyParishFilter } from '../../../../utils/parishGuard'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<{
    name?: string; category?: string; summary?: string
    coordinator?: string; meetings?: string; body?: string
  }>(event)

  const supabase = useServiceRole()
  let q = supabase.from('pastorais').update(body as never).eq('id', id as never)
  q = applyParishFilter(q, profile)
  const { error } = await q
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
