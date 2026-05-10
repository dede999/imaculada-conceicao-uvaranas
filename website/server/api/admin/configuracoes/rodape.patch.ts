import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'
import { getParishId } from '../../../utils/getParishId'
import { insertAuditLog } from '../../../utils/auditLog'
import type { FooterConfig } from '../../../api/parish-config.get'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAdmin(event)
  const parishId    = getParishId(event)
  const body        = await readBody<FooterConfig>(event)
  const supabase    = serverSupabaseServiceRole(event)

  const { error } = await supabase
    .from('parish_config')
    .upsert({
      parish_id:           parishId,
      footer_show:         body.footer_show         ?? true,
      footer_motto_latin:  body.footer_motto_latin  ?? 'Instaurare omnia in Christo',
      footer_motto_pt:     body.footer_motto_pt     ?? 'Restaurar todas as coisas em Cristo',
      footer_display_mode: body.footer_display_mode ?? 'both',
      updated_at:          new Date().toISOString(),
      updated_by:          profile.id,
    } as never)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await insertAuditLog(supabase, {
    table_name: 'parish_config',
    record_id:  parishId,
    action:     'update',
    parish_id:  parishId,
    actor_id:   profile.id,
    actor_name: profile.name,
    diff:       { footer: [null, body] },
  })

  return { ok: true }
})
