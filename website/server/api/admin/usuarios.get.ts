import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = serverSupabaseServiceRole(event)

  const [{ data: requestsRaw }, { data: usersRaw }] = await Promise.all([
    supabase.from('user_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, name, parish_role, role, created_at').order('created_at', { ascending: true }),
  ])

  return {
    requests: (requestsRaw as unknown as object[]) ?? [],
    users: (usersRaw as unknown as object[]) ?? [],
  }
})
