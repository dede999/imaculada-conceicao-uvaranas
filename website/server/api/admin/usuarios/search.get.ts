import { requireAdmin } from '../../../utils/requireAdmin'
import { getParishId } from '../../../utils/getParishId'

export interface SearchedProfile {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor'
  parish_role: string
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const q = ((getQuery(event).q as string) ?? '').trim()
  if (q.length < 2) return []

  const parishId = getParishId(event)
  const supabase = useServiceRole()

  // Profiles already in this parish — to exclude from results
  const { data: inParish } = await supabase
    .from('profile_parishes')
    .select('profile_id')
    .eq('parish_id', parishId)

  const excludedIds = ((inParish ?? []) as { profile_id: string }[]).map(r => r.profile_id)

  // Search profiles by name
  const { data: byName } = await supabase
    .from('profiles')
    .select('id, name, role, parish_role')
    .ilike('name', `%${q}%`)
    .limit(20)

  // Cross-reference auth users to get emails and filter by email pattern
  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 })

  const emailById = new Map(authUsers.map(u => [u.id, u.email ?? '']))

  // Merge: match by name OR by email
  const allProfiles = (byName ?? []) as { id: string; name: string; role: string; parish_role: string }[]

  // Add profiles matched by email but not already in byName
  const nameMatchIds = new Set(allProfiles.map(p => p.id))
  const emailMatchIds = authUsers
    .filter(u => u.email?.toLowerCase().includes(q.toLowerCase()))
    .map(u => u.id)
    .filter(id => !nameMatchIds.has(id))

  let extra: typeof allProfiles = []
  if (emailMatchIds.length > 0) {
    const { data: byEmail } = await supabase
      .from('profiles')
      .select('id, name, role, parish_role')
      .in('id', emailMatchIds)
    extra = (byEmail ?? []) as typeof allProfiles
  }

  const combined = [...allProfiles, ...extra]

  return combined
    .filter(p => !excludedIds.includes(p.id))
    .map(p => ({
      id: p.id,
      name: p.name,
      email: emailById.get(p.id) ?? '',
      role: p.role as 'admin' | 'editor',
      parish_role: p.parish_role,
    })) satisfies SearchedProfile[]
})
