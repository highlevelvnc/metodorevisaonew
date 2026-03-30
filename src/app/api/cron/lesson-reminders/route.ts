/**
 * GET /api/cron/lesson-reminders
 *
 * Sends reminder emails for upcoming lessons:
 * - 24h before: "Lembrete da sua aula de amanhã"
 * - 1h before:  "Sua aula começa em 1 hora!"
 *
 * Should be called every hour by Vercel Cron or external scheduler.
 * Protected by CRON_SECRET Bearer token.
 *
 * Idempotent: uses a simple time-window approach —
 * 24h reminders for lessons 23–25h away, 1h reminders for lessons 0.5–1.5h away.
 * Running the cron every hour ensures each lesson gets exactly one reminder per window.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { notifyLessonReminder } from '@/lib/notifications'

export async function GET(req: Request) {
  // Auth check
  const authHeader = req.headers.get('authorization') ?? ''
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any
  const now = new Date()

  // Windows: 24h reminder (23–25h from now), 1h reminder (30min–90min from now)
  const windows: { hoursUntil: 24 | 1; from: string; to: string }[] = [
    {
      hoursUntil: 24,
      from: new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString(),
      to:   new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString(),
    },
    {
      hoursUntil: 1,
      from: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
      to:   new Date(now.getTime() + 90 * 60 * 1000).toISOString(),
    },
  ]

  let sent = 0
  let errors = 0

  for (const window of windows) {
    // Find scheduled lessons in this time window
    // Combine session_date + session_time into a comparable timestamp
    const { data: lessons } = await db
      .from('lesson_sessions')
      .select('id, student_id, session_date, session_time, subject, meet_link, professor_id, users!lesson_sessions_professor_id_fkey(full_name)')
      .eq('status', 'scheduled')
      .not('student_id', 'is', null)
      .not('session_time', 'is', null)

    if (!lessons || lessons.length === 0) continue

    for (const lesson of lessons) {
      // Build full datetime from session_date + session_time
      const lessonDateTime = new Date(`${lesson.session_date}T${lesson.session_time}:00`)
      const lessonISO = lessonDateTime.toISOString()

      // Check if lesson falls in this window
      if (lessonISO < window.from || lessonISO > window.to) continue

      // Get student email
      const { data: student } = await db
        .from('users')
        .select('email, full_name')
        .eq('id', lesson.student_id)
        .single()

      if (!student?.email) continue

      try {
        await notifyLessonReminder({
          studentEmail:  student.email,
          studentName:   student.full_name,
          subject:       lesson.subject,
          sessionDate:   lesson.session_date,
          sessionTime:   lesson.session_time,
          meetLink:      lesson.meet_link,
          professorName: lesson.users?.full_name ?? null,
          hoursUntil:    window.hoursUntil,
        })
        sent++
        console.log(`[lesson-reminders] Sent ${window.hoursUntil}h reminder to ${student.email} for lesson ${lesson.id}`)
      } catch (err) {
        errors++
        console.error(`[lesson-reminders] Failed for lesson ${lesson.id}:`, err)
      }
    }
  }

  console.log(`[lesson-reminders] Done: sent=${sent} errors=${errors}`)
  return Response.json({ sent, errors })
}
