'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trackEvent } from '@/components/Analytics'

interface Props {
  planSlug: string
  label: string
  variant?: 'primary' | 'secondary'
}

export function LandingCheckoutButton({ planSlug, label, variant = 'secondary' }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const router = useRouter()

  async function handleClick() {
    setLoading(true)
    setError(null)
    trackEvent('checkout_started', { plan: planSlug })

    try {
      const res  = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ planSlug }),
      })
      const data = await res.json()

      if (res.status === 401) {
        // Not authenticated — send to sign-up then back to upgrade
        router.push('/cadastro?next=/aluno/upgrade')
        return
      }

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Erro ao iniciar checkout.')
        setLoading(false)
        return
      }

      // Redirect to Stripe hosted checkout
      window.location.href = data.url
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full text-center rounded-xl font-semibold py-3.5 text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
          variant === 'primary'
            ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-btn-primary hover:shadow-btn-primary-lg'
            : 'bg-white/[0.05] border border-white/[0.09] text-gray-400 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.15]'
        }`}
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
            </svg>
            Aguarde…
          </>
        ) : (
          label
        )}
      </button>
      {error && (
        <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
