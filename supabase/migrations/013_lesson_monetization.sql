-- 013: Lesson monetization — plan_type, lesson credits, atomic debit, professor_id nullable
-- Backwards compatible: all additions use DEFAULTs, existing rows unaffected.

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Extend plans table
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'essay';

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS lesson_count int NOT NULL DEFAULT 0;

-- Check constraint: plan_type must be 'essay' or 'lesson'
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'plans_plan_type_check'
  ) THEN
    ALTER TABLE public.plans
      ADD CONSTRAINT plans_plan_type_check CHECK (plan_type IN ('essay', 'lesson'));
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Extend subscriptions table
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS lessons_used int NOT NULL DEFAULT 0;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS lessons_limit int NOT NULL DEFAULT 0;

-- CHECK constraint: lessons_used must be within bounds
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subs_lessons_used_lte_limit'
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subs_lessons_used_lte_limit
      CHECK (lessons_used >= 0 AND lessons_used <= lessons_limit)
      NOT VALID;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Make professor_id nullable in lesson_sessions
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.lesson_sessions ALTER COLUMN professor_id DROP NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Seed lesson plans (6 tiers, prices defined by client)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO public.plans (name, slug, price_brl, essay_count, lesson_count, plan_type, active) VALUES
  ('Reforço 4',  'reforco-4',  316.00,  0, 4,  'lesson', true),
  ('Reforço 8',  'reforco-8',  600.00,  0, 8,  'lesson', true),
  ('Reforço 12', 'reforco-12', 864.00,  0, 12, 'lesson', true),
  ('Reforço 16', 'reforco-16', 1120.00, 0, 16, 'lesson', true),
  ('Reforço 22', 'reforco-22', 1496.00, 0, 22, 'lesson', true),
  ('Reforço 34', 'reforco-34', 2210.00, 0, 34, 'lesson', true)
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Atomic lesson credit debit + insert
-- Modeled on submit_essay_atomic (schema.sql lines 269-325)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.request_lesson_atomic(
  p_user_id     uuid,
  p_session_date text,
  p_session_time text DEFAULT NULL,
  p_subject     text DEFAULT NULL,
  p_notes       text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub_id     uuid;
  v_used       int;
  v_limit      int;
  v_lesson_id  uuid;
BEGIN
  -- Verify caller identity
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'AUTH_MISMATCH';
  END IF;

  -- Lock the active lesson subscription row
  SELECT s.id, s.lessons_used, s.lessons_limit
    INTO v_sub_id, v_used, v_limit
    FROM subscriptions s
    JOIN plans p ON p.id = s.plan_id
   WHERE s.user_id = p_user_id
     AND s.status  = 'active'
     AND p.plan_type = 'lesson'
   ORDER BY s.created_at DESC
   LIMIT 1
     FOR UPDATE OF s;

  IF v_sub_id IS NULL THEN
    RAISE EXCEPTION 'NO_LESSON_PLAN';
  END IF;

  IF v_used >= v_limit THEN
    RAISE EXCEPTION 'LESSON_CREDIT_LIMIT_REACHED';
  END IF;

  -- Debit credit
  UPDATE subscriptions
     SET lessons_used = lessons_used + 1
   WHERE id = v_sub_id;

  -- Insert lesson request (professor_id = NULL, will be claimed by professor)
  INSERT INTO lesson_sessions (
    professor_id, student_id, student_name, session_date, session_time,
    subject, notes, duration_min, status
  )
  SELECT
    NULL,
    p_user_id,
    u.full_name,
    p_session_date::date,
    p_session_time,
    p_subject,
    p_notes,
    60,
    'requested'
  FROM users u WHERE u.id = p_user_id
  RETURNING id INTO v_lesson_id;

  RETURN v_lesson_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_lesson_atomic TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. Lesson credit refund (called when professor cancels a requested/scheduled lesson)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.refund_lesson_credit(
  p_lesson_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id uuid;
  v_sub_id     uuid;
BEGIN
  -- Get student from lesson
  SELECT student_id INTO v_student_id
    FROM lesson_sessions
   WHERE id = p_lesson_id;

  IF v_student_id IS NULL THEN
    RETURN; -- No student linked, nothing to refund
  END IF;

  -- Find their active lesson subscription
  SELECT s.id INTO v_sub_id
    FROM subscriptions s
    JOIN plans p ON p.id = s.plan_id
   WHERE s.user_id = v_student_id
     AND s.status  = 'active'
     AND p.plan_type = 'lesson'
   ORDER BY s.created_at DESC
   LIMIT 1
     FOR UPDATE OF s;

  IF v_sub_id IS NULL THEN
    RETURN; -- No active plan, skip refund
  END IF;

  -- Decrement (with floor of 0)
  UPDATE subscriptions
     SET lessons_used = GREATEST(lessons_used - 1, 0)
   WHERE id = v_sub_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refund_lesson_credit TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. RLS: professors can view and claim unassigned lesson requests
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'lesson_sessions' AND policyname = 'Professors can view unassigned requests'
  ) THEN
    CREATE POLICY "Professors can view unassigned requests"
      ON public.lesson_sessions
      FOR SELECT
      USING (
        professor_id IS NULL
        AND status = 'requested'
        AND is_admin_or_reviewer()
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'lesson_sessions' AND policyname = 'Professors can update own and unassigned lessons'
  ) THEN
    CREATE POLICY "Professors can update own and unassigned lessons"
      ON public.lesson_sessions
      FOR UPDATE
      USING (
        is_admin_or_reviewer()
        AND (professor_id = auth.uid() OR professor_id IS NULL)
      );
  END IF;
END $$;
