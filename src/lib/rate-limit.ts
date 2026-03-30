/**
 * Simple in-memory rate limiter for serverless functions.
 *
 * Uses a Map with automatic cleanup. Each key (IP or identifier)
 * is tracked with a sliding window of request timestamps.
 *
 * Limitations:
 * - Resets on deploy/cold start (acceptable for Vercel)
 * - Per-instance (not shared across regions)
 * - For production scale, replace with Redis/Upstash
 */

const store = new Map<string, number[]>()

// Cleanup old entries every 5 minutes
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < 300_000) return
  lastCleanup = now
  const cutoff = now - windowMs
  store.forEach((timestamps: number[], key: string) => {
    const valid = timestamps.filter((t: number) => t > cutoff)
    if (valid.length === 0) store.delete(key)
    else store.set(key, valid)
  })
}

/**
 * Check if a request should be rate-limited.
 *
 * @param key     Unique identifier (IP address, email, etc.)
 * @param limit   Max requests allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns true if request is ALLOWED, false if RATE LIMITED
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  cleanup(windowMs)

  const now = Date.now()
  const cutoff = now - windowMs
  const timestamps = (store.get(key) ?? []).filter(t => t > cutoff)

  if (timestamps.length >= limit) {
    return false // rate limited
  }

  timestamps.push(now)
  store.set(key, timestamps)
  return true // allowed
}
