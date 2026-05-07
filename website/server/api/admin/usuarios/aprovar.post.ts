import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'

interface UserRequest {
  id: string
  name: string
  email: string
  parish_role: string
  parish_id: string
  status: string
}

export default defineEventHandler(async (event) => {
  const { user: actor, profile: actorProfile } = await requireAdmin(event)
  const { id } = await readBody<{ id: string }>(event)

  if (!id) throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })

  const supabase = serverSupabaseServiceRole(event)

  const { data } = await supabase
    .from('user_requests')
    .select('*')
    .eq('id', id)
    .eq('status', 'pending')
    .single()

  const request = data as unknown as UserRequest | null
  if (!request) throw createError({ statusCode: 404, statusMessage: 'Solicitação não encontrada' })

  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    request.email,
    { data: { name: request.name, parish_role: request.parish_role } },
  )

  if (inviteError) throw createError({ statusCode: 500, statusMessage: inviteError.message })

  // Assign the new user to the parish where they requested access.
  // The handle_new_user trigger creates the profile on auth.users INSERT,
  // so the profile exists by the time inviteUserByEmail returns.
  const newUserId = inviteData.user.id
  await supabase.from('profile_parishes').upsert({
    profile_id: newUserId,
    parish_id: request.parish_id,
  } as never)

  await supabase.from('user_requests').update({
    status: 'approved',
    reviewed_by: actor.id,
    reviewed_at: new Date().toISOString(),
  } as never).eq('id', id)

  await supabase.from('audit_log').insert({
    table_name: 'user_requests',
    record_id: id,
    action: 'approve',
    parish_id: request.parish_id,
    actor_id: actor.id,
    actor_name: actorProfile.name,
  } as never)

  return { ok: true }
})
