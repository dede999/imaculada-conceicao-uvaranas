import type { H3Event } from 'h3'

export interface AuthProfile {
  id: string
  name: string
  role: 'admin' | 'editor'
  is_super_admin: boolean
  /** Parish UUIDs this user can access.
   *  Admins bypass parish scoping — this array is empty for them. */
  parishIds: string[]
}

export async function requireAuth(event: H3Event) {
  const client = useServerClient(event)
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  const supabase = useServiceRole()

  const { data: row } = await supabase
    .from('profiles')
    .select('id, name, role, is_super_admin')
    .eq('id', user.id)
    .single()

  const p = row as unknown as { id: string; name: string; role: 'admin' | 'editor'; is_super_admin: boolean } | null
  if (!p) throw createError({ statusCode: 403, statusMessage: 'Profile not found' })

  // Admins see all parishes — no need to fetch assignments.
  let parishIds: string[] = []
  if (p.role === 'editor') {
    const { data: assignments } = await supabase
      .from('profile_parishes')
      .select('parish_id')
      .eq('profile_id', user.id)
    parishIds = ((assignments ?? []) as { parish_id: string }[]).map(a => a.parish_id)
  }

  const profile: AuthProfile = { ...p, parishIds }
  return { user, profile }
}
