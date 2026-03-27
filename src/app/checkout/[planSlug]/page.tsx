import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CheckoutForm } from './CheckoutForm'
import { ProceedButton } from './ProceedButton'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { planSlug: string }
}) {
  const names: Record<string, string> = {
    evolucao:   'Evolução',
    estrategia: 'Estratégia',
    intensivo:  'Intensivo',
  }
  const name = names[params.planSlug] ?? 'Plano'
  return {
    title:   `Assinar plano ${name} | Método Revisão`,
    robots: { index: false, follow: false },
  }
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params:       { planSlug: string }
  searchParams: { cancelado?: string }
}) {
  const { planSlug } = params

  /* ── Fetch plan ─────────────────────────────────────────────────────────── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any
  const { data: plan } = await admin
    .from('plans')
    .select('id, name, slug, price_brl, essay_count')
    .eq('slug', planSlug)
    .eq('active', true)
    .maybeSingle()

  if (!plan) notFound()

  /* ── Auth state ─────────────────────────────────────────────────────────── */
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userProfile: { full_name?: string | null; email?: string | null } | null = null
  if (user) {
    const { data } = await admin
      .from('users')
      .select('full_name, email')
      .eq('id', user.id)
      .maybeSingle()
    userProfile = data
  }

  const cancelado = searchParams.cancelado === '1'

  return (
    <div className="min-h-screen bg-[#070c14] flex flex-col">

      {/* ── Minimal header ──────────────────────────────────────────────────── */}
      <header className="py-4 px-5 sm:px-8 flex items-center justify-between border-b border-white/[0.04]">
        <Link href="/" className="transition-opacity hover:opacity-80 flex-shrink-0">
          <div style={{ position: 'relative', width: '130px', height: '40px', overflow: 'hidden' }}>
            <Image
              src="/logo.png"
              alt="Método Revisão"
              fill
              sizes="130px"
              style={{ objectFit: 'cover', objectPosition: '50% 52%' }}
              priority
            />
          </div>
        </Link>

        {/* Secure badge — center on desktop */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-600">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Ambiente seguro — SSL 256-bit
        </div>

        <Link
          href="/#planos"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Ver outros planos</span>
          <span className="sm:hidden">Voltar</span>
        </Link>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-start justify-center px-4 py-8 lg:py-12">
        <div className="w-full max-w-4xl">
          <div className="grid lg:grid-cols-[1fr_420px] gap-8 lg:gap-14 items-start">

            {/* Left: plan summary */}
            <PlanCard plan={plan} />

            {/* Right: form or one-click proceed */}
            <div>
              {user ? (
                <ProceedButton
                  planSlug={plan.slug}
                  planName={plan.name}
                  userEmail={user.email ?? ''}
                  userName={userProfile?.full_name ?? user.email ?? ''}
                  cancelado={cancelado}
                />
              ) : (
                <CheckoutForm
                  planSlug={plan.slug}
                  planName={plan.name}
                  cancelado={cancelado}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-4 px-5 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-3 text-xs text-gray-700">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Pagamento seguro via Stripe
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Visa, Mastercard, Pix
            </span>
          </div>
          <span>© {new Date().getFullYear()} Método Revisão</span>
        </div>
      </footer>
    </div>
  )
}

// ─── Plan card ────────────────────────────────────────────────────────────────

const PLAN_FEATURES: Record<string, string[]> = {
  evolucao: [
    '4 redações corrigidas por ciclo',
    'Devolutiva estratégica completa (C1–C5)',
    'Anotações direto no texto parágrafo a parágrafo',
    'Diagnóstico dos seus padrões de erro',
    'Orientação personalizada para a próxima redação',
    'Entregue em até 24 horas',
  ],
  estrategia: [
    '8 redações corrigidas por ciclo',
    'Devolutiva estratégica completa (C1–C5)',
    '1 sessão ao vivo mensal (30 min) com a especialista',
    'Revisão comparativa da sua evolução',
    'Propostas de tema direcionadas ao seu nível',
    'Prioridade na fila de devolutiva',
  ],
  intensivo: [
    '12 redações corrigidas por ciclo',
    'Tudo do plano Estratégia',
    '2 sessões ao vivo mensais com a especialista',
    'Plano de estudo por competência ENEM',
    'Simulados com temas inéditos e gabarito',
    'Canal direto para dúvidas entre sessões',
  ],
}

const PLAN_POPULAR: Record<string, boolean> = {
  evolucao:   false,
  estrategia: true,
  intensivo:  false,
}

const TESTIMONIALS: Record<string, { text: string; author: string; result: string }> = {
  evolucao: {
    text: 'Recebi a devolutiva e vi exatamente onde estava errando na C5. Nunca tinha tido isso antes.',
    author: 'Mariana S.',
    result: '+160 pontos em 6 semanas',
  },
  estrategia: {
    text: 'A sessão ao vivo foi o que faltava. A especialista me mostrou o padrão que eu repetia sem perceber.',
    author: 'Lucas M.',
    result: '+300 pontos em 12 semanas',
  },
  intensivo: {
    text: 'Com 2 meses pro ENEM, o Intensivo foi decisivo. Saí de 520 para 820.',
    author: 'Felipe R.',
    result: 'Nota 820 no ENEM 2024',
  },
}

interface PlanData {
  id:          string
  name:        string
  slug:        string
  price_brl:   number
  essay_count: number
}

function PlanCard({ plan }: { plan: PlanData }) {
  const features      = PLAN_FEATURES[plan.slug] ?? []
  const popular       = PLAN_POPULAR[plan.slug] ?? false
  const testimonial   = TESTIMONIALS[plan.slug]
  const perCorrection = (plan.price_brl / plan.essay_count).toFixed(2).replace('.', ',')

  return (
    <div className="lg:sticky lg:top-6 space-y-4">

      {/* ── Social proof bar ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-1">
        {[
          { value: '+10.000', label: 'redações corrigidas' },
          { value: '+180 pts', label: 'evolução média' },
          { value: '4.9/5', label: 'avaliação dos alunos' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-base font-extrabold text-white tabular-nums">{s.value}</p>
            <p className="text-[10px] text-gray-600 leading-snug">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Plan card ───────────────────────────────────────────────────────── */}
      <div className={`rounded-2xl border relative overflow-hidden ${
        popular
          ? 'border-purple-500/40 bg-gradient-to-b from-purple-600/[0.10] to-purple-700/[0.04]'
          : 'border-white/[0.08] bg-white/[0.025]'
      }`}>
        {popular && (
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
        )}

        <div className="p-6 sm:p-7">
          {popular && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 bg-purple-600 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Mais escolhido pelos alunos
              </span>
            </div>
          )}

          {/* Price block */}
          <div className="mb-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Plano {plan.name}
            </p>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-sm text-gray-500">R$</span>
              <span className="text-5xl font-extrabold text-white tabular-nums leading-none">
                {Math.round(plan.price_brl)}
              </span>
              <span className="text-sm text-gray-500 self-end pb-0.5">/ciclo</span>
            </div>

            {/* Per-correction callout */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400">
                  R$ {perCorrection} por redação
                </p>
                <p className="text-[10px] text-gray-600 leading-snug">
                  Devolutiva completa C1–C5 inclusa
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-2.5 mb-6">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className={`flex-shrink-0 mt-0.5 ${popular ? 'text-purple-400' : 'text-gray-500'}`}>
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-300 leading-snug">{f}</span>
              </li>
            ))}
          </ul>

          {/* Micro trust signals */}
          <div className="border-t border-white/[0.05] pt-5 grid grid-cols-3 gap-2 text-center">
            {[
              { icon: '🔒', label: 'Pagamento\nseguro' },
              { icon: '↩️', label: 'Sem\nfidelidade' },
              { icon: '⚡', label: 'Acesso\nimediato' },
            ].map((t) => (
              <div key={t.label}>
                <p className="text-base mb-0.5">{t.icon}</p>
                <p className="text-[10px] text-gray-600 leading-tight whitespace-pre-line">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Testimonial ─────────────────────────────────────────────────────── */}
      {testimonial && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-gray-300 leading-relaxed italic mb-3">
            &ldquo;{testimonial.text}&rdquo;
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">— {testimonial.author}</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {testimonial.result}
            </span>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-gray-700">
        Acesso liberado em menos de 2 minutos após o pagamento
      </p>
    </div>
  )
}
