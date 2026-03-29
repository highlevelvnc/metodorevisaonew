-- 014: Change lesson credit flow
-- OLD: debit on request, refund on cancel
-- NEW: validate on request, debit on confirm (scheduled), refund on cancel of scheduled

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Replace request_lesson_atomic — now VALIDATE-ONLY, no debit
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

  -- Check active lesson subscription exists with available credits
  -- (read-only validation — no debit, no lock needed)
  SELECT s.id, s.lessons_used, s.lessons_limit
    INTO v_sub_id, v_used, v_limit
    FROM subscriptions s
    JOIN plans p ON p.id = s.plan_id
   WHERE s.user_id = p_user_id
     AND s.status  = 'active'
     AND p.plan_type = 'lesson'
   ORDER BY s.created_at DESC
   LIMIT 1;

  IF v_sub_id IS NULL THEN
    RAISE EXCEPTION 'NO_LESSON_PLAN';
  END IF;

  IF v_used >= v_limit THEN
    RAISE EXCEPTION 'LESSON_CREDIT_LIMIT_REACHED';
  END IF;

  -- Insert lesson request (NO credit debit — just validation passed)
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

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. New: confirm_lesson_debit — atomic debit when professor confirms
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.confirm_lesson_debit(
  p_lesson_id   uuid,
  p_professor_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id uuid;
  v_sub_id     uuid;
  v_used       int;
  v_limit      int;
BEGIN
  -- Get student from lesson
  SELECT student_id INTO v_student_id
    FROM lesson_sessions
   WHERE id = p_lesson_id
     AND status = 'requested';

  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'LESSON_NOT_FOUND_OR_NOT_REQUESTED';
  END IF;

  -- Lock the student's active lesson subscription
  SELECT s.id, s.lessons_used, s.lessons_limit
    INTO v_sub_id, v_used, v_limit
    FROM subscriptions s
    JOIN plans p ON p.id = s.plan_id
   WHERE s.user_id = v_student_id
     AND s.status  = 'active'
     AND p.plan_type = 'lesson'
   ORDER BY s.created_at DESC
   LIMIT 1
     FOR UPDATE OF s;

  IF v_sub_id IS NULL THEN
    -- Student lost their plan between request and confirm; allow confirm anyway
    -- (professor shouldn't be blocked from confirming a valid request)
    RAISE WARNING 'Student % has no active lesson plan — confirming without debit', v_student_id;
    RETURN;
  END IF;

  IF v_used >= v_limit THEN
    -- Credits exhausted between request and confirm; allow confirm anyway
    RAISE WARNING 'Student % lesson credits exhausted — confirming without debit', v_student_id;
    RETURN;
  END IF;

  -- Debit 1 lesson credit
  UPDATE subscriptions
     SET lessons_used = lessons_used + 1
   WHERE id = v_sub_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_lesson_debit TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Replace refund_lesson_credit — only refund if lesson was 'scheduled'
-- (requested lessons never consumed credit, so no refund needed)
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
  v_status     text;
  v_sub_id     uuid;
BEGIN
  -- Get student and current status from lesson
  SELECT student_id, status INTO v_student_id, v_status
    FROM lesson_sessions
   WHERE id = p_lesson_id;

  -- Only refund if the lesson was scheduled (credit was consumed on confirm)
  -- Requested lessons never consumed credit, so cancelling them costs nothing
  IF v_student_id IS NULL OR v_status <> 'scheduled' THEN
    RETURN;
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
    RETURN;
  END IF;

  -- Decrement (with floor of 0)
  UPDATE subscriptions
     SET lessons_used = GREATEST(lessons_used - 1, 0)
   WHERE id = v_sub_id;
END;
$$;
