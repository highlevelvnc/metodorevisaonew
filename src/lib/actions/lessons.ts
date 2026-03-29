'use server'

import { createActionClient } from '@/lib/supabase/server-action'
import { notifyLessonScheduled, notifyLessonRequested } from '@/lib/notifications'

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

  // Verify caller is professor/admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: profile } = await db.from('users').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'reviewer'].includes(profile.role)) {
    return { error: 'Sem permissão' }
  }

  const { data: inserted, error: insertErr } = await db
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

// ── Student requests a lesson ─────────────────────────────────────────────────

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

  // Fetch student profile for the email
  const { data: studentData } = await db
    .from('users')
    .select('email, full_name')
    .eq('id', user.id)
    .single()

  // Find first professor (admin or reviewer)
  const { data: professorData } = await db
    .from('users')
    .select('id, email, full_name')
    .in('role', ['admin', 'reviewer'])
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!professorData?.id) {
    return { error: 'Nenhum professor encontrado. Contate o suporte.' }
  }

  const { error: insertErr } = await db
    .from('lesson_sessions')
    .insert({
      professor_id: professorData.id,
      student_id:   user.id,
      student_name: studentData?.full_name ?? null,
      session_date: params.sessionDate,
      session_time: params.sessionTime,
      subject:      params.subject,
      notes:        params.notes,
      duration_min: 60,
      status:       'requested',
    })

  if (insertErr) {
    console.error('[requestLessonAction] Insert error:', insertErr)
    return { error: insertErr.message ?? 'Erro ao solicitar aula' }
  }

  // Notify professor (non-fatal)
  if (professorData?.email) {
    try {
      await notifyLessonRequested({
        professorEmail: professorData.email,
        studentEmail:   studentData?.email ?? user.email ?? '',
        studentName:    studentData?.full_name ?? null,
        subject:        params.subject,
        sessionDate:    params.sessionDate,
        sessionTime:    params.sessionTime,
        notes:          params.notes,
      })
    } catch (emailErr) {
      console.error('[requestLessonAction] Professor email failed:', emailErr)
    }
  }

  return {}
}
