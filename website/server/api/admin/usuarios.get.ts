import { requireAdmin } from '../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = useServiceRole()

  const [{ data: requestsRaw }, { data: usersRaw }, { data: { users: authUsers } }] =
    await Promise.all([
      supabase.from('user_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, name, parish_role, role, created_at').order('created_at', { ascending: true }),
      supabase.auth.admin.listUsers({ perPage: 200 }),
    ])

  // Build lookup tables to backfill profiles that have empty name/parish_role
  const emailById = new Map<string, string>()
  for (const u of authUsers) {
    emailById.set(u.id, u.email ?? '')
  }

  const requestByEmail = new Map<string, { name: string; parish_role: string }>()
  for (const r of (requestsRaw ?? []) as any[]) {
    if (r.status === 'approved' && r.email) {
      requestByEmail.set(r.email, { name: r.name, parish_role: r.parish_role })
    }
  }

  const users = ((usersRaw ?? []) as any[]).map((u) => {
    const email = emailById.get(u.id) ?? ''
    if (u.name && u.parish_role) return { ...u, email }
    const req = requestByEmail.get(email)
    return {
      ...u,
      email,
      name: u.name || req?.name || '',
      parish_role: u.parish_role || req?.parish_role || '',
    }
  })

  return {
    requests: (requestsRaw as unknown as object[]) ?? [],
    users,
  }
})
