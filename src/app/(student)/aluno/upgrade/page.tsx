import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckoutButton } from './CheckoutButton'
import { TrackPageView } from '@/components/TrackPageView'

export const metadata = { title: 'Upgrade de Plano | Método Revisão' }

type Plan = {
  id: string
  name: string
  slug: string
  price_brl: number
  essay_count: number
  features: string[]
}

// Display order and feature bullets for each plan.
// Essay count is intentionally omitted here — it's shown directly from
// `plan.essay_count` (DB) in the price block, so there's only one source of truth.
const PLAN_FEATURES: Record<string, string[]> = {
  trial: [
    'Devolutiva completa C1–C5',
    'Acesso à biblioteca de temas',
    'Videoaulas disponíveis',
  ],
  evolucao: [
    'Devolutiva completa C1–C5',
    'Análise de padrões recorrentes',
    'Acesso completo à plataforma',
    'Mentorias em grupo semanais',
  ],
  estrategia: [
    'Devolutiva completa C1–C5',
    'Plano de evolução personalizado',
    'Relatório exportável do ciclo',
    'Mentorias em grupo semanais',
    'Acompanhamento prioritário',
  ],
  intensivo: [
    'Devolutiva completa C1–C5',
    'Correção em até 24h',
    'Plano e relatório personalizados',
    'Mentoria com feedback direto',
    'Correção prioritária garantida',
  ],
}

const PLAN_ORDER = ['trial', 'evolucao', 'estrategia', 'intensivo']

function planTier(slug: string): number {
  return PLAN_ORDER.indexOf(slug)
}

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: { cancelado?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  /* ── Fetch plans + current subscription in parallel ──────────────────── */
  const [{ data: plansRaw }, { data: subRaw }] = await Promise.all([
    db
      .from('plans')
      .select('id, name, slug, price_brl, essay_count, features')
      .eq('active', true)
      .order('essay_count'),
    db
      .from('subscriptions')
      .select('plan_id, status, essays_used, essays_limit, plans(name, slug)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const plans: Plan[] = (plansRaw ?? []).map((p: any) => ({
    ...p,
    features: PLAN_FEATURES[p.slug] ?? [],
  }))

  const currentSlug: string = subRaw?.plans?.slug ?? 'trial'
  const currentTier = planTier(currentSlug)

  const cancelado = searchParams.cancelado === '1'

  return (
    <div className="max-w-4xl">
      <TrackPageView event="upgrade_page_viewed" userId={user.id} metadata={{ current_plan: currentSlug }} />
      {/* Masthead */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-purple-400/70 mb-1.5">
          Planos
        </p>
        <h1 className="text-2xl font-bold text-white mb-1.5">Escolha seu plano</h1>
        <p className="text-sm text-gray-500">
          Cada redação corrigida por uma especialista real. Sem IA, sem correção genérica.
        </p>
      </div>

      {/* Cancellation notice */}
      {cancelado && (
        <div className="rounded-2xl border border-amber-500/[0.2] bg-amber-500/[0.04] px-5 py-3.5 mb-6 flex items-center gap-3">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400 shrink-0">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-xs text-amber-400/80">
            Pagamento cancelado. Seu plano atual permanece ativo. Você pode tentar novamente quando quiser.
          </p>
        </div>
      )}

      {/* Current plan note */}
      {subRaw && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-3.5 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-xs text-gray-400">
              Plano atual: <span className="font-bold text-white">{subRaw.plans?.name ?? 'Trial'}</span>
              <span className="text-gray-600 ml-2">
                {subRaw.essays_used}/{subRaw.essays_limit} redações usadas
              </span>
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            Ativo
          </span>
        </div>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {plans.map((plan) => {
          const tier       = planTier(plan.slug)
          const isCurrent  = plan.slug === currentSlug
          const isUpgrade  = tier > currentTier
          const isDowngrade = tier < currentTier
          const isFree     = plan.price_brl === 0
          const isPopular  = plan.slug === 'estrategia'

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border flex flex-col ${
                isPopular
                  ? 'border-purple-500/40 bg-gradient-to-b from-purple-900/20 to-transparent'
                  : isCurrent
                  ? 'border-emerald-500/30 bg-white/[0.03]'
                  : 'border-white/[0.08] bg-white/[0.02]'
              }`}
            >
              {/* Popular badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-purple-700 text-white border border-purple-500/40 whitespace-nowrap">
                    Mais escolhido
                  </span>
                </div>
              )}

              <div className="p-5 flex flex-col flex-1">
                {/* Plan name */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-white">{plan.name}</p>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      Atual
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-5">
                  {isFree ? (
                    <p className="text-2xl font-black text-white">Grátis</p>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-gray-500 self-start mt-1">R$</span>
                      <span className="text-2xl font-black text-white">
                        {plan.price_brl.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </span>
                      <span className="text-xs text-gray-600">/ciclo</span>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    {plan.essay_count} {plan.essay_count === 1 ? 'redação' : 'redações'} por ciclo
                  </p>
                </div>

                {/* Feature list */}
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-gray-500">
                      <svg
                        className="shrink-0 mt-0.5 text-emerald-500"
                        width="12" height="12" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div className="w-full text-center py-2 text-xs text-gray-600 border border-white/[0.06] rounded-xl">
                    Plano atual
                  </div>
                ) : isDowngrade ? (
                  <div className="w-full text-center py-2 text-xs text-gray-700 border border-white/[0.04] rounded-xl">
                    Plano inferior
                  </div>
                ) : isFree ? (
                  <div className="w-full text-center py-2 text-xs text-gray-700 border border-white/[0.04] rounded-xl">
                    —
                  </div>
                ) : (
                  <CheckoutButton
                    planSlug={plan.slug}
                    label={isUpgrade ? `Fazer upgrade` : 'Selecionar'}
                    variant={isPopular ? 'primary' : 'secondary'}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Trust signals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            ),
            title: 'Pagamento seguro',
            desc: 'Processado pelo Stripe, padrão PCI-DSS nível 1.',
          },
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            ),
            title: 'Ativação imediata',
            desc: 'Créditos disponíveis assim que o pagamento é confirmado.',
          },
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            ),
            title: 'Correção humana',
            desc: 'Cada redação avaliada por uma especialista ENEM real.',
          },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.04] bg-white/[0.015] px-4 py-3 flex items-start gap-3">
            <div className="shrink-0 w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-500 mt-0.5">
              {item.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 mb-0.5">{item.title}</p>
              <p className="text-[11px] text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="card-dark rounded-2xl p-5">
        <p className="text-xs font-bold text-white mb-4">Dúvidas frequentes</p>
        <div className="space-y-4">
          {[
            {
              q: 'O que é um ciclo?',
              a: 'Um ciclo é o período de uso do plano. Cada plano dá um número fixo de redações para envio. Quando os créditos acabam, você faz upgrade ou aguarda o próximo ciclo.',
            },
            {
              q: 'Posso fazer upgrade no meio do ciclo?',
              a: 'Sim. O upgrade é imediato — seu plano anterior é encerrado e o novo fica ativo na hora, com os novos créditos disponíveis.',
            },
            {
              q: 'Meu cartão está seguro?',
              a: 'Seus dados de cartão nunca passam pelos nossos servidores. O pagamento é processado diretamente pelo Stripe, certificado PCI-DSS nível 1.',
            },
          ].map((item, i) => (
            <div key={i} className={i > 0 ? 'pt-4 border-t border-white/[0.04]' : ''}>
              <p className="text-xs font-bold text-white mb-1">{item.q}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
