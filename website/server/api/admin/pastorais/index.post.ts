import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{
    slug: string; name: string; category: string
    summary?: string; coordinator?: string; meetings?: string; body?: string
  }>(event)

  const supabase = serverSupabaseServiceRole(event)
  const { data, error } = await supabase
    .from('pastorais')
    .insert(body as never)
    .select('id')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as unknown as { id: string }
})
