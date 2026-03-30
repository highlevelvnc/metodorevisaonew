/**
 * GET /api/cron/lesson-activation
 *
 * Sends activation nudge emails to students who:
 * - Have an active lesson subscription (plan_type='lesson')
 * - Subscription was created 24-48h ago
 * - Have ZERO lesson_sessions (requested, scheduled, or completed)
 *
 * Also sends post-lesson re-booking emails to students whose lesson
 * was marked 'completed' 2-4h ago.
 *
 * Called every 2 hours by Vercel Cron.
 * Protected by CRON_SECRET.
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
  let errors = 0

  // ── 1. Activation nudge: 24-48h after purchase, no lessons ─────────────
  const since24h = new Date(now - 48 * 3600_000).toISOString()
  const until24h = new Date(now - 24 * 3600_000).toISOString()

  const { data: inactiveSubs } = await db
    .from('subscriptions')
    .select('user_id, lessons_limit, plans!inner(name, plan_type)')
    .eq('status', 'active')
    .eq('plans.plan_type', 'lesson')
    .gte('created_at', since24h)
    .lte('created_at', until24h)

  for (const sub of (inactiveSubs ?? [])) {
    // Check if user has ANY lesson_sessions
    const { count } = await db
      .from('lesson_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', sub.user_id)

    if ((count ?? 0) > 0) continue // already booked at least once

    // Get student info
    const { data: user } = await db
      .from('users')
      .select('email, full_name')
      .eq('id', sub.user_id)
      .single()

    if (!user?.email) continue

    try {
      await notifyNoLessonBooked({
        studentEmail: user.email,
        studentName: user.full_name,
        creditsTotal: sub.lessons_limit,
        planName: sub.plans?.name ?? 'Reforço',
      })
      activationSent++
      console.log(`[lesson-activation] Nudge sent to ${user.email}`)
    } catch (err) {
      errors++
      console.error(`[lesson-activation] Nudge failed for ${sub.user_id}:`, err)
    }
  }

  // ── 2. Post-lesson re-booking: 2-4h after lesson completed ─────────────
  const since2h = new Date(now - 4 * 3600_000).toISOString()
  const until2h = new Date(now - 2 * 3600_000).toISOString()

  const { data: recentCompleted } = await db
    .from('lesson_sessions')
    .select('id, student_id, subject, updated_at')
    .eq('status', 'completed')
    .gte('updated_at', since2h)
    .lte('updated_at', until2h)
    .not('student_id', 'is', null)

  for (const lesson of (recentCompleted ?? [])) {
    // Get student info + remaining credits
    const { data: user } = await db
      .from('users')
      .select('email, full_name')
      .eq('id', lesson.student_id)
      .single()

    if (!user?.email) continue

    const { data: sub } = await db
      .from('subscriptions')
      .select('lessons_used, lessons_limit')
      .eq('user_id', lesson.student_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const creditsLeft = sub ? Math.max(0, sub.lessons_limit - sub.lessons_used) : 0

    try {
      await notifyLessonCompleted({
        studentEmail: user.email,
        studentName: user.full_name,
        subject: lesson.subject,
        creditsLeft,
        lessonId: lesson.id,
      })
      rebookingSent++
      console.log(`[lesson-activation] Re-booking sent to ${user.email}`)
    } catch (err) {
      errors++
      console.error(`[lesson-activation] Re-booking failed for ${lesson.student_id}:`, err)
    }
  }

  // ── 3. Reactivation: active sub with credits but no recent lesson activity ──
  // Targets students who have credits remaining but haven't had ANY lesson
  // activity (requested/scheduled/completed) in the last 5 days.
  // Deduplication: uses product_events to ensure max 1 email per 7-day window.
  let reactivationSent = 0

  const { data: activeLessonSubs } = await db
    .from('subscriptions')
    .select('user_id, lessons_used, lessons_limit, current_period_start, plans!inner(name, plan_type)')
    .eq('status', 'active')
    .eq('plans.plan_type', 'lesson')

  const fiveDaysAgo = new Date(now - 5 * 24 * 3600_000).toISOString()

  for (const sub of (activeLessonSubs ?? [])) {
    const remaining = sub.lessons_limit - sub.lessons_used
    if (remaining <= 0) continue // no credits left, nothing to reactivate

    // Check last lesson activity (any status)
    const { data: lastLesson } = await db
      .from('lesson_sessions')
      .select('session_date, subject, status, updated_at')
      .eq('student_id', sub.user_id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Skip if recent activity (within 5 days)
    if (lastLesson?.updated_at && lastLesson.updated_at > fiveDaysAgo) continue
    // Skip if never had a lesson (handled by activation nudge above)
    if (!lastLesson) continue

    // Deduplication: check if we already sent a reactivation in the last 7 days
    const sevenDaysAgo = new Date(now - 7 * 24 * 3600_000).toISOString()
    const { count: recentNudges } = await db
      .from('product_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_name', 'lesson_reactivation_sent')
      .eq('user_id', sub.user_id)
      .gte('created_at', sevenDaysAgo)

    if ((recentNudges ?? 0) > 0) continue // already nudged this week

    // Get student info
    const { data: user } = await db
      .from('users')
      .select('email, full_name')
      .eq('id', sub.user_id)
      .single()

    if (!user?.email) continue

    const daysSince = lastLesson.updated_at
      ? Math.floor((now - new Date(lastLesson.updated_at).getTime()) / (24 * 3600_000))
      : 7

    try {
      await notifyLessonInactive({
        studentEmail: user.email,
        studentName: user.full_name,
        creditsLeft: remaining,
        daysSinceLastLesson: daysSince,
        lastSubject: lastLesson.subject ?? null,
      })

      // Record send for deduplication
      await db.from('product_events').insert({
        event_name: 'lesson_reactivation_sent',
        user_id: sub.user_id,
        metadata: { credits_left: remaining, days_since: daysSince },
      })

      reactivationSent++
      console.log(`[lesson-activation] Reactivation sent to ${user.email} (${daysSince}d inactive, ${remaining} credits)`)
    } catch (err) {
      errors++
      console.error(`[lesson-activation] Reactivation failed for ${sub.user_id}:`, err)
    }
  }

  console.log(`[lesson-activation] Done: activation=${activationSent} rebooking=${rebookingSent} reactivation=${reactivationSent} errors=${errors}`)
  return Response.json({ activationSent, rebookingSent, reactivationSent, errors })
}
