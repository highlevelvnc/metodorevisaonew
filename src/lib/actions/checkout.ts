'use server'

import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe }            from '@/lib/stripe'
import { redirect }          from 'next/navigation'

// ─── Types ──────────────────────────────────────────────────────────────────

export type CheckoutState = {
  error?:        string
  confirm?:      boolean
  planSlug?:     string
  existingUser?: boolean
} | null

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL)           return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

// ─── Core Stripe session builder ─────────────────────────────────────────────

interface BuildSessionParams {
  userId:   string
  email:    string
  name:     string
  planSlug: string
}

/**
 * Looks up (or creates) the Stripe customer, then creates a Checkout Session.
 * Returns the Stripe hosted checkout URL.
 */
export async function buildStripeSession({
  userId,
  email,
  name,
  planSlug,
}: BuildSessionParams): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any

  /* ── Fetch plan (authoritative price) ─────────────────────────────────── */
  const { data: plan, error: planErr } = await admin
    .from('plans')
    .select('id, name, slug, price_brl, essay_count')
    .eq('slug', planSlug)
    .eq('active', true)
    .single()

  if (planErr || !plan) {
    throw new Error('Plano não encontrado.')
  }

  /* ── Stripe customer ────────────────────────────────────────────────────── */
  const { data: userRow } = await admin
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle()

  let stripeCustomerId: string = userRow?.stripe_customer_id ?? ''

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: { userId },
    })
    stripeCustomerId = customer.id

    await admin
      .from('users')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', userId)
  }

  /* ── Checkout Session ───────────────────────────────────────────────────── */
  const siteUrl = getSiteUrl().replace(/\/$/, '')

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'brl',
          unit_amount: Math.round(plan.price_brl * 100),
          product_data: {
            name:        `Método Revisão — Plano ${plan.name}`,
            description: `${plan.essay_count} redações com devolutiva completa C1–C5 por ciclo`,
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${siteUrl}/aluno/upgrade/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${siteUrl}/checkout/${planSlug}?cancelado=1`,
    metadata: { userId, planSlug: plan.slug },
    client_reference_id: userId,
    locale: 'pt-BR',
  })

  return session.url!
}

// ─── Server Action: sign up → Stripe ─────────────────────────────────────────

/**
 * Creates a new Supabase account and immediately redirects to Stripe checkout.
 * Used with useFormState on the /checkout/[planSlug] page.
 *
 * Flow:
 *  - Validates fields
 *  - Calls supabase.auth.signUp
 *  - If email confirmation required → returns { confirm: true }
 *  - If session active → buildStripeSession → redirect(stripeUrl)
 */
export async function signUpAndCheckout(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const fullName = (formData.get('full_name') as string)?.trim()
  const email    = (formData.get('email')     as string)?.trim().toLowerCase()
  const password =  formData.get('password')  as string
  const planSlug = (formData.get('planSlug')  as string)?.trim()

  /* ── Validation ─────────────────────────────────────────────────────────── */
  if (!fullName || fullName.length < 2)  return { error: 'Informe seu nome completo.' }
  if (!email)                            return { error: 'E-mail obrigatório.' }
  if (!password || password.length < 6) return { error: 'Senha com no mínimo 6 caracteres.' }
  if (!planSlug)                         return { error: 'Plano inválido.' }

  /* ── Verify plan exists before creating account ─────────────────────────── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any
  const { data: plan } = await admin
    .from('plans')
    .select('id')
    .eq('slug', planSlug)
    .eq('active', true)
    .maybeSingle()

  if (!plan) return { error: 'Plano não encontrado. Volte e escolha novamente.' }

  /* ── Sign up ─────────────────────────────────────────────────────────────── */
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      // After email confirmation, land back on the checkout page (already logged in)
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/checkout/${planSlug}`,
    },
  })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('already exists'))
      return { error: 'Este e-mail já está cadastrado.', existingUser: true, planSlug }
    if (msg.includes('invalid email'))
      return { error: 'E-mail inválido. Verifique o formato.' }
    if (msg.includes('password'))
      return { error: 'Senha muito fraca. Use pelo menos 6 caracteres.' }
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }

  /* ── Email confirmation required ────────────────────────────────────────── */
  if (data.user && !data.session) {
    return { confirm: true, planSlug }
  }

  /* ── Session active → go straight to Stripe ────────────────────────────── */
  const user = data.session!.user

  try {
    const stripeUrl = await buildStripeSession({
      userId:   user.id,
      email:    email,
      name:     fullName,
      planSlug,
    })
    redirect(stripeUrl)
  } catch (err) {
    console.error('[signUpAndCheckout] Stripe error', err)
    return { error: 'Erro ao iniciar pagamento. Tente novamente.' }
  }
}
