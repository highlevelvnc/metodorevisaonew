-- 009_correction_feedback.sql — Real feedback collection (G2)
--
-- Lightweight student feedback on corrections.
-- One feedback per correction (UNIQUE constraint).
-- Stores rating + optional testimonial text.

CREATE TABLE IF NOT EXISTS correction_feedback (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correction_id uuid NOT NULL REFERENCES corrections(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating       smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  testimonial  text DEFAULT NULL,
  allow_public boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (correction_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_correction_feedback_user
  ON correction_feedback (user_id);
