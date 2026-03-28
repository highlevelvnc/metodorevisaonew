import { trackProductEvent, type ProductEventName } from '@/lib/analytics'

/**
 * Server Component that fires a product event on render.
 * Use in server-rendered pages to track page views without client JS.
 *
 * Usage:
 *   <TrackPageView event="upgrade_page_viewed" userId={user.id} />
 *
 * Renders nothing visible — purely a side-effect component.
 */
export function TrackPageView({
  event,
  userId,
  metadata,
}: {
  event: ProductEventName
  userId: string | null
  metadata?: Record<string, unknown>
}) {
  // Fire event during server render — fire-and-forget
  trackProductEvent(event, userId, metadata)
  return null
}
