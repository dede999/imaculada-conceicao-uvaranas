import { requireAdmin } from '../../../utils/requireAdmin'
import { getParishId } from '../../../utils/getParishId'
import type { ParishConfig } from '../../../api/parish-config.get'

const DEFAULT: Omit<ParishConfig, 'parish_id'> = {
  colors: {},
  icon_type: 'tau',
  icon_url: null,
  home_layout: 'standard',
  sections: { instagram: true, ministries: true },
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parishId = getParishId(event)
  const supabase = useServiceRole()

  const { data } = await supabase
    .from('parish_config')
    .select('parish_id, colors, icon_type, icon_url, home_layout, sections')
    .eq('parish_id', parishId)
    .maybeSingle()

  return (data ?? { parish_id: parishId, ...DEFAULT }) as ParishConfig
})
