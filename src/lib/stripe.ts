import Stripe from 'stripe'

/**
 * Stripe server-side client.
 * Only import in Server Components, Route Handlers, and Server Actions.
 * Never expose the secret key to the browser.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
})

/**
 * Plan slugs → human-readable names for Stripe product descriptions.
 * Keep in sync with the `plans` table seed data.
 */
export const STRIPE_PLAN_LABELS: Record<string, string> = {
  evolucao:   'Evolução',
  estrategia: 'Estratégia',
  intensivo:  'Intensivo',
}
