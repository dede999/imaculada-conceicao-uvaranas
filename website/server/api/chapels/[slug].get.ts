import { serverSupabaseServiceRole } from '#supabase/server'
import type {
  ChapelContact,
  ChapelImage,
  Mass,
  Confession,
  CatechismGroup,
} from './index.get'

// ─── Extended type with body ───────────────────────────────────────────────────

export interface ChapelDetail {
  id: string
  slug: string
  name: string
  type: 'matriz' | 'branch'
  address: string
  lat: number | null
  lng: number | null
  pastor: string
  body: string
  sort: number
  contacts: ChapelContact[]
  images: ChapelImage[]
  masses: Mass[]
  confessions: Confession[]
  catechism_groups: CatechismGroup[]
}

// GET /api/chapels/:slug — returns a single chapel with all sub-relations and body.
// Branch chapels with no contacts inherit the matriz contacts (COALESCE).

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug is required' })

  const supabase = serverSupabaseServiceRole(event)

  // Fetch the target chapel first to know its id and type
  const { data: chapelRow, error: chapelErr } = await supabase
    .from('chapels')
    .select('id, slug, name, type, address, lat, lng, pastor, body, sort')
    .eq('slug', slug as never)
    .single()

  if (chapelErr || !chapelRow) {
    throw createError({ statusCode: 404, statusMessage: 'Chapel not found' })
  }

  const chapel = chapelRow as unknown as ChapelDetail

  // Collect all chapel ids we may need: the target + matriz (for contact fallback)
  const needMatriz = chapel.type === 'branch'

  const [contactsRes, imagesRes, massesRes, confsRes, catRes] =
    await Promise.all([
      supabase
        .from('chapel_contacts')
        .select('id, chapel_id, type, value, sort')
        .eq('chapel_id', chapel.id as never)
        .order('sort'),
      supabase
        .from('chapel_images')
        .select('id, chapel_id, url, caption, sort')
        .eq('chapel_id', chapel.id as never)
        .order('sort'),
      supabase
        .from('masses')
        .select('id, chapel_id, day_of_week, time, note')
        .eq('chapel_id', chapel.id as never)
        .eq('active', true as never)
        .order('day_of_week')
        .order('time'),
      supabase
        .from('confessions')
        .select('id, chapel_id, day_of_week, time_start, time_end')
        .eq('chapel_id', chapel.id as never)
        .eq('active', true as never)
        .order('day_of_week')
        .order('time_start'),
      supabase
        .from('catechism_groups')
        .select('id, chapel_id, group_name, day_of_week, time')
        .eq('chapel_id', chapel.id as never)
        .eq('active', true as never),
    ])

  if (contactsRes.error) throw createError({ statusCode: 500, statusMessage: contactsRes.error.message })
  if (imagesRes.error) throw createError({ statusCode: 500, statusMessage: imagesRes.error.message })
  if (massesRes.error) throw createError({ statusCode: 500, statusMessage: massesRes.error.message })
  if (confsRes.error) throw createError({ statusCode: 500, statusMessage: confsRes.error.message })
  if (catRes.error) throw createError({ statusCode: 500, statusMessage: catRes.error.message })

  const ownContacts = contactsRes.data as unknown as ChapelContact[]

  // COALESCE: use own contacts; if none and we are a branch, fall back to matriz contacts
  let resolvedContacts = ownContacts
  if (ownContacts.length === 0 && needMatriz) {
    const { data: matrizChapel } = await supabase
      .from('chapels')
      .select('id')
      .eq('type', 'matriz' as never)
      .single()

    if (matrizChapel) {
      const { data: matrizContacts } = await supabase
        .from('chapel_contacts')
        .select('id, chapel_id, type, value, sort')
        .eq('chapel_id', (matrizChapel as unknown as { id: string }).id as never)
        .order('sort')

      resolvedContacts = (matrizContacts as unknown as ChapelContact[]) ?? []
    }
  }

  const result: ChapelDetail = {
    ...chapel,
    contacts: resolvedContacts,
    images: imagesRes.data as unknown as ChapelImage[],
    masses: massesRes.data as unknown as Mass[],
    confessions: confsRes.data as unknown as Confession[],
    catechism_groups: catRes.data as unknown as CatechismGroup[],
  }

  return result
})
