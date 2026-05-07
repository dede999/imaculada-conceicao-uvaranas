import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'
import { insertAuditLog } from '../../../utils/auditLog'

export default defineEventHandler(async (event) => {
  const { user: actor, profile: actorProfile } = await requireAdmin(event)
  const { id } = await readBody<{ id: string }>(event)

  if (!id) throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })

  const supabase = serverSupabaseServiceRole(event)

  const { error } = await supabase.from('user_requests').update({
    status: 'rejected',
    reviewed_by: actor.id,
    reviewed_at: new Date().toISOString(),
  } as never).eq('id', id).eq('status', 'pending')

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await insertAuditLog(supabase, {
    table_name: 'user_requests',
    record_id: id,
    action: 'reject',
    actor_id: actor.id,
    actor_name: actorProfile.name,
  })

  return { ok: true }
})
