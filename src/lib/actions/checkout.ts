'use server'

import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe }            from '@/lib/stripe'
import { redirect }          from 'next/navigation'
import { isRedirectError }   from 'next/dist/client/components/redirect'

// ─── Types ───────────────────────────────────────────────────────────────────

export type CheckoutState = {
  error?:        string
  confirm?:      boolean
  planSlug?:     string
  existingUser?: boolean
} | null

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL)           return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

// ─── Core Stripe session builder ──────────────────────────────────────────────

interface BuildSessionParams {
  userId:   string
  email:    string
  name:     string
  planSlug: string
}

/**
 * Looks up (or creates) a Stripe Customer for the user, then creates a
 * Checkout Session and returns the hosted checkout URL.
 *
 * NOTE: Does NOT call redirect() — callers are responsible for redirecting.
 * This keeps the function safe to use inside try/catch blocks.
 */
export async function buildStripeSession({
  userId,
  email,
  name,
  planSlug,
}: BuildSessionParams): Promise<string> {
  const tag   = `[buildStripeSession user=${userId} plan=${planSlug}]`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any

  /* ── Fetch plan (authoritative source of truth for price) ──────────────── */
  console.log(`${tag} fetching plan`)
  const { data: plan, error: planErr } = await admin
    .from('plans')
    .select('id, name, slug, price_brl, essay_count')
    .eq('slug', planSlug)
    .eq('active', true)
    .single()

  if (planErr || !plan) {
    console.error(`${tag} plan not found:`, planErr?.message ?? 'no row')
    throw new Error(`Plano "${planSlug}" não encontrado ou inativo.`)
  }
  console.log(`${tag} plan found: ${plan.name} R$ ${plan.price_brl}`)

  /* ── Stripe customer: fetch existing or create ─────────────────────────── */
  const { data: userRow, error: userRowErr } = await admin
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle()

  if (userRowErr) {
    console.warn(`${tag} could not fetch users row (may not exist yet):`, userRowErr.message)
  }

  let stripeCustomerId: string = userRow?.stripe_customer_id ?? ''

  if (!stripeCustomerId) {
    console.log(`${tag} creating Stripe customer for email=${email}`)
    const customer = await stripe.customers.create({
      email,
      name:     name || undefined,
      metadata: { userId },
    })
    stripeCustomerId = customer.id
    console.log(`${tag} Stripe customer created: ${stripeCustomerId}`)

    // Persist — if row doesn't exist yet, this is a no-op (0 rows updated).
    // The webhook also persists it as a fallback.
    const { error: updateErr } = await admin
      .from('users')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', userId)

    if (updateErr) {
      // Non-fatal: webhook will persist the customer ID when payment completes
      console.warn(`${tag} could not persist stripe_customer_id (non-fatal):`, updateErr.message)
    }
  } else {
    console.log(`${tag} reusing Stripe customer: ${stripeCustomerId}`)
  }

  /* ── Create Stripe Checkout Session ───────────────────────────────────── */
  const siteUrl = getSiteUrl().replace(/\/$/, '')
  console.log(`${tag} creating Checkout Session siteUrl=${siteUrl}`)

  const session = await stripe.checkout.sessions.create({
    customer:             stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency:     'brl',
          unit_amount:  Math.round(plan.price_brl * 100),
          product_data: {
            name:        `Método Revisão — Plano ${plan.name}`,
            description: `${plan.essay_count} redações com devolutiva completa C1–C5 por ciclo`,
          },
        },
        quantity: 1,
      },
    ],
    mode:        'payment',
    success_url: `${siteUrl}/aluno/upgrade/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${siteUrl}/checkout/${planSlug}?cancelado=1`,
    metadata:    { userId, planSlug: plan.slug },
    client_reference_id: userId,
    locale:      'pt-BR',
  })

  if (!session.url) {
    console.error(`${tag} Stripe session has no URL:`, session.id)
    throw new Error('Stripe retornou uma sessão sem URL de checkout.')
  }

  console.log(`${tag} Checkout Session created: ${session.id}`)
  return session.url
}

// ─── Server Action: sign-up → Stripe ─────────────────────────────────────────

/**
 * Creates a new Supabase account, then immediately redirects to Stripe.
 *
 * ⚠️  IMPORTANT: redirect() MUST be called OUTSIDE any try/catch block.
 *    In Next.js 14 App Router, redirect() throws a NEXT_REDIRECT error
 *    internally. If that error is caught, the redirect never fires and
 *    the user sees a spurious "payment error" message instead.
 */
export async function signUpAndCheckout(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const fullName = (formData.get('full_name') as string)?.trim()
  const email    = (formData.get('email')     as string)?.trim().toLowerCase()
  const password =  formData.get('password')  as string
  const planSlug = (formData.get('planSlug')  as string)?.trim()

  const tag = `[signUpAndCheckout email=${email} plan=${planSlug}]`
  console.log(`${tag} form submitted`)

  /* ── Input validation ─────────────────────────────────────────────────── */
  if (!fullName || fullName.length < 2) {
    return { error: 'Informe seu nome completo (mínimo 2 caracteres).' }
  }
  if (!email || !email.includes('@')) {
    return { error: 'E-mail inválido. Verifique e tente novamente.' }
  }
  if (!password || password.length < 6) {
    return { error: 'A senha deve ter no mínimo 6 caracteres.' }
  }
  if (!planSlug) {
    return { error: 'Plano não especificado. Volte e escolha novamente.' }
  }

  /* ── Verify plan exists before creating account ───────────────────────── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any
  const { data: plan, error: planCheckErr } = await admin
    .from('plans')
    .select('id, name')
    .eq('slug', planSlug)
    .eq('active', true)
    .maybeSingle()

  if (planCheckErr) {
    console.error(`${tag} plan DB error:`, planCheckErr.message)
    return { error: 'Erro ao verificar o plano. Tente novamente em instantes.' }
  }
  if (!plan) {
    console.error(`${tag} plan "${planSlug}" not found or inactive`)
    return { error: 'Plano não encontrado. Volte e escolha um plano válido.' }
  }
  console.log(`${tag} plan verified: ${plan.name}`)

  /* ── Supabase sign-up ─────────────────────────────────────────────────── */
  const supabase = await createClient()
  console.log(`${tag} calling supabase.auth.signUp`)

  const { data, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      // After email confirmation → user lands back on checkout page, already logged in
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/checkout/${planSlug}`,
    },
  })

  if (signUpErr) {
    const msg = signUpErr.message.toLowerCase()
    console.error(`${tag} signUp error:`, signUpErr.message)

    if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already')) {
      return { error: 'Este e-mail já tem uma conta. Faça login para continuar.', existingUser: true, planSlug }
    }
    if (msg.includes('invalid email') || msg.includes('email address')) {
      return { error: 'E-mail inválido. Verifique o endereço e tente novamente.' }
    }
    if (msg.includes('password')) {
      return { error: 'Senha não aceita. Use pelo menos 6 caracteres.' }
    }
    if (msg.includes('rate limit') || msg.includes('too many')) {
      return { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }
    }
    return { error: `Erro ao criar conta: ${signUpErr.message}` }
  }

  console.log(`${tag} signUp result: user=${data.user?.id ?? 'none'} session=${data.session ? 'present' : 'null'}`)

  /* ── Email confirmation required ──────────────────────────────────────── */
  // Supabase returns user but no session when email confirmation is enabled.
  // The user receives an email; on click → /auth/callback → back to /checkout/[planSlug].
  if (data.user && !data.session) {
    console.log(`${tag} email confirmation required`)
    return { confirm: true, planSlug }
  }

  /* ── Session active → build Stripe session, then redirect ────────────── */
  // CRITICAL: redirect() must be called OUTSIDE try/catch.
  // Calling redirect() inside catch would cause it to be swallowed.
  if (!data.session) {
    console.error(`${tag} unexpected: no session and no email-confirm flag`)
    return { error: 'Erro inesperado ao criar sessão. Tente novamente.' }
  }

  const user = data.session.user
  console.log(`${tag} session active, user=${user.id}`)

  let stripeUrl: string
  try {
    stripeUrl = await buildStripeSession({
      userId:   user.id,
      email,
      name:     fullName,
      planSlug,
    })
  } catch (err) {
    // Only catch actual errors here — NOT redirect errors (redirect isn't called inside)
    if (isRedirectError(err)) throw err  // Safety net: re-throw if somehow a redirect slips in
    console.error(`${tag} buildStripeSession failed:`, err)
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return { error: `Erro ao iniciar pagamento: ${message}` }
  }

  // ✅ redirect() is called here, OUTSIDE the try/catch — safe to throw NEXT_REDIRECT
  console.log(`${tag} redirecting to Stripe: ${stripeUrl.substring(0, 60)}…`)
  redirect(stripeUrl)
}
