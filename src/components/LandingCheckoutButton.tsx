'use client'
import Link from 'next/link'
import { trackEvent } from '@/components/Analytics'

interface Props {
  planSlug: string
  label:    string
  variant?: 'primary' | 'secondary'
}

/**
 * Landing page plan button.
 * Routes directly to /checkout/[planSlug] — no API call needed here.
 * The checkout page handles auth state (new signup, login, or already logged in).
 */
export function LandingCheckoutButton({ planSlug, label, variant = 'secondary' }: Props) {
  return (
    <Link
      href={`/checkout/${planSlug}`}
      className={`block w-full text-center rounded-xl font-semibold py-3.5 text-sm transition-all duration-200 ${
        variant === 'primary'
          ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-btn-primary hover:shadow-btn-primary-lg'
          : 'bg-white/[0.05] border border-white/[0.09] text-gray-400 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.15]'
      }`}
      onClick={() => trackEvent('checkout_started', { plan: planSlug })}
    >
      {label}
    </Link>
  )
}
