import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export interface AuthProfile {
  id: string
  name: string
  role: 'admin' | 'editor'
}

export async function requireAuth(event: H3Event) {
  const client = await serverSupabaseClient(event)
  const { data: { user } } = await client.auth.getUser()

  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  const { data } = await client
    .from('profiles')
    .select('id, name, role')
    .eq('id', user.id)
    .single()

  const profile = data as unknown as AuthProfile | null
  if (!profile) throw createError({ statusCode: 403, statusMessage: 'Profile not found' })

  return { user, profile }
}
