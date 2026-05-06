export default defineEventHandler(async (event) => {
  const { user: actor, profile: actorProfile } = await requireAdmin(event)
  const { id, role } = await readBody<{ id: string; role: string }>(event)

  if (!id || !['admin', 'editor'].includes(role)) {
    throw createError({ statusCode: 400, statusMessage: 'Parâmetros inválidos' })
  }

  const supabase = serverSupabaseServiceRole(event)

  const { data: current } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', id)
    .single()

  if (!current) throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado' })

  await supabase.from('profiles').update({ role }).eq('id', id)

  await supabase.from('audit_log').insert({
    table_name: 'profiles',
    record_id: id,
    action: 'update',
    diff: { role: [current.role, role] },
    actor_id: actor.id,
    actor_name: actorProfile.name,
  })

  return { ok: true }
})
