import type { SupabaseClient } from '@supabase/supabase-js'

interface AuditEntry {
  table_name: string
  record_id: string
  action: string
  actor_id: string
  actor_name: string
  parish_id?: string
  diff?: Record<string, [unknown, unknown]> | null
}

export async function insertAuditLog(supabase: SupabaseClient, entry: AuditEntry) {
  await supabase.from('audit_log').insert(entry as never)
}
