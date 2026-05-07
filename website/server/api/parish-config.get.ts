import { serverSupabaseServiceRole } from '#supabase/server'
import { getParishId } from '../utils/getParishId'

export interface ParishConfig {
  parish_id: string
  colors: Record<string, string>
  icon_type: 'tau' | 'sacred_heart' | 'custom'
  icon_url: string | null
  home_layout: string
  sections: { instagram: boolean; ministries: boolean }
}

const DEFAULT: Omit<ParishConfig, 'parish_id'> = {
  colors: {},
  icon_type: 'tau',
  icon_url: null,
  home_layout: 'standard',
  sections: { instagram: true, ministries: true },
}

export default defineEventHandler(async (event) => {
  const parishId = getParishId(event)
  const supabase = serverSupabaseServiceRole(event)

  const { data } = await supabase
    .from('parish_config')
    .select('parish_id, colors, icon_type, icon_url, home_layout, sections')
    .eq('parish_id', parishId)
    .maybeSingle()

  return (data ?? { parish_id: parishId, ...DEFAULT }) as ParishConfig
})
