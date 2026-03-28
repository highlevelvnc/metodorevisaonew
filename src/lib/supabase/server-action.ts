/**
 * server-action.ts — Supabase client for Server Actions ONLY.
 *
 * Why this exists:
 *   server.ts wraps cookieStore.set() in a silent try/catch because
 *   Server Components legitimately can't write cookies. But that same
 *   silence means if set() fails inside a Server Action (e.g. PKCE
 *   verifier on signUp), we have zero visibility — the verifier is
 *   lost and email confirmation silently breaks.
 *
 *   This client logs cookie writes (success) and logs failures as
 *   CRITICAL errors, so Vercel logs will show the exact failure point.
 *
 * Use in:  src/lib/actions/auth.ts (signIn, signUp)
 *          src/lib/actions/checkout.ts (signUpAndCheckout)
 *
 * Do NOT use in Server Components — their cookies() is read-only and
 * set() will throw; the error log would be a false positive.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies }            from 'next/headers'
import type { Database }      from './types'

export async function createActionClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  if (!supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
            // Only log auth-related cookies to keep noise down
            const authCookies = cookiesToSet.map((c) => c.name).filter((n) => n.startsWith('sb-'))
            if (authCookies.length > 0) {
              console.log(`[supabase/action] ✓ cookies written: [${authCookies.join(', ')}]`)
            }
          } catch (err) {
            // ⚠️  If you see this in Vercel logs, the PKCE verifier was NOT written.
            // Email confirmation links will fail: exchangeCodeForSession() will return
            // "invalid grant" because the verifier is missing.
            //
            // Possible causes:
            //   1. This function is being called from a Server Component (expected — safe to ignore)
            //   2. Next.js cookies() API returned a read-only store in a Server Action context
            //      (bug — check Next.js version / Vercel deployment)
            //   3. Response headers were already sent (shouldn't happen in Server Actions)
            console.error(
              '[supabase/action] ✗ CRITICAL: setAll() failed — PKCE verifier NOT written!\n' +
              '  Cookies attempted : ' + cookiesToSet.map((c) => c.name).join(', ') + '\n' +
              '  Error             : ' + (err instanceof Error ? err.message : String(err)) + '\n' +
              '  Impact            : Email confirmation will fail (missing code verifier)\n' +
              '  Check             : Is this called from a Server Action (OK) or Server Component (not OK)?'
            )
          }
        },
      },
    }
  )
}
