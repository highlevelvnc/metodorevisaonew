import type { Metadata } from 'next'
import { Suspense } from 'react'
import RegisterForm from './RegisterForm'

export const metadata: Metadata = {
  title: 'Criar conta',
  robots: { index: false, follow: false },
}

// RegisterForm uses useSearchParams() which requires Suspense in Next.js 14 App Router
export default function CadastroPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-8 w-40 bg-white/[0.06] rounded-lg mx-auto mb-2 animate-pulse" />
          <div className="h-4 w-56 bg-white/[0.04] rounded mx-auto animate-pulse" />
        </div>
        <div className="card-dark rounded-2xl p-6 h-64 animate-pulse" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
