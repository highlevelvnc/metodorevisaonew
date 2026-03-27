import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ShieldCheck, CreditCard, User, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { PixKeyType } from '@/lib/supabase/types'
import PayoutForm from './PayoutForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Professor — Perfil',
  robots: { index: false, follow: false },
}

const PIX_LABELS: Record<PixKeyType, string> = {
  cpf:    'CPF',
  cnpj:   'CNPJ',
  email:  'E-mail',
  phone:  'Celular',
  random: 'Chave aleatória',
}

export default async function ProfessorPerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single()
  const profile = profileRaw as { role: string; full_name: string | null } | null
  if (!profile || !['admin', 'reviewer'].includes(profile.role)) redirect('/aluno')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: payoutRaw } = await db
    .from('professor_payout_profiles')
    .select('pix_key, pix_key_type, cpf, short_bio')
    .eq('professor_id', user.id)
    .maybeSingle()

  const payout = payoutRaw as {
    pix_key: string | null
    pix_key_type: PixKeyType | null
    cpf: string | null
    short_bio: string | null
  } | null

  const displayName = profile.full_name ?? user.email?.split('@')[0] ?? 'Professor'
  const initial     = displayName.charAt(0).toUpperCase()
  const hasPayoutData = !!(payout?.pix_key)

  return (
    <div className="max-w-2xl space-y-5">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Perfil</h1>
        <p className="text-gray-500 text-sm mt-0.5">Dados da conta e configurações de pagamento</p>
      </div>

      {/* ── Identity card ────────────────────────────────────────── */}
      <div className="card-dark rounded-2xl p-5">
        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-4">
          <User size={8} className="inline mr-1.5 -mt-px" />
          Identidade
        </p>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-500/30 flex items-center justify-center text-xl font-bold text-amber-300 flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-bold text-white truncate">{displayName}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full shrink-0">
                <ShieldCheck size={9} />
                {profile.role === 'admin' ? 'Administrador' : 'Professor'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{user.email}</p>
            {payout?.short_bio && (
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">{payout.short_bio}</p>
            )}
          </div>
        </div>

        {/* CPF quick view */}
        {payout?.cpf && (
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2">
            <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">CPF</span>
            <span className="text-xs font-mono text-gray-400">{payout.cpf}</span>
          </div>
        )}
      </div>

      {/* ── Payout status ────────────────────────────────────────── */}
      {hasPayoutData ? (
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 size={15} className="text-green-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-400">Dados de pagamento configurados</p>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Chave PIX {payout?.pix_key_type ? PIX_LABELS[payout.pix_key_type] : ''}:&nbsp;
              <span className="font-mono text-gray-500">{payout?.pix_key}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-center gap-3">
          <CreditCard size={15} className="text-amber-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-400">Dados de pagamento pendentes</p>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Preencha sua chave PIX abaixo para garantir o recebimento do fechamento mensal.
            </p>
          </div>
        </div>
      )}

      {/* ── Payout settings form ─────────────────────────────────── */}
      <div className="card-dark rounded-2xl p-5">
        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-5">
          <CreditCard size={8} className="inline mr-1.5 -mt-px" />
          Dados de pagamento
        </p>
        <PayoutForm initial={payout} />
      </div>

      {/* ── Account settings (read-only) ─────────────────────────── */}
      <div className="card-dark rounded-2xl p-5">
        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-4">
          Conta &amp; Segurança
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05]">
            <div>
              <p className="text-xs font-semibold text-gray-300">E-mail</p>
              <p className="text-xs text-gray-600 mt-0.5">{user.email}</p>
            </div>
            <span className="text-[10px] text-gray-700 bg-white/[0.04] border border-white/[0.07] px-2.5 py-1 rounded-lg">
              Verificado
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-xs font-semibold text-gray-300">Senha</p>
              <p className="text-xs text-gray-600 mt-0.5">Gerenciada via autenticação Supabase</p>
            </div>
            <a
              href="mailto:suporte@metodorevisao.com.br?subject=Alterar senha"
              className="text-[10px] text-amber-500/70 hover:text-amber-400 transition-colors"
            >
              Solicitar alteração
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}
