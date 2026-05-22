import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'
import { getParishId } from '../../../utils/getParishId'
import { insertAuditLog } from '../../../utils/auditLog'

type Sections = { instagram: boolean; ministries: boolean }
type Diff = Record<string, [unknown, unknown]>

function buildDiff(
  old: Record<string, unknown> | null,
  newColors: Record<string, string>,
  newIconType: string,
  newIconUrl: string | null,
  newSections: Sections,
): Diff {
  const diff: Diff = {}

  const oldColors   = (old?.colors   as Record<string, string>) ?? {}
  const oldIconType = (old?.icon_type as string)                ?? 'tau'
  const oldIconUrl  = (old?.icon_url  as string | null)         ?? null
  const oldSections = (old?.sections  as Sections)              ?? { instagram: true, ministries: true }

  if (oldIconType !== newIconType) diff.icon_type = [oldIconType, newIconType]
  if (oldIconUrl  !== newIconUrl)  diff.icon_url  = [oldIconUrl,  newIconUrl]

  if (oldSections.instagram  !== newSections.instagram)
    diff['sections.instagram']  = [oldSections.instagram,  newSections.instagram]
  if (oldSections.ministries !== newSections.ministries)
    diff['sections.ministries'] = [oldSections.ministries, newSections.ministries]

  const allColorKeys = new Set([...Object.keys(oldColors), ...Object.keys(newColors)])
  for (const key of allColorKeys) {
    const o = oldColors[key] ?? null
    const n = newColors[key] ?? null
    if (o !== n) diff[key] = [o, n]
  }

  return diff
}

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

  const { data: current } = await supabase
    .from('parish_config')
    .select('*')
    .eq('parish_id', parishId)
    .maybeSingle()

  if (current) {
    await supabase.from('parish_config_history').insert({
      parish_id:  parishId,
      snapshot:   current,
      actor_id:   profile.id,
      actor_name: profile.name,
    } as never)
  }

  const snap        = entry.snapshot as Record<string, unknown>
  const newColors   = (snap.colors   as Record<string, string>) ?? {}
  const newIconType = (snap.icon_type as string)                ?? 'tau'
  const newIconUrl  = (snap.icon_url  as string | null)         ?? null
  const newSections = (snap.sections  as Sections)              ?? { instagram: true, ministries: true }

  const diff = buildDiff(current, newColors, newIconType, newIconUrl, newSections)

  const { error } = await supabase
    .from('parish_config')
    .upsert({
      parish_id:   parishId,
      colors:      newColors,
      icon_type:   newIconType,
      icon_url:    newIconUrl,
      home_layout: snap.home_layout ?? 'standard',
      sections:    newSections,
      updated_at:  new Date().toISOString(),
      updated_by:  profile.id,
    } as never)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await insertAuditLog(supabase, {
    table_name: 'parish_config',
    record_id:  parishId,
    action:     'restore',
    parish_id:  parishId,
    actor_id:   profile.id,
    actor_name: profile.name,
    diff:       Object.keys(diff).length ? diff : null,
  })

  return { ok: true }
})
