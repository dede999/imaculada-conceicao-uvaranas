import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'
import { getParishId } from '../../../utils/getParishId'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAdmin(event)
  const { history_id } = await readBody<{ history_id: number }>(event)

  if (!history_id) throw createError({ statusCode: 400, statusMessage: 'history_id required' })

  const parishId = getParishId(event)
  const supabase = serverSupabaseServiceRole(event)

  const { data: entry } = await supabase
    .from('parish_config_history')
    .select('snapshot')
    .eq('id', history_id)
    .eq('parish_id', parishId)
    .single()

  if (!entry) throw createError({ statusCode: 404, statusMessage: 'Snapshot not found' })

  // Snapshot current state before restoring
  const { data: current } = await supabase
    .from('parish_config')
    .select('*')
    .eq('parish_id', parishId)
    .maybeSingle()

  if (current) {
    await supabase.from('parish_config_history').insert({
      parish_id: parishId,
      snapshot: current,
      actor_id: profile.id,
      actor_name: profile.name,
    } as never)
  }

  const snap = entry.snapshot as Record<string, unknown>

  const { error } = await supabase
    .from('parish_config')
    .upsert({
      parish_id: parishId,
      colors: snap.colors ?? {},
      icon_type: snap.icon_type ?? 'tau',
      icon_url: snap.icon_url ?? null,
      home_layout: snap.home_layout ?? 'standard',
      sections: snap.sections ?? { instagram: true, ministries: true },
      updated_at: new Date().toISOString(),
      updated_by: profile.id,
    } as never)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await supabase.from('audit_log').insert({
    table_name: 'parish_config',
    record_id: parishId,
    action: 'restore',
    parish_id: parishId,
    actor_id: profile.id,
    actor_name: profile.name,
  } as never)

  return { ok: true }
})
