-- 012: Add 'requested' status for student-initiated lesson bookings
-- Also adds RLS policy so students can insert their own lesson requests

-- Widen the status check constraint to include 'requested'
-- (drop old constraint if it exists, then recreate)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'lesson_sessions_status_check'
  ) THEN
    ALTER TABLE public.lesson_sessions DROP CONSTRAINT lesson_sessions_status_check;
  END IF;
  ALTER TABLE public.lesson_sessions
    ADD CONSTRAINT lesson_sessions_status_check
    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'requested'));
END $$;

-- RLS: students can insert a lesson request for themselves
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'lesson_sessions' AND policyname = 'Students can request lessons'
  ) THEN
    CREATE POLICY "Students can request lessons"
      ON public.lesson_sessions
      FOR INSERT
      WITH CHECK (auth.uid() = student_id AND status = 'requested');
  END IF;
END $$;

-- RLS: students can also view their requested (pending) lessons
-- (the existing "Students can view own lessons" already covers all statuses via student_id = auth.uid())
