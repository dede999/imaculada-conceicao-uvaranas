import { requireAuth } from '../../../../utils/requireAuth'
import { applyParishFilter } from '../../../../utils/parishGuard'

export default defineEventHandler(async (event) => {
  const { user, profile } = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<{
    slug?: string; title?: string; type?: string; date?: string
    end_date?: string | null; status?: string
    summary?: string; body?: string; published?: boolean
  }>(event)

  const supabase = useServiceRole()
  let q = supabase
    .from('eventos')
    .update({ ...body, updated_by: user.id } as never)
    .eq('id', id as never)
  q = applyParishFilter(q, profile)
  const { error } = await q

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
