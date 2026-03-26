/**
 * GET /auth/callback
 *
 * Supabase Auth PKCE callback handler.
 * Handles two flows:
 *   1. Email confirmation after sign-up  → redirect to ?next= (e.g. /checkout/estrategia)
 *   2. Password reset / magic link       → redirect to /auth/atualizar-senha
 *
 * ── Why we use createServerClient directly (not createClient from server.ts) ──
 *
 * server.ts's createClient() uses `cookies()` from `next/headers`.
 * In Next.js route handlers, next/headers cookies are READ-ONLY — calling
 * cookieStore.set() silently throws (caught by the try/catch in setAll).
 * This means supabase.auth.exchangeCodeForSession() exchanges the code
 * successfully with Supabase's API, but the resulting session tokens are
 * NEVER written as HTTP cookies in the browser.
 *
 * The fix: create the Supabase client with a `setAll` that writes cookies
 * directly onto the NextResponse object being returned. This way the HTTP
 * Set-Cookie headers ARE included in the response and the browser stores them.
 *
 * ── Why we use getSiteUrl() for redirects, NOT new URL(request.url).origin ──
 *
 * request.url may be a Vercel preview URL. Always redirect to the canonical
 * production domain to keep session cookies on the correct domain.
 */

export const runtime = 'nodejs'

import { NextRequest, NextResponse }  from 'next/server'
import { createServerClient }         from '@supabase/ssr'
import { getSiteUrl }                 from '@/lib/get-site-url'

// ─── Helper: Supabase client that writes cookies to a response object ─────────

function makeSupabaseClient(request: NextRequest, response: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  )

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      // Read from the incoming request's cookies
      getAll() {
        return request.cookies.getAll()
      },
      // Write to the outgoing response — this is what actually sets browser cookies
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams, origin: requestOrigin } = new URL(request.url)

  const code       = searchParams.get('code')
  const tokenHash  = searchParams.get('token_hash')
  const type       = searchParams.get('type')
  const rawNext    = searchParams.get('next')
  const errorParam = searchParams.get('error')
  const errorDesc  = searchParams.get('error_description')

  // Validate next — must be a relative path (prevent open redirect)
  const next =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')
      ? rawNext
      : '/aluno'

  const canonical = getSiteUrl()

  const tag = `[auth/callback]`

  // ── Cookie diagnostics (run before anything else) ─────────────────────────
  const allCookies  = request.cookies.getAll()
  const cookieNames = allCookies.map((c) => c.name)
  const sbCookies   = cookieNames.filter((n) => n.startsWith('sb-'))

  // The PKCE code verifier is stored as a cookie by @supabase/ssr during signUp.
  // If it's absent here, exchangeCodeForSession() will ALWAYS fail.
  const verifierCookie = sbCookies.find((n) => n.includes('code-verifier') || n.includes('pkce'))
  console.log(
    `${tag} cookies: total=${cookieNames.length} sb-count=${sbCookies.length} ` +
    `sb-names=[${sbCookies.join(', ')}]`
  )
  if (verifierCookie) {
    console.log(`${tag} ✓ PKCE verifier cookie FOUND: "${verifierCookie}"`)
  } else if (code) {
    console.error(
      `${tag} ✗ PKCE verifier cookie MISSING — exchangeCodeForSession will fail!\n` +
      `  This means the signUp/signIn call that generated the email link did NOT write\n` +
      `  the verifier cookie to the browser (likely a domain mismatch or Server Action\n` +
      `  cookie-write failure). All sb- cookies: [${sbCookies.join(', ')}]`
    )
  }

  console.log(
    `${tag} requestOrigin="${requestOrigin}" canonical="${canonical}" ` +
    `code=${code ? 'present' : 'absent'} ` +
    `token_hash=${tokenHash ? 'present' : 'absent'} ` +
    `type="${type ?? 'n/a'}" next="${next}"`
  )

  if (requestOrigin !== canonical) {
    console.warn(
      `${tag} ⚠️  requestOrigin ≠ canonical — email link was built with wrong domain.\n` +
      `  requestOrigin = "${requestOrigin}"\n` +
      `  canonical     = "${canonical}"\n` +
      `  PKCE verifier was set on "${requestOrigin}" — but we're running on "${canonical}".\n` +
      `  The verifier cookie won't cross domains → exchange will fail.\n` +
      `  Fix: ensure NEXT_PUBLIC_SITE_URL is set correctly on ALL Vercel environments.`
    )
  }

  /* ── Supabase-side error (expired link etc.) ─────────────────────────────── */
  if (errorParam) {
    console.error(`${tag} Supabase error: "${errorParam}" — ${errorDesc}`)
    return NextResponse.redirect(
      `${canonical}/login?error=${encodeURIComponent(errorParam)}&next=${encodeURIComponent(next)}`,
    )
  }

  /* ── PKCE code exchange ──────────────────────────────────────────────────── */
  if (code) {
    console.log(`${tag} exchanging PKCE code → session`)

    // Create the redirect response FIRST so we can attach cookies to it
    const successResponse = NextResponse.redirect(`${canonical}${next}`)

    // Build Supabase client that writes to successResponse's cookies
    const supabase = makeSupabaseClient(request, successResponse)

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error(
        `${tag} ✗ exchangeCodeForSession FAILED\n` +
        `  message : ${error.message}\n` +
        `  code    : ${error.code    ?? 'n/a'}\n` +
        `  status  : ${error.status  ?? 'n/a'}\n` +
        `  hint    : ${!verifierCookie ? 'PKCE verifier was missing — domain mismatch likely' : 'verifier present — possible expired/already-used code'}`
      )
      return NextResponse.redirect(
        `${canonical}/login?error=link_expirado&next=${encodeURIComponent(next)}`,
      )
    }

    const userId = data.session?.user?.id ?? 'unknown'
    console.log(`${tag} ✓ session exchanged — user=${userId}`)
    console.log(`${tag} → redirecting to ${canonical}${next}`)

    // successResponse already has Set-Cookie headers from setAll() above
    return successResponse
  }

  /* ── Token hash flow (magic link / password reset) ──────────────────────── */
  if (tokenHash && type) {
    console.log(`${tag} verifying token_hash type="${type}"`)

    const targetPath = type === 'recovery' ? '/auth/atualizar-senha' : next
    const tokenResponse = NextResponse.redirect(`${canonical}${targetPath}`)

    const supabase = makeSupabaseClient(request, tokenResponse)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any })

    if (error) {
      console.error(`${tag} verifyOtp failed: ${error.message}`)
      return NextResponse.redirect(
        `${canonical}/login?error=link_expirado&next=${encodeURIComponent(next)}`,
      )
    }

    const userId = data.session?.user?.id ?? 'unknown'
    console.log(`${tag} ✓ OTP verified — user=${userId} → ${canonical}${targetPath}`)

    return tokenResponse
  }

  /* ── No code and no token_hash ───────────────────────────────────────────── */
  console.warn(`${tag} no code or token_hash — redirecting to login`)
  return NextResponse.redirect(`${canonical}/login?error=link_invalido`)
}
