-- 010: Lightweight product events table for funnel/analytics tracking
-- Captures critical product events (signup, essay submit, correction view, purchase, etc.)
-- Designed for low overhead — append-only, no indexes beyond created_at + event_name

CREATE TABLE IF NOT EXISTS product_events (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text        NOT NULL,
  user_id    uuid        REFERENCES users(id) ON DELETE SET NULL,
  metadata   jsonb       DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for time-range queries (admin analytics view)
CREATE INDEX IF NOT EXISTS idx_product_events_created_at ON product_events (created_at DESC);

-- Index for event_name + time filtering
CREATE INDEX IF NOT EXISTS idx_product_events_name_created ON product_events (event_name, created_at DESC);

-- RLS: only service-role / server-side can insert/read
ALTER TABLE product_events ENABLE ROW LEVEL SECURITY;

-- No public policies — only service-role (admin) client can access
-- This ensures events can only be written/read from server-side code
