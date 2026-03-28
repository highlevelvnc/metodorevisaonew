-- Migration 005: Add stripe_subscription_id for recurring billing
--
-- Supports the switch from Stripe mode:'payment' to mode:'subscription'.
-- This column stores the Stripe Subscription ID (sub_xxx) so we can:
--   1. Reset credits on monthly renewal (invoice.payment_succeeded)
--   2. Handle cancellation (customer.subscription.deleted)
--   3. Look up subscription status from Stripe

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Index for webhook lookups (renewal + cancellation events query by this)
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub_id
  ON subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Unique constraint: one DB row per Stripe subscription
-- (prevents duplicate activation from retried webhooks)
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_stripe_subscription_id_unique
  UNIQUE (stripe_subscription_id);
