import { requireAuth } from '../../utils/requireAuth'
import { applyParishFilter } from '../../utils/parishGuard'

export interface DashboardData {
  profile: { name: string; role: string }
  stats: {
    noticias_published: number
    noticias_drafts: number
    eventos_upcoming: number
    pastorais: number
    chapels: number
    pending_requests: number | null  // null for editors
  }
  upcoming_eventos: Array<{
    id: string; title: string; date: string; time: string | null; location: string | null
  }>
  recent_log: Array<{
    id: number; action: string; table_name: string; actor_name: string | null; created_at: string
  }> | null  // null for editors
}

export default defineEventHandler(async (event) => {
  const { profile } = await requireAuth(event)
  const isAdmin = profile.role === 'admin'
  const supabase = useServiceRole()
  const today = new Date().toISOString().slice(0, 10)

  const queries = await Promise.all([
    // noticias published count
    applyParishFilter(supabase.from('noticias').select('id', { count: 'exact', head: true }).eq('published', true), profile),
    // noticias drafts count
    applyParishFilter(supabase.from('noticias').select('id', { count: 'exact', head: true }).eq('published', false), profile),
    // upcoming eventos
    applyParishFilter(supabase.from('eventos').select('id', { count: 'exact', head: true })
      .eq('status', 'active').gte('date', today), profile),
    // pastorais count
    applyParishFilter(supabase.from('pastorais').select('id', { count: 'exact', head: true }), profile),
    // chapels count
    applyParishFilter(supabase.from('chapels').select('id', { count: 'exact', head: true }), profile),
    // next 3 eventos detail
    applyParishFilter(supabase.from('eventos')
      .select('id, title, date, time, location')
      .eq('status', 'active').gte('date', today)
      .order('date').limit(3), profile),
    // pending requests (admin only)
    isAdmin
      ? supabase.from('user_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      : Promise.resolve({ count: null, error: null }),
    // recent audit log (admin only)
    isAdmin
      ? supabase.from('audit_log')
          .select('id, action, table_name, actor_name, created_at')
          .order('created_at', { ascending: false }).limit(5)
      : Promise.resolve({ data: null, error: null }),
  ])

  const [
    { count: noticiasPublished },
    { count: noticiasDrafts },
    { count: eventosUpcoming },
    { count: pastoraisCount },
    { count: chapelsCount },
    { data: upcomingEventos },
    { count: pendingRequests },
    { data: recentLog },
  ] = queries

  return {
    profile: { name: profile.name, role: profile.role },
    stats: {
      noticias_published: noticiasPublished ?? 0,
      noticias_drafts: noticiasDrafts ?? 0,
      eventos_upcoming: eventosUpcoming ?? 0,
      pastorais: pastoraisCount ?? 0,
      chapels: chapelsCount ?? 0,
      pending_requests: isAdmin ? (pendingRequests ?? 0) : null,
    },
    upcoming_eventos: (upcomingEventos ?? []) as DashboardData['upcoming_eventos'],
    recent_log: isAdmin ? (recentLog as DashboardData['recent_log']) : null,
  } satisfies DashboardData
})
