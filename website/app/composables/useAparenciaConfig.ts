import type { ParishConfig } from '~/server/api/parish-config.get'
import type { HistoryEntry } from '~/server/api/admin/configuracoes/historico.get'

const DEFAULT_COLORS: Record<string, string> = {
  '--fr-950': '#412402', '--fr-800': '#633806', '--fr-600': '#854F0B',
  '--fr-400': '#BA7517', '--fr-200': '#EF9F27', '--fr-50':  '#FAEEDA',
  '--cv-950': '#04342C', '--cv-600': '#0F6E56', '--cv-400': '#1D9E75',
  '--cv-50':  '#E1F5EE',
}

export function useAparenciaConfig() {
  const { t } = useI18n()

  const AMBER_TOKENS = [
    { key: '--fr-950', label: () => t('admin.aparencia.colors.fr_950') },
    { key: '--fr-800', label: () => t('admin.aparencia.colors.fr_800') },
    { key: '--fr-600', label: () => t('admin.aparencia.colors.fr_600') },
    { key: '--fr-400', label: () => t('admin.aparencia.colors.fr_400') },
    { key: '--fr-200', label: () => t('admin.aparencia.colors.fr_200') },
    { key: '--fr-50',  label: () => t('admin.aparencia.colors.fr_50') },
  ]

  const TEAL_TOKENS = [
    { key: '--cv-950', label: () => t('admin.aparencia.colors.cv_950') },
    { key: '--cv-600', label: () => t('admin.aparencia.colors.cv_600') },
    { key: '--cv-400', label: () => t('admin.aparencia.colors.cv_400') },
    { key: '--cv-50',  label: () => t('admin.aparencia.colors.cv_50') },
  ]

  const { data: remote, refresh: refreshConfig } = useAsyncData(
    'admin-aparencia',
    () => $fetch<ParishConfig>('/api/admin/configuracoes/aparencia'),
    { server: false },
  )

  const { data: history, refresh: refreshHistory } = useAsyncData(
    'admin-aparencia-history',
    () => $fetch<HistoryEntry[]>('/api/admin/configuracoes/historico'),
    { server: false },
  )

  const colors   = ref<Record<string, string>>({ ...DEFAULT_COLORS })
  const iconType = ref<'tau' | 'sacred_heart' | 'custom'>('tau')
  const iconUrl  = ref<string>('')
  const sections = ref({ instagram: true, ministries: true })

  watch(remote, (cfg) => {
    if (!cfg) return
    colors.value   = { ...DEFAULT_COLORS, ...cfg.colors }
    iconType.value = cfg.icon_type
    iconUrl.value  = cfg.icon_url ?? ''
    sections.value = { ...cfg.sections }
  }, { immediate: true })

  const previewStyle = computed(() =>
    Object.entries(colors.value).map(([k, v]) => `${k}: ${v}`).join('; ')
  )

  const saving      = ref(false)
  const saveMessage = ref<{ type: 'ok' | 'err'; text: string } | null>(null)
  let   saveTimer:  ReturnType<typeof setTimeout> | null = null

  async function save() {
    saving.value = true
    saveMessage.value = null
    try {
      const overrides: Record<string, string> = {}
      for (const [k, v] of Object.entries(colors.value)) {
        if (v !== DEFAULT_COLORS[k]) overrides[k] = v
      }
      await $fetch('/api/admin/configuracoes/aparencia', {
        method: 'PATCH',
        body: {
          colors: overrides,
          icon_type: iconType.value,
          icon_url: iconUrl.value || null,
          home_layout: remote.value?.home_layout ?? 'standard',
          sections: sections.value,
        },
      })
      saveMessage.value = { type: 'ok', text: t('admin.aparencia.saved') }
      await Promise.all([refreshConfig(), refreshHistory(), refreshNuxtData('parish-config')])
    }
    catch {
      saveMessage.value = { type: 'err', text: t('admin.aparencia.save_error') }
    }
    finally {
      saving.value = false
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(() => { saveMessage.value = null }, 4000)
    }
  }

  function resetColors() {
    colors.value = { ...DEFAULT_COLORS }
  }

  const restoring      = ref<number | null>(null)
  const restoreMessage = ref<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function restore(id: number) {
    restoring.value = id
    restoreMessage.value = null
    try {
      await $fetch('/api/admin/configuracoes/desfazer', {
        method: 'POST',
        body: { history_id: id },
      })
      restoreMessage.value = { type: 'ok', text: t('admin.aparencia.history.restored') }
      await Promise.all([refreshConfig(), refreshHistory(), refreshNuxtData('parish-config')])
    }
    catch {
      restoreMessage.value = { type: 'err', text: t('admin.aparencia.history.restore_error') }
    }
    finally {
      restoring.value = null
      setTimeout(() => { restoreMessage.value = null }, 4000)
    }
  }

  return {
    AMBER_TOKENS, TEAL_TOKENS,
    colors, iconType, iconUrl, sections, previewStyle,
    saving, saveMessage, save, resetColors,
    history, restoring, restoreMessage, restore,
  }
}
