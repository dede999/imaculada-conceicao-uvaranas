import { requireAdmin } from '../../../utils/requireAdmin'
import { insertAuditLog } from '../../../utils/auditLog'

export default defineEventHandler(async (event) => {
  const { user: actor, profile: actorProfile } = await requireAdmin(event)
  const { id } = await readBody<{ id: string }>(event)

  if (!id) throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })

  const supabase = useServiceRole()

  // Fetch the request so we can look up the email for cleanup
  const { data: found } = await supabase
    .from('user_requests')
    .select('id, email')
    .eq('id', id)
    .eq('status', 'pending')
    .maybeSingle()

  if (!found) throw createError({ statusCode: 404, statusMessage: 'Solicitação não encontrada ou já processada' })

  const { error } = await supabase.from('user_requests').update({
    status: 'rejected',
    reviewed_by: actor.id,
    reviewed_at: new Date().toISOString(),
  } as never).eq('id', id).eq('status', 'pending')

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // Delete the pre-created auth user (created during solicitar) so the email is freed
  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const authUser = authUsers.find(u => u.email?.toLowerCase() === (found as { email: string }).email.toLowerCase())
  if (authUser) {
    await supabase.auth.admin.deleteUser(authUser.id)
  }

  await insertAuditLog(supabase, {
    table_name: 'user_requests',
    record_id: id,
    action: 'reject',
    actor_id: actor.id,
    actor_name: actorProfile.name,
  })

  return { ok: true }
})
