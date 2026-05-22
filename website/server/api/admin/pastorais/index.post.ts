import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAuth } from '../../../utils/requireAuth'
import { getParishId } from '../../../utils/getParishId'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const body = await readBody<{
    slug: string; name: string; category: string
    summary?: string; coordinator?: string; meetings?: string; body?: string
  }>(event)

  const parish_id = profile.role === 'editor' ? profile.parishIds[0] : getParishId(event)
  const supabase = serverSupabaseServiceRole(event)
  const { data, error } = await supabase
    .from('pastorais')
    .insert({ ...body, parish_id } as never)
    .select('id')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as unknown as { id: string }
})
