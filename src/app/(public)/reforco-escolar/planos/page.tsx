import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = {
  title: 'Planos de Reforço Escolar | Método Revisão',
  description: 'Aulas particulares online de Português, Inglês, Redação e Literatura. Planos a partir de R$65/aula.',
}

const HIGHLIGHTED_SLUGS = ['reforco-4', 'reforco-8', 'reforco-12']
const MOST_POPULAR_SLUG = 'reforco-8'

const PLAN_FEATURES: Record<string, string[]> = {
  'reforco-4':  ['4 aulas por mês', 'Google Meet ao vivo', '4 matérias', 'Professora dedicada'],
  'reforco-8':  ['8 aulas por mês', 'Google Meet ao vivo', '4 matérias', 'Professora dedicada', 'Material personalizado'],
  'reforco-12': ['12 aulas por mês', 'Google Meet ao vivo', '4 matérias', 'Professora dedicada', 'Material personalizado', 'Acompanhamento contínuo'],
  'reforco-16': ['16 aulas por mês', 'Google Meet ao vivo', '4 matérias', 'Material personalizado', 'Acompanhamento contínuo'],
  'reforco-22': ['22 aulas por mês', 'Google Meet ao vivo', '4 matérias', 'Material personalizado', 'Acompanhamento diário'],
  'reforco-34': ['34 aulas por mês', 'Google Meet ao vivo', '4 matérias', 'Material personalizado', 'Acompanhamento diário', 'Prioridade total'],
}

const PLAN_LABELS: Record<string, string> = {
  'reforco-4':  'Para começar',
  'reforco-8':  'Para evoluir de verdade',
  'reforco-12': 'Para quem quer resultado rápido',
}

type Plan = { id: string; name: string; slug: string; price_brl: number; lesson_count: number }

export default async function PlanosPublicosPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const { data: plansRaw } = await db
    .from('plans')
    .select('id, name, slug, price_brl, lesson_count')
    .eq('active', true)
    .eq('plan_type', 'lesson')
    .order('lesson_count')

  const allPlans: Plan[] = (plansRaw ?? []) as Plan[]
  const highlighted = allPlans.filter(p => HIGHLIGHTED_SLUGS.includes(p.slug))
  const extraPlans  = allPlans.filter(p => !HIGHLIGHTED_SLUGS.includes(p.slug))

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">

        {/* Header */}
        <div className="text-center">
          <span className="inline-block bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Reforço Escolar
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Escolha seu plano de aulas
          </h1>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">
            Aulas individuais de Português, Inglês, Redação e Literatura via Google Meet.
            Sem fidelidade — cancele quando quiser.
          </p>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-6 text-center text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400">★★★★★</span>
            <span>Nota 4.9</span>
          </div>
          <span className="text-gray-700">·</span>
          <span>Professora com 8+ anos</span>
          <span className="text-gray-700">·</span>
          <span>Cancele quando quiser</span>
        </div>

        {/* ── Main 3 plans ─────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-4">
          {highlighted.map(plan => {
            const isPopular      = plan.slug === MOST_POPULAR_SLUG
            const pricePerLesson = plan.lesson_count > 0 ? Math.round(plan.price_brl / plan.lesson_count) : 0
            const features       = PLAN_FEATURES[plan.slug] ?? []
            const tagline        = PLAN_LABELS[plan.slug] ?? ''

            return (
              <div
                key={plan.id}
                className={`relative card-dark rounded-2xl p-5 flex flex-col ${
                  isPopular ? 'border-purple-500/30 ring-1 ring-purple-500/20 scale-[1.02]' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-600 px-3 py-1 rounded-full whitespace-nowrap">
                      Mais escolhido
                    </span>
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

                <Link
                  href={`/checkout/${plan.slug}`}
                  className={`inline-flex items-center justify-center gap-2 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors ${
                    isPopular
                      ? 'bg-purple-700 hover:bg-purple-600 text-white'
                      : 'border border-gray-700 text-gray-300 hover:border-purple-600 hover:text-white hover:bg-purple-700/10'
                  }`}
                >
                  Assinar agora
                </Link>
              </div>
            )
          })}
        </div>

        {/* ── Extra plans ─────────────────────────── */}
        {extraPlans.length > 0 && (
          <details className="group">
            <summary className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-300 transition-colors py-2 cursor-pointer list-none">
              <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
              Ver mais {extraPlans.length} planos (16, 22 e 34 aulas)
            </summary>
            <div className="grid sm:grid-cols-3 gap-3 mt-3">
              {extraPlans.map(plan => {
                const pricePerLesson = plan.lesson_count > 0 ? Math.round(plan.price_brl / plan.lesson_count) : 0
                const features = PLAN_FEATURES[plan.slug] ?? [`${plan.lesson_count} aulas por mês`]

                return (
                  <div key={plan.id} className="card-dark rounded-2xl p-4 flex flex-col">
                    <h3 className="text-base font-bold text-white mb-0.5">{plan.name}</h3>
                    <p className="text-[11px] text-gray-500 mb-3">{plan.lesson_count} aulas por mês</p>
                    <div className="mb-3">
                      <span className="text-2xl font-black text-white">
                        R${plan.price_brl.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </span>
                      <span className="text-xs text-gray-600">/mês</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">R${pricePerLesson} por aula</p>
                    </div>
                    <ul className="space-y-1.5 mb-4 flex-1">
                      {features.map(f => (
                        <li key={f} className="flex items-start gap-1.5 text-[11px] text-gray-400">
                          <span className="text-green-400 mt-0.5">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/checkout/${plan.slug}`}
                      className="inline-flex items-center justify-center gap-2 font-semibold px-4 py-2 rounded-xl text-xs border border-gray-700 text-gray-300 hover:border-purple-600 hover:text-white hover:bg-purple-700/10 transition-colors"
                    >
                      Assinar
                    </Link>
                  </div>
                )
              })}
            </div>
          </details>
        )}

        {/* ── Trust strip ─────────────────────────── */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Sem fidelidade, sem multa</p>
              <p className="text-xs text-gray-500">Cancele ou troque de plano a qualquer momento. Pagamento seguro via Stripe.</p>
            </div>
          </div>
        </div>

        {/* ── How it works ────────────────────────── */}
        <div className="card-dark rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white mb-3">Como funciona</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-xs text-gray-500">
            <div>
              <p className="font-semibold text-gray-300 mb-1">1. Crie sua conta e assine</p>
              <p>Escolha seu plano e finalize o pagamento. Leva menos de 2 minutos.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-300 mb-1">2. Solicite suas aulas</p>
              <p>Escolha data, horário e matéria no painel. A professora confirma em até 24h.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-300 mb-1">3. Aula via Google Meet</p>
              <p>Link enviado por e-mail. Aula individual com acompanhamento real.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
