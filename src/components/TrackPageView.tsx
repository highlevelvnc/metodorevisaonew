import { trackProductEvent, trackOncePerUser, type ProductEventName } from '@/lib/analytics'

/**
 * Server Component that fires a product event on render.
 * Use in server-rendered pages to track page views without client JS.
 *
 * Usage:
 *   <TrackPageView event="upgrade_page_viewed" userId={user.id} />
 *   <TrackPageView event="first_dashboard_view" userId={user.id} once />
 *
 * Set `once` to true for first-time events — deduplicates via product_events table.
 * Renders nothing visible — purely a side-effect component.
 */
export function TrackPageView({
  event,
  userId,
  metadata,
  once = false,
}: {
  event: ProductEventName
  userId: string | null
  metadata?: Record<string, unknown>
  once?: boolean
}) {
  if (once && userId) {
    trackOncePerUser(event, userId, metadata)
  } else {
    trackProductEvent(event, userId, metadata)
  }
  return null
}
