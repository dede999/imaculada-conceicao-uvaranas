import { requireAuth } from '../../../utils/requireAuth'
import { getParishId } from '../../../utils/getParishId'

export default defineEventHandler(async (event) => {
  const { user, profile } = await requireAuth(event)
  const body = await readBody<{
    slug: string; title: string; type: string; date: string
    end_date?: string | null; status: string
    summary: string; body: string; published: boolean
  }>(event)

  const parish_id = profile.role === 'editor' ? profile.parishIds[0] : getParishId(event)
  const supabase = useServiceRole()
  const { data, error } = await supabase
    .from('eventos')
    .insert({ ...body, parish_id, created_by: user.id, updated_by: user.id } as never)
    .select('id')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as unknown as { id: string }
})
