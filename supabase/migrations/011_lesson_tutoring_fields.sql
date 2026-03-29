-- 011: Add tutoring fields to lesson_sessions
-- Supports: Google Meet link, subject, session time, price per session

-- Meet link for the lesson (Google Meet / Zoom URL)
ALTER TABLE public.lesson_sessions
  ADD COLUMN IF NOT EXISTS meet_link text DEFAULT NULL;

-- Subject being taught (e.g., 'Português', 'Inglês', 'Redação', 'Literatura')
ALTER TABLE public.lesson_sessions
  ADD COLUMN IF NOT EXISTS subject text DEFAULT NULL;

-- Time of day for the session (e.g., '19:15')
ALTER TABLE public.lesson_sessions
  ADD COLUMN IF NOT EXISTS session_time text DEFAULT NULL;

-- Price charged for this specific session (allows per-session pricing)
ALTER TABLE public.lesson_sessions
  ADD COLUMN IF NOT EXISTS price_brl numeric(8,2) DEFAULT 20.00;

-- Student name snapshot (for display when student_id may not have a profile yet)
ALTER TABLE public.lesson_sessions
  ADD COLUMN IF NOT EXISTS student_name text DEFAULT NULL;

-- Index for student queries (my upcoming lessons)
CREATE INDEX IF NOT EXISTS idx_lesson_sessions_student
  ON public.lesson_sessions (student_id, session_date)
  WHERE student_id IS NOT NULL;

-- RLS: students can read their own lessons
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'lesson_sessions' AND policyname = 'Students can view own lessons'
  ) THEN
    CREATE POLICY "Students can view own lessons"
      ON public.lesson_sessions
      FOR SELECT
      USING (auth.uid() = student_id);
  END IF;
END $$;
