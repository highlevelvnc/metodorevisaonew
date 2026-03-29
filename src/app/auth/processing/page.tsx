/**
 * /auth/processing — Client-side session handler for Supabase Implicit Flow.
 *
 * When does this page run?
 *   Only when the Supabase project sends auth tokens via URL fragment (#access_token=...)
 *   instead of via PKCE code (?code=...). This is the "Implicit Flow" configuration.
 *
 * How it works:
 *   1. auth/callback/route.ts detects no ?code or ?token_hash in query string
 *   2. Returns a tiny HTML page (NOT a redirect — redirecting would lose the fragment)
 *   3. Client-side JS reads window.location.hash, redirects here preserving the fragment
 *   4. THIS PAGE loads — URL is: /auth/processing?next=...#access_token=XXX&...
 *   5. createBrowserClient initialises with detectSessionInUrl:true (default)
 *   6. Supabase JS reads window.location.hash, processes the implicit session
 *   7. Fires SIGNED_IN → onAuthStateChange → we redirect to `next`
 *   8. Session is stored in cookies by createBrowserClient's document.cookie adapter
 *   9. All subsequent server-side requests (middleware, /api/checkout) see the session
 *
 * ⚠️  The long-term fix is to enable PKCE in the Supabase Dashboard:
 *     Authentication → Configuration → ✓ "Use PKCE flow for email"
 *     With PKCE, this page is never needed — the server handles everything.
 */

import { Suspense } from 'react'
import ProcessingInner from './ProcessingInner'

function Spinner() {
  return (
    <div className="min-h-screen bg-[var(--bg-body)] flex flex-col items-center justify-center gap-3">
      <span
        className="w-5 h-5 border-2 border-t-purple-400 rounded-full animate-spin"
        style={{ borderColor: 'rgba(168,85,247,.25)', borderTopColor: '#a855f7' }}
      />
      <p className="text-sm text-gray-500">Autenticando…</p>
    </div>
  )
}

export default function AuthProcessingPage() {
  return (
    // useSearchParams() inside ProcessingInner requires Suspense boundary
    <Suspense fallback={<Spinner />}>
      <ProcessingInner />
    </Suspense>
  )
}
