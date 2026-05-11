import { serverSupabaseServiceRole } from '#supabase/server'
import { getParishId } from '../utils/getParishId'

export interface FooterConfig {
  footer_show: boolean
  footer_motto_latin: string
  footer_motto_pt: string
  footer_display_mode: 'latin_only' | 'both' | 'translation_only'
}

export interface ParishConfig extends FooterConfig {
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
  footer_show: true,
  footer_motto_latin: 'Instaurare omnia in Christo',
  footer_motto_pt: 'Restaurar todas as coisas em Cristo',
  footer_display_mode: 'both',
}

export default defineEventHandler(async (event) => {
  const parishId = getParishId(event)
  const supabase = serverSupabaseServiceRole(event)

  const { data, error } = await supabase
    .from('parish_config')
    .select('parish_id, colors, icon_type, icon_url, home_layout, sections, footer_show, footer_motto_latin, footer_motto_pt, footer_display_mode')
    .eq('parish_id', parishId)
    .maybeSingle()

  if (error) {
    // Footer columns may not exist yet (migration pending) — fall back to base query
    const { data: base } = await supabase
      .from('parish_config')
      .select('parish_id, colors, icon_type, icon_url, home_layout, sections')
      .eq('parish_id', parishId)
      .maybeSingle()
    return { parish_id: parishId, ...DEFAULT, ...(base ?? {}) } as ParishConfig
  }

  return (data ?? { parish_id: parishId, ...DEFAULT }) as ParishConfig
})
