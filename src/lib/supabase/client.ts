import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Client-side Supabase client.
 * Use in Client Components ('use client').
 */
export function createClient() {
  // Supabase renomeou a chave em projetos novos; suporta ambas as variantes
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey
  )
}
