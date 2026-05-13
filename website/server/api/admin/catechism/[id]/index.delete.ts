import { requireAuth } from '../../../../utils/requireAuth'
import { assertChapelAccess } from '../../../../utils/parishGuard'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const supabase = useServiceRole()
  const { data: rec } = await supabase.from('catechism_groups').select('chapel_id').eq('id', id as never).maybeSingle()
  if (!rec) throw createError({ statusCode: 404 })
  await assertChapelAccess(supabase, (rec as unknown as { chapel_id: string }).chapel_id, profile)
  const { error } = await supabase.from('catechism_groups').delete().eq('id', id as never)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
