'use client'

import { useState } from 'react'

interface CheckoutButtonProps {
  planSlug: string
  label?: string
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

/**
 * Client component that calls /api/checkout and redirects the user
 * to Stripe Hosted Checkout. Handles loading and error states.
 */
export function CheckoutButton({
  planSlug,
  label = 'Fazer upgrade',
  variant = 'primary',
  disabled = false,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug }),
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Erro ao iniciar pagamento. Tente novamente.')
        setLoading(false)
        return
      }

      // Redirect to Stripe Hosted Checkout
      window.location.href = data.url
      // Keep loading state true — user is navigating away
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
      setLoading(false)
    }
  }

  const baseClass =
    'inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full'

  const variantClass =
    variant === 'primary'
      ? 'bg-purple-700 hover:bg-purple-600 text-white'
      : 'border border-white/[0.12] text-gray-300 hover:text-white hover:border-white/[0.22]'

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className={`${baseClass} ${variantClass}`}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin"
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Redirecionando…
          </>
        ) : (
          <>
            {variant === 'primary' && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
            {label}
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-[11px] text-red-400 text-center leading-relaxed">{error}</p>
      )}
    </div>
  )
}
