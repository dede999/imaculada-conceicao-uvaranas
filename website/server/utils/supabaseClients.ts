import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import type { H3Event } from 'h3'
import { parseCookies, setCookie } from 'h3'

export function useServiceRole() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

export function useServerClient(event: H3Event) {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = parseCookies(event)
          return Object.entries(cookies).map(([name, value]) => ({ name, value }))
        },
        setAll(cookies) {
          for (const { name, value, options } of cookies) {
            setCookie(event, name, value, options as Parameters<typeof setCookie>[3])
          }
        },
      },
    },
  )
}
