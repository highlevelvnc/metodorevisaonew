'use server'

/**
 * Server Actions for the checkout flow.
 *
 * 'use server' marks signUpAndCheckout as a Next.js Server Action,
 * callable via useFormState from client components.
 *
 * buildStripeSession lives in stripe-session.ts (no 'use server') so it
 * can also be imported cleanly by the /api/checkout route handler.
 */

import { createClient }                       from '@/lib/supabase/server'
import { createAdminClient }                  from '@/lib/supabase/admin'
import { redirect }                           from 'next/navigation'
import { isRedirectError }                    from 'next/dist/client/components/redirect'
import { buildStripeSession, getSiteUrl }     from '@/lib/stripe-session'

// ─── Types ───────────────────────────────────────────────────────────────────

export type CheckoutState = {
  error?:        string
  confirm?:      boolean
  planSlug?:     string
  existingUser?: boolean
} | null

// ─── Server Action: sign-up → Stripe ─────────────────────────────────────────

/**
 * Creates a new Supabase account, then immediately redirects to Stripe.
 *
 * ⚠️  redirect() MUST be called OUTSIDE any try/catch block.
 *    In Next.js 14 App Router, redirect() throws a NEXT_REDIRECT error
 *    internally. If that throw is caught, the redirect never fires and
 *    the user sees a spurious error message instead.
 *
 * Flow (email confirmation DISABLED in Supabase):
 *   signUp → session active → buildStripeSession → redirect(stripeUrl)
 *
 * Flow (email confirmation ENABLED):
 *   signUp → no session → return { confirm: true }
 *   user clicks email link → /auth/callback → /checkout/[planSlug]
 *   ProceedButton shown → calls POST /api/checkout → redirect to Stripe
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

  // ── Input validation ────────────────────────────────────────────────────────
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

  // ── Verify plan exists before creating account ──────────────────────────────
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

  // ── Supabase sign-up ────────────────────────────────────────────────────────
  const supabase = await createClient()
  console.log(`${tag} calling supabase.auth.signUp`)

  const { data, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      // After email confirmation → back to checkout page already logged in
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

  // ── Email confirmation required ─────────────────────────────────────────────
  // Supabase returns user but no session when email confirmation is enabled.
  // User gets an email → clicks link → /auth/callback → /checkout/[planSlug]
  // At that point ProceedButton is shown and calls POST /api/checkout.
  if (data.user && !data.session) {
    console.log(`${tag} email confirmation required — showing confirm screen`)
    return { confirm: true, planSlug }
  }

  // ── Unexpected: neither session nor email-confirm ───────────────────────────
  if (!data.session) {
    console.error(`${tag} unexpected state: no session and data.user=${data.user?.id ?? 'null'}`)
    return { error: 'Erro inesperado ao criar sessão. Tente novamente.' }
  }

  const user = data.session.user
  console.log(`${tag} session active immediately — user=${user.id}`)

  // ── Build Stripe session ────────────────────────────────────────────────────
  // CRITICAL: redirect() is called OUTSIDE this try/catch.
  // If redirect() were inside, Next.js's NEXT_REDIRECT throw would be
  // caught and the redirect would never happen.
  let stripeUrl: string
  try {
    stripeUrl = await buildStripeSession({
      userId:   user.id,
      email,
      name:     fullName,
      planSlug,
    })
  } catch (err) {
    if (isRedirectError(err)) throw err   // safety net: re-throw any stray redirects
    console.error(`${tag} buildStripeSession failed:`, err)
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return { error: `Erro ao iniciar pagamento: ${msg}` }
  }

  // ✅ Outside try/catch — safe for NEXT_REDIRECT
  console.log(`${tag} redirecting to Stripe`)
  redirect(stripeUrl)
}
