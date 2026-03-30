-- 016: Prevent duplicate lesson requests
-- A student cannot have two open lessons (requested/scheduled) for the same date + time + subject.
-- This guards against double-submit from network retries or rapid clicks.

CREATE UNIQUE INDEX IF NOT EXISTS idx_lesson_no_duplicate_open
  ON public.lesson_sessions (student_id, session_date, session_time, subject)
  WHERE status IN ('requested', 'scheduled');
