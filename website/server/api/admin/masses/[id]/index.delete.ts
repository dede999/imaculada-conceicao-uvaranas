import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const supabase = serverSupabaseServiceRole(event)
  const { error } = await supabase.from('masses').delete().eq('id', id as never)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
