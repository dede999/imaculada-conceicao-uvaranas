import { getParishId } from '../../utils/getParishId'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChapelContact {
  id: string
  chapel_id: string
  type: 'phone' | 'whatsapp' | 'email' | 'instagram' | 'facebook' | 'youtube' | 'tiktok'
  value: string
  sort: number
}

export interface ChapelImage {
  id: string
  chapel_id: string
  url: string
  caption: string
  sort: number
}

export interface Mass {
  id: string
  chapel_id: string
  day_of_week: number
  time: string
  note: string | null
}

export interface Confession {
  id: string
  chapel_id: string
  day_of_week: number
  time_start: string
  time_end: string
}

export interface CatechismGroup {
  id: string
  chapel_id: string
  group_name: string
  day_of_week: number | null
  time: string | null
}

export interface ChapelListItem {
  id: string
  slug: string
  name: string
  type: 'matriz' | 'branch'
  address: string
  lat: number | null
  lng: number | null
  pastor: string
  sort: number
  contacts: ChapelContact[]
  images: ChapelImage[]
  masses: Mass[]
  confessions: Confession[]
  catechism_groups: CatechismGroup[]
}

// GET /api/chapels — returns all chapels with sub-relations (no body field).
// Branch chapels with no contacts inherit the matriz contacts (COALESCE).

export default defineEventHandler(async (event) => {
  const supabase = useServiceRole()

  const [chapelsRes, contactsRes, imagesRes, massesRes, confsRes, catRes] =
    await Promise.all([
      supabase
        .from('chapels')
        .select('id, slug, name, type, address, lat, lng, pastor, sort')
        .eq('parish_id', getParishId(event))
        .order('sort'),
      supabase
        .from('chapel_contacts')
        .select('id, chapel_id, type, value, sort')
        .order('sort'),
      supabase
        .from('chapel_images')
        .select('id, chapel_id, url, caption, sort')
        .order('sort'),
      supabase
        .from('masses')
        .select('id, chapel_id, day_of_week, time, note')
        .eq('active', true as never)
        .order('day_of_week')
        .order('time'),
      supabase
        .from('confessions')
        .select('id, chapel_id, day_of_week, time_start, time_end')
        .eq('active', true as never)
        .order('day_of_week')
        .order('time_start'),
      supabase
        .from('catechism_groups')
        .select('id, chapel_id, group_name, day_of_week, time')
        .eq('active', true as never),
    ])

  if (chapelsRes.error) throw createError({ statusCode: 500, statusMessage: chapelsRes.error.message })
  if (contactsRes.error) throw createError({ statusCode: 500, statusMessage: contactsRes.error.message })
  if (imagesRes.error) throw createError({ statusCode: 500, statusMessage: imagesRes.error.message })
  if (massesRes.error) throw createError({ statusCode: 500, statusMessage: massesRes.error.message })
  if (confsRes.error) throw createError({ statusCode: 500, statusMessage: confsRes.error.message })
  if (catRes.error) throw createError({ statusCode: 500, statusMessage: catRes.error.message })

  const chapels = chapelsRes.data as unknown as ChapelListItem[]
  const contacts = contactsRes.data as unknown as ChapelContact[]
  const images = imagesRes.data as unknown as ChapelImage[]
  const masses = massesRes.data as unknown as Mass[]
  const confessions = confsRes.data as unknown as Confession[]
  const catechismGroups = catRes.data as unknown as CatechismGroup[]

  // Resolve matriz contacts for COALESCE fallback
  const matriz = chapels.find((c) => c.type === 'matriz')
  const matrizContacts = matriz
    ? contacts.filter((ct) => ct.chapel_id === matriz.id)
    : []

  const result: ChapelListItem[] = chapels.map((chapel) => {
    const ownContacts = contacts.filter((ct) => ct.chapel_id === chapel.id)

    return {
      ...chapel,
      // If a branch has no contacts of its own, fall back to matriz contacts
      contacts: ownContacts.length > 0 ? ownContacts : matrizContacts,
      images: images.filter((img) => img.chapel_id === chapel.id),
      masses: masses.filter((m) => m.chapel_id === chapel.id),
      confessions: confessions.filter((cf) => cf.chapel_id === chapel.id),
      catechism_groups: catechismGroups.filter((cg) => cg.chapel_id === chapel.id),
    }
  })

  return result
})
