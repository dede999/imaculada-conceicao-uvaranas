// ─── Re-exported types ────────────────────────────────────────────────────────
// Imported from the server route so pages have a single source of truth.

export type {
  ChapelContact,
  ChapelImage,
  Mass,
  Confession,
  CatechismGroup,
  ChapelListItem,
} from '../../server/api/chapels/index.get'

export type { ChapelDetail } from '../../server/api/chapels/[slug].get'

import type { ChapelListItem } from '../../server/api/chapels/index.get'
import type { ChapelDetail } from '../../server/api/chapels/[slug].get'

// ─── Composables ──────────────────────────────────────────────────────────────

/**
 * Fetch all chapels (without body) with their sub-relations.
 * Branch chapels with no own contacts inherit the matriz contacts.
 */
export function useChapels() {
  return useAsyncData<ChapelListItem[]>('chapels', () =>
    $fetch<ChapelListItem[]>('/api/chapels')
  )
}

/**
 * Fetch a single chapel by slug, including the body field.
 * Branch chapels with no own contacts inherit the matriz contacts.
 */
export function useChapel(slug: string | Ref<string>) {
  const slugValue = isRef(slug) ? slug : ref(slug)
  return useAsyncData<ChapelDetail>(
    `chapel-${slugValue.value}`,
    () => $fetch<ChapelDetail>(`/api/chapels/${slugValue.value}`),
    { watch: [slugValue] }
  )
}
