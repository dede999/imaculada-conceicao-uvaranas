import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<{
    slug?: string; title?: string; date?: string
    summary?: string; body?: string; published?: boolean
  }>(event)

  const supabase = serverSupabaseServiceRole(event)
  const { error } = await supabase
    .from('noticias')
    .update({ ...body, updated_by: user.id } as never)
    .eq('id', id as never)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
