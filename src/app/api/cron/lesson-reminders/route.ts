/**
 * GET /api/cron/lesson-reminders
 *
 * Sends reminder emails for upcoming lessons:
 * - 24h before: "Lembrete da sua aula de amanhã"
 * - 1h before:  "Sua aula começa em 1 hora!"
 *
 * Called every hour by Vercel Cron (vercel.json: "15 * * * *").
 * Protected by CRON_SECRET Bearer token.
 *
 * Timezone: All lesson times are in BRT (America/Sao_Paulo, UTC-3).
 * session_date + session_time are stored as text without timezone,
 * so we append -03:00 to interpret them correctly on UTC servers.
 *
 * Idempotent: uses time-window approach —
 * 24h reminders for lessons 23–25h away, 1h reminders for 30–90min away.
 * Running the cron every hour ensures each lesson gets exactly one reminder per window.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { notifyLessonReminder } from '@/lib/notifications'

// Brazil Standard Time offset (UTC-3). All lessons are in this timezone.
const BRT_OFFSET = '-03:00'

export async function GET(req: Request) {
  // Auth check
  const authHeader = req.headers.get('authorization') ?? ''
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any
  const nowMs = Date.now()

  // Windows in absolute UTC milliseconds
  const windows: { hoursUntil: 24 | 1; fromMs: number; toMs: number }[] = [
    { hoursUntil: 24, fromMs: nowMs + 23 * 3600_000, toMs: nowMs + 25 * 3600_000 },
    { hoursUntil: 1,  fromMs: nowMs + 30 * 60_000,   toMs: nowMs + 90 * 60_000   },
  ]

  // Only fetch lessons in the broadest window (next 25 hours) to avoid full table scan.
  // Filter by session_date to narrow DB scan before JS-side time check.
  const todayStr = new Date(nowMs).toISOString().slice(0, 10)
  const tomorrowStr = new Date(nowMs + 48 * 3600_000).toISOString().slice(0, 10)

  // Single query: lesson data + student email + professor name (no N+1)
  const { data: lessons } = await db
    .from('lesson_sessions')
    .select(`
      id, session_date, session_time, subject, meet_link,
      student:users!lesson_sessions_student_id_fkey(email, full_name),
      professor:users!lesson_sessions_professor_id_fkey(full_name)
    `)
    .eq('status', 'scheduled')
    .not('student_id', 'is', null)
    .not('session_time', 'is', null)
    .gte('session_date', todayStr)
    .lte('session_date', tomorrowStr)

  if (!lessons || lessons.length === 0) {
    console.log('[lesson-reminders] No scheduled lessons in window — nothing to do')
    return Response.json({ sent: 0, errors: 0 })
  }

  let sent = 0
  let errors = 0

  for (const lesson of lessons) {
    // Build timezone-aware datetime: "2026-04-02T14:00:00-03:00"
    const lessonMs = new Date(`${lesson.session_date}T${lesson.session_time}:00${BRT_OFFSET}`).getTime()
    if (isNaN(lessonMs)) continue

    const studentEmail = lesson.student?.email
    const studentName  = lesson.student?.full_name ?? null
    if (!studentEmail) continue

    // Check which window this lesson falls into (if any)
    for (const window of windows) {
      if (lessonMs < window.fromMs || lessonMs > window.toMs) continue

      try {
        await notifyLessonReminder({
          studentEmail,
          studentName,
          subject:       lesson.subject,
          sessionDate:   lesson.session_date,
          sessionTime:   lesson.session_time,
          meetLink:      lesson.meet_link,
          professorName: lesson.professor?.full_name ?? null,
          hoursUntil:    window.hoursUntil,
        })
        sent++
        console.log(`[lesson-reminders] Sent ${window.hoursUntil}h reminder to ${studentEmail} for lesson ${lesson.id}`)
      } catch (err) {
        errors++
        console.error(`[lesson-reminders] Failed for lesson ${lesson.id}:`, err)
      }
      break // A lesson matches at most one window
    }
  }

  console.log(`[lesson-reminders] Done: sent=${sent} errors=${errors}`)
  return Response.json({ sent, errors })
}
