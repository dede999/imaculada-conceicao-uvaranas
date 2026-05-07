import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'
import { getParishId } from '../../../utils/getParishId'
import type { ParishConfig } from '../../../api/parish-config.get'

type Body = Omit<ParishConfig, 'parish_id'>

export default defineEventHandler(async (event) => {
  const { profile } = await requireAdmin(event)
  const parishId = getParishId(event)
  const body = await readBody<Body>(event)
  const supabase = serverSupabaseServiceRole(event)

  // Snapshot current state before overwriting
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

  const { error } = await supabase
    .from('parish_config')
    .upsert({
      parish_id: parishId,
      colors: body.colors ?? {},
      icon_type: body.icon_type ?? 'tau',
      icon_url: body.icon_url ?? null,
      home_layout: body.home_layout ?? 'standard',
      sections: body.sections ?? { instagram: true, ministries: true },
      updated_at: new Date().toISOString(),
      updated_by: profile.id,
    } as never)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await supabase.from('audit_log').insert({
    table_name: 'parish_config',
    record_id: parishId,
    action: 'update',
    parish_id: parishId,
    actor_id: profile.id,
    actor_name: profile.name,
  } as never)

  return { ok: true }
})
