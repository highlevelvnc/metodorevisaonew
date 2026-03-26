'use client'

/**
 * Global error boundary — catches crashes inside the root layout itself.
 * Must include <html> and <body> because the root layout is unavailable.
 *
 * Next.js docs: https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs
 */
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error.message, error.digest)
  }, [error])

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          background: '#070c14',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div style={{ maxWidth: '360px', width: '100%', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            Método Revisão
          </p>
          <h1 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
            Algo deu errado
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px', lineHeight: 1.6 }}>
            Ocorreu um erro inesperado. Tente novamente ou recarregue a página.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Tentar novamente
            </button>
            <a
              href="/"
              style={{
                color: '#9ca3af',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '13px',
                textDecoration: 'none',
              }}
            >
              Voltar ao início
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
