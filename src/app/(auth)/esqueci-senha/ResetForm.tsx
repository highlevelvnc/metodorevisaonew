'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { resetPassword } from '@/lib/actions/auth'

export default function ResetForm() {
  const [pending, setPending] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [sent,    setSent]    = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pending) return

    setPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result   = await resetPassword(null, formData)

    if (result?.confirm) {
      setSent(true)
      setPending(false)
      return
    }

    if (result?.error) {
      setError(result.error)
    }
    setPending(false)
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={28} className="text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Verifique seu e-mail</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha em breve.
        </p>
        <Link href="/login" className="btn-primary justify-center w-full">
          Voltar para o login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Recuperar senha</h1>
        <p className="text-gray-500 text-sm">
          Informe seu e-mail e enviaremos um link para redefinir sua senha
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-dark rounded-2xl p-6 space-y-4">
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">
            {error}
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

        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full justify-center"
        >
          {pending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar link de recuperação'
          )}
        </button>
      </form>

      <p className="text-center mt-5 text-sm text-gray-600">
        Lembrou a senha?{' '}
        <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
          Entrar
        </Link>
      </p>
    </div>
  )
}
