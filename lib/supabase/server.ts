import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

export async function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  let supabaseAccessToken: string | null = null
  try {
    const { getToken } = await auth()
    supabaseAccessToken = await getToken({ template: 'supabase' })
  } catch (err) {
    // Clerk "supabase" JWT template may not exist yet (404). Use anon client;
    // RLS may restrict access until the template is configured.
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.warn(
        '[Supabase] No Clerk JWT template "supabase" – create it in Clerk Dashboard → JWT Templates. Using anon key only.'
      )
    }
  }

  return createClient(url, key, {
    global: {
      headers: supabaseAccessToken
        ? {
            Authorization: `Bearer ${supabaseAccessToken}`
          }
        : {}
    }
  })
}

/** Admin client for webhook operations (bypasses RLS). Use only in server-side webhooks. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, key)
}
