'use client'

import { useState } from 'react'
import { trackEvent } from '@/components/Analytics'

interface Props {
  planSlug:   string
  planName:   string
  planPrice:  number
  userEmail:  string
  userName:   string
  cancelado?: boolean
}

export function ProceedButton({
  planSlug,
  planName,
  planPrice,
  userEmail,
  userName,
  cancelado = false,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    trackEvent('checkout_started', { plan: planSlug, source: 'checkout_page_logged_in' })

    try {
      const res  = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ planSlug }),
      })
      const data = await res.json()

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Erro ao iniciar o pagamento. Tente novamente.')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
      setLoading(false)
    }
  }

  const displayName = userName && userName !== userEmail ? userName : null

  return (
    <div className="card-dark rounded-2xl p-7">

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/15 rounded-full px-3 py-1 mb-4">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" />
          </svg>
          Conta pronta
        </div>
        <h1 className="text-2xl font-extrabold text-white leading-tight mb-2">
          Tudo pronto!
        </h1>
        <p className="text-sm text-gray-400 leading-relaxed">
          {displayName ? `Olá, ${displayName.split(' ')[0]}! ` : ''}
          Um clique para garantir seu plano {planName} e começar a evoluir.
        </p>
      </div>

      {/* Cancelado */}
      {cancelado && (
        <div className="rounded-xl bg-amber-500/[0.07] border border-amber-500/15 px-4 py-3 mb-5">
          <p className="text-sm text-amber-400/90">
            Sem problema — não foi cobrado nada. Tente novamente abaixo.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 mb-5">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Account pill */}
      <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-purple-600/20 border border-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-300 flex-shrink-0">
          {((displayName ?? userEmail)?.[0] ?? '?').toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          {displayName && (
            <p className="text-sm font-semibold text-white truncate leading-tight">{displayName}</p>
          )}
          <p className="text-xs text-gray-500 truncate">{userEmail}</p>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
          ✓ Logado
        </span>
      </div>

      {/* Billing summary */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] px-4 py-3 mb-4 text-xs text-gray-500">
        <div className="flex items-center justify-between mb-1">
          <span>Plano {planName}</span>
          <span className="text-white font-semibold">R$ {planPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</span>
        </div>
        <p className="text-[10px] text-gray-600">Renovação mensal automática · Cancele quando quiser, sem multa</p>
      </div>

      {/* CTA */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="btn-primary w-full justify-center py-4 text-[15px] font-bold disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Abrindo pagamento seguro…
          </>
        ) : (
          <>
            Pagar R$ {Math.round(planPrice)} e começar
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>

      {/* Trust */}
      <div className="flex items-center justify-center gap-3 flex-wrap mt-3.5">
        {['🔒 Criptografado', '↩️ Sem fidelidade', '✓ Cancele quando quiser'].map((t) => (
          <span key={t} className="text-[11px] text-gray-600">{t}</span>
        ))}
      </div>

      {/* Switch account — plain <a> tag prevents Next.js Link prefetch,
          which would otherwise trigger GET /api/auth/signout at render time
          (causing accidental signout + CORS errors on the preflight). */}
      <p className="text-center text-xs text-gray-700 mt-5 pt-4 border-t border-white/[0.05]">
        Não é você?{' '}
        <a
          href={`/api/auth/signout?next=/checkout/${planSlug}`}
          className="text-gray-500 hover:text-gray-300 transition-colors underline"
        >
          Usar outra conta
        </a>
      </p>
    </div>
  )
}
