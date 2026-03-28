-- Migration 006: Add UNIQUE constraint on corrections.essay_id
--
-- Prevents the race condition where two professors both pass the
-- existence check in saveCorrection() simultaneously and both insert.
-- This enforces one correction per essay at the database level.
--
-- If a duplicate insert is attempted, Postgres returns 23505 (unique_violation)
-- which the application handles gracefully.

ALTER TABLE corrections
  ADD CONSTRAINT corrections_essay_id_unique UNIQUE (essay_id);
