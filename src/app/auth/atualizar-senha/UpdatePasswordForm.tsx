'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { updatePassword } from '@/lib/actions/auth'

export default function UpdatePasswordForm() {
  const [pending,  setPending]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState(false)
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')

  const match      = password === confirm && confirm.length > 0
  const hasMinLen  = password.length >= 6
  const canSubmit  = hasMinLen && match

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pending || !canSubmit) return

    setPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result   = await updatePassword(null, formData)

    if (result?.error) {
      setError(result.error)
      setPending(false)
      return
    }

    // Se success → servidor fez redirect para /aluno (esta linha pode não ser atingida)
    setSuccess(true)
    setPending(false)
  }

  if (success) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={28} className="text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Senha atualizada!</h2>
        <p className="text-gray-500 text-sm">Redirecionando...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Nova senha</h1>
        <p className="text-gray-500 text-sm">Escolha uma senha segura para sua conta</p>
      </div>

      <form onSubmit={handleSubmit} className="card-dark rounded-2xl p-6 space-y-4">
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Nova senha
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
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm" className="block text-sm font-medium text-gray-300">
            Confirmar senha
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            disabled={pending}
            placeholder="Repita a senha"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className={`w-full h-10 rounded-xl border px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 bg-white/[0.04] ${
              confirm.length > 0
                ? match
                  ? 'border-green-500/40 focus:ring-green-500'
                  : 'border-red-500/40 focus:ring-red-500'
                : 'border-white/[0.08] focus:ring-purple-500'
            }`}
          />
          {confirm.length > 0 && !match && (
            <p className="text-xs text-red-400">As senhas não coincidem</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending || !canSubmit}
          className="btn-primary w-full justify-center"
        >
          {pending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Atualizando...
            </>
          ) : (
            'Salvar nova senha'
          )}
        </button>
      </form>
    </div>
  )
}
