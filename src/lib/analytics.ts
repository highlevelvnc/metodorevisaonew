/**
 * Server-side product event tracking.
 *
 * Central helper for recording critical product events to the `product_events` table.
 * All events are fire-and-forget — failures are logged but never block the user flow.
 *
 * Usage:
 *   import { trackProductEvent, trackOncePerUser } from '@/lib/analytics'
 *   trackProductEvent('essay_submitted', userId, { essay_id, input_mode })
 *   trackOncePerUser('first_essay_submitted', userId, { essay_id })
 *
 * Event naming convention:
 *   - snake_case
 *   - past tense verb (submitted, viewed, created, completed)
 *   - noun first when describing a thing (essay_submitted, correction_viewed)
 */

import { createAdminClient } from '@/lib/supabase/admin'

// ── Core event names (enforced via type for autocomplete + typo prevention) ──

export type ProductEventName =
  | 'account_created'
  | 'first_dashboard_view'
  | 'essay_submitted'
  | 'first_essay_submitted'
  | 'correction_ready'
  | 'correction_viewed'
  | 'first_correction_viewed'
  | 'biia_used'
  | 'upgrade_page_viewed'
  | 'checkout_started'
  | 'purchase_completed'
  | 'credits_exhausted'
  | 'share_link_generated'
  | 'feedback_submitted'
  // Public funnel events (H3)
  | 'landing_cta_clicked'
  | 'plans_cta_clicked'
  | 'checkout_started_public'

/**
 * Record a product event to the database.
 *
 * Fire-and-forget: never throws, never blocks the calling flow.
 * Uses the admin (service-role) client to bypass RLS.
 *
 * @param eventName - One of the defined ProductEventName values
 * @param userId    - The user who triggered the event (null for anonymous events)
 * @param metadata  - Optional JSON metadata (plan slug, essay_id, score, etc.)
 */
export function trackProductEvent(
  eventName: ProductEventName,
  userId: string | null,
  metadata?: Record<string, unknown>,
): void {
  // Fire-and-forget — run async but don't await
  _persistEvent(eventName, userId, metadata).catch((err) => {
    console.error(`[analytics] Failed to persist event "${eventName}":`, err instanceof Error ? err.message : err)
  })
}

/**
 * Record a first-time event, deduplicated per user.
 *
 * Checks product_events for an existing row with the same (event_name, user_id).
 * If found, skips the insert silently. This ensures events like
 * first_dashboard_view, account_created, first_essay_submitted, and
 * first_correction_viewed are never duplicated on refresh/re-render.
 *
 * Fire-and-forget: never throws, never blocks the calling flow.
 * Cost: 1 extra SELECT per call — acceptable for rare once-per-user events.
 */
export function trackOncePerUser(
  eventName: ProductEventName,
  userId: string,
  metadata?: Record<string, unknown>,
): void {
  _persistOnce(eventName, userId, metadata).catch((err) => {
    console.error(`[analytics] Failed to persist once-event "${eventName}":`, err instanceof Error ? err.message : err)
  })
}

async function _persistEvent(
  eventName: string,
  userId: string | null,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createAdminClient() as any

    const { error } = await db.from('product_events').insert({
      event_name: eventName,
      user_id: userId || null,
      metadata: metadata && Object.keys(metadata).length > 0 ? metadata : null,
    })

    if (error) {
      console.error(`[analytics] DB insert failed for "${eventName}":`, error.message)
    }
  } catch (err) {
    console.error(`[analytics] Event tracking unavailable:`, err instanceof Error ? err.message : err)
  }
}

async function _persistOnce(
  eventName: string,
  userId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createAdminClient() as any

    // Check if this user already has this event
    const { count, error: checkErr } = await db
      .from('product_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_name', eventName)
      .eq('user_id', userId)

    if (checkErr) {
      console.error(`[analytics] Dedup check failed for "${eventName}":`, checkErr.message)
      return
    }

    if (count && count > 0) {
      // Already recorded — skip
      return
    }

    const { error } = await db.from('product_events').insert({
      event_name: eventName,
      user_id: userId,
      metadata: metadata && Object.keys(metadata).length > 0 ? metadata : null,
    })

    if (error) {
      console.error(`[analytics] DB insert failed for "${eventName}":`, error.message)
    }
  } catch (err) {
    console.error(`[analytics] Event tracking unavailable:`, err instanceof Error ? err.message : err)
  }
}
