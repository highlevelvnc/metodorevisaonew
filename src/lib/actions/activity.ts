'use server'

import { createClient } from '@/lib/supabase/server'
import { trackProductEvent } from '@/lib/analytics'

/**
 * Mark a correction as viewed by the student.
 * Called when the student opens the essay detail page.
 * Only sets viewed_at once (first view). Idempotent on repeat calls.
 * Also updates last_activity_at and clears any pending nudge events.
 */
export async function markCorrectionViewed(essayId: string): Promise<void> {
  if (!essayId) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const now = new Date().toISOString()

  // Set viewed_at only if null (first view) — uses Supabase .is() filter
  const { data: updatedRows } = await db
    .from('corrections')
    .update({ viewed_at: now })
    .eq('essay_id', essayId)
    .is('viewed_at', null)
    .select('id')

  const isFirstViewOfThisCorrection = updatedRows && updatedRows.length > 0

  // Track correction_viewed event
  trackProductEvent('correction_viewed', user.id, { essay_id: essayId })

  // If this was the first time ANY correction was viewed, track that too
  if (isFirstViewOfThisCorrection) {
    try {
      const { count } = await db
        .from('corrections')
        .select('id', { count: 'exact', head: true })
        .not('viewed_at', 'is', null)
        .eq('essay_id', essayId)
      // Join through essays to check total viewed corrections for this user
      const { count: totalViewed } = await db
        .from('corrections')
        .select('id, essays!inner(student_id)', { count: 'exact', head: true })
        .not('viewed_at', 'is', null)
        .eq('essays.student_id', user.id)
      if (totalViewed === 1) {
        trackProductEvent('first_correction_viewed', user.id, { essay_id: essayId })
      }
    } catch { /* non-fatal */ }
  }

  // Update last_activity_at
  await db
    .from('users')
    .update({ last_activity_at: now })
    .eq('id', user.id)

  // Clear nudge events (user is now active)
  await db
    .from('nudge_events')
    .delete()
    .eq('user_id', user.id)
}

/**
 * Update last_activity_at for the current user.
 * Called on significant actions (essay submit, biia interaction).
 * Also clears pending nudge events.
 */
export async function touchActivity(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const now = new Date().toISOString()

  await db
    .from('users')
    .update({ last_activity_at: now })
    .eq('id', user.id)

  // Clear nudge events (user is active again)
  await db
    .from('nudge_events')
    .delete()
    .eq('user_id', user.id)
}
