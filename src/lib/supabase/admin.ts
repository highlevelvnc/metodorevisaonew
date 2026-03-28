import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Supabase admin client using the service role key.
 * - Bypasses Row Level Security entirely.
 * - Use ONLY in server-side contexts (Route Handlers, webhooks).
 * - NEVER import in client components or expose to the browser.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set.')
  }
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your .env.local for local dev ' +
      'and to your Vercel environment variables for production.'
    )
  }

  return createClient<Database>(
    supabaseUrl,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
