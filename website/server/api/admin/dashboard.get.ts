import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAuth } from '../../utils/requireAuth'

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
  const supabase = serverSupabaseServiceRole(event)
  const today = new Date().toISOString().slice(0, 10)

  const queries = await Promise.all([
    // noticias published count
    supabase.from('noticias').select('id', { count: 'exact', head: true }).eq('published', true),
    // noticias drafts count
    supabase.from('noticias').select('id', { count: 'exact', head: true }).eq('published', false),
    // upcoming eventos
    supabase.from('eventos').select('id', { count: 'exact', head: true })
      .eq('status', 'active').gte('date', today),
    // pastorais count
    supabase.from('pastorais').select('id', { count: 'exact', head: true }),
    // chapels count
    supabase.from('chapels').select('id', { count: 'exact', head: true }),
    // next 3 eventos detail
    supabase.from('eventos')
      .select('id, title, date, time, location')
      .eq('status', 'active').gte('date', today)
      .order('date').limit(3),
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
