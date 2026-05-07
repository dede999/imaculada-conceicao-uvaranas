import type { AuthProfile } from './requireAuth'

/**
 * Adds a parish_id filter to a Supabase query.
 * Admins bypass filtering (they see all parishes).
 * Editors are scoped to their assigned parishIds.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyParishFilter(query: any, profile: AuthProfile, column = 'parish_id'): any {
  if (profile.role === 'admin') return query
  if (profile.parishIds.length === 0)
    throw createError({ statusCode: 403, statusMessage: 'No parish assigned' })
  return query.in(column, profile.parishIds)
}

/**
 * Verifies that a chapel belongs to one of the user's assigned parishes.
 * Admins always pass. Throws 403 if the editor has no access.
 */
export async function assertChapelAccess(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  chapelId: string,
  profile: AuthProfile,
): Promise<void> {
  if (profile.role === 'admin') return

  if (profile.parishIds.length === 0)
    throw createError({ statusCode: 403, statusMessage: 'No parish assigned' })

  const { data } = await supabase
    .from('chapels')
    .select('id')
    .eq('id', chapelId)
    .in('parish_id', profile.parishIds)
    .maybeSingle()

  if (!data) throw createError({ statusCode: 403, statusMessage: 'Chapel not in your parish' })
}
