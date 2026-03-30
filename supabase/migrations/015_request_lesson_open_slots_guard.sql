-- 015: Guard against excess open lesson requests
-- A student cannot have more open lessons (requested + scheduled) than their total credit limit.
-- This prevents abuse since requests don't consume credits until confirmed.
--
-- Formula: open_lessons (requested + scheduled) + lessons_used (confirmed & consumed) <= lessons_limit

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
  v_sub_id       uuid;
  v_used         int;
  v_limit        int;
  v_open_count   int;
  v_available    int;
  v_lesson_id    uuid;
BEGIN
  -- Verify caller identity
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'AUTH_MISMATCH';
  END IF;

  -- 1. Check active lesson subscription
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

  -- 2. Count open lessons (requested + scheduled = not yet completed/cancelled)
  SELECT COUNT(*)
    INTO v_open_count
    FROM lesson_sessions
   WHERE student_id = p_user_id
     AND status IN ('requested', 'scheduled');

  -- 3. Check: used (confirmed) + open (pending/scheduled) must be < limit
  v_available := v_limit - v_used - v_open_count;

  IF v_available <= 0 THEN
    RAISE EXCEPTION 'LESSON_CREDIT_LIMIT_REACHED';
  END IF;

  -- 4. Insert lesson request (no debit — debit happens on confirm)
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
