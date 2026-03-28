import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/analytics
 *
 * Returns operational analytics data for admin users.
 * Protected: requires authenticated user with role = 'admin'.
 *
 * Query params:
 *   ?days=7  — lookback window (default 30, max 90)
 */
export async function GET(req: Request) {
  // ── Auth + role check ──────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as { role: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 })
  }

  // ── Parse days param ──────────────────────────────────────────────────────
  const url = new URL(req.url)
  const daysParam = parseInt(url.searchParams.get('days') ?? '30')
  const days = Math.min(90, Math.max(1, isNaN(daysParam) ? 30 : daysParam))
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  // ── Parallel queries ──────────────────────────────────────────────────────
  const [
    eventsRes,
    usersCountRes,
    essaysCountRes,
    correctionsCountRes,
    subsActiveRes,
    feedbackCountRes,
  ] = await Promise.all([
    // Product events aggregated by name
    db
      .from('product_events')
      .select('event_name')
      .gte('created_at', since),

    // Total users created in period
    db
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since),

    // Total essays submitted in period
    db
      .from('essays')
      .select('id', { count: 'exact', head: true })
      .gte('submitted_at', since),

    // Total corrections completed in period
    db
      .from('corrections')
      .select('id', { count: 'exact', head: true })
      .gte('corrected_at', since),

    // Active subscriptions (current, not time-bounded)
    db
      .from('subscriptions')
      .select('id, essays_used, essays_limit, user_id', { count: 'exact' })
      .eq('status', 'active'),

    // Feedback count in period
    db
      .from('correction_feedback')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since),
  ])

  // ── Aggregate event counts ────────────────────────────────────────────────
  const eventCounts: Record<string, number> = {}
  if (eventsRes.data) {
    for (const row of eventsRes.data as { event_name: string }[]) {
      eventCounts[row.event_name] = (eventCounts[row.event_name] ?? 0) + 1
    }
  }

  // ── Active subscription analysis ─────────────────────────────────────────
  const activeSubs = (subsActiveRes.data ?? []) as {
    id: string; essays_used: number; essays_limit: number; user_id: string
  }[]

  const activePayingUsers = activeSubs.length
  const usersWithCredits = activeSubs.filter(s => s.essays_used < s.essays_limit).length
  const usersExhausted = activeSubs.filter(s => s.essays_used >= s.essays_limit).length
  const totalCreditsRemaining = activeSubs.reduce(
    (sum, s) => sum + Math.max(0, s.essays_limit - s.essays_used), 0
  )

  // ── Corrections not yet viewed ────────────────────────────────────────────
  let unviewedCorrections = 0
  try {
    const { count } = await db
      .from('corrections')
      .select('id', { count: 'exact', head: true })
      .is('viewed_at', null)
      .gte('corrected_at', since)
    unviewedCorrections = count ?? 0
  } catch { /* non-fatal */ }

  // ── Inactive paying users (last activity > 5 days ago) ────────────────────
  let inactivePayingUsers = 0
  try {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    const activeUserIds = activeSubs
      .filter(s => s.essays_used < s.essays_limit)
      .map(s => s.user_id)

    if (activeUserIds.length > 0) {
      const { data: inactiveUsers } = await db
        .from('users')
        .select('id', { count: 'exact', head: true })
        .in('id', activeUserIds)
        .lt('last_activity_at', fiveDaysAgo)
      inactivePayingUsers = inactiveUsers?.length ?? 0
    }
  } catch { /* non-fatal */ }

  // ── Build response ────────────────────────────────────────────────────────
  const analytics = {
    period: { days, since },
    overview: {
      new_users: usersCountRes.count ?? 0,
      essays_submitted: essaysCountRes.count ?? 0,
      corrections_completed: correctionsCountRes.count ?? 0,
      feedback_submitted: feedbackCountRes.count ?? 0,
    },
    funnel_events: eventCounts,
    subscriptions: {
      active_paying_users: activePayingUsers,
      users_with_credits: usersWithCredits,
      users_exhausted: usersExhausted,
      total_credits_remaining: totalCreditsRemaining,
    },
    retention: {
      unviewed_corrections: unviewedCorrections,
      inactive_paying_users: inactivePayingUsers,
    },
    // Funnel conversion rates (computed from events)
    funnel: {
      upgrade_views: eventCounts['upgrade_page_viewed'] ?? 0,
      checkout_started: eventCounts['checkout_started'] ?? 0,
      purchases: eventCounts['purchase_completed'] ?? 0,
      upgrade_to_checkout_rate: safePct(eventCounts['checkout_started'], eventCounts['upgrade_page_viewed']),
      checkout_to_purchase_rate: safePct(eventCounts['purchase_completed'], eventCounts['checkout_started']),
      first_essays: eventCounts['first_essay_submitted'] ?? 0,
      first_corrections_viewed: eventCounts['first_correction_viewed'] ?? 0,
      first_essay_to_view_rate: safePct(eventCounts['first_correction_viewed'], eventCounts['first_essay_submitted']),
    },
  }

  return NextResponse.json(analytics)
}

function safePct(num: number | undefined, den: number | undefined): string | null {
  if (!den || !num || den === 0) return null
  return `${Math.round((num / den) * 100)}%`
}
