import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'
import { insertAuditLog } from '../../../utils/auditLog'

interface UserRequest {
  id: string
  name: string
  email: string
  parish_role: string
  parish_id: string
}

export default defineEventHandler(async (event) => {
  const { user: actor, profile: actorProfile } = await requireAdmin(event)
  const { id } = await readBody<{ id: string }>(event)

  if (!id) throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })

  const supabase = serverSupabaseServiceRole(event)

  // Fetch request details first (need email, name, parish_id)
  const { data: found } = await supabase
    .from('user_requests')
    .select('id, name, email, parish_role, parish_id')
    .eq('id', id)
    .eq('status', 'pending')
    .maybeSingle()

  const request = found as UserRequest | null
  if (!request) throw createError({ statusCode: 404, statusMessage: 'Solicitação não encontrada ou já processada' })

  // Atomically claim the request: only succeeds if status is still 'pending'.
  // Prevents duplicate invites from double-clicks or concurrent admin sessions.
  const { data: claimed } = await supabase
    .from('user_requests')
    .update({
      status: 'approved',
      reviewed_by: actor.id,
      reviewed_at: new Date().toISOString(),
    } as never)
    .eq('id', id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()

  if (!claimed) throw createError({ statusCode: 409, statusMessage: 'Solicitação já foi processada' })

  // Status locked — safe to send the invite now
  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    request.email,
    { data: { name: request.name, parish_role: request.parish_role } },
  )

  if (inviteError) {
    // Roll back the status change so the admin can retry
    await supabase
      .from('user_requests')
      .update({ status: 'pending', reviewed_by: null, reviewed_at: null } as never)
      .eq('id', id)
    throw createError({ statusCode: 500, statusMessage: inviteError.message })
  }

  // The handle_new_user trigger creates the profile on auth.users INSERT,
  // so the profile exists by the time inviteUserByEmail returns.
  const newUserId = inviteData.user.id
  await supabase.from('profile_parishes').upsert({
    profile_id: newUserId,
    parish_id: request.parish_id,
  } as never)

  await insertAuditLog(supabase, {
    table_name: 'user_requests',
    record_id: id,
    action: 'approve',
    parish_id: request.parish_id,
    actor_id: actor.id,
    actor_name: actorProfile.name,
  })

  return { ok: true }
})
