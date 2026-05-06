import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const body = await readBody<{
    slug: string; title: string; type: string; date: string
    end_date?: string | null; status: string
    summary: string; body: string; published: boolean
  }>(event)

  const supabase = serverSupabaseServiceRole(event)
  const { data, error } = await supabase
    .from('eventos')
    .insert({ ...body, created_by: user.id, updated_by: user.id } as never)
    .select('id')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as unknown as { id: string }
})
