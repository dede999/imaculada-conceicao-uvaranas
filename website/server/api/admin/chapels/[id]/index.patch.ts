import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<{
    name?: string; address?: string; pastor?: string
    lat?: number | null; lng?: number | null; body?: string
  }>(event)

  const supabase = serverSupabaseServiceRole(event)
  const { error } = await supabase
    .from('chapels')
    .update(body as never)
    .eq('id', id as never)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
