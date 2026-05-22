import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/requireAdmin'
import { getParishId } from '../../../utils/getParishId'
import { insertAuditLog } from '../../../utils/auditLog'

export default defineEventHandler(async (event) => {
  const { profile: actorProfile } = await requireAdmin(event)
  const { profile_id } = await readBody<{ profile_id: string }>(event)

  if (!profile_id) throw createError({ statusCode: 400, statusMessage: 'profile_id required' })

  const parishId = getParishId(event)
  const supabase = serverSupabaseServiceRole(event)

  const { error } = await supabase
    .from('profile_parishes')
    .upsert({ profile_id, parish_id: parishId } as never)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await insertAuditLog(supabase, {
    table_name: 'profile_parishes',
    record_id: profile_id,
    action: 'create',
    parish_id: parishId,
    actor_id: actorProfile.id,
    actor_name: actorProfile.name,
  })

  return { ok: true }
})
