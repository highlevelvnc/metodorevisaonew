/**
 * Inactivity recovery cron endpoint.
 *
 * Call via scheduled job (e.g. Vercel Cron, external cron service):
 *   GET /api/cron/inactivity
 *   Header: Authorization: Bearer <CRON_SECRET>
 *
 * Uses:
 * - users.last_activity_at  — single source of truth for activity (R3)
 * - nudge_events table      — deduplication: max one email per type per window (R2)
 *
 * Logic:
 * - 24h inactive + no 24h nudge sent → send gentle email, record in nudge_events
 * - 48h inactive + no 48h nudge sent → send stronger email, record in nudge_events
 * - >72h inactive → skip (avoid spamming)
 * - <24h inactive → skip (user is active)
 *
 * Idempotent: repeated runs within the same inactivity window will not resend.
 * nudge_events are cleared when user becomes active (via touchActivity()).
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyInactivity24h, notifyInactivity48h } from '@/lib/notifications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Auth: require CRON_SECRET
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceKey)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const now = Date.now()

  // ── Fetch active students with last_activity_at ─────────────────────────────
  const { data: activeSubs } = await db
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  if (!activeSubs || activeSubs.length === 0) {
    return NextResponse.json({ checked: 0, sent24h: 0, sent48h: 0, skippedDupe: 0 })
  }

  const userIds = Array.from(new Set((activeSubs as { user_id: string }[]).map(s => s.user_id))) as string[]
  let sent24h = 0
  let sent48h = 0
  let skippedDupe = 0

  for (const userId of userIds) {
    try {
      // Fetch user with last_activity_at
      const { data: user } = await supabase
        .from('users')
        .select('email, full_name, last_activity_at, created_at')
        .eq('id', userId)
        .single()

      if (!user) continue
      const userData = user as { email: string; full_name: string; last_activity_at: string | null; created_at: string }
      if (!userData.email) continue

      // Use last_activity_at (R3), fall back to created_at for users who haven't had it set yet
      const lastActivityIso = userData.last_activity_at ?? userData.created_at
      if (!lastActivityIso) continue

      const lastActivityMs = new Date(lastActivityIso).getTime()
      if (isNaN(lastActivityMs)) continue

      const hoursSinceActivity = (now - lastActivityMs) / (1000 * 60 * 60)

      // Skip if active recently or too long ago (avoid spamming)
      if (hoursSinceActivity < 24 || hoursSinceActivity > 72) continue

      // ── Check existing nudge_events (R2 deduplication) ────────────────────
      const { data: existingNudges } = await db
        .from('nudge_events')
        .select('event_type')
        .eq('user_id', userId)

      const sentTypes = new Set(
        ((existingNudges ?? []) as { event_type: string }[]).map(n => n.event_type)
      )

      // Determine which nudge to send
      if (hoursSinceActivity >= 48 && !sentTypes.has('inactivity_48h')) {
        // Fetch avg score for email context
        const { data: essays } = await db
          .from('essays')
          .select('status, corrections(total_score)')
          .eq('student_id', userId)
          .eq('status', 'corrected')
          .limit(10)

        const essayList = (essays as { status: string; corrections: { total_score: number }[] }[] | null) ?? []
        const avgScore = essayList.length > 0
          ? Math.round(essayList.reduce((sum, e) => sum + (e.corrections?.[0]?.total_score ?? 0), 0) / essayList.length)
          : null

        await notifyInactivity48h({
          studentEmail: userData.email,
          studentName: userData.full_name,
          avgScore,
        })

        // Record the send (upsert to handle race conditions)
        await db.from('nudge_events').upsert(
          { user_id: userId, event_type: 'inactivity_48h', sent_at: new Date().toISOString() },
          { onConflict: 'user_id,event_type' }
        )
        sent48h++

      } else if (hoursSinceActivity >= 24 && !sentTypes.has('inactivity_24h')) {
        // Fetch essay count for email context
        const { count } = await db
          .from('essays')
          .select('id', { count: 'exact', head: true })
          .eq('student_id', userId)

        await notifyInactivity24h({
          studentEmail: userData.email,
          studentName: userData.full_name,
          lastEssayCount: (count as number) ?? 0,
        })

        // Record the send
        await db.from('nudge_events').upsert(
          { user_id: userId, event_type: 'inactivity_24h', sent_at: new Date().toISOString() },
          { onConflict: 'user_id,event_type' }
        )
        sent24h++

      } else {
        skippedDupe++
      }
    } catch (err) {
      console.error(`[cron/inactivity] Error processing user ${userId}:`, err instanceof Error ? err.message : err)
    }
  }

  console.log(`[cron/inactivity] Done: checked=${userIds.length}, sent24h=${sent24h}, sent48h=${sent48h}, skippedDupe=${skippedDupe}`)
  return NextResponse.json({ checked: userIds.length, sent24h, sent48h, skippedDupe })
}
