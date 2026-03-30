-- 018: Lesson feedback — post-lesson student ratings
-- Stores star rating (1-5) + optional comment per completed lesson.
-- One feedback per lesson per student (UNIQUE constraint).

CREATE TABLE IF NOT EXISTS public.lesson_feedback (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id     uuid NOT NULL REFERENCES public.lesson_sessions(id) ON DELETE CASCADE,
  student_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  professor_id  uuid REFERENCES public.users(id) ON DELETE SET NULL,
  subject       text,
  rating        smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       text DEFAULT NULL,
  created_at    timestamptz DEFAULT now() NOT NULL,

  CONSTRAINT lesson_feedback_unique UNIQUE (lesson_id, student_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lesson_feedback_student ON public.lesson_feedback (student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_feedback_professor ON public.lesson_feedback (professor_id, created_at DESC);

-- RLS
ALTER TABLE public.lesson_feedback ENABLE ROW LEVEL SECURITY;

-- Students can insert their own feedback
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lesson_feedback' AND policyname = 'Students can insert own feedback') THEN
    CREATE POLICY "Students can insert own feedback"
      ON public.lesson_feedback FOR INSERT
      WITH CHECK (auth.uid() = student_id);
  END IF;
END $$;

-- Students can read their own feedback
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lesson_feedback' AND policyname = 'Students can view own feedback') THEN
    CREATE POLICY "Students can view own feedback"
      ON public.lesson_feedback FOR SELECT
      USING (auth.uid() = student_id);
  END IF;
END $$;

-- Professors can read feedback about them
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lesson_feedback' AND policyname = 'Professors can view own feedback') THEN
    CREATE POLICY "Professors can view own feedback"
      ON public.lesson_feedback FOR SELECT
      USING (is_admin_or_reviewer());
  END IF;
END $$;
