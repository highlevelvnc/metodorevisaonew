'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { trackEvent } from '@/components/Analytics'

interface Props {
  planSlug?: string
  delay?: number // seconds, default 5
}

export function AutoRedirect({ planSlug, delay = 5 }: Props) {
  const [seconds, setSeconds] = useState(delay)
  const router = useRouter()

  useEffect(() => {
    if (planSlug) trackEvent('checkout_completed', { plan: planSlug })

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
  }, [])

  return (
    <p className="text-xs text-gray-600 mt-2 text-center">
      Redirecionando para o painel em{' '}
      <span className="tabular-nums text-gray-400 font-semibold">{seconds}s</span>…
    </p>
  )
}
