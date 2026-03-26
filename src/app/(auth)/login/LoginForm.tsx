'use client'

import { useState }          from 'react'
import Link                  from 'next/link'
import { useSearchParams }   from 'next/navigation'
import { signIn }            from '@/lib/actions/auth'
import { resendConfirmation } from '@/lib/actions/auth'

// ─── URL error messages (from ?error= query param) ───────────────────────────
// These are sent by our /auth/callback when Supabase returns an error.
// When error_code=otp_expired is also present we override with the OTP message below.
const URL_ERROR_MESSAGES: Record<string, string> = {
  link_expirado:  'Seu link de confirmação expirou.',
  link_invalido:  'Link inválido. Use o botão no e-mail que enviamos.',
  access_denied:  'Link expirado ou já utilizado.',
  otp_expired:    'Seu link de confirmação expirou.',
}

export default function LoginForm() {
  const searchParams = useSearchParams()
  const nextPath     = searchParams.get('next') ?? ''
  const urlError     = searchParams.get('error')
  const errorCode    = searchParams.get('error_code') // e.g. 'otp_expired'

  // An OTP-expired error means the account exists but the confirmation link was
  // consumed before the user clicked (usually by an email scanner / prefetch).
  const isOtpExpired = errorCode === 'otp_expired' || urlError === 'otp_expired'

  // ── Login form state ───────────────────────────────────────────────────────
  const [loginPending, setLoginPending] = useState(false)
  const [loginError,   setLoginError]   = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loginPending) return

    setLoginPending(true)
    setLoginError(null)

    const formData = new FormData(e.currentTarget)
    const result   = await signIn(null, formData)

    if (result?.error) {
      setLoginError(result.error)
      setLoginPending(false)
    }
    // On success the server calls redirect() — the component will unmount
  }

  // ── Resend confirmation state ──────────────────────────────────────────────
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

  // ── Which error to display in the main error box ───────────────────────────
  const urlErrorMessage = isOtpExpired
    ? 'Seu link de confirmação expirou ou já foi utilizado.'
    : urlError
      ? (URL_ERROR_MESSAGES[urlError] ?? `Erro de autenticação (${urlError}). Tente novamente.`)
      : null

  const displayError = loginError ?? urlErrorMessage

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h1>
        <p className="text-gray-500 text-sm">Acesse sua conta para ver suas redações</p>
      </div>

      {/* ── OTP expired — resend section ──────────────────────────────────── */}
      {isOtpExpired && (
        <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4 space-y-3">
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
      )}

      {/* ── Login form ────────────────────────────────────────────────────── */}
      <form onSubmit={handleLogin} className="card-dark rounded-2xl p-6 space-y-4">
        {/* Hidden field so signIn knows where to redirect after success */}
        <input type="hidden" name="next" value={nextPath} />

        {displayError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">
            {displayError}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={loginPending}
            placeholder="seu@email.com"
            className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Senha
            </label>
            <Link
              href="/esqueci-senha"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={loginPending}
            placeholder="••••••••"
            className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loginPending}
          className="btn-primary w-full justify-center"
        >
          {loginPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>

      <p className="text-center mt-5 text-sm text-gray-600">
        Não tem conta?{' '}
        <Link
          href="/cadastro"
          className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
        >
          Criar conta grátis
        </Link>
      </p>
    </div>
  )
}
