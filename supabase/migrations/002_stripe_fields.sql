-- ============================================================================
-- Migration 002: Stripe integration fields
-- Run in Supabase: Dashboard → SQL Editor → Execute
-- ============================================================================

-- ─── users: persist Stripe customer ID ───────────────────────────────────────
alter table public.users
  add column if not exists stripe_customer_id text unique;

-- ─── subscriptions: Stripe payment tracking + idempotency ────────────────────
alter table public.subscriptions
  add column if not exists stripe_checkout_session_id text unique,
  add column if not exists stripe_customer_id         text,
  add column if not exists stripe_price_id            text;

-- ─── Indexes for webhook lookups (high-frequency) ────────────────────────────
create index if not exists idx_subscriptions_stripe_session
  on public.subscriptions(stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists idx_subscriptions_stripe_customer
  on public.subscriptions(stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists idx_users_stripe_customer
  on public.users(stripe_customer_id)
  where stripe_customer_id is not null;

-- ─── Grant service-role access to new columns (already covered by table grants)
-- No extra grants needed — service role bypasses RLS.
