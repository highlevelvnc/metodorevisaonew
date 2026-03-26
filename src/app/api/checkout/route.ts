/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for the authenticated user.
 * Returns { url } — client redirects to Stripe hosted page.
 *
 * ⚠️  MUST run in Node.js runtime.
 *    Stripe SDK uses node:http / node:https which are unavailable in Edge Runtime.
 *    Supabase getUser() also makes a network call that can silently fail in Edge.
 */
export const runtime = 'nodejs'

import { NextResponse }       from 'next/server'
import { createClient }       from '@/lib/supabase/server'
import { buildStripeSession } from '@/lib/stripe-session'

export async function POST(req: Request) {
  const reqId = Math.random().toString(36).slice(2, 8)
  const tag   = `[api/checkout id=${reqId}]`

  console.log(`${tag} ── request received ──`)

  // ── 1. Parse body ───────────────────────────────────────────────────────────
  let planSlug: string | undefined
  try {
    const body = await req.json() as { planSlug?: string }
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

  // ── 2. Authenticate ─────────────────────────────────────────────────────────
  let user: Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>['auth']['getUser']>>['data']['user']

  try {
    const supabase = await createClient()
    const { data, error: authErr } = await supabase.auth.getUser()

    if (authErr) {
      // Supabase returns an error when the session is absent or expired
      console.warn(`${tag} getUser() error: code=${authErr.status} msg=${authErr.message}`)
    }

    user = data.user
    console.log(`${tag} auth: user=${user?.id ?? 'null'} email=${user?.email ?? 'n/a'}`)
  } catch (err) {
    console.error(`${tag} getUser() threw unexpectedly:`, err)
    return NextResponse.json(
      { error: 'Erro ao verificar sessão. Recarregue a página e tente novamente.' },
      { status: 500 },
    )
  }

  if (!user) {
    console.log(`${tag} → 401 unauthenticated`)
    return NextResponse.json(
      { error: 'Você precisa estar logado para realizar o pagamento.' },
      { status: 401 },
    )
  }

  // ── 3. Fetch user profile (name for Stripe customer) ────────────────────────
  let email    = user.email ?? ''
  let fullName = ''

  try {
    const supabase = await createClient()
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
      email    = profile.email    || email
      fullName = profile.full_name || ''
      console.log(`${tag} profile: name="${fullName}" email=${email}`)
    } else {
      console.warn(`${tag} no profile row found for user ${user.id} (new user, proceeding)`)
    }
  } catch (err) {
    console.warn(`${tag} profile fetch threw (non-fatal):`, err)
  }

  // ── 4. Build Stripe session ──────────────────────────────────────────────────
  console.log(`${tag} calling buildStripeSession`)

  let stripeUrl: string
  try {
    stripeUrl = await buildStripeSession({
      userId:   user.id,
      email,
      name:     fullName,
      planSlug,
    })
  } catch (err) {
    const raw     = err instanceof Error ? err.message : String(err)
    const isStripe = raw.toLowerCase().includes('stripe') ||
                     raw.toLowerCase().includes('connection') ||
                     raw.toLowerCase().includes('network')

    console.error(`${tag} buildStripeSession threw:`, raw)
    if (err instanceof Error && err.stack) {
      console.error(`${tag} stack:`, err.stack.split('\n').slice(0, 5).join(' | '))
    }

    if (raw.includes('não encontrado') || raw.includes('inativo')) {
      return NextResponse.json({ error: raw }, { status: 404 })
    }
    if (isStripe) {
      return NextResponse.json(
        { error: 'Não foi possível conectar ao sistema de pagamento. Tente novamente em alguns instantes.' },
        { status: 502 },
      )
    }
    return NextResponse.json(
      { error: `Erro ao iniciar pagamento: ${raw}` },
      { status: 500 },
    )
  }

  console.log(`${tag} ✓ returning Stripe URL`)
  return NextResponse.json({ url: stripeUrl })
}
