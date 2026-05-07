import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  const { user: actor, profile: actorProfile } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
  if (id === actor.id) throw createError({ statusCode: 403, statusMessage: 'Não é possível excluir a própria conta.' })

  const supabase = serverSupabaseServiceRole(event)

  const { data } = await supabase.from('profiles').select('role, name').eq('id', id).single()
  const target = data as unknown as { role: string; name: string } | null

  if (!target) throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado.' })
  if (target.role === 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Administradores não podem ser excluídos. Rebaixe para editor primeiro.' })
  }

  const { error } = await supabase.auth.admin.deleteUser(id)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await supabase.from('audit_log').insert({
    table_name: 'profiles',
    record_id: id,
    action: 'delete',
    diff: { name: target.name, role: target.role },
    actor_id: actor.id,
    actor_name: actorProfile.name,
  } as never)

  return { ok: true }
})
