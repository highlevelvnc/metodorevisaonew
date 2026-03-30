'use server'

import { createActionClient } from '@/lib/supabase/server-action'
import { notifyLessonScheduled, notifyLessonRequested, notifyLastLessonCredit } from '@/lib/notifications'
import { trackProductEvent, trackOncePerUser } from '@/lib/analytics'

// ── Helpers: role check ──────────────────────────────────────────────────────

async function requireProfessor() {
  const supabase = await createActionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' as const, db: null as ReturnType<typeof Object>, userId: '' }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: profile } = await db.from('users').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'reviewer'].includes(profile.role)) {
    return { error: 'Sem permissão' as const, db: null as ReturnType<typeof Object>, userId: '' }
  }
  return { error: null, db, userId: user.id }
}

// ── Professor schedules a lesson for a student ────────────────────────────────

export async function scheduleLessonAction(params: {
  sessionDate: string
  sessionTime: string | null
  subject: string | null
  studentId: string | null
  studentName: string | null
  meetLink: string | null
  topic: string | null
  durationMin: number
  priceBrl: number
}): Promise<{ error?: string }> {
  const supabase = await createActionClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: profile } = await db.from('users').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'reviewer'].includes(profile.role)) {
    return { error: 'Sem permissão' }
  }

  const { error: insertErr } = await db
    .from('lesson_sessions')
    .insert({
      professor_id:  user.id,
      session_date:  params.sessionDate,
      session_time:  params.sessionTime,
      subject:       params.subject,
      student_id:    params.studentId,
      student_name:  params.studentName,
      meet_link:     params.meetLink,
      topic:         params.topic,
      duration_min:  params.durationMin,
      price_brl:     params.priceBrl,
      status:        'scheduled',
    })
    .select('id')
    .single()

  if (insertErr) {
    console.error('[scheduleLessonAction] Insert error:', insertErr)
    return { error: insertErr.message ?? 'Erro ao criar aula' }
  }

  // Send email to student (non-fatal)
  if (params.studentId) {
    try {
      const { data: studentData } = await db
        .from('users')
        .select('email, full_name')
        .eq('id', params.studentId)
        .single()

      if (studentData?.email) {
        await notifyLessonScheduled({
          studentEmail: studentData.email,
          studentName:  studentData.full_name ?? params.studentName,
          subject:      params.subject,
          sessionDate:  params.sessionDate,
          sessionTime:  params.sessionTime,
          durationMin:  params.durationMin,
          topic:        params.topic,
          meetLink:     params.meetLink,
        })
      }
    } catch (emailErr) {
      console.error('[scheduleLessonAction] Email send failed:', emailErr)
    }
  }

  return {}
}

// ── Student requests a lesson (validates credit, does NOT debit) ──────────────

export async function requestLessonAction(params: {
  sessionDate: string
  sessionTime: string | null
  subject: string | null
  notes: string | null
}): Promise<{ error?: string }> {
  const supabase = await createActionClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Call RPC: validates credit availability + inserts lesson (NO debit — debit happens on confirm)
  const { data: lessonId, error: rpcErr } = await db.rpc('request_lesson_atomic', {
    p_user_id:      user.id,
    p_session_date: params.sessionDate,
    p_session_time: params.sessionTime ?? null,
    p_subject:      params.subject ?? null,
    p_notes:        params.notes ?? null,
  })

  if (rpcErr) {
    const msg = rpcErr.message ?? ''
    console.error('[requestLessonAction] RPC error:', msg)

    if (msg.includes('NO_LESSON_PLAN')) {
      return { error: 'Você precisa de um plano de aulas ativo para solicitar aulas.' }
    }
    if (msg.includes('LESSON_CREDIT_LIMIT_REACHED')) {
      return { error: 'Você já atingiu o limite de aulas do seu plano (incluindo solicitações em andamento). Conclua ou cancele aulas abertas, ou faça upgrade.' }
    }
    if (msg.includes('AUTH_MISMATCH')) {
      return { error: 'Erro de autenticação.' }
    }
    // Unique index violation = duplicate lesson request
    if (msg.includes('idx_lesson_no_duplicate_open') || msg.includes('23505') || msg.includes('duplicate key')) {
      return { error: 'Você já tem uma aula solicitada para esta data, horário e matéria.' }
    }
    return { error: 'Erro ao solicitar aula. Tente novamente.' }
  }

  // Track lesson request
  trackProductEvent('lesson_requested', user.id, {
    subject: params.subject,
    session_date: params.sessionDate,
  })

  // Notify ALL professors about new request (non-fatal)
  try {
    const { data: studentData } = await db.from('users').select('email, full_name').eq('id', user.id).single()

    const { data: professors } = await db
      .from('users')
      .select('email, full_name')
      .in('role', ['admin', 'reviewer'])

    for (const prof of (professors ?? [])) {
      if (!prof?.email) continue
      try {
        await notifyLessonRequested({
          professorEmail: prof.email,
          studentEmail:   studentData?.email ?? user.email ?? '',
          studentName:    studentData?.full_name ?? null,
          subject:        params.subject,
          sessionDate:    params.sessionDate,
          sessionTime:    params.sessionTime,
          notes:          params.notes,
        })
      } catch { /* individual email failure is non-fatal */ }
    }
  } catch (emailErr) {
    console.error('[requestLessonAction] Email notification failed:', emailErr)
  }

  return {}
}

// ── Professor confirms a student-requested lesson ────────────────────────────

export async function confirmLessonAction(params: {
  lessonId: string
  meetLink?: string | null
}): Promise<{ error?: string }> {
  const { error: authErr, db, userId } = await requireProfessor()
  if (authErr) return { error: authErr }

  // Fetch lesson — try own first, then unassigned
  // Two explicit queries instead of .or() string interpolation (security: no SQL injection risk)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lesson: any = null
  const selectFields = 'id, status, professor_id, student_id, student_name, session_date, session_time, subject, topic, duration_min, meet_link'

  // 1. Check if this professor owns the lesson
  const { data: ownLesson } = await db
    .from('lesson_sessions')
    .select(selectFields)
    .eq('id', params.lessonId)
    .eq('professor_id', userId)
    .maybeSingle()

  if (ownLesson) {
    lesson = ownLesson
  } else {
    // 2. Check if lesson is unassigned (professor_id IS NULL)
    const { data: unassigned } = await db
      .from('lesson_sessions')
      .select(selectFields)
      .eq('id', params.lessonId)
      .is('professor_id', null)
      .maybeSingle()
    lesson = unassigned
  }

  if (!lesson) return { error: 'Aula não encontrada' }
  if (lesson.status !== 'requested') return { error: 'Apenas aulas solicitadas podem ser confirmadas' }

  // Debit lesson credit from student — FATAL: if debit fails, lesson is NOT confirmed.
  // This prevents revenue leakage from silent debit failures.
  if (lesson.student_id) {
    const { error: debitErr } = await db.rpc('confirm_lesson_debit', {
      p_lesson_id: params.lessonId,
      p_professor_id: userId,
    })
    if (debitErr) {
      const msg = debitErr.message ?? ''
      console.error('[confirmLessonAction] Credit debit FAILED — lesson NOT confirmed:', msg)
      if (msg.includes('LESSON_NOT_FOUND_OR_NOT_REQUESTED')) {
        return { error: 'Aula não encontrada ou já foi confirmada por outro professor.' }
      }
      return { error: 'Não foi possível debitar o crédito do aluno. A aula não foi confirmada. Tente novamente.' }
    }
  }

  // Check if this debit left the student with exactly 1 credit → send alert
  if (lesson.student_id) {
    try {
      const { data: subAfter } = await db
        .from('subscriptions')
        .select('id, lessons_used, lessons_limit, current_period_start, plans!inner(name, plan_type)')
        .eq('user_id', lesson.student_id)
        .eq('status', 'active')
        .eq('plans.plan_type', 'lesson')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (subAfter) {
        const remaining = subAfter.lessons_limit - subAfter.lessons_used
        if (remaining === 1) {
          // Deduplicate: one alert per billing cycle.
          // Key uses sub ID + current_period_start (set by webhook on activation/renewal).
          // When handleRenewal resets credits, it also updates current_period_start,
          // so the key changes and the email can fire again in the new cycle.
          const cycleKey = subAfter.current_period_start
            ? new Date(subAfter.current_period_start).toISOString().slice(0, 10) // "2026-04-15"
            : new Date().toISOString().slice(0, 7) // fallback to YYYY-MM
          const dedupeKey = `last_credit_lesson_${subAfter.id}_${cycleKey}`
          trackOncePerUser(dedupeKey as any, lesson.student_id) // eslint-disable-line @typescript-eslint/no-explicit-any

          const { data: studentInfo } = await db
            .from('users')
            .select('email, full_name')
            .eq('id', lesson.student_id)
            .single()

          if (studentInfo?.email) {
            await notifyLastLessonCredit({
              studentEmail: studentInfo.email,
              studentName: studentInfo.full_name,
              planName: subAfter.plans?.name ?? 'Reforço',
            })
            console.log(`[confirmLessonAction] Last credit alert sent to ${studentInfo.email}`)
          }
        }
      }
    } catch (e) {
      console.error('[confirmLessonAction] Last credit check failed (non-fatal):', e)
    }
  }

  // Claim the lesson: set professor_id + status + optional meet link
  const updates: Record<string, unknown> = {
    status: 'scheduled',
    professor_id: userId,
  }
  if (params.meetLink) updates.meet_link = params.meetLink

  const { error: updateErr } = await db
    .from('lesson_sessions')
    .update(updates)
    .eq('id', params.lessonId)

  if (updateErr) {
    console.error('[confirmLessonAction] Update error:', updateErr)
    return { error: updateErr.message ?? 'Erro ao confirmar aula' }
  }

  // Track lesson confirmation
  trackProductEvent('lesson_confirmed', userId, {
    lesson_id: params.lessonId,
    subject: lesson.subject,
    student_id: lesson.student_id,
  })

  // Notify student (non-fatal)
  if (lesson.student_id) {
    try {
      const { data: student } = await db.from('users').select('email, full_name').eq('id', lesson.student_id).single()
      if (student?.email) {
        await notifyLessonScheduled({
          studentEmail: student.email,
          studentName:  student.full_name ?? lesson.student_name,
          subject:      lesson.subject,
          sessionDate:  lesson.session_date,
          sessionTime:  lesson.session_time,
          durationMin:  lesson.duration_min ?? 60,
          topic:        lesson.topic,
          meetLink:     params.meetLink ?? lesson.meet_link,
        })
      }
    } catch (e) {
      console.error('[confirmLessonAction] Email failed:', e)
    }
  }

  return {}
}

// ── Professor marks a lesson as completed ─────────────────────────────────────

export async function completeLessonAction(lessonId: string): Promise<{ error?: string }> {
  const { error: authErr, db, userId } = await requireProfessor()
  if (authErr) return { error: authErr }

  const { data: lesson } = await db
    .from('lesson_sessions')
    .select('id, status')
    .eq('id', lessonId)
    .eq('professor_id', userId)
    .single()

  if (!lesson) return { error: 'Aula não encontrada' }
  if (lesson.status !== 'scheduled') return { error: 'Apenas aulas agendadas podem ser concluídas' }

  const { error: updateErr } = await db
    .from('lesson_sessions')
    .update({ status: 'completed' })
    .eq('id', lessonId)

  if (updateErr) {
    console.error('[completeLessonAction] Update error:', updateErr)
    return { error: updateErr.message ?? 'Erro ao concluir aula' }
  }

  return {}
}

// ── Professor cancels a lesson (refunds credit only if status was 'scheduled') ──

export async function cancelLessonAction(lessonId: string): Promise<{ error?: string }> {
  const { error: authErr, db, userId } = await requireProfessor()
  if (authErr) return { error: authErr }

  // Match own lessons OR unassigned — two explicit queries (no string interpolation)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lesson: any = null

  const { data: own } = await db
    .from('lesson_sessions')
    .select('id, status, student_id')
    .eq('id', lessonId)
    .eq('professor_id', userId)
    .maybeSingle()

  if (own) {
    lesson = own
  } else {
    const { data: unassigned } = await db
      .from('lesson_sessions')
      .select('id, status, student_id')
      .eq('id', lessonId)
      .is('professor_id', null)
      .maybeSingle()
    lesson = unassigned
  }

  if (!lesson) return { error: 'Aula não encontrada' }
  if (lesson.status === 'completed') return { error: 'Aulas concluídas não podem ser canceladas' }
  if (lesson.status === 'cancelled') return { error: 'Aula já cancelada' }

  // Refund lesson credit ONLY if lesson was 'scheduled' (credit was consumed on confirm).
  // 'requested' lessons never consumed credit, so no refund needed.
  // The RPC itself also checks status, but we guard here for clarity.
  if (lesson.student_id && lesson.status === 'scheduled') {
    try {
      const { error: refundErr } = await db.rpc('refund_lesson_credit', {
        p_lesson_id: lessonId,
      })
      if (refundErr) {
        console.error('[cancelLessonAction] Credit refund failed (non-fatal):', refundErr.message)
      }
    } catch (e) {
      console.error('[cancelLessonAction] Refund RPC threw (non-fatal):', e)
    }
  }

  const { error: updateErr } = await db
    .from('lesson_sessions')
    .update({ status: 'cancelled' })
    .eq('id', lessonId)

  if (updateErr) {
    console.error('[cancelLessonAction] Update error:', updateErr)
    return { error: updateErr.message ?? 'Erro ao cancelar aula' }
  }

  return {}
}
