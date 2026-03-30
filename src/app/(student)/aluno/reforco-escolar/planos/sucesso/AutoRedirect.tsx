'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * For active subscriptions: auto-redirects to booking page after 8s.
 * For pending subscriptions: polls by refreshing the page every 3s until active.
 */
export function AutoRedirect({ isActive = true }: { isActive?: boolean }) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(isActive ? 8 : 0)

  useEffect(() => {
    if (isActive) {
      // Subscription active: countdown then redirect
      const interval = setInterval(() => setCountdown(c => c - 1), 1000)
      const timer = setTimeout(() => router.push('/aluno/reforco-escolar'), 8000)
      return () => { clearInterval(interval); clearTimeout(timer) }
    } else {
      // Subscription pending: poll every 3s
      const timer = setInterval(() => router.refresh(), 3000)
      return () => clearInterval(timer)
    }
  }, [router, isActive])

  if (!isActive) {
    return (
      <p className="text-[11px] text-gray-600 mt-3 animate-pulse">
        Verificando ativação automaticamente…
      </p>
    )
  }

  return (
    <p className="text-[11px] text-gray-600 mt-3">
      Redirecionando para sua agenda em {countdown}s…
    </p>
  )
}
