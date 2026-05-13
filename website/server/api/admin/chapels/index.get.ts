import { requireAuth } from '../../../utils/requireAuth'
import { applyParishFilter } from '../../../utils/parishGuard'
import type { ChapelListItem, ChapelContact, ChapelImage, Mass, Confession, CatechismGroup } from '../../chapels/index.get'

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const supabase = useServiceRole()

  const [chapelsRes, contactsRes, imagesRes, massesRes, confsRes, catRes] = await Promise.all([
    applyParishFilter(supabase.from('chapels').select('id, slug, name, type, address, lat, lng, pastor, body, sort').order('sort'), profile),
    supabase.from('chapel_contacts').select('id, chapel_id, type, value, sort').order('sort'),
    supabase.from('chapel_images').select('id, chapel_id, url, caption, sort').order('sort'),
    supabase.from('masses').select('id, chapel_id, day_of_week, time, note, active').order('day_of_week').order('time'),
    supabase.from('confessions').select('id, chapel_id, day_of_week, time_start, time_end, active').order('day_of_week').order('time_start'),
    supabase.from('catechism_groups').select('id, chapel_id, group_name, day_of_week, time, active'),
  ])

  if (chapelsRes.error) throw createError({ statusCode: 500, statusMessage: chapelsRes.error.message })

  const chapels = chapelsRes.data as unknown as (ChapelListItem & { body: string })[]
  const contacts = (contactsRes.data ?? []) as unknown as ChapelContact[]
  const images = (imagesRes.data ?? []) as unknown as ChapelImage[]
  const masses = (massesRes.data ?? []) as unknown as (Mass & { active: boolean })[]
  const confessions = (confsRes.data ?? []) as unknown as (Confession & { active: boolean })[]
  const catechism = (catRes.data ?? []) as unknown as (CatechismGroup & { active: boolean })[]

  return chapels.map(chapel => ({
    ...chapel,
    contacts: contacts.filter(c => c.chapel_id === chapel.id),
    images: images.filter(i => i.chapel_id === chapel.id),
    masses: masses.filter(m => m.chapel_id === chapel.id),
    confessions: confessions.filter(c => c.chapel_id === chapel.id),
    catechism_groups: catechism.filter(c => c.chapel_id === chapel.id),
  }))
})
