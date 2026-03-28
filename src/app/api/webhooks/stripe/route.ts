import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { trackProductEvent } from '@/lib/analytics'

/**
 * POST /api/webhooks/stripe
 *
 * Receives Stripe webhook events, verifies the signature, and manages
 * the subscription lifecycle for the user.
 *
 * Key security properties:
 * - Signature verified using STRIPE_WEBHOOK_SECRET before any DB write
 * - Idempotent: `stripe_checkout_session_id` has a UNIQUE constraint —
 *   a duplicate event simply finds the existing row and returns 200
 * - Uses service-role Supabase client (bypasses RLS — runs server-to-server)
 *
 * Events handled:
 *   checkout.session.completed            → initial subscription activation
 *   checkout.session.async_payment_succeeded → async methods (future: Pix/boleto)
 *   invoice.payment_succeeded             → monthly renewal → reset credits
 *   customer.subscription.deleted         → cancellation → expire subscription
 *   customer.subscription.updated         → plan changes (future)
 */

// Force Node.js runtime — `stripe.webhooks.constructEvent` needs the raw body
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const t0 = Date.now()

  /* ── Read raw body (must be text, not parsed) ──────────────────────────── */
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') ?? ''

  if (!sig) {
    console.warn('[webhook] Missing stripe-signature header')
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] Missing STRIPE_WEBHOOK_SECRET environment variable')
    return new Response('Server configuration error', { status: 500 })
  }

  /* ── Verify webhook signature ──────────────────────────────────────────── */
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
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
        // For subscription mode, payment_status is 'paid' when card is charged
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

      // Monthly renewal — reset essay credits for the billing cycle
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleRenewal(invoice)
        break
      }

      // Subscription cancelled (by user via portal, or by Stripe due to failed payments)
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleCancellation(subscription)
        break
      }

      // Subscription updated (plan change, etc.) — log for now
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[webhook] Subscription updated: ${subscription.id} status=${subscription.status}`)
        // Handle payment failure → past_due
        if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
          console.warn(`[webhook] Subscription ${subscription.id} is ${subscription.status} — will expire on deletion`)
        }
        break
      }

      // Log but don't error on unhandled events
      default:
        console.log('[webhook] Unhandled event type:', event.type)
    }
  } catch (err) {
    console.error(`[webhook] Handler threw (+${Date.now() - t0}ms):`, err)
    // Return 500 so Stripe retries the event
    return new Response('Internal handler error', { status: 500 })
  }

  console.log(`[webhook] Completed event=${event.type} total=${Date.now() - t0}ms`)
  return new Response('OK', { status: 200 })
}

/* ── Core activation logic (initial subscription) ────────────────────────── */
async function activateSubscription(session: Stripe.Checkout.Session) {
  const t0       = Date.now()
  const userId   = session.metadata?.userId ?? session.client_reference_id
  const planSlug = session.metadata?.planSlug

  if (!userId || !planSlug) {
    console.error('[webhook] Missing userId or planSlug in session metadata:', session.id)
    return
  }

  console.log(`[webhook] activateSubscription start — session=${session.id} user=${userId} plan=${planSlug}`)

  // Use admin client — webhook has no user auth context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  /* ── Idempotency check ─────────────────────────────────────────────────── */
  const { data: existing } = await db
    .from('subscriptions')
    .select('id')
    .eq('stripe_checkout_session_id', session.id)
    .maybeSingle()

  if (existing) {
    console.log(`[webhook] Session already processed — skipping: ${session.id} (+${Date.now() - t0}ms)`)
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

  /* ── Check for trial-to-paid conversion (T5) before deactivating ──────── */
  const { data: oldSub } = await db
    .from('subscriptions')
    .select('id, plans(slug)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (oldSub?.plans?.slug === 'trial') {
    trackProductEvent('trial_to_paid_conversion', userId, {
      from_plan: 'trial',
      to_plan: planSlug,
      to_plan_name: plan.name,
    })
    console.log(`[webhook] Trial-to-paid conversion — user=${userId} plan=${planSlug}`)
  }

  /* ── Deactivate all previous active subscriptions ──────────────────────── */
  const { error: expireErr } = await db
    .from('subscriptions')
    .update({ status: 'expired' })
    .eq('user_id', userId)
    .eq('status', 'active')

  if (expireErr) {
    console.error('[webhook] Failed to expire old subscriptions:', expireErr)
    throw expireErr
  }

  /* ── Extract Stripe subscription ID ────────────────────────────────────── */
  const stripeSubscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : (session.subscription as Stripe.Subscription | null)?.id ?? null

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
      stripe_subscription_id:     stripeSubscriptionId,
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

  // Track purchase event
  trackProductEvent('purchase_completed', userId, {
    plan_slug: planSlug,
    plan_name: plan.name,
    essay_limit: plan.essay_count,
    stripe_session_id: session.id,
  })

  console.log(
    `[webhook] Subscription activated — user: ${userId} | plan: ${planSlug} | stripe_sub: ${stripeSubscriptionId} | session: ${session.id} | total: ${Date.now() - t0}ms`
  )
}

/* ── Monthly renewal — reset credits ─────────────────────────────────────── */
async function handleRenewal(invoice: Stripe.Invoice) {
  const t0 = Date.now()

  // Skip the first invoice (handled by activateSubscription via checkout.session.completed)
  if (invoice.billing_reason === 'subscription_create') {
    console.log(`[webhook] Skipping initial invoice ${invoice.id} (handled by checkout.session.completed)`)
    return
  }

  // In Stripe API 2026+, subscription may be in subscription_details or as a direct field
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any
  const rawSub = invoiceAny.subscription ?? invoiceAny.subscription_details?.id ?? null
  const stripeSubId: string | null = typeof rawSub === 'string'
    ? rawSub
    : rawSub?.id ?? null

  if (!stripeSubId) {
    console.warn(`[webhook] invoice.payment_succeeded without subscription ID: ${invoice.id}`)
    return
  }

  console.log(`[webhook] handleRenewal — invoice=${invoice.id} subscription=${stripeSubId}`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  // Find our subscription row by Stripe subscription ID
  const { data: sub, error: subErr } = await db
    .from('subscriptions')
    .select('id, essays_limit, user_id')
    .eq('stripe_subscription_id', stripeSubId)
    .eq('status', 'active')
    .maybeSingle()

  if (subErr || !sub) {
    console.warn(`[webhook] No active subscription found for stripe_sub=${stripeSubId}`, subErr)
    return
  }

  // Reset essay credits for the new billing cycle
  const { error: updateErr } = await db
    .from('subscriptions')
    .update({ essays_used: 0 })
    .eq('id', sub.id)

  if (updateErr) {
    console.error(`[webhook] Failed to reset credits for sub=${sub.id}:`, updateErr)
    throw updateErr
  }

  console.log(
    `[webhook] Credits reset — sub=${sub.id} user=${sub.user_id} limit=${sub.essays_limit} | total: ${Date.now() - t0}ms`
  )
}

/* ── Subscription cancelled ──────────────────────────────────────────────── */
async function handleCancellation(subscription: Stripe.Subscription) {
  const t0 = Date.now()
  const stripeSubId = subscription.id

  console.log(`[webhook] handleCancellation — subscription=${stripeSubId}`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const { error: updateErr } = await db
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('stripe_subscription_id', stripeSubId)
    .eq('status', 'active')

  if (updateErr) {
    console.error(`[webhook] Failed to cancel subscription stripe_sub=${stripeSubId}:`, updateErr)
    throw updateErr
  }

  console.log(`[webhook] Subscription cancelled — stripe_sub=${stripeSubId} | total: ${Date.now() - t0}ms`)
}
