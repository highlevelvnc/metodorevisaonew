-- 017: Add current_period_start to subscriptions
-- Tracks the start of the current billing cycle.
-- Set by webhook on activation and renewal.
-- Used for per-cycle deduplication of alerts.

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS current_period_start timestamptz DEFAULT now();
