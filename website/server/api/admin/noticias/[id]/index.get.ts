import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const supabase = serverSupabaseServiceRole(event)

  const { data, error } = await supabase
    .from('noticias')
    .select('*')
    .eq('id', id as never)
    .single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Não encontrado' })
  return data as unknown as object
})
