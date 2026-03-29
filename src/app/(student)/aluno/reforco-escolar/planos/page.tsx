import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckoutButton } from '../../upgrade/CheckoutButton'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Planos de Reforço Escolar | Método Revisão',
  robots: { index: false, follow: false },
}

const PLAN_FEATURES: Record<string, string[]> = {
  'reforco-4':  ['4 aulas por mês', 'Google Meet ao vivo', '4 matérias disponíveis', 'Professora dedicada'],
  'reforco-8':  ['8 aulas por mês', 'Google Meet ao vivo', '4 matérias disponíveis', 'Professora dedicada', 'Material personalizado'],
  'reforco-12': ['12 aulas por mês', 'Google Meet ao vivo', '4 matérias disponíveis', 'Professora dedicada', 'Material personalizado', 'Acompanhamento contínuo'],
  'reforco-16': ['16 aulas por mês', 'Google Meet ao vivo', '4 matérias disponíveis', 'Professora dedicada', 'Material personalizado', 'Acompanhamento contínuo'],
  'reforco-22': ['22 aulas por mês', 'Google Meet ao vivo', '4 matérias disponíveis', 'Professora dedicada', 'Material personalizado', 'Acompanhamento diário'],
  'reforco-34': ['34 aulas por mês', 'Google Meet ao vivo', '4 matérias disponíveis', 'Professora dedicada', 'Material personalizado', 'Acompanhamento diário', 'Prioridade total'],
}

const MOST_POPULAR_SLUG = 'reforco-8'

type Plan = {
  id: string
  name: string
  slug: string
  price_brl: number
  lesson_count: number
}

export default async function PlanosReforcoPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelado?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [{ data: plansRaw }, { data: subRaw }] = await Promise.all([
    db.from('plans')
      .select('id, name, slug, price_brl, lesson_count')
      .eq('active', true)
      .eq('plan_type', 'lesson')
      .order('lesson_count'),
    db.from('subscriptions')
      .select('plan_id, status, lessons_used, lessons_limit, plans!inner(name, slug, plan_type)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('plans.plan_type', 'lesson')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const plans: Plan[] = (plansRaw ?? []) as Plan[]
  const currentSub = subRaw as {
    plan_id: string; lessons_used: number; lessons_limit: number
    plans: { name: string; slug: string } | null
  } | null

  const sp = await searchParams
  const wasCancelled = sp?.cancelado === '1'

  return (
    <div className="max-w-5xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Planos de Reforço Escolar</h1>
        <p className="text-gray-500 text-sm mt-1">
          Aulas particulares online de Português, Inglês, Redação e Literatura via Google Meet.
        </p>
      </div>

      {/* Cancellation notice */}
      {wasCancelled && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-5 py-3.5">
          <p className="text-sm text-amber-300 font-medium">Pagamento cancelado</p>
          <p className="text-xs text-gray-500 mt-0.5">Você pode tentar novamente quando quiser.</p>
        </div>
      )}

      {/* Current subscription */}
      {currentSub && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/[0.04] px-5 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                Plano atual: <span className="text-green-400">{currentSub.plans?.name}</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {currentSub.lessons_used}/{currentSub.lessons_limit} aulas usadas neste ciclo
              </p>
            </div>
            <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/25 px-2.5 py-1 rounded-full">
              Ativo
            </span>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => {
          const isCurrent    = currentSub?.plans?.slug === plan.slug
          const isPopular    = plan.slug === MOST_POPULAR_SLUG
          const pricePerLesson = plan.lesson_count > 0 ? Math.round(plan.price_brl / plan.lesson_count) : 0
          const features     = PLAN_FEATURES[plan.slug] ?? [`${plan.lesson_count} aulas por mês`, 'Google Meet ao vivo']

          return (
            <div
              key={plan.id}
              className={`relative card-dark rounded-2xl p-5 flex flex-col ${
                isPopular ? 'border-purple-500/30 ring-1 ring-purple-500/20' :
                isCurrent ? 'border-green-500/30' : ''
              }`}
            >
              {/* Popular badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] font-bold text-purple-300 bg-purple-600 px-3 py-1 rounded-full whitespace-nowrap">
                    Mais escolhido
                  </span>
                </div>
              )}

              {/* Current badge */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] font-bold text-green-300 bg-green-600 px-3 py-1 rounded-full">
                    Atual
                  </span>
                </div>
              )}

              {/* Plan name + lesson count */}
              <h3 className="text-lg font-bold text-white mb-1 mt-2">{plan.name}</h3>
              <p className="text-xs text-gray-500 mb-4">
                {plan.lesson_count} aulas por mês
              </p>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    R${plan.price_brl.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </span>
                  <span className="text-sm text-gray-600">/mês</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  R${pricePerLesson} por aula
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-5 flex-1">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <div className="text-center text-xs text-gray-600 py-2.5">Plano atual</div>
              ) : (
                <CheckoutButton
                  planSlug={plan.slug}
                  label={currentSub ? 'Trocar plano' : 'Assinar agora'}
                  variant={isPopular ? 'primary' : 'secondary'}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Info section */}
      <div className="card-dark rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-3">Como funciona</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-xs text-gray-500">
          <div>
            <p className="font-semibold text-gray-300 mb-1">1. Escolha seu plano</p>
            <p>Selecione a quantidade de aulas que melhor se encaixa na sua rotina de estudos.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-300 mb-1">2. Solicite suas aulas</p>
            <p>Escolha data, horário e matéria. A professora recebe e confirma o agendamento.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-300 mb-1">3. Aula via Google Meet</p>
            <p>Receba o link por e-mail, entre na aula e estude com acompanhamento individualizado.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
