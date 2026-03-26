'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signIn } from '@/lib/actions/auth'

const URL_ERROR_MESSAGES: Record<string, string> = {
  link_invalido: 'Link inválido ou expirado. Solicite um novo.',
}

export default function LoginForm() {
  const searchParams = useSearchParams()
  const nextPath     = searchParams.get('next') ?? ''
  const urlError     = searchParams.get('error')

  const [pending, setPending] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pending) return

    setPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result   = await signIn(null, formData)

    // Se chegou aqui é porque não houve redirect (houve erro)
    if (result?.error) {
      setError(result.error)
      setPending(false)
    }
    // Se o login foi bem-sucedido, o servidor faz redirect e o componente desmonta
  }

  const displayError = error ?? (urlError ? URL_ERROR_MESSAGES[urlError] ?? 'Erro de autenticação.' : null)

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h1>
        <p className="text-gray-500 text-sm">Acesse sua conta para ver suas redações</p>
      </div>

      <form onSubmit={handleSubmit} className="card-dark rounded-2xl p-6 space-y-4">
        {/* hidden field so signIn action knows where to redirect after success */}
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
            disabled={pending}
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
            disabled={pending}
            placeholder="••••••••"
            className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full justify-center"
        >
          {pending ? (
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
