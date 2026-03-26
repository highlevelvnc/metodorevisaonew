'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { useState } from 'react'
import { signUpAndCheckout } from '@/lib/actions/checkout'
import type { CheckoutState } from '@/lib/actions/checkout'

// ─── Submit button ────────────────────────────────────────────────────────────

function SubmitButton({ planName }: { planName: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full justify-center py-4 text-[15px] font-bold disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Preparando seu acesso…
        </>
      ) : (
        <>
          Garantir meu plano {planName}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </>
      )}
    </button>
  )
}

// ─── Email confirmation state ─────────────────────────────────────────────────

function EmailConfirmState({ planSlug }: { planSlug: string }) {
  return (
    <div className="card-dark rounded-2xl p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400">
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-white mb-2">Confirme seu e-mail</h2>
      <p className="text-sm text-gray-400 leading-relaxed mb-5">
        Enviamos um link para o seu e-mail.
        Clique nele e você será{' '}
        <strong className="text-white">redirecionado automaticamente</strong>{' '}
        para finalizar o pagamento.
      </p>
      <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/15 px-4 py-3 mb-6">
        <p className="text-xs text-amber-400/90 leading-relaxed">
          Não feche esta aba. Após confirmar, volte aqui e clique em prosseguir.
        </p>
      </div>
      <Link
        href={`/checkout/${planSlug}`}
        className="text-sm text-gray-500 hover:text-white transition-colors"
      >
        ← Tentar com outro e-mail
      </Link>
    </div>
  )
}

// ─── Progress steps ───────────────────────────────────────────────────────────

function ProgressSteps() {
  return (
    <div className="flex items-center justify-center gap-0 mb-7">
      {['Dados', 'Pagamento', 'Acesso'].map((label, i) => {
        const active = i === 0
        const done   = false
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                done   ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' :
                active ? 'bg-purple-600 text-white' :
                         'bg-white/[0.04] border border-white/[0.07] text-gray-600'
              }`}>
                {i + 1}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${active ? 'text-gray-300' : 'text-gray-700'}`}>
                {label}
              </span>
            </div>
            {i < 2 && <div className="h-px w-8 mx-1.5 mb-5 bg-white/[0.06]" />}
          </div>
        )
      })}
    </div>
  )
}

// ─── Trust bar ────────────────────────────────────────────────────────────────

function TrustBar() {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap mt-3.5">
      {[
        { icon: '🔒', text: 'Pagamento criptografado' },
        { icon: '↩️', text: 'Sem fidelidade' },
        { icon: '✓',  text: 'Cancele quando quiser' },
      ].map((t) => (
        <span key={t.text} className="flex items-center gap-1 text-[11px] text-gray-600">
          <span>{t.icon}</span>
          {t.text}
        </span>
      ))}
    </div>
  )
}

// ─── Main checkout form ───────────────────────────────────────────────────────

interface Props {
  planSlug:  string
  planName:  string
  cancelado?: boolean
}

export function CheckoutForm({ planSlug, planName, cancelado = false }: Props) {
  const [state, action] = useFormState<CheckoutState, FormData>(signUpAndCheckout, null)
  const [password, setPassword] = useState('')

  if (state?.confirm) return <EmailConfirmState planSlug={planSlug} />

  const hasMinLength = password.length >= 6

  return (
    <div className="card-dark rounded-2xl p-7">
      <ProgressSteps />

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/15 rounded-full px-3 py-1 mb-4">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Leva menos de 1 minuto
        </div>
        <h1 className="text-2xl font-extrabold text-white leading-tight mb-2">
          Quase lá.
        </h1>
        <p className="text-sm text-gray-400 leading-relaxed">
          Crie sua conta e finalize o pagamento.<br />
          <span className="text-gray-500">Sua nota começa a subir na próxima redação.</span>
        </p>
      </div>

      {/* Cancelado */}
      {cancelado && (
        <div className="rounded-xl bg-amber-500/[0.07] border border-amber-500/15 px-4 py-3 mb-5">
          <p className="text-sm text-amber-400/90">
            Sem problema — o pagamento não foi cobrado. Tente novamente abaixo.
          </p>
        </div>
      )}

      {/* Error */}
      {state?.error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 mb-5">
          <p className="text-sm text-red-400">{state.error}</p>
          {state.existingUser && (
            <p className="text-xs text-gray-500 mt-2">
              <Link
                href={`/login?next=/checkout/${planSlug}`}
                className="text-purple-400 hover:text-purple-300 transition-colors font-semibold underline"
              >
                Entrar com este e-mail para continuar →
              </Link>
            </p>
          )}
        </div>
      )}

      {/* Form fields */}
      <form action={action} className="space-y-3.5">
        <input type="hidden" name="planSlug" value={planSlug} />

        {/* Nome */}
        <div>
          <label htmlFor="co_full_name" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
            Seu nome
          </label>
          <input
            id="co_full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            autoFocus
            required
            placeholder="Como podemos te chamar?"
            className="w-full h-11 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/30 transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="co_email" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
            E-mail
          </label>
          <input
            id="co_email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="seu@email.com"
            className="w-full h-11 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/30 transition-all"
          />
        </div>

        {/* Senha */}
        <div>
          <label htmlFor="co_password" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
            Crie uma senha
          </label>
          <input
            id="co_password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/30 transition-all"
          />
          {password.length > 0 && (() => {
            const strength = password.length < 6 ? 1 : password.length < 10 ? 2 : 3
            const meta = [
              null,
              { color: 'bg-red-500',   label: 'Fraca',  tc: 'text-red-400' },
              { color: 'bg-amber-500', label: 'Boa',    tc: 'text-amber-400' },
              { color: 'bg-green-500', label: 'Forte',  tc: 'text-green-400' },
            ][strength]!
            return (
              <div className="mt-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3].map((l) => (
                    <div key={l} className={`h-0.5 flex-1 rounded-full transition-all ${strength >= l ? meta.color : 'bg-white/[0.07]'}`} />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <p className={`text-[11px] ${meta.tc}`}>{meta.label}</p>
                  {!hasMinLength && (
                    <p className="text-[11px] text-gray-700">{6 - password.length} restante{(6 - password.length) !== 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
            )
          })()}
        </div>

        {/* Submit */}
        <div className="pt-1">
          <SubmitButton planName={planName} />
          <TrustBar />
        </div>

        <p className="text-[11px] text-gray-700 text-center">
          Ao continuar você concorda com os{' '}
          <Link href="/termos" className="underline hover:text-gray-500 transition-colors">termos de uso</Link>.
        </p>
      </form>

      {/* Login link */}
      <div className="mt-5 pt-4 border-t border-white/[0.05] text-center">
        <p className="text-sm text-gray-600">
          Já tem conta?{' '}
          <Link
            href={`/login?next=/checkout/${planSlug}`}
            className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
          >
            Entrar e pagar →
          </Link>
        </p>
      </div>
    </div>
  )
}
