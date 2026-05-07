import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'

interface ProfileRow {
  role: 'admin' | 'editor'
  name: string
}

export default defineEventHandler(async (event) => {
  const { user: actor, profile: actorProfile } = await requireAdmin(event)
  const { id, role } = await readBody<{ id: string; role: string }>(event)

  if (!id || !['admin', 'editor'].includes(role)) {
    throw createError({ statusCode: 400, statusMessage: 'Parâmetros inválidos' })
  }
  if (id === actor.id && role === 'editor') {
    throw createError({ statusCode: 403, statusMessage: 'Não é possível se auto-rebaixar.' })
  }

  const supabase = serverSupabaseServiceRole(event)

  const { data } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', id)
    .single()

  const current = data as unknown as ProfileRow | null
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado' })

  await supabase.from('profiles').update({ role } as never).eq('id', id)

  await supabase.from('audit_log').insert({
    table_name: 'profiles',
    record_id: id,
    action: 'update',
    diff: { role: [current.role, role] },
    actor_id: actor.id,
    actor_name: actorProfile.name,
  } as never)

  return { ok: true }
})
