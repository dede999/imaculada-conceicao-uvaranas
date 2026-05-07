import { serverSupabaseServiceRole } from '#supabase/server'
import { getParishId } from '../../utils/getParishId'

export interface Pastoral {
  id: string
  slug: string
  name: string
  category: 'liturgia' | 'formacao' | 'social' | 'movimentos' | 'comunicacao'
  summary: string
  coordinator: string
  meetings: string
  body: string
}

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  const { data, error } = await supabase
    .from('pastorais')
    .select('id, slug, name, category, summary, coordinator, meetings, body')
    .eq('parish_id', getParishId(event))
    .order('name')

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data as unknown as Pastoral[]) ?? []
})
