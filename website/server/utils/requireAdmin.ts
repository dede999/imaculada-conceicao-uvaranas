import type { H3Event } from 'h3'
import { requireAuth } from './requireAuth'

export async function requireAdmin(event: H3Event) {
  const result = await requireAuth(event)
  if (result.profile.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  return result
}
