/**
 * stripe-session.ts — Plain server utility. No 'use server' directive.
 *
 * Contains buildStripeSession() — the core function that creates a Stripe
 * Checkout Session for a given user + plan.
 *
 * Imported by:
 *   src/lib/actions/checkout.ts    (Server Action: signUpAndCheckout)
 *   src/app/api/checkout/route.ts  (Route Handler: POST /api/checkout)
 *
 * The route handler declares `export const runtime = 'nodejs'`, which
 * ensures this entire module tree executes in Node.js — where Stripe's SDK
 * can use node:http / node:https correctly.
 */

import Stripe             from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSiteUrl }        from '@/lib/get-site-url'

export { getSiteUrl } // re-export so existing imports from this module keep working

// ─── Stripe singleton ─────────────────────────────────────────────────────────

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY

  if (!key) {
    throw new Error(
      '[stripe-session] STRIPE_SECRET_KEY is not set. ' +
      'Add it to .env.local and to Vercel › Settings › Environment Variables.',
    )
  }
  if (!key.startsWith('sk_live_') && !key.startsWith('sk_test_')) {
    throw new Error(
      `[stripe-session] STRIPE_SECRET_KEY looks wrong — prefix "${key.slice(0, 8)}…". ` +
      'Expected sk_live_… or sk_test_…',
    )
  }

  return new Stripe(key, {
    apiVersion:        '2026-03-25.dahlia' as Stripe.LatestApiVersion,
    typescript:        true,
    // Serverless-friendly settings:
    // - maxNetworkRetries 1 (default is 2) keeps total retry window short
    //   so Vercel hobby (10s timeout) / Pro (60s) doesn't get exhausted
    // - timeout 8000ms leaves a buffer before Vercel's function limit
    maxNetworkRetries: 1,
    timeout:           8000,
  })
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BuildSessionParams {
  userId:     string
  email:      string
  name:       string
  planSlug:   string
  /** Where Stripe sends the user when they click "Go back" in checkout.
   *  Defaults to /checkout/{planSlug}?cancelado=1 (public page, correct for new users).
   *  Pass /aluno/upgrade?cancelado=1 when called from the authenticated upgrade page. */
  cancelUrl?: string
}

// ─── Core function ────────────────────────────────────────────────────────────

/**
 * Looks up (or creates) a Stripe Customer, then creates a one-time
 * Checkout Session and returns the hosted checkout URL.
 *
 * Never calls redirect() — caller decides what to do with the URL.
 * Safe to use inside try/catch (no NEXT_REDIRECT throws here).
 */
export async function buildStripeSession({
  userId,
  email,
  name,
  planSlug,
  cancelUrl,
}: BuildSessionParams): Promise<string> {
  const tag     = `[buildStripeSession user=${userId} plan=${planSlug}]`
  const stripe  = getStripe()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin   = createAdminClient() as any
  const siteUrl = getSiteUrl()

  console.log(`${tag} start — siteUrl=${siteUrl}`)

  // ── Fetch plan (authoritative price from DB) ──────────────────────────────
  console.log(`${tag} fetching plan`)
  const { data: plan, error: planErr } = await admin
    .from('plans')
    .select('id, name, slug, price_brl, essay_count')
    .eq('slug', planSlug)
    .eq('active', true)
    .single()

  if (planErr || !plan) {
    console.error(`${tag} plan not found — error=${planErr?.message ?? 'no row'}`)
    throw new Error(`Plano "${planSlug}" não encontrado ou inativo.`)
  }
  console.log(`${tag} plan OK — "${plan.name}" R$${plan.price_brl} × ${plan.essay_count} redações`)

  // ── Stripe customer: reuse or create ─────────────────────────────────────
  const { data: userRow, error: userRowErr } = await admin
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle()

  if (userRowErr) {
    console.warn(`${tag} users row fetch failed (non-fatal):`, userRowErr.message)
  }

  let customerId: string = userRow?.stripe_customer_id ?? ''

  if (!customerId) {
    console.log(`${tag} creating Stripe customer for email=${email}`)
    const customer = await stripe.customers.create({
      email,
      name:     name || undefined,
      metadata: { userId },
    })
    customerId = customer.id
    console.log(`${tag} customer created: ${customerId}`)

    // Persist — non-fatal if users row doesn't exist yet; webhook also persists as fallback
    const { error: updateErr } = await admin
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId)

    if (updateErr) {
      console.warn(`${tag} stripe_customer_id persist skipped (non-fatal):`, updateErr.message)
    }
  } else {
    console.log(`${tag} reusing customer: ${customerId}`)
  }

  // ── Checkout Session ──────────────────────────────────────────────────────
  const unitAmount = Math.round(plan.price_brl * 100)
  console.log(`${tag} creating Checkout Session — unit_amount=${unitAmount} BRL centavos`)

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.create({
      customer:             customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency:     'brl',
            unit_amount:  unitAmount,
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
      cancel_url:  cancelUrl ?? `${siteUrl}/checkout/${planSlug}?cancelado=1`,
      metadata:    { userId, planSlug: plan.slug },
      client_reference_id: userId,
      locale:      'pt-BR',
    })
  } catch (err) {
    // Log with typed Stripe error info so Vercel shows the real cause
    if (err instanceof Stripe.errors.StripeAuthenticationError) {
      console.error(
        `${tag} Stripe AUTHENTICATION error — STRIPE_SECRET_KEY is invalid or revoked.\n` +
        `  Check: Stripe Dashboard → Developers → API keys`
      )
    } else if (err instanceof Stripe.errors.StripePermissionError) {
      console.error(
        `${tag} Stripe PERMISSION error — live mode requires full account activation.\n` +
        `  Required: identity verification + bank account in Stripe Dashboard.\n` +
        `  Stripe Dashboard → Settings → Business → Verify identity`
      )
    } else if (err instanceof Stripe.errors.StripeConnectionError) {
      console.error(
        `${tag} Stripe CONNECTION error — could not reach Stripe API from Vercel.\n` +
        `  Common causes:\n` +
        `    1. Vercel function timed out (hobby=10s, pro=60s) — cold start + Supabase queries + Stripe\n` +
        `    2. Transient network issue — check https://status.stripe.com\n` +
        `    3. export const runtime was set to 'edge' (needs 'nodejs') — check api/checkout/route.ts`
      )
    } else if (err instanceof Stripe.errors.StripeInvalidRequestError) {
      console.error(
        `${tag} Stripe INVALID REQUEST error — ${(err as Stripe.errors.StripeInvalidRequestError).message}\n` +
        `  param: ${(err as Stripe.errors.StripeInvalidRequestError).param ?? 'n/a'}`
      )
    } else {
      console.error(`${tag} Stripe unexpected error — ${err instanceof Error ? err.message : String(err)}`)
    }
    throw err
  }

  if (!session.url) {
    console.error(`${tag} Stripe returned session without URL — id=${session.id}`)
    throw new Error('Stripe criou a sessão mas não retornou a URL de checkout.')
  }

  console.log(`${tag} session OK — id=${session.id}`)
  return session.url
}
