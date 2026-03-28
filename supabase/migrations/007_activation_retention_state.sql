-- Migration 007: Activation & Retention state tracking
--
-- R1: corrections.viewed_at — tracks when student first viewed their correction
-- R2: nudge_events — deduplicates inactivity email sends
-- R3: users.last_activity_at — single source of truth for user activity

-- ─── R1: Correction view tracking ──────────────────────────���──────────────────
ALTER TABLE corrections
  ADD COLUMN IF NOT EXISTS viewed_at timestamptz DEFAULT NULL;

COMMENT ON COLUMN corrections.viewed_at IS
  'Timestamp when the student first opened the correction page. NULL = not yet viewed.';

-- ─── R2: Nudge event deduplication ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nudge_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type text NOT NULL,       -- 'inactivity_24h', 'inactivity_48h'
  sent_at    timestamptz NOT NULL DEFAULT now(),
  -- Prevent duplicate sends in the same window
  UNIQUE (user_id, event_type)
);

COMMENT ON TABLE nudge_events IS
  'Tracks sent nudge/engagement emails to prevent duplicate sends. '
  'Rows are deleted when user becomes active again (essay submitted, correction viewed).';

CREATE INDEX IF NOT EXISTS idx_nudge_events_user ON nudge_events (user_id);

-- ─── R3: Last activity tracking ───────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_activity_at timestamptz DEFAULT NULL;

COMMENT ON COLUMN users.last_activity_at IS
  'Updated on essay submission, correction view, and Biia interaction. '
  'Used by inactivity cron to determine nudge eligibility.';

-- Backfill last_activity_at from most recent essay submission (if any)
UPDATE users u
SET last_activity_at = sub.latest
FROM (
  SELECT student_id, MAX(submitted_at) AS latest
  FROM essays
  GROUP BY student_id
) sub
WHERE u.id = sub.student_id
  AND u.last_activity_at IS NULL;

-- For users with no essays, use created_at as fallback
UPDATE users
SET last_activity_at = created_at
WHERE last_activity_at IS NULL;
