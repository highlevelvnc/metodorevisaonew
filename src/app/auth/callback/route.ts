/**
 * GET /auth/callback
 *
 * Supabase Auth PKCE callback handler. Used in two scenarios:
 *   1. Email confirmation after sign-up  → redirects to ?next= (e.g. /checkout/estrategia)
 *   2. Password reset link               → redirects to /auth/atualizar-senha
 *
 * Supabase sends the user here with ?code=xxx (PKCE) or ?token_hash=xxx&type=email.
 * We exchange the code/token for a session cookie, then redirect to the intended page.
 *
 * Supabase Dashboard → Authentication → URL Configuration must include:
 *   https://metodorevisao.com/auth/callback    (or your domain)
 *   http://localhost:3000/auth/callback        (for local dev)
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  const code       = searchParams.get('code')
  const tokenHash  = searchParams.get('token_hash')
  const type       = searchParams.get('type')  // 'email' | 'recovery' | etc.
  const rawNext    = searchParams.get('next')
  const errorParam = searchParams.get('error')
  const errorDesc  = searchParams.get('error_description')

  // Validate next to prevent open redirect — must be a relative path
  const next = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')
    ? rawNext
    : '/aluno'

  const tag = `[auth/callback]`
  console.log(`${tag} code=${code ? 'present' : 'absent'} token_hash=${tokenHash ? 'present' : 'absent'} type=${type} next=${next}`)

  /* ── Supabase-side error (e.g. expired link) ──────────────────────────── */
  if (errorParam) {
    console.error(`${tag} Supabase error: ${errorParam} — ${errorDesc}`)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorParam)}&next=${encodeURIComponent(next)}`,
    )
  }

  const supabase = await createClient()

  /* ── PKCE code exchange ────────────────────────────────────────────────── */
  if (code) {
    console.log(`${tag} exchanging code for session`)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error(`${tag} exchangeCodeForSession failed:`, error.message, '| code:', error.code ?? 'n/a')
      // Link may be expired or already used
      return NextResponse.redirect(
        `${origin}/login?error=link_expirado&next=${encodeURIComponent(next)}`,
      )
    }

    console.log(`${tag} session established for user=${data.session?.user?.id ?? 'unknown'}`)
    console.log(`${tag} redirecting to: ${next}`)
    return NextResponse.redirect(`${origin}${next}`)
  }

  /* ── Token hash flow (magic link / recovery) ──────────────────────────── */
  if (tokenHash && type) {
    console.log(`${tag} verifying token_hash type=${type}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any })

    if (error) {
      console.error(`${tag} verifyOtp failed:`, error.message)
      return NextResponse.redirect(
        `${origin}/login?error=link_expirado&next=${encodeURIComponent(next)}`,
      )
    }

    console.log(`${tag} OTP verified for user=${data.session?.user?.id ?? 'unknown'}`)

    // Recovery (password reset) → send to password update page
    if (type === 'recovery') {
      console.log(`${tag} recovery flow — redirecting to /auth/atualizar-senha`)
      return NextResponse.redirect(`${origin}/auth/atualizar-senha`)
    }

    console.log(`${tag} redirecting to: ${next}`)
    return NextResponse.redirect(`${origin}${next}`)
  }

  /* ── No code and no token_hash ────────────────────────────────────────── */
  console.warn(`${tag} no code or token_hash present — redirecting to login`)
  return NextResponse.redirect(`${origin}/login?error=link_invalido`)
}
