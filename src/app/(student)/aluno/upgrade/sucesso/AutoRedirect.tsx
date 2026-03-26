'use client'
import { useEffect, useState } from 'react'
import { useRouter }           from 'next/navigation'
import Link                    from 'next/link'
import { trackEvent }          from '@/components/Analytics'

interface Props {
  planSlug?:  string
  delay?:     number   // seconds before redirect, default 10
  confirmed?: boolean  // true = DB confirmed subscription active; false = webhook may still be in flight
}

export function AutoRedirect({ planSlug, delay = 10, confirmed = true }: Props) {
  const [seconds, setSeconds] = useState(delay)
  const router = useRouter()

  useEffect(() => {
    // Only track the conversion once and only when payment is confirmed
    if (planSlug && confirmed) trackEvent('checkout_completed', { plan: planSlug })

    // If the DB hasn't confirmed the subscription yet, don't auto-redirect.
    // The user would land on /aluno and see the old plan (trial), which is
    // confusing. They get a manual "go to dashboard" link instead.
    if (!confirmed) return

    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval)
          router.push('/aluno')
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmed])

  if (!confirmed) {
    // Webhook still in flight — show a manual prompt rather than auto-redirecting
    // to a dashboard that would show stale plan data.
    return (
      <div className="mt-4 text-center space-y-2">
        <p className="text-[11px] text-gray-700">
          Assim que o plano for confirmado, acesse o painel:
        </p>
        <Link
          href="/aluno"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
        >
          Ir para o painel →
        </Link>
      </div>
    )
  }

  return (
    <p className="text-xs text-gray-600 mt-2 text-center">
      Redirecionando para o painel em{' '}
      <span className="tabular-nums text-gray-400 font-semibold">{seconds}s</span>…
    </p>
  )
}
