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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `[auth/callback] Missing Supabase env vars: ` +
      `URL=${supabaseUrl ? 'set' : 'MISSING'} KEY=${supabaseKey ? 'set' : 'MISSING'}`
    )
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      // Read from the incoming request's cookies
      getAll() {
        return request.cookies.getAll()
      },
      // Write to the outgoing response — this is what actually sets browser cookies
      setAll(cookiesToSet) {
        console.log(
          `[auth/callback] setAll writing ${cookiesToSet.length} cookies: ` +
          `[${cookiesToSet.map(c => c.name).join(', ')}]`
        )
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
  const errorCode  = searchParams.get('error_code')        // e.g. 'otp_expired'
  const errorDesc  = searchParams.get('error_description') // human-readable detail

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
    console.error(
      `${tag} Supabase error — error="${errorParam}" error_code="${errorCode ?? 'n/a'}" desc="${errorDesc ?? 'n/a'}"\n` +
      (errorCode === 'otp_expired'
        ? `  CAUSE: The email confirmation token was already consumed before the user clicked.\n` +
          `  Most common reason: Gmail / Outlook / corporate email scanner made a prefetch GET\n` +
          `  request to the Supabase verify URL (https://[project].supabase.co/auth/v1/verify?token=...)\n` +
          `  which consumed the single-use OTP. When the user actually clicked, the token was gone.\n` +
          `  FIX: Supabase Dashboard → Authentication → Email Templates → enable "Confirm email"\n` +
          `  button-based flow, OR increase OTP expiry (Auth → Config → OTP Expiry).`
        : '')
    )

    // Build the login redirect, preserving error_code so the UI can show a specific message
    const loginUrl = new URL(`${canonical}/login`)
    loginUrl.searchParams.set('error', errorParam)
    if (errorCode)  loginUrl.searchParams.set('error_code', errorCode)
    loginUrl.searchParams.set('next', next)

    return NextResponse.redirect(loginUrl.toString())
  }

  /* ── PKCE code exchange ──────────────────────────────────────────────────── */
  if (code) {
    console.log(`${tag} exchanging PKCE code → session`)

    // Create the redirect response FIRST so we can attach cookies to it
    const successResponse = NextResponse.redirect(`${canonical}${next}`)

    // Build Supabase client that writes to successResponse's cookies
    let supabase
    try {
      supabase = makeSupabaseClient(request, successResponse)
    } catch (envErr) {
      console.error(`${tag} ✗ makeSupabaseClient failed:`, envErr)
      return NextResponse.redirect(`${canonical}/login?error=server_error&next=${encodeURIComponent(next)}`)
    }

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

    // Verify that Set-Cookie headers were actually written to the response
    const setCookieHeaders = successResponse.headers.getSetCookie()
    const sbSetCookies = setCookieHeaders.filter(h => h.startsWith('sb-'))
    console.log(
      `${tag} Set-Cookie headers on response: total=${setCookieHeaders.length} ` +
      `sb-count=${sbSetCookies.length}`
    )
    if (sbSetCookies.length === 0) {
      console.error(
        `${tag} ⚠️  NO sb- Set-Cookie headers on redirect response!\n` +
        `  exchangeCodeForSession succeeded but session cookies were NOT written.\n` +
        `  The user will arrive at ${next} without a session → immediate redirect to /login.\n` +
        `  Check: was setAll() called by the SDK? Check logs above for "setAll writing" line.`
      )
    }

    console.log(`${tag} → redirecting to ${canonical}${next}`)

    // successResponse already has Set-Cookie headers from setAll() above
    return successResponse
  }

  /* ── Token hash flow (magic link / password reset) ──────────────────────── */
  if (tokenHash && type) {
    console.log(`${tag} verifying token_hash type="${type}"`)

    const targetPath = type === 'recovery' ? '/auth/atualizar-senha' : next
    const tokenResponse = NextResponse.redirect(`${canonical}${targetPath}`)

    let supabase
    try {
      supabase = makeSupabaseClient(request, tokenResponse)
    } catch (envErr) {
      console.error(`${tag} ✗ makeSupabaseClient failed:`, envErr)
      return NextResponse.redirect(`${canonical}/login?error=server_error&next=${encodeURIComponent(next)}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any })

    if (error) {
      console.error(
        `${tag} ✗ verifyOtp FAILED\n` +
        `  message : ${error.message}\n` +
        `  code    : ${error.code    ?? 'n/a'}\n` +
        `  status  : ${error.status  ?? 'n/a'}`
      )
      return NextResponse.redirect(
        `${canonical}/login?error=link_expirado&next=${encodeURIComponent(next)}`,
      )
    }

    const userId = data.session?.user?.id ?? 'unknown'
    console.log(`${tag} ✓ OTP verified — user=${userId} → ${canonical}${targetPath}`)

    // Verify cookies were written
    const setCookieHeaders = tokenResponse.headers.getSetCookie()
    console.log(`${tag} Set-Cookie headers: ${setCookieHeaders.length} total`)

    return tokenResponse
  }

  /* ── No code and no token_hash ───────────────────────────────────────────── */
  // This happens when the Supabase project uses Implicit Flow instead of PKCE.
  // In implicit flow the access_token is in the URL *fragment* (#), which is
  // never sent to the server. We return a tiny HTML page (not a redirect) so
  // the browser doesn't navigate away — the JS can then read the hash and
  // redirect to /auth/processing while preserving it.
  //
  // If the hash has no access_token either, fall through to the login error.
  console.warn(
    `${tag} no code or token_hash in query string — serving implicit-flow bounce page.\n` +
    `  If the Supabase project uses PKCE, this should never happen. ` +
    `Check Dashboard → Authentication → Configuration → "Use PKCE flow for email".`
  )

  // The `next` value is already sanitised (relative path only) above.
  const bounceHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Autenticando…</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#070c14;min-height:100vh;display:flex;flex-direction:column;
         align-items:center;justify-content:center;gap:12px;
         font-family:system-ui,-apple-system,sans-serif}
    .spinner{width:20px;height:20px;border:2px solid rgba(168,85,247,.25);
             border-top-color:#a855f7;border-radius:50%;animation:spin .7s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    p{color:#6b7280;font-size:14px}
  </style>
</head>
<body>
  <div class="spinner"></div>
  <p>Autenticando sua conta…</p>
  <script>
  ;(function () {
    var hash   = window.location.hash.slice(1)
    var params = new URLSearchParams(hash)
    var next   = ${JSON.stringify(next)}

    if (params.get('access_token')) {
      // Implicit flow: redirect to client handler, preserving the fragment
      window.location.replace('/auth/processing?next=' + encodeURIComponent(next) + '#' + hash)
    } else if (params.get('error')) {
      // Supabase sent an error in the fragment (e.g. access_denied)
      window.location.replace('/login?error=' + encodeURIComponent(params.get('error')) + '&next=' + encodeURIComponent(next))
    } else {
      // No recognisable params at all — genuine invalid link
      window.location.replace('/login?error=link_invalido&next=' + encodeURIComponent(next))
    }
  })()
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=/login?error=link_invalido">
  </noscript>
</body>
</html>`

  return new Response(bounceHtml, {
    status:  200,
    headers: {
      'Content-Type':  'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
