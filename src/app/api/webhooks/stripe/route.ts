import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/webhooks/stripe
 *
 * Receives Stripe webhook events, verifies the signature, and activates
 * the purchased subscription for the user.
 *
 * Key security properties:
 * - Signature verified using STRIPE_WEBHOOK_SECRET before any DB write
 * - Idempotent: `stripe_checkout_session_id` has a UNIQUE constraint —
 *   a duplicate event simply finds the existing row and returns 200
 * - Uses service-role Supabase client (bypasses RLS — runs server-to-server)
 *
 * Events handled:
 *   checkout.session.completed            → immediate card payments
 *   checkout.session.async_payment_succeeded → async methods (future: Pix/boleto)
 */

// Force Node.js runtime — `stripe.webhooks.constructEvent` needs the raw body
export const runtime = 'nodejs'

export async function POST(req: Request) {
  /* ── Read raw body (must be text, not parsed) ──────────────────────────── */
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') ?? ''

  if (!sig) {
    console.warn('[webhook] Missing stripe-signature header')
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  /* ── Verify webhook signature ──────────────────────────────────────────── */
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return new Response('Invalid webhook signature', { status: 400 })
  }

  /* ── Route event types ─────────────────────────────────────────────────── */
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        // Only activate on confirmed payment (card payments are immediate)
        if (session.payment_status === 'paid') {
          await activateSubscription(session)
        }
        break
      }

      // Async payment methods (Pix, boleto) fire this event when funds clear
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        await activateSubscription(session)
        break
      }

      // Log but don't error on unhandled events
      default:
        console.log('[webhook] Unhandled event type:', event.type)
    }
  } catch (err) {
    console.error('[webhook] Handler threw:', err)
    // Return 500 so Stripe retries the event
    return new Response('Internal handler error', { status: 500 })
  }

  return new Response('OK', { status: 200 })
}

/* ── Core activation logic ────────────────────────────────────────────────── */
async function activateSubscription(session: Stripe.Checkout.Session) {
  const userId   = session.metadata?.userId ?? session.client_reference_id
  const planSlug = session.metadata?.planSlug

  if (!userId || !planSlug) {
    console.error('[webhook] Missing userId or planSlug in session metadata:', session.id)
    return
  }

  // Use admin client — webhook has no user auth context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  /* ── Idempotency check ─────────────────────────────────────────────────── */
  // If the session was already processed (e.g. Stripe retried), skip silently.
  // The UNIQUE constraint on stripe_checkout_session_id also enforces this at DB level.
  const { data: existing } = await db
    .from('subscriptions')
    .select('id')
    .eq('stripe_checkout_session_id', session.id)
    .maybeSingle()

  if (existing) {
    console.log('[webhook] Session already processed — skipping:', session.id)
    return
  }

  /* ── Resolve plan from DB ──────────────────────────────────────────────── */
  const { data: plan, error: planErr } = await db
    .from('plans')
    .select('id, essay_count, name')
    .eq('slug', planSlug)
    .single()

  if (planErr || !plan) {
    console.error('[webhook] Plan not found for slug:', planSlug, planErr)
    throw new Error(`Plan not found: ${planSlug}`)
  }

  /* ── Deactivate all previous active subscriptions ──────────────────────── */
  // A user can only have one active subscription at a time.
  const { error: expireErr } = await db
    .from('subscriptions')
    .update({ status: 'expired' })
    .eq('user_id', userId)
    .eq('status', 'active')

  if (expireErr) {
    console.error('[webhook] Failed to expire old subscriptions:', expireErr)
    throw expireErr
  }

  /* ── Create new active subscription ───────────────────────────────────── */
  const { error: insertErr } = await db
    .from('subscriptions')
    .insert({
      user_id:                    userId,
      plan_id:                    plan.id,
      status:                     'active',
      essays_used:                0,
      essays_limit:               plan.essay_count,
      stripe_checkout_session_id: session.id,
      stripe_customer_id:         (session.customer as string | null) ?? null,
    })

  if (insertErr) {
    console.error('[webhook] Failed to insert subscription:', insertErr)
    throw insertErr
  }

  /* ── Persist Stripe customer ID on user for future checkouts ────────────── */
  if (session.customer) {
    await db
      .from('users')
      .update({ stripe_customer_id: session.customer as string })
      .eq('id', userId)
  }

  console.log(
    `[webhook] Subscription activated — user: ${userId} | plan: ${planSlug} | session: ${session.id}`
  )
}
