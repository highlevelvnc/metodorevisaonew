import type { Metadata }   from 'next'
import { redirect }        from 'next/navigation'
import { createClient }    from '@/lib/supabase/server'

import { DashboardHero }      from './_components/DashboardHero'
import { StatsRow }           from './_components/StatsRow'
import { CorrectionsList }    from './_components/CorrectionsList'
import { BiiaCard }           from './_components/BiiaCard'
import { AdaptiveContent }    from './_components/AdaptiveContent'
import { ThemesSection }      from './_components/ThemesSection'
import { LessonsGrid }        from './_components/LessonsGrid'
import { SimuladosSection }   from './_components/SimuladosSection'
import { MentoriasSection }   from './_components/MentoriasSection'
import { ClubeLivroSection }  from './_components/ClubeLivroSection'
import { CorrectorSelection } from './_components/CorrectorSelection'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Painel do Aluno',
  robots: { index: false, follow: false },
}

// ─── Types ────────────────────────────────────────────────────────────────────

type CompKey = 'c1_score' | 'c2_score' | 'c3_score' | 'c4_score' | 'c5_score'

type CorrectionData = {
  c1_score: number; c2_score: number; c3_score: number
  c4_score: number; c5_score: number; total_score: number
  reviewer_name: string; corrected_at: string
}
type EssayData = {
  id: string; theme_title: string; status: string
  submitted_at: string; corrections: CorrectionData[]
}
type SubData = {
  essays_used: number; essays_limit: number
  plans: { name: string } | null
}

const compKeys: CompKey[] = ['c1_score', 'c2_score', 'c3_score', 'c4_score', 'c5_score']

// ─── Coaching tips ────────────────────────────────────────────────────────────

const NEXT_STEP: Record<string, { focus: string; tip: string }> = {
  c1_score: { focus: 'Norma Culta',             tip: 'Releia em voz alta para capturar erros de concordância e pontuação.' },
  c2_score: { focus: 'Compreensão do Tema',     tip: 'Escreva sua tese em uma frase antes de começar — garante foco total.' },
  c3_score: { focus: 'Seleção de Argumentos',   tip: 'Pesquise 2–3 dados ou referências antes de escrever qualquer parágrafo.' },
  c4_score: { focus: 'Mecanismos de Coesão',    tip: 'Varie os conectivos: "Ademais", "Nesse sentido", "Por outro lado".' },
  c5_score: { focus: 'Proposta de Intervenção', tip: 'Inclua explicitamente: agente, ação, modo/meio e finalidade.' },
}

// ─── Plan tiers ───────────────────────────────────────────────────────────────

const PLAN_TIERS: Record<string, { nextPlan: string | null }> = {
  'Trial':      { nextPlan: 'Evolução'   },
  'Evolução':   { nextPlan: 'Estratégia' },
  'Estratégia': { nextPlan: 'Intensivo'  },
  'Intensivo':  { nextPlan: null         },
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3 px-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 whitespace-nowrap">
        {children}
      </p>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AlunoDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [{ data: profileRaw }, { data: subRaw }, { data: essaysRaw }] = await Promise.all([
    supabase.from('users').select('full_name').eq('id', user.id).single(),
    db.from('subscriptions')
      .select('essays_used, essays_limit, plans(name)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    db.from('essays')
      .select('id, theme_title, status, submitted_at, corrections(c1_score, c2_score, c3_score, c4_score, c5_score, total_score, reviewer_name, corrected_at)')
      .eq('student_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(200),
  ])

  const profile  = profileRaw as { full_name: string } | null
  const sub      = subRaw as SubData | null
  const essays   = (essaysRaw as EssayData[]) ?? []

  // ── Derived values ────────────────────────────────────────────────────────

  const firstName    = profile?.full_name?.split(' ')[0] ?? 'Aluno'
  const planName     = sub?.plans?.name ?? 'Trial'
  const creditsLeft  = sub ? Math.max(0, sub.essays_limit - sub.essays_used) : 0
  const creditsTotal = sub?.essays_limit ?? 1

  const correctedEssays = essays.filter(e => e.status === 'corrected' && e.corrections?.length > 0)
  const lastCorrection  = correctedEssays[0]?.corrections?.[0] ?? null
  const pendingCount    = essays.filter(e => e.status === 'pending' || e.status === 'in_review').length

  const avgScore = correctedEssays.length
    ? Math.round(correctedEssays.reduce((s, e) => s + (e.corrections[0]?.total_score ?? 0), 0) / correctedEssays.length)
    : null

  const delta = correctedEssays.length >= 2
    ? (correctedEssays[0].corrections[0]?.total_score ?? 0) - (correctedEssays[1].corrections[0]?.total_score ?? 0)
    : null

  const overallDelta = correctedEssays.length >= 2
    ? (correctedEssays[0].corrections[0]?.total_score ?? 0) -
      (correctedEssays[correctedEssays.length - 1].corrections[0]?.total_score ?? 0)
    : null

  // Weakest competency
  const worstCompKey: CompKey | null = lastCorrection
    ? compKeys.reduce((a, b) => (lastCorrection[a] ?? 0) <= (lastCorrection[b] ?? 0) ? a : b)
    : null
  const nextStep = worstCompKey ? NEXT_STEP[worstCompKey] : null

  // Patterns: competencies averaging below 100
  const patterns = correctedEssays.length >= 2
    ? compKeys
        .map(key => ({
          key,
          avg: Math.round(correctedEssays.reduce((s, e) => s + (e.corrections[0]?.[key] ?? 0), 0) / correctedEssays.length),
        }))
        .filter(c => c.avg < 100)
    : []

  // Upgrade signal
  const creditsPct       = creditsTotal > 0 ? Math.round((creditsLeft / creditsTotal) * 100) : 0
  const planTier         = PLAN_TIERS[planName] ?? PLAN_TIERS['Evolução']
  const upgradeAvailable = planTier.nextPlan !== null
  const isEvolving       = (overallDelta !== null && overallDelta > 60) || (avgScore !== null && avgScore >= 560)

  const thirtyDaysAgo  = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const cycleEssays    = essays.filter(e => e.submitted_at >= thirtyDaysAgo)
  const cycleIsIntense = cycleEssays.length >= Math.max(2, Math.ceil(creditsTotal * 0.66))

  type UpgradeSignal = 'last_credit_evolving' | 'exhausted' | 'halfway_evolving' | null
  const upgradeSignal: UpgradeSignal = (() => {
    if (!upgradeAvailable) return null
    if (creditsLeft === 0 && correctedEssays.length > 0) return 'exhausted'
    if (creditsLeft === 1 && isEvolving) return 'last_credit_evolving'
    if (creditsPct <= 50 && isEvolving && cycleIsIntense) return 'halfway_evolving'
    return null
  })()

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl">

      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <DashboardHero
        firstName={firstName}
        planName={planName}
        creditsLeft={creditsLeft}
        creditsTotal={creditsTotal}
        avgScore={avgScore}
        overallDelta={overallDelta}
        pendingCount={pendingCount}
        upgradeSignal={upgradeSignal}
        planTierNextPlan={planTier.nextPlan}
      />

      {/* ── 2. Stats ────────────────────────────────────────────────────────── */}
      <StatsRow
        totalEssays={essays.length}
        correctedCount={correctedEssays.length}
        avgScore={avgScore}
        delta={delta}
        creditsLeft={creditsLeft}
        pendingCount={pendingCount}
      />

      {/* ── 3. Core: Correções + Biia ────────────────────────────────────────
           Correções takes 3/5 of the width (more important), Biia takes 2/5   */}
      <div className="grid lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3">
          <CorrectionsList essays={essays} />
        </div>
        <div className="lg:col-span-2">
          <BiiaCard
            worstCompKey={worstCompKey}
            avgScore={avgScore}
            firstName={firstName}
          />
        </div>
      </div>

      {/* ── 4. Adaptive content ─────────────────────────────────────────────── */}
      <AdaptiveContent
        patterns={patterns}
        worstCompKey={worstCompKey}
        nextStep={nextStep ?? null}
        lastCorrectionDate={lastCorrection?.corrected_at ?? null}
      />

      {/* ── 5. Resources ────────────────────────────────────────────────────── */}
      <SectionLabel>Recursos de estudo</SectionLabel>
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <ThemesSection />
        <LessonsGrid />
        <SimuladosSection />
      </div>

      {/* ── 6. Community ────────────────────────────────────────────────────── */}
      <SectionLabel>Comunidade e aprofundamento</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <MentoriasSection />
        <ClubeLivroSection />
      </div>

      {/* ── 7. Corretor VIP ──────────────────────────────────────────────────── */}
      <SectionLabel>Plano Intensivo</SectionLabel>
      <CorrectorSelection />

    </div>
  )
}
