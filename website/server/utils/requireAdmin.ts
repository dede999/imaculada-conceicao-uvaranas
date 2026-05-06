import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

interface AdminProfile {
  id: string
  name: string
  role: 'admin' | 'editor'
}

export async function requireAdmin(event: H3Event) {
  const client = await serverSupabaseClient(event)
  const { data: { user } } = await client.auth.getUser()

  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })

  const { data } = await client
    .from('profiles')
    .select('id, name, role')
    .eq('id', user.id)
    .single()

  const profile = data as unknown as AdminProfile | null

  if (!profile || profile.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  return { user, profile }
}
