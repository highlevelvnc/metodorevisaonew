-- 008_share_tokens.sql — Shareable student reports (G1)
--
-- Adds an optional share_token to essays, enabling public read-only
-- devolutiva links. Token is generated only when the student explicitly
-- creates a share link and can be revoked (set to NULL).

ALTER TABLE essays
  ADD COLUMN IF NOT EXISTS share_token text UNIQUE DEFAULT NULL;

-- Index for fast public lookups
CREATE INDEX IF NOT EXISTS idx_essays_share_token
  ON essays (share_token)
  WHERE share_token IS NOT NULL;
