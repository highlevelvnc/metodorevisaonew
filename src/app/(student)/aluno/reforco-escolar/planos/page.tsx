import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckoutButton } from '../../upgrade/CheckoutButton'
import ExpandablePlans from './ExpandablePlans'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Planos de Reforço Escolar | Método Revisão',
  robots: { index: false, follow: false },
}

// Main 3 plans shown by default
const HIGHLIGHTED_SLUGS = ['reforco-4', 'reforco-8', 'reforco-12']
const MOST_POPULAR_SLUG = 'reforco-8'

const PLAN_FEATURES: Record<string, string[]> = {
  'reforco-4':  ['4 aulas por mês', 'Google Meet ao vivo', '4 matérias', 'Professora dedicada'],
  'reforco-8':  ['8 aulas por mês', 'Google Meet ao vivo', '4 matérias', 'Professora dedicada', 'Material personalizado'],
  'reforco-12': ['12 aulas por mês', 'Google Meet ao vivo', '4 matérias', 'Professora dedicada', 'Material personalizado', 'Acompanhamento contínuo'],
  'reforco-16': ['16 aulas por mês', 'Google Meet ao vivo', '4 matérias', 'Professora dedicada', 'Material personalizado', 'Acompanhamento contínuo'],
  'reforco-22': ['22 aulas por mês', 'Google Meet ao vivo', '4 matérias', 'Professora dedicada', 'Material personalizado', 'Acompanhamento diário'],
  'reforco-34': ['34 aulas por mês', 'Google Meet ao vivo', '4 matérias', 'Professora dedicada', 'Material personalizado', 'Acompanhamento diário', 'Prioridade total'],
}

const PLAN_LABELS: Record<string, string> = {
  'reforco-4':  'Para começar',
  'reforco-8':  'Para evoluir de verdade',
  'reforco-12': 'Para quem quer resultado rápido',
}

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

  const allPlans: Plan[] = (plansRaw ?? []) as Plan[]
  const highlighted = allPlans.filter(p => HIGHLIGHTED_SLUGS.includes(p.slug))
  const extraPlans  = allPlans.filter(p => !HIGHLIGHTED_SLUGS.includes(p.slug))

  const currentSub = subRaw as {
    plan_id: string; lessons_used: number; lessons_limit: number
    plans: { name: string; slug: string } | null
  } | null

  const sp = await searchParams
  const wasCancelled = sp?.cancelado === '1'

  return (
    <div className="max-w-4xl space-y-6">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Planos de Reforço Escolar</h1>
        <p className="text-gray-500 text-sm mt-1 max-w-lg mx-auto">
          Aulas individuais de Português, Inglês, Redação e Literatura via Google Meet.
          Escolha o plano que cabe na sua rotina.
        </p>
      </div>

      {/* Social proof */}
      <div className="flex items-center justify-center gap-6 text-center text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-400">★★★★★</span>
          <span>Nota 4.9</span>
        </div>
        <span className="text-gray-700">·</span>
        <span>Professora com 8+ anos de experiência</span>
        <span className="text-gray-700">·</span>
        <span>Cancele quando quiser</span>
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

      {/* ── Main 3 plans ─────────────────────────────── */}
      <div className="grid sm:grid-cols-3 gap-4">
        {highlighted.map(plan => {
          const isCurrent      = currentSub?.plans?.slug === plan.slug
          const isPopular      = plan.slug === MOST_POPULAR_SLUG
          const pricePerLesson = plan.lesson_count > 0 ? Math.round(plan.price_brl / plan.lesson_count) : 0
          const features       = PLAN_FEATURES[plan.slug] ?? [`${plan.lesson_count} aulas por mês`]
          const tagline        = PLAN_LABELS[plan.slug] ?? ''

          return (
            <div
              key={plan.id}
              className={`relative card-dark rounded-2xl p-5 flex flex-col ${
                isPopular ? 'border-purple-500/30 ring-1 ring-purple-500/20 scale-[1.02]' :
                isCurrent ? 'border-green-500/30' : ''
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] font-bold text-purple-300 bg-purple-600 px-3 py-1 rounded-full whitespace-nowrap">
                    Mais escolhido
                  </span>
                </div>
              )}
              {isCurrent && !isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] font-bold text-green-300 bg-green-600 px-3 py-1 rounded-full">Atual</span>
                </div>
              )}

              <h3 className="text-lg font-bold text-white mb-0.5 mt-2">{plan.name}</h3>
              {tagline && <p className="text-[11px] text-gray-500 mb-4">{tagline}</p>}

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    R${plan.price_brl.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </span>
                  <span className="text-sm text-gray-600">/mês</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  R${pricePerLesson} por aula · {plan.lesson_count} aulas
                </p>
              </div>

              <ul className="space-y-2 mb-5 flex-1">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

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

      {/* ── Extra plans (expandable) ─────────────────── */}
      {extraPlans.length > 0 && (
        <ExpandablePlans
          plans={extraPlans}
          features={PLAN_FEATURES}
          currentSlug={currentSub?.plans?.slug ?? null}
          hasCurrentSub={!!currentSub}
        />
      )}

      {/* ── Cancellation / trust strip ───────────────── */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Sem fidelidade, sem multa</p>
            <p className="text-xs text-gray-500">Cancele ou troque de plano a qualquer momento. Seus créditos continuam válidos até o fim do ciclo.</p>
          </div>
        </div>
      </div>

      {/* ── How it works ─────────────────────────────── */}
      <div className="card-dark rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-3">Como funciona</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-xs text-gray-500">
          <div>
            <p className="font-semibold text-gray-300 mb-1">1. Escolha seu plano</p>
            <p>Selecione a quantidade de aulas. Pagamento online pelo site.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-300 mb-1">2. Solicite suas aulas</p>
            <p>Escolha data, horário e matéria. A professora confirma em até 24h.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-300 mb-1">3. Aula via Google Meet</p>
            <p>Link enviado por e-mail. Aula individual com acompanhamento real.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
