import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import type { H3Event } from 'h3'
import { parseCookies, setCookie } from 'h3'

export function useServiceRole() {
  const { public: { supabase: { url } }, supabase: { serviceKey } } = useRuntimeConfig()
  return createClient(
    url,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

export function useServerClient(event: H3Event) {
  const { public: { supabase: { url, key } } } = useRuntimeConfig()
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
