import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildStripeSession } from '@/lib/actions/checkout'

/**
 * POST /api/checkout
 * Body: { planSlug: 'evolucao' | 'estrategia' | 'intensivo' }
 *
 * Creates a Stripe Checkout Session for the authenticated user and returns
 * the hosted Checkout URL. The client redirects to that URL.
 *
 * Used by:
 * - ProceedButton (logged-in user on /checkout/[planSlug])
 * - LandingCheckoutButton (any page, redirects to /login if 401)
 *
 * After payment Stripe redirects to:
 *   success → /aluno/upgrade/sucesso?session_id={CHECKOUT_SESSION_ID}
 *   cancel  → /checkout/[planSlug]?cancelado=1
 */
export async function POST(req: Request) {
  const requestId = Math.random().toString(36).slice(2, 8)
  const tag = `[api/checkout req=${requestId}]`

  try {
    /* ── Parse body first (before auth, so we can log planSlug) ──────────── */
    let planSlug: string | undefined
    try {
      const body = await req.json()
      planSlug = (body as { planSlug?: string }).planSlug?.trim()
    } catch {
      console.error(`${tag} failed to parse request body`)
      return NextResponse.json(
        { error: 'Corpo da requisição inválido. Envie JSON com { planSlug }.' },
        { status: 400 },
      )
    }

    console.log(`${tag} planSlug=${planSlug}`)

    if (!planSlug) {
      return NextResponse.json(
        { error: 'planSlug é obrigatório.' },
        { status: 400 },
      )
    }

    if (planSlug === 'trial') {
      return NextResponse.json(
        { error: 'O plano trial é gratuito e não requer pagamento.' },
        { status: 400 },
      )
    }

    /* ── Auth check ────────────────────────────────────────────────────────── */
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()

    if (authErr) {
      console.error(`${tag} auth error:`, authErr.message)
    }

    if (!user) {
      console.log(`${tag} unauthenticated request — returning 401`)
      return NextResponse.json(
        { error: 'Você precisa estar logado para realizar o pagamento.' },
        { status: 401 },
      )
    }

    console.log(`${tag} user=${user.id} email=${user.email}`)

    /* ── Fetch user profile (for Stripe customer name) ────────────────────── */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data: userData, error: profileErr } = await db
      .from('users')
      .select('email, full_name, stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileErr) {
      console.warn(`${tag} could not fetch user profile (non-fatal):`, profileErr.message)
    }

    const email    = userData?.email    ?? user.email    ?? ''
    const fullName = userData?.full_name ?? ''
    console.log(`${tag} profile: name="${fullName}" email=${email}`)

    /* ── Build Stripe session ──────────────────────────────────────────────── */
    let stripeUrl: string
    try {
      stripeUrl = await buildStripeSession({
        userId:   user.id,
        email,
        name:     fullName,
        planSlug,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error(`${tag} buildStripeSession failed:`, message)

      // Return specific error to help frontend show a useful message
      if (message.includes('não encontrado') || message.includes('inativo')) {
        return NextResponse.json({ error: message }, { status: 404 })
      }
      return NextResponse.json(
        { error: `Erro ao criar sessão de pagamento: ${message}` },
        { status: 500 },
      )
    }

    console.log(`${tag} returning Stripe URL`)
    return NextResponse.json({ url: stripeUrl })

  } catch (err) {
    // Unexpected error — last-resort catch
    console.error(`${tag} unhandled error:`, err)
    return NextResponse.json(
      { error: 'Erro inesperado ao processar o pagamento. Tente novamente.' },
      { status: 500 },
    )
  }
}
