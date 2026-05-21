import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import type { H3Event } from 'h3'
import { parseCookies, setCookie } from 'h3'

function getSupabaseEnv() {
  const cfg = useRuntimeConfig()
  return {
    url:        (cfg.public.supabase as { url?: string }).url        || process.env.SUPABASE_URL         || '',
    key:        (cfg.public.supabase as { key?: string }).key        || process.env.SUPABASE_KEY         || '',
    serviceKey: (cfg.supabase        as { serviceKey?: string }).serviceKey || process.env.SUPABASE_SERVICE_KEY || '',
  }
}

export function useServiceRole() {
  const { url, serviceKey } = getSupabaseEnv()
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
}

export function useServerClient(event: H3Event) {
  const { url, key } = getSupabaseEnv()
  return createServerClient(url, key, {
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
  })
}
