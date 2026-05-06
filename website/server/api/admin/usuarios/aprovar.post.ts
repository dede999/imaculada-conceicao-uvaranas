import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'

interface UserRequest {
  id: string
  name: string
  email: string
  parish_role: string
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

  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(request.email, {
    data: { name: request.name, parish_role: request.parish_role },
  })

  if (inviteError) throw createError({ statusCode: 500, statusMessage: inviteError.message })

  await supabase.from('user_requests').update({
    status: 'approved',
    reviewed_by: actor.id,
    reviewed_at: new Date().toISOString(),
  } as never).eq('id', id)

  await supabase.from('audit_log').insert({
    table_name: 'user_requests',
    record_id: id,
    action: 'approve',
    actor_id: actor.id,
    actor_name: actorProfile.name,
  } as never)

  return { ok: true }
})
