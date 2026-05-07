import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAuth } from '../../../utils/requireAuth'
import { assertChapelAccess } from '../../../utils/parishGuard'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const body = await readBody<{ chapel_id: string; url: string; caption?: string; sort?: number }>(event)
  const supabase = serverSupabaseServiceRole(event)
  await assertChapelAccess(supabase, body.chapel_id, profile)
  const { data, error } = await supabase.from('chapel_images').insert(body as never).select('id').single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as unknown as { id: string }
})
