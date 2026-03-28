import { NextResponse } from 'next/server'
import { trackProductEvent, type ProductEventName } from '@/lib/analytics'

/**
 * POST /api/track
 *
 * Lightweight endpoint for persisting public funnel events from client-side code.
 * Only accepts events from a strict allowlist — prevents arbitrary event injection.
 *
 * Body: { event: string, metadata?: Record<string, unknown> }
 *
 * No auth required (public funnel events are anonymous by definition).
 * Rate limiting should be handled at the infrastructure layer (Vercel, Cloudflare, etc.).
 */

// Events allowed from public/client-side code
const ALLOWED_PUBLIC_EVENTS = new Set<ProductEventName>([
  'landing_cta_clicked',
  'plans_cta_clicked',
  'checkout_started_public',
])

export async function POST(req: Request) {
  try {
    const body = await req.json() as { event?: string; metadata?: Record<string, unknown> }

    if (!body.event || typeof body.event !== 'string') {
      return NextResponse.json({ error: 'Missing event name' }, { status: 400 })
    }

    if (!ALLOWED_PUBLIC_EVENTS.has(body.event as ProductEventName)) {
      return NextResponse.json({ error: 'Event not allowed' }, { status: 400 })
    }

    // Sanitize metadata — only keep string/number/boolean values, cap keys
    const safeMeta: Record<string, unknown> = {}
    if (body.metadata && typeof body.metadata === 'object') {
      const entries = Object.entries(body.metadata).slice(0, 10)
      for (const [k, v] of entries) {
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
          safeMeta[k.slice(0, 50)] = typeof v === 'string' ? v.slice(0, 200) : v
        }
      }
    }

    trackProductEvent(body.event as ProductEventName, null, safeMeta)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
