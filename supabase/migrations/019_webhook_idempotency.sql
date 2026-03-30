-- 019: Webhook idempotency table
-- Prevents replay attacks on invoice.payment_succeeded (renewal).
-- Each processed webhook event is recorded by its unique event_id.
-- UNIQUE constraint ensures the same event is never processed twice.

CREATE TABLE IF NOT EXISTS public.processed_webhooks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    text NOT NULL UNIQUE,   -- Stripe event ID (evt_xxx) or invoice ID (in_xxx)
  event_type  text NOT NULL,          -- e.g. 'invoice.payment_succeeded'
  processed_at timestamptz DEFAULT now() NOT NULL
);

-- Index for cleanup queries (delete old entries after 90 days)
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_date
  ON public.processed_webhooks (processed_at);

-- No RLS needed — only accessed by service-role (webhook handler)
