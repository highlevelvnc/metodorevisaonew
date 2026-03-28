import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Meu Perfil',
  robots: { index: false, follow: false },
}

const PLAN_ORDER = ['trial', 'evolucao', 'estrategia', 'intensivo']

export default async function ContaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [{ data: userData }, { data: subRaw }] = await Promise.all([
    db
      .from('users')
      .select('full_name, email, created_at')
      .eq('id', user.id)
      .single(),
    db
      .from('subscriptions')
      .select('essays_used, essays_limit, started_at, status, plans(name, slug, price_brl, essay_count)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const planName   = subRaw?.plans?.name   ?? 'Trial'
  const planSlug   = subRaw?.plans?.slug   ?? 'trial'
  const essaysUsed  = subRaw?.essays_used  ?? 0
  const essaysLimit = subRaw?.essays_limit ?? 1
  const creditsLeft = Math.max(0, essaysLimit - essaysUsed)
  const pct         = essaysLimit > 0 ? Math.round((essaysUsed / essaysLimit) * 100) : 0
  const isMaxPlan   = planSlug === 'intensivo'

  const memberSince = userData?.created_at
    ? new Date(userData.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="max-w-lg">
      {/* Masthead */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1.5">Meu Perfil</h1>
        <p className="text-sm text-gray-500">Seu plano e dados de acesso</p>
      </div>

      {/* Profile card */}
      <div className="card-dark rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-4">
          {/* Avatar placeholder */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-700/40 to-purple-900/30 border border-purple-500/30 flex items-center justify-center text-lg font-bold text-purple-300 shrink-0">
            {(userData?.full_name ?? user.email ?? '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{userData?.full_name || 'Aluno'}</p>
            <p className="text-xs text-gray-500 truncate">{userData?.email ?? user.email}</p>
            {memberSince && (
              <p className="text-[11px] text-gray-700 mt-0.5">Membro desde {memberSince}</p>
            )}
          </div>
        </div>
      </div>

      {/* Subscription card */}
      <div className="card-dark rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-white">Plano atual</p>
          {subRaw ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Ativo
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.10] text-gray-500">
              Gratuito
            </span>
          )}
        </div>

        {/* Plan name + price */}
        <div className="flex items-baseline gap-2 mb-4">
          <p className="text-2xl font-black text-white">{planName}</p>
          {subRaw?.plans?.price_brl > 0 && (
            <p className="text-sm text-gray-600">
              R$ {Number(subRaw.plans.price_brl).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}/ciclo
            </p>
          )}
        </div>

        {/* Credits progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="text-gray-500">Redações usadas</span>
            <span className={`font-bold ${creditsLeft === 0 ? 'text-amber-400' : 'text-white'}`}>
              {essaysUsed}/{essaysLimit}
            </span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                pct >= 100 ? 'bg-amber-500' : pct >= 66 ? 'bg-purple-500' : 'bg-purple-600'
              }`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-600 mt-1.5">
            {creditsLeft === 0
              ? 'Correções esgotadas — faça upgrade para continuar'
              : `${creditsLeft} correç${creditsLeft === 1 ? 'ão disponível' : 'ões disponíveis'} neste ciclo`
            }
          </p>
        </div>

        {/* Upgrade CTA */}
        {!isMaxPlan && (
          <Link
            href="/aluno/upgrade"
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-purple-600/30 bg-purple-700/10 hover:bg-purple-700/20 transition-all group"
          >
            <div>
              <p className="text-xs font-bold text-purple-300">Fazer upgrade</p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {planSlug === 'trial'
                  ? 'Comece com 4 correções por ciclo no plano Evolução'
                  : planSlug === 'evolucao'
                  ? 'Passe para Estratégia — 8 redações + prioridade na fila'
                  : 'Passe para Intensivo — 12 redações + correção em 24h'}
              </p>
            </div>
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.5"
              className="text-purple-400 shrink-0 group-hover:translate-x-0.5 transition-transform"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {/* Quick links */}
      <div className="card-dark rounded-2xl divide-y divide-white/[0.04]">
        <Link
          href="/aluno/redacoes"
          className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Minhas redações</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-700">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        <Link
          href="/aluno/evolucao"
          className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
            </svg>
            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Minha evolução</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-700">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-red-500/[0.05] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600 group-hover:text-red-500 transition-colors">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="text-sm text-gray-400 group-hover:text-red-400 transition-colors">Sair da conta</span>
            </div>
          </button>
        </form>
      </div>
    </div>
  )
}
