import { requireAuth } from '../../../../utils/requireAuth'
import { assertChapelAccess } from '../../../../utils/parishGuard'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<{
    name?: string; address?: string; pastor?: string
    lat?: number | null; lng?: number | null; body?: string
  }>(event)

  const supabase = useServiceRole()
  await assertChapelAccess(supabase, id as string, profile)
  const { error } = await supabase
    .from('chapels')
    .update(body as never)
    .eq('id', id as never)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
