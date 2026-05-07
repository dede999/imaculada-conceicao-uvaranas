import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<{
    name?: string; category?: string; summary?: string
    coordinator?: string; meetings?: string; body?: string
  }>(event)

  const supabase = serverSupabaseServiceRole(event)
  const { error } = await supabase.from('pastorais').update(body as never).eq('id', id as never)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
