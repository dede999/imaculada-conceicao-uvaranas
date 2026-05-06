import type { H3Event } from 'h3'

export async function requireAdmin(event: H3Event) {
  const client = serverSupabaseClient(event)
  const { data: { user } } = await client.auth.getUser()

  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })

  const { data: profile } = await client
    .from('profiles')
    .select('id, name, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  return { user, profile }
}
