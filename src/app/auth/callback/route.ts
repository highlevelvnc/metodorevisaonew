/**
 * GET /auth/callback
 *
 * Supabase Auth PKCE callback handler.
 * Triggered in two scenarios:
 *   1. Email confirmation after sign-up  → redirects to ?next= (e.g. /checkout/estrategia)
 *   2. Password reset link               → redirects to /auth/atualizar-senha
 *
 * ⚠️  IMPORTANT — why we use getSiteUrl() and NOT `request.url` origin:
 *
 *     If the emailRedirectTo was accidentally built with the preview/deployment
 *     URL (e.g. myapp-abc123.vercel.app), this callback will receive the request
 *     on that preview domain. Using `new URL(request.url).origin` as the redirect
 *     target would keep the user on the preview domain — where their session cookie
 *     (scoped to the production domain) doesn't work and they appear logged-out.
 *
 *     By always redirecting to getSiteUrl() (NEXT_PUBLIC_SITE_URL), we guarantee
 *     the user lands on the correct production domain regardless of which domain
 *     received the auth callback request.
 *
 * Supabase Dashboard → Authentication → URL Configuration must include:
 *   https://metodorevisao.com/auth/callback
 *   http://localhost:3000/auth/callback
 */

export const runtime = 'nodejs'

import { NextResponse }  from 'next/server'
import { createClient }  from '@/lib/supabase/server'
import { getSiteUrl }    from '@/lib/get-site-url'

export async function GET(request: Request) {
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

  // ⚠️  Use canonical URL, NOT requestOrigin.
  // requestOrigin may be a Vercel preview URL if the email link was built wrong.
  const canonical = getSiteUrl()

  const tag = `[auth/callback]`
  console.log(
    `${tag} requestOrigin="${requestOrigin}" canonical="${canonical}" ` +
    `code=${code ? 'yes' : 'no'} token_hash=${tokenHash ? 'yes' : 'no'} ` +
    `type="${type}" next="${next}"`
  )

  if (requestOrigin !== canonical) {
    console.warn(
      `${tag} ⚠️  requestOrigin (${requestOrigin}) ≠ canonical (${canonical}). ` +
      `This means the email link was built with the wrong domain. ` +
      `Redirecting to canonical URL after session exchange. ` +
      `Fix: ensure NEXT_PUBLIC_SITE_URL is set on ALL Vercel environments (Production + Preview + Development).`
    )
  }

  const supabase = await createClient()

  /* ── Supabase-side error (e.g. expired link) ──────────────────────────── */
  if (errorParam) {
    console.error(`${tag} Supabase error: "${errorParam}" — ${errorDesc}`)
    return NextResponse.redirect(
      `${canonical}/login?error=${encodeURIComponent(errorParam)}&next=${encodeURIComponent(next)}`,
    )
  }

  /* ── PKCE code exchange ────────────────────────────────────────────────── */
  if (code) {
    console.log(`${tag} exchanging PKCE code for session`)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error(`${tag} exchangeCodeForSession failed: ${error.message} (code: ${error.code ?? 'n/a'})`)
      return NextResponse.redirect(
        `${canonical}/login?error=link_expirado&next=${encodeURIComponent(next)}`,
      )
    }

    console.log(`${tag} ✓ session established — user=${data.session?.user?.id ?? 'unknown'}`)
    console.log(`${tag} → redirecting to ${canonical}${next}`)
    return NextResponse.redirect(`${canonical}${next}`)
  }

  /* ── Token hash flow (magic link / recovery) ──────────────────────────── */
  if (tokenHash && type) {
    console.log(`${tag} verifying token_hash type="${type}"`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any })

    if (error) {
      console.error(`${tag} verifyOtp failed: ${error.message}`)
      return NextResponse.redirect(
        `${canonical}/login?error=link_expirado&next=${encodeURIComponent(next)}`,
      )
    }

    console.log(`${tag} ✓ OTP verified — user=${data.session?.user?.id ?? 'unknown'}`)

    if (type === 'recovery') {
      console.log(`${tag} recovery flow → /auth/atualizar-senha`)
      return NextResponse.redirect(`${canonical}/auth/atualizar-senha`)
    }

    console.log(`${tag} → redirecting to ${canonical}${next}`)
    return NextResponse.redirect(`${canonical}${next}`)
  }

  /* ── Neither code nor token_hash ─────────────────────────────────────── */
  console.warn(`${tag} no code or token_hash present → /login`)
  return NextResponse.redirect(`${canonical}/login?error=link_invalido`)
}
