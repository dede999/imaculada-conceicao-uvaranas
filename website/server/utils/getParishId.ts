import type { H3Event } from 'h3'

/** Returns the PARISH_ID for the current deployment (public routes). */
export function getParishId(event: H3Event): string {
  const id = (useRuntimeConfig(event) as unknown as { parishId: string }).parishId
  if (!id) throw createError({ statusCode: 500, statusMessage: 'PARISH_ID env var not set' })
  return id
}
