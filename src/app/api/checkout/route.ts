/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for the authenticated user.
 * Returns { url } — client redirects to Stripe hosted page.
 *
 * ⚠️  MUST run in Node.js runtime.
 *    Stripe SDK uses node:http / node:https — unavailable in Edge Runtime.
 *    Supabase getUser() makes a network call — also unreliable in Edge.
 */
export const runtime = 'nodejs'

import { NextRequest, NextResponse }  from 'next/server'
import { createServerClient }         from '@supabase/ssr'
import { buildStripeSession, getSiteUrl } from '@/lib/stripe-session'
import { trackProductEvent }          from '@/lib/analytics'

// ─── Supabase client scoped to the incoming request (read-only cookies OK) ───
// Route handlers can read cookies but not set them via next/headers.
// For this endpoint we only READ the session, so that's fine.

function makeSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  )

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      // We don't need to set cookies here (read-only is fine for auth check)
      setAll() {},
    },
  })
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const reqId = Math.random().toString(36).slice(2, 8)
  const tag   = `[api/checkout id=${reqId}]`

  console.log(`${tag} ── POST received ──`)
  console.log(`${tag} host="${request.headers.get('host')}" origin="${request.headers.get('origin')}"`)
  console.log(`${tag} url="${request.url}"`)

  // ── Cookie diagnostics ────────────────────────────────────────────────────
  const allCookies  = request.cookies.getAll()
  const cookieNames = allCookies.map((c) => c.name)
  const sbCookies   = cookieNames.filter((n) => n.startsWith('sb-'))
  console.log(`${tag} cookies total=${cookieNames.length} supabase=${sbCookies.length} names=[${sbCookies.join(', ')}]`)

  if (sbCookies.length === 0) {
    console.warn(
      `${tag} ⚠️  No Supabase cookies found in request.\n` +
      `  This means the browser did not send session cookies with this POST request.\n` +
      `  Likely cause: session was never written to cookies (e.g. auth/callback did not set them),\n` +
      `  or cookies are on a different domain than this request.\n` +
      `  All cookie names received: [${cookieNames.join(', ')}]`
    )
  }

  // ── 1. Parse body ────────────────────────────────────────────────────────
  let planSlug: string | undefined
  try {
    const body = await request.json() as { planSlug?: string }
    planSlug   = body.planSlug?.trim()
  } catch {
    console.error(`${tag} body parse failed`)
    return NextResponse.json(
      { error: 'Corpo inválido. Envie JSON: { planSlug: "estrategia" }' },
      { status: 400 },
    )
  }

  console.log(`${tag} planSlug="${planSlug}"`)

  if (!planSlug) {
    return NextResponse.json({ error: 'planSlug é obrigatório.' }, { status: 400 })
  }
  if (planSlug === 'trial') {
    return NextResponse.json({ error: 'Plano trial não requer pagamento.' }, { status: 400 })
  }

  // ── 2. Authenticate ──────────────────────────────────────────────────────
  const supabase = makeSupabaseClient(request)

  // getUser() verifies the JWT with Supabase's API (authoritative).
  // Never use getSession() for authorization — it trusts the local JWT
  // without server verification and can be spoofed.
  const { data: userData, error: authErr } = await supabase.auth.getUser()
  console.log(
    `${tag} getUser() → ` +
    (userData.user
      ? `user=${userData.user.id} email=${userData.user.email}`
      : `null${authErr ? ` error=${authErr.message}` : ''}`)
  )

  if (authErr) {
    console.warn(`${tag} getUser() error code=${authErr.status} msg=${authErr.message}`)
  }

  const user = userData.user

  if (!user) {
    console.log(`${tag} → 401 unauthenticated`)
    return NextResponse.json(
      { error: 'Você precisa estar logado para realizar o pagamento.' },
      { status: 401 },
    )
  }

  // ── 3. Fetch user profile ────────────────────────────────────────────────
  let email    = user.email ?? ''
  let fullName = ''

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data: profile, error: profileErr } = await db
      .from('users')
      .select('email, full_name, stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileErr) {
      console.warn(`${tag} profile fetch error (non-fatal):`, profileErr.message)
    } else if (profile) {
      email    = profile.email     || email
      fullName = profile.full_name || ''
      console.log(`${tag} profile: name="${fullName}" email=${email}`)
    } else {
      console.warn(`${tag} no profile row for user ${user.id}`)
    }
  } catch (err) {
    console.warn(`${tag} profile fetch threw (non-fatal):`, err)
  }

  // ── 4. Build Stripe session ──────────────────────────────────────────────
  console.log(`${tag} calling buildStripeSession`)

  let stripeUrl: string
  try {
    stripeUrl = await buildStripeSession({
      userId:    user.id,
      email,
      name:      fullName,
      planSlug,
      // Logged-in upgrade users should return to their upgrade page, not the public checkout
      cancelUrl: `${getSiteUrl()}/aluno/upgrade?cancelado=1`,
    })
  } catch (err) {
    const raw      = err instanceof Error ? err.message : String(err)
    const isStripe = raw.toLowerCase().includes('stripe') ||
                     raw.toLowerCase().includes('connection') ||
                     raw.toLowerCase().includes('network')

    console.error(`${tag} buildStripeSession threw: ${raw}`)
    if (err instanceof Error && err.stack) {
      console.error(`${tag} stack: ${err.stack.split('\n').slice(0, 4).join(' | ')}`)
    }

    if (raw.includes('não encontrado') || raw.includes('inativo')) {
      return NextResponse.json({ error: raw }, { status: 404 })
    }
    if (isStripe) {
      return NextResponse.json(
        { error: 'Não foi possível conectar ao sistema de pagamento. Tente novamente.' },
        { status: 502 },
      )
    }
    return NextResponse.json({ error: `Erro ao iniciar pagamento: ${raw}` }, { status: 500 })
  }

  // Track checkout_started for authenticated upgrade flow
  trackProductEvent('checkout_started', user.id, { plan_slug: planSlug, source: 'upgrade_page' })

  console.log(`${tag} ✓ Stripe URL ready`)
  return NextResponse.json({ url: stripeUrl })
}
