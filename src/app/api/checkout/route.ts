import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

/**
 * POST /api/checkout
 * Body: { planSlug: 'evolucao' | 'estrategia' | 'intensivo' }
 *
 * Creates a Stripe Checkout Session for the authenticated user and returns
 * the hosted Checkout URL. The client redirects to that URL.
 *
 * After payment Stripe redirects to:
 *   success → /aluno/upgrade/sucesso?session_id={CHECKOUT_SESSION_ID}
 *   cancel  → /aluno/upgrade?cancelado=1
 */
export async function POST(req: Request) {
  try {
    /* ── Auth ──────────────────────────────────────────────────────────────── */
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    /* ── Validate plan ─────────────────────────────────────────────────────── */
    const body = await req.json().catch(() => ({}))
    const { planSlug } = body as { planSlug?: string }

    if (!planSlug) {
      return NextResponse.json({ error: 'planSlug obrigatório.' }, { status: 400 })
    }

    // Trial plan is free — should never go through Stripe
    if (planSlug === 'trial') {
      return NextResponse.json({ error: 'Plano trial não requer pagamento.' }, { status: 400 })
    }

    /* ── Fetch plan from DB (source of truth for price) ───────────────────── */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const { data: plan, error: planErr } = await db
      .from('plans')
      .select('id, name, slug, price_brl, essay_count')
      .eq('slug', planSlug)
      .eq('active', true)
      .single()

    if (planErr || !plan) {
      return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 })
    }

    /* ── Fetch / create Stripe customer ────────────────────────────────────── */
    const { data: userData } = await db
      .from('users')
      .select('email, full_name, stripe_customer_id')
      .eq('id', user.id)
      .single()

    let stripeCustomerId: string = userData?.stripe_customer_id ?? ''

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userData?.email ?? user.email ?? '',
        name: userData?.full_name || undefined,
        metadata: { userId: user.id },
      })
      stripeCustomerId = customer.id

      // Persist customer ID on user so future checkouts reuse it
      await db
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id)
    }

    /* ── Create Checkout Session ───────────────────────────────────────────── */
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],

      line_items: [
        {
          price_data: {
            currency: 'brl',
            // Stripe expects amount in smallest currency unit (centavos)
            unit_amount: Math.round(plan.price_brl * 100),
            product_data: {
              name: `Método Revisão — Plano ${plan.name}`,
              description: `${plan.essay_count} redações com devolutiva completa C1–C5 por ciclo`,
            },
          },
          quantity: 1,
        },
      ],

      mode: 'payment',

      // {CHECKOUT_SESSION_ID} is a Stripe template variable — replaced at runtime
      success_url: `${siteUrl}/aluno/upgrade/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/aluno/upgrade?cancelado=1`,

      // Stored in session.metadata — recovered in the webhook
      metadata: {
        userId: user.id,
        planSlug: plan.slug,
      },

      // client_reference_id is an extra fallback identifier
      client_reference_id: user.id,

      locale: 'pt-BR',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[api/checkout]', err)
    return NextResponse.json({ error: 'Erro interno ao criar sessão de pagamento.' }, { status: 500 })
  }
}
