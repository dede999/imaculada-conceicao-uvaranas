import { requireAuth } from '../../../utils/requireAuth'
import { assertChapelAccess } from '../../../utils/parishGuard'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const body = await readBody<{ chapel_id: string; group_name: string; day_of_week?: number | null; time?: string | null }>(event)
  const supabase = useServiceRole()
  await assertChapelAccess(supabase, body.chapel_id, profile)
  const { data, error } = await supabase.from('catechism_groups').insert(body as never).select('id').single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as unknown as { id: string }
})
