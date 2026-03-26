import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Entrar',
  robots: { index: false, follow: false },
}

// LoginForm uses useSearchParams() which requires Suspense in Next.js 14 App Router
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-8 w-48 bg-white/[0.06] rounded-lg mx-auto mb-2 animate-pulse" />
          <div className="h-4 w-64 bg-white/[0.04] rounded mx-auto animate-pulse" />
        </div>
        <div className="card-dark rounded-2xl p-6 h-48 animate-pulse" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
