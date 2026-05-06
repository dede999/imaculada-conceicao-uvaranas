export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          parish_role: string
          role: 'admin' | 'editor'
          created_at: string
        }
        Insert: {
          id: string
          name?: string
          parish_role?: string
          role?: 'admin' | 'editor'
        }
        Update: {
          name?: string
          parish_role?: string
          role?: 'admin' | 'editor'
        }
      }
      user_requests: {
        Row: {
          id: string
          name: string
          email: string
          parish_role: string
          status: 'pending' | 'approved' | 'rejected'
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          name: string
          email: string
          parish_role: string
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
        Update: {
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
      }
      noticias: {
        Row: {
          id: string
          slug: string
          title: string
          date: string
          summary: string
          body: string
          published: boolean
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          slug: string
          title: string
          date: string
          summary?: string
          body?: string
          published?: boolean
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          slug?: string
          title?: string
          date?: string
          summary?: string
          body?: string
          published?: boolean
          updated_at?: string
          updated_by?: string | null
        }
      }
      audit_log: {
        Row: {
          id: number
          table_name: string
          record_id: string | null
          action: string
          diff: Record<string, unknown> | null
          actor_id: string | null
          actor_name: string | null
          created_at: string
        }
        Insert: {
          table_name: string
          record_id?: string | null
          action: string
          diff?: Record<string, unknown> | null
          actor_id?: string | null
          actor_name?: string | null
        }
        Update: Record<string, never>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
