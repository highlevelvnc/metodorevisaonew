/**
 * get-site-url.ts — Single source of truth for the canonical site URL.
 *
 * Used for ALL absolute URLs that leave the server and come back:
 *   - Stripe success_url / cancel_url
 *   - Supabase emailRedirectTo
 *   - Auth callback redirects
 *   - Signout redirects
 *
 * ⚠️  NEVER use process.env.VERCEL_URL as a fallback here.
 *     Vercel sets VERCEL_URL to the deployment-specific preview URL
 *     (e.g. myapp-abc123-org.vercel.app), NOT the custom domain.
 *     Using it causes users to land on the preview domain where their
 *     session cookie (scoped to the production domain) doesn't work.
 *
 * Required Vercel configuration:
 *   Settings → Environment Variables → NEXT_PUBLIC_SITE_URL
 *   Value: https://metodorevisao.com  (no trailing slash)
 *   Environments: ✓ Production  ✓ Preview  ✓ Development
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL

  if (configured) {
    const url = configured.replace(/\/$/, '') // strip trailing slash
    console.log(`[getSiteUrl] → ${url}`)
    return url
  }

  // Development fallback — safe because localhost is obviously not production
  if (process.env.NODE_ENV !== 'production') {
    console.log('[getSiteUrl] NEXT_PUBLIC_SITE_URL not set, using localhost (dev only)')
    return 'http://localhost:3000'
  }

  // Production with missing env var — log loudly and return a value that
  // will obviously fail (better than silently using the preview domain).
  console.error(
    '[getSiteUrl] CRITICAL: NEXT_PUBLIC_SITE_URL is not set in this Vercel environment!\n' +
    'Go to Vercel → Settings → Environment Variables and add:\n' +
    '  NEXT_PUBLIC_SITE_URL = https://metodorevisao.com\n' +
    'Make sure it is enabled for Production, Preview, AND Development.\n' +
    'DO NOT use VERCEL_URL — it always points to the preview/deployment URL, not the custom domain.'
  )
  // Return localhost so the failure is obvious in Stripe / email links
  // instead of silently routing users to the wrong domain.
  return 'http://localhost:3000'
}
