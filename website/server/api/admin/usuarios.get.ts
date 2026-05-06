export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = serverSupabaseServiceRole(event)

  const [{ data: requests }, { data: users }] = await Promise.all([
    supabase
      .from('user_requests')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, name, parish_role, role, created_at')
      .order('created_at', { ascending: true }),
  ])

  return { requests: requests ?? [], users: users ?? [] }
})
