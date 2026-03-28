'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Error boundary for public pages (/, /blog, /para-escolas, etc.).
 * Renders inside the public layout — navbar and footer remain visible.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[PublicError]', error.message, error.digest)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h2 className="text-lg font-bold text-white mb-2">Página indisponível</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Ocorreu um erro inesperado ao carregar esta página. Tente recarregar.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-white/[0.08] hover:border-white/[0.18] px-4 py-2.5 rounded-xl transition-all"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
