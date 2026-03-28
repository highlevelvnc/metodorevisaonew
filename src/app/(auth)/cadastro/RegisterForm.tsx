'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { signUp } from '@/lib/actions/auth'

export default function RegisterForm() {
  const searchParams = useSearchParams()
  const nextPath     = searchParams.get('next') ?? ''

  const [pending,  setPending]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [confirm,  setConfirm]  = useState(false)
  const [password, setPassword] = useState('')

  const hasMinLength = password.length >= 6

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pending) return

    setPending(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const result   = await signUp(null, formData)

      if (result?.confirm) {
        setConfirm(true)
        setPending(false)
        return
      }

      if (result?.error) {
        setError(result.error)
        setPending(false)
        return
      }
      // Sem error e sem confirm → servidor fez redirect para /aluno
    } catch (err) {
      // Server action threw — Next.js wraps these in opaque errors.
      // Log the raw error; show it in the UI so it's diagnosable.
      const rawMsg = err instanceof Error ? err.message : String(err)
      console.error('[RegisterForm] Server action threw:', rawMsg, err)
      // Next.js server action errors often show as "An error occurred in the Server Component"
      // Surface whatever we got so the developer can see it
      setError(`Erro inesperado: ${rawMsg}`)
      setPending(false)
    }
  }

  // ── Estado: aguardando confirmação de e-mail ────────────────────────────────
  if (confirm) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={28} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Confirme seu e-mail</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Enviamos um link de confirmação para o seu e-mail.
          <br />
          Clique no link para ativar sua conta.
        </p>
        <p className="text-xs text-gray-700">
          Não recebeu?{' '}
          <button
            onClick={() => setConfirm(false)}
            className="text-purple-400 hover:text-purple-300 transition-colors underline"
          >
            Tentar novamente
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Criar conta</h1>
        <p className="text-gray-500 text-sm">Comece com 1 redação gratuita</p>
      </div>

      <form onSubmit={handleSubmit} className="card-dark rounded-2xl p-6 space-y-4">
        {/* Thread ?next= so checkout flows survive email confirmation */}
        {nextPath && <input type="hidden" name="next" value={nextPath} />}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Nome */}
        <div className="space-y-1.5">
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-300">
            Nome completo
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            disabled={pending}
            placeholder="Seu nome"
            className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        {/* E-mail */}
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
            disabled={pending}
            placeholder="seu@email.com"
            className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        {/* Senha */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            disabled={pending}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
          {/* Indicador de força */}
          {password.length > 0 && (() => {
            // 0 = empty, 1 = weak (<6), 2 = ok (6-9), 3 = strong (10+)
            const strength = password.length < 6 ? 1 : password.length < 10 ? 2 : 3
            const meta = [
              null,
              { color: 'bg-red-500',   label: 'Fraca',  textColor: 'text-red-400' },
              { color: 'bg-amber-500', label: 'Boa',    textColor: 'text-amber-400' },
              { color: 'bg-green-500', label: 'Forte',  textColor: 'text-green-400' },
            ][strength]!
            return (
              <div className="mt-1.5">
                <div className="flex gap-1.5">
                  {[1, 2, 3].map(level => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength >= level ? meta.color : 'bg-white/[0.08]'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-xs ${meta.textColor}`}>{meta.label}</p>
                  {!hasMinLength && (
                    <p className="text-xs text-gray-600">
                      {6 - password.length} caractere{6 - password.length !== 1 ? 's' : ''} restante{6 - password.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            )
          })()}
        </div>

        <button
          type="submit"
          disabled={pending || !hasMinLength}
          className="btn-primary w-full justify-center"
        >
          {pending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Criando conta...
            </>
          ) : (
            'Criar conta grátis'
          )}
        </button>

        <p className="text-xs text-gray-700 text-center pt-1">
          Ao criar conta você concorda com nossos termos de uso.
        </p>
      </form>

      <p className="text-center mt-5 text-sm text-gray-600">
        Já tem conta?{' '}
        <Link
          href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : '/login'}
          className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
        >
          Entrar
        </Link>
      </p>
    </div>
  )
}
