'use client'

import { useState }          from 'react'
import { useSearchParams }   from 'next/navigation'
import { signIn }            from '@/lib/actions/auth'
import { resendConfirmation } from '@/lib/actions/auth'
import { SignInCard }        from '@/components/ui/sign-in-card-2'

// ─── URL error messages (from ?error= query param) ───────────────────────────
const URL_ERROR_MESSAGES: Record<string, string> = {
  link_expirado: 'Seu link de confirmação expirou.',
  link_invalido: 'Link inválido. Use o botão no e-mail que enviamos.',
  access_denied: 'Link expirado ou já utilizado.',
  otp_expired:   'Seu link de confirmação expirou.',
}

// ─── OTP-expired inline block ─────────────────────────────────────────────────

function OtpExpiredBlock({ nextPath }: { nextPath: string }) {
  const [resendEmail,  setResendEmail]  = useState('')
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [resendError,  setResendError]  = useState<string | null>(null)

  async function handleResend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (resendStatus === 'sending') return
    setResendStatus('sending')
    setResendError(null)

    const result = await resendConfirmation(resendEmail, nextPath || undefined)
    if (result?.error) {
      setResendError(result.error)
      setResendStatus('error')
    } else {
      setResendStatus('sent')
    }
  }

  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4 space-y-3">
      <div className="flex items-start gap-2.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" className="text-amber-400 flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <p className="text-sm font-medium text-amber-300 leading-snug">
            Link de confirmação expirado
          </p>
          <p className="text-xs text-amber-400/70 mt-0.5 leading-relaxed">
            Isso acontece quando o seu cliente de e-mail abre o link automaticamente
            antes de você clicar. Reenvie um novo link abaixo.
          </p>
        </div>
      </div>

      {resendStatus === 'sent' ? (
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" />
          </svg>
          Novo link enviado! Verifique sua caixa de entrada.
        </div>
      ) : (
        <form onSubmit={handleResend} className="space-y-2">
          <input
            type="email"
            required
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            placeholder="Informe seu e-mail"
            disabled={resendStatus === 'sending'}
            className="w-full h-9 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50"
          />
          {resendError && (
            <p className="text-xs text-red-400">{resendError}</p>
          )}
          <button
            type="submit"
            disabled={resendStatus === 'sending'}
            className="w-full h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 text-sm font-medium text-amber-300 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
          >
            {resendStatus === 'sending' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                Enviando…
              </span>
            ) : (
              'Reenviar link de confirmação'
            )}
          </button>
        </form>
      )}
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function LoginForm() {
  const searchParams = useSearchParams()
  const nextPath     = searchParams.get('next') ?? ''
  const urlError     = searchParams.get('error')
  const errorCode    = searchParams.get('error_code')

  const isProfessor  = nextPath === '/professor' || nextPath.startsWith('/professor/')
  const isOtpExpired = errorCode === 'otp_expired' || urlError === 'otp_expired'

  const [loginPending, setLoginPending] = useState(false)
  const [loginError,   setLoginError]   = useState<string | null>(null)

  const urlErrorMessage = isOtpExpired
    ? 'Seu link de confirmação expirou ou já foi utilizado.'
    : urlError
      ? (URL_ERROR_MESSAGES[urlError] ?? `Erro de autenticação (${urlError}). Tente novamente.`)
      : null

  const displayError = loginError ?? urlErrorMessage

  // Called by SignInCard when the user submits — returns error string or null
  async function handleLogin(email: string, password: string): Promise<string | null> {
    if (loginPending) return null
    setLoginPending(true)
    setLoginError(null)

    const formData = new FormData()
    formData.append('email',    email)
    formData.append('password', password)
    formData.append('next',     nextPath)

    const result = await signIn(null, formData)
    if (result?.error) {
      setLoginPending(false)
      setLoginError(result.error)
      return result.error
    }
    // On success signIn calls redirect() — component unmounts
    return null
  }

  return (
    <SignInCard
      onSubmit={handleLogin}
      isLoading={loginPending}
      error={displayError}
      nextPath={nextPath}
      isProfessor={isProfessor}
      headerExtra={isOtpExpired ? <OtpExpiredBlock nextPath={nextPath} /> : undefined}
    />
  )
}
