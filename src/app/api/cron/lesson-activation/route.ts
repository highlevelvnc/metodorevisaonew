/**
 * GET /api/cron/lesson-activation
 *
 * Three automated email flows for lesson retention:
 * 1. Activation nudge (24-48h after purchase, no lessons booked)
 * 2. Post-lesson re-booking (2-4h after lesson completed)
 * 3. Reactivation (5+ days inactive with credits remaining)
 *
 * Optimized: uses batch queries with JOINs instead of N+1 loops.
 * Called every 2 hours by Vercel Cron.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { notifyNoLessonBooked, notifyLessonCompleted, notifyLessonInactive } from '@/lib/notifications'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization') ?? ''
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any
  const now = Date.now()
  let activationSent = 0
  let rebookingSent = 0
  let reactivationSent = 0
  let errors = 0

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ACTIVATION NUDGE — 24-48h after purchase, zero lessons ever
  // Single query: subscriptions + user data joined, then filter in JS
  // ═══════════════════════════════════════════════════════════════════════════
  const since48h = new Date(now - 48 * 3600_000).toISOString()
  const until24h = new Date(now - 24 * 3600_000).toISOString()

  const { data: recentLessonSubs } = await db
    .from('subscriptions')
    .select('user_id, lessons_limit, plans!inner(name, plan_type), user:users!subscriptions_user_id_fkey(email, full_name)')
    .eq('status', 'active')
    .eq('plans.plan_type', 'lesson')
    .gte('created_at', since48h)
    .lte('created_at', until24h)

  if (recentLessonSubs && recentLessonSubs.length > 0) {
    // Batch: get all user_ids that have ANY lesson_sessions
    const userIds = recentLessonSubs.map((s: any) => s.user_id) // eslint-disable-line @typescript-eslint/no-explicit-any
    const { data: usersWithLessons } = await db
      .from('lesson_sessions')
      .select('student_id')
      .in('student_id', userIds)

    const hasLessonSet = new Set((usersWithLessons ?? []).map((l: any) => l.student_id)) // eslint-disable-line @typescript-eslint/no-explicit-any

    for (const sub of recentLessonSubs) {
      if (hasLessonSet.has(sub.user_id)) continue
      if (!sub.user?.email) continue

      try {
        await notifyNoLessonBooked({
          studentEmail: sub.user.email,
          studentName: sub.user.full_name,
          creditsTotal: sub.lessons_limit,
          planName: sub.plans?.name ?? 'Reforço',
        })
        activationSent++
      } catch (err) {
        errors++
        console.error(`[lesson-activation] Nudge failed for ${sub.user_id}:`, err)
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. POST-LESSON RE-BOOKING — 2-4h after lesson completed
  // Single query: lessons + student + subscription joined
  // ═══════════════════════════════════════════════════════════════════════════
  const since4h = new Date(now - 4 * 3600_000).toISOString()
  const until2h = new Date(now - 2 * 3600_000).toISOString()

  const { data: completedLessons } = await db
    .from('lesson_sessions')
    .select('id, student_id, subject, student:users!lesson_sessions_student_id_fkey(email, full_name)')
    .eq('status', 'completed')
    .not('student_id', 'is', null)
    .gte('updated_at', since4h)
    .lte('updated_at', until2h)

  if (completedLessons && completedLessons.length > 0) {
    // Batch: get all active lesson subscriptions for these students
    const studentIds = Array.from(new Set(completedLessons.map((l: any) => l.student_id))) // eslint-disable-line @typescript-eslint/no-explicit-any
    const { data: studentSubs } = await db
      .from('subscriptions')
      .select('user_id, lessons_used, lessons_limit, plans!inner(plan_type)')
      .in('user_id', studentIds)
      .eq('status', 'active')
      .eq('plans.plan_type', 'lesson')

    const subByUser = new Map<string, { lessons_used: number; lessons_limit: number }>()
    for (const s of (studentSubs ?? [])) {
      subByUser.set(s.user_id, s)
    }

    for (const lesson of completedLessons) {
      if (!lesson.student?.email) continue
      const sub = subByUser.get(lesson.student_id)
      const creditsLeft = sub ? Math.max(0, sub.lessons_limit - sub.lessons_used) : 0

      try {
        await notifyLessonCompleted({
          studentEmail: lesson.student.email,
          studentName: lesson.student.full_name,
          subject: lesson.subject,
          creditsLeft,
          lessonId: lesson.id,
        })
        rebookingSent++
      } catch (err) {
        errors++
        console.error(`[lesson-activation] Re-booking failed for ${lesson.student_id}:`, err)
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. REACTIVATION — 5+ days inactive, has credits, max 1 email per 7 days
  // Batch: subscriptions + users joined, then batch lesson + dedup checks
  // ═══════════════════════════════════════════════════════════════════════════
  const { data: allLessonSubs } = await db
    .from('subscriptions')
    .select('user_id, lessons_used, lessons_limit, plans!inner(name, plan_type), user:users!subscriptions_user_id_fkey(email, full_name)')
    .eq('status', 'active')
    .eq('plans.plan_type', 'lesson')

  const eligibleSubs = (allLessonSubs ?? []).filter((s: any) => // eslint-disable-line @typescript-eslint/no-explicit-any
    s.lessons_limit - s.lessons_used > 0 && s.user?.email
  )

  if (eligibleSubs.length > 0) {
    const eligibleUserIds = eligibleSubs.map((s: any) => s.user_id) // eslint-disable-line @typescript-eslint/no-explicit-any

    // Batch: last lesson per student (most recent updated_at)
    const { data: lastLessons } = await db
      .from('lesson_sessions')
      .select('student_id, subject, updated_at')
      .in('student_id', eligibleUserIds)
      .order('updated_at', { ascending: false })

    // Build map: user_id → most recent lesson
    const lastLessonByUser = new Map<string, { subject: string | null; updated_at: string }>()
    for (const l of (lastLessons ?? [])) {
      if (!lastLessonByUser.has(l.student_id)) {
        lastLessonByUser.set(l.student_id, l)
      }
    }

    // Batch: recent reactivation nudges (dedup check)
    const sevenDaysAgo = new Date(now - 7 * 24 * 3600_000).toISOString()
    const { data: recentNudges } = await db
      .from('product_events')
      .select('user_id')
      .eq('event_name', 'lesson_reactivation_sent')
      .in('user_id', eligibleUserIds)
      .gte('created_at', sevenDaysAgo)

    const nudgedRecently = new Set((recentNudges ?? []).map((n: any) => n.user_id)) // eslint-disable-line @typescript-eslint/no-explicit-any

    const fiveDaysAgo = new Date(now - 5 * 24 * 3600_000).toISOString()

    for (const sub of eligibleSubs) {
      if (nudgedRecently.has(sub.user_id)) continue

      const lastLesson = lastLessonByUser.get(sub.user_id)
      if (!lastLesson) continue // never had a lesson → handled by activation nudge
      if (lastLesson.updated_at > fiveDaysAgo) continue // recent activity

      const remaining = sub.lessons_limit - sub.lessons_used
      const daysSince = Math.floor((now - new Date(lastLesson.updated_at).getTime()) / (24 * 3600_000))

      try {
        await notifyLessonInactive({
          studentEmail: sub.user.email,
          studentName: sub.user.full_name,
          creditsLeft: remaining,
          daysSinceLastLesson: daysSince,
          lastSubject: lastLesson.subject ?? null,
        })

        await db.from('product_events').insert({
          event_name: 'lesson_reactivation_sent',
          user_id: sub.user_id,
          metadata: { credits_left: remaining, days_since: daysSince },
        })

        reactivationSent++
      } catch (err) {
        errors++
        console.error(`[lesson-activation] Reactivation failed for ${sub.user_id}:`, err)
      }
    }
  }

  console.log(`[lesson-activation] Done: activation=${activationSent} rebooking=${rebookingSent} reactivation=${reactivationSent} errors=${errors}`)
  return Response.json({ activationSent, rebookingSent, reactivationSent, errors })
}
