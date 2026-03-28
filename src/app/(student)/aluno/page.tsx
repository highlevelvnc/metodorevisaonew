import type { Metadata }   from 'next'
import { redirect }        from 'next/navigation'
import Link                from 'next/link'
import { createClient }    from '@/lib/supabase/server'
import { PenLine, FileText, Target, Clock, ArrowRight, Flame } from 'lucide-react'

import { DashboardHero }      from './_components/DashboardHero'
import { StatsRow }           from './_components/StatsRow'
import { NextStepCard }       from './_components/NextStepCard'
import { ProgressLoop }       from './_components/ProgressLoop'
import { CorrectionsList }    from './_components/CorrectionsList'
import { BiiaCard }           from './_components/BiiaCard'
import { AdaptiveContent }    from './_components/AdaptiveContent'
import { ThemesSection }      from './_components/ThemesSection'
import { LessonsGrid }        from './_components/LessonsGrid'
import { SimuladosSection }   from './_components/SimuladosSection'
import { MentoriasSection }   from './_components/MentoriasSection'
import { ClubeLivroSection }  from './_components/ClubeLivroSection'
import { CorrectorSelection }  from './_components/CorrectorSelection'
import { OnboardingDashboard } from './_components/OnboardingDashboard'

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
  viewed_at: string | null
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

// ─── Safe date parser ──────────────────────────────────────────────────────────

/** Returns a valid timestamp (ms) for an ISO date string, or null if invalid. */
function safeDateMs(iso: string | null | undefined): number | null {
  if (!iso) return null
  const ms = new Date(iso).getTime()
  return isNaN(ms) ? null : ms
}

// ─── Streak engine ─────────────────────────────────────────────────────────────

function computeWeekStreak(essayList: { submitted_at: string }[]): number {
  if (essayList.length === 0) return 0
  const MS_WEEK = 7 * 24 * 60 * 60 * 1000
  const now = Date.now()
  const activeWeeks = new Set<number>()
  for (const e of essayList) {
    const ms = safeDateMs(e.submitted_at)
    if (ms === null) continue  // skip essays with null/invalid submitted_at
    const weekIdx = Math.floor((now - ms) / MS_WEEK)
    if (weekIdx >= 0) activeWeeks.add(weekIdx)  // only non-negative (past) weeks
  }
  if (activeWeeks.size === 0) return 0
  // Grace: start from this week (0) if active, else last week (1)
  const start = activeWeeks.has(0) ? 0 : 1
  let streak = 0, i = start
  while (activeWeeks.has(i)) { streak++; i++ }
  return streak
}

// ─── Daily action engine ───────────────────────────────────────────────────────

type DailyActionKind = 'write' | 'review' | 'practice' | 'wait'
type DailyAction = { label: string; sub: string; href: string; kind: DailyActionKind }

const ACTION_CFG: Record<DailyActionKind, { icon: React.ElementType; color: string; bg: string; card: string }> = {
  write:   { icon: PenLine,   color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', card: 'border-purple-500/15 bg-purple-500/[0.04]' },
  review:  { icon: FileText,  color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',     card: 'border-blue-500/15 bg-blue-500/[0.03]'    },
  practice:{ icon: Target,    color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',   card: 'border-amber-500/15 bg-amber-500/[0.03]'  },
  wait:    { icon: Clock,     color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',   card: 'border-green-500/15 bg-green-500/[0.03]'  },
}

// ─── Habit bar ─────────────────────────────────────────────────────────────────

function HabitBar({
  streak,
  weeklyCount,
  weeklyGoal,
  recommendedAction,
}: {
  streak: number
  weeklyCount: number
  weeklyGoal: number
  recommendedAction: DailyAction
}) {
  const cfg      = ACTION_CFG[recommendedAction.kind]
  const ActionIcon = cfg.icon
  const goalPct  = Math.min(100, Math.round((weeklyCount / weeklyGoal) * 100))
  const goalMet  = weeklyCount >= weeklyGoal

  return (
    <div className="mb-6 grid sm:grid-cols-3 gap-3">

      {/* Streak */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Sequência</p>
        {streak > 0 ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white tabular-nums leading-none">{streak}</span>
            <span className="text-[11px] text-gray-600">semana{streak !== 1 ? 's' : ''}</span>
            <Flame size={14} className="text-amber-400 mb-0.5" />
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-gray-400 leading-none mb-1">Sem sequência</p>
            <Link href="/aluno/redacoes/nova" className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Iniciar agora →
            </Link>
          </div>
        )}
        {streak > 0 && (
          <p className="text-[10px] text-gray-700 mt-1">
            {streak === 1 ? 'semana ativa' : 'semanas consecutivas'}
          </p>
        )}
      </div>

      {/* Weekly goal */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Meta semanal</p>
          <span className={`text-[11px] font-bold tabular-nums ${goalMet ? 'text-green-400' : 'text-gray-500'}`}>
            {weeklyCount}/{weeklyGoal}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-1.5">
          <div
            className={`h-full rounded-full transition-all ${goalMet ? 'bg-green-500' : 'bg-purple-500'}`}
            style={{ width: `${goalPct}%` }}
          />
        </div>
        <p className="text-[11px] leading-snug">
          {goalMet
            ? <span className="text-green-400 font-medium">Meta atingida esta semana ✓</span>
            : <span className="text-gray-600">
                {weeklyGoal - weeklyCount} redaç{weeklyGoal - weeklyCount === 1 ? 'ão' : 'ões'} para a meta
              </span>
          }
        </p>
      </div>

      {/* Recommended action */}
      <Link
        href={recommendedAction.href}
        className={`group rounded-2xl border px-4 py-3.5 flex items-center gap-3 hover:opacity-90 hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)] active:scale-[0.99] transition-all duration-200 ${cfg.card}`}
      >
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
          <ActionIcon size={14} className={cfg.color} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-0.5">Ação de hoje</p>
          <p className="text-xs font-semibold text-white leading-snug line-clamp-1 group-hover:text-white/90">
            {recommendedAction.label}
          </p>
          <p className="text-[10px] text-gray-600 leading-snug line-clamp-1 mt-0.5">
            {recommendedAction.sub}
          </p>
        </div>
        <ArrowRight size={12} className="text-gray-700 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
      </Link>
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

  // Wrap all data fetching in try/catch — a query failure must never crash the dashboard.
  let profileRaw: { full_name: string } | null = null
  let subRaw:     SubData | null                = null
  let essaysRaw:  unknown[]                     = []

  try {
    const [profileRes, subRes, essaysRes] = await Promise.all([
      supabase.from('users').select('full_name').eq('id', user.id).single(),
      db.from('subscriptions')
        .select('essays_used, essays_limit, plans(name)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      db.from('essays')
        .select('id, theme_title, status, submitted_at, corrections(c1_score, c2_score, c3_score, c4_score, c5_score, total_score, reviewer_name, corrected_at, viewed_at)')
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(200),
    ])

    profileRaw = (profileRes.data as { full_name: string } | null) ?? null
    subRaw     = (subRes.data     as SubData | null)                ?? null
    essaysRaw  = (essaysRes.data  as unknown[])                    ?? []

    if (essaysRes.error) console.error('[dashboard] essays query error:', essaysRes.error.message)
    if (profileRes.error) console.error('[dashboard] profile query error:', profileRes.error.message)
  } catch (fetchErr) {
    console.error('[dashboard] Promise.all failed:', fetchErr)
    // Continue with empty state — dashboard renders a safe shell
  }

  const profile  = profileRaw
  const sub      = subRaw

  // Normalize essays: the only hard requirement is a string id.
  // corrections: null from PostgREST (no rows) is normalized to [] — this is the root cause
  // of post-submit dashboard crashes for brand-new students.
  const VALID_ESSAY_STATUSES = new Set<string>(['pending', 'in_review', 'corrected'])
  const essays: EssayData[] = (essaysRaw as unknown[])
    .filter((e) => e !== null && e !== undefined && typeof (e as EssayData).id === 'string')
    .map((e) => {
      const raw = e as Record<string, unknown>
      return {
        id:           raw.id           as string,
        theme_title:  (raw.theme_title as string) ?? '—',
        status:       VALID_ESSAY_STATUSES.has(raw.status as string) ? (raw.status as string) : 'pending',
        submitted_at: (raw.submitted_at as string) ?? new Date(0).toISOString(),
        // corrections: null from PostgREST means 0 rows — normalize to []
        corrections:  Array.isArray(raw.corrections) ? (raw.corrections as CorrectionData[]) : [],
      } satisfies EssayData
    })

  // ── Derived values ────────────────────────────────────────────────────────

  const firstName    = profile?.full_name?.split(' ')[0] ?? 'Aluno'
  const planName     = sub?.plans?.name ?? 'Trial'
  const creditsLeft  = sub ? Math.max(0, sub.essays_limit - sub.essays_used) : 0
  const creditsTotal = sub?.essays_limit ?? 1

  const correctedEssays = essays.filter(e => e.status === 'corrected' && (e.corrections?.length ?? 0) > 0)
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

  // Weekly activity
  const oneWeekAgo              = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const weeklyCount             = essays.filter(e => e.submitted_at != null && e.submitted_at >= oneWeekAgo).length
  const daysSinceLastCorrection = lastCorrection?.corrected_at
    ? Math.floor((Date.now() - new Date(lastCorrection.corrected_at).getTime()) / (1000 * 60 * 60 * 24))
    : null
  const lastCorrectedEssayId    = correctedEssays[0]?.id ?? null

  // ── Streak & weekly goal ────────────────────────────────────────────────────
  const weekStreak  = computeWeekStreak(essays)
  const weeklyGoal  = (['Intensivo', 'Estratégia'] as string[]).includes(planName) ? 2 : 1

  // ── Recommended daily action ─────────────────────────────────────────────────
  const COMP_SHORT_MAP: Record<CompKey, string> = {
    c1_score: 'C1', c2_score: 'C2', c3_score: 'C3', c4_score: 'C4', c5_score: 'C5',
  }
  const recommendedAction: DailyAction = (() => {
    if (pendingCount > 0)
      return { label: 'Devolutiva chegando em breve', sub: 'Pratique com a Biia enquanto aguarda', href: '/aluno/biia', kind: 'wait' }
    if (creditsLeft > 0 && weeklyCount < weeklyGoal)
      return { label: weeklyCount === 0 ? 'Enviar redação desta semana' : 'Enviar mais uma redação', sub: `Meta: ${weeklyCount}/${weeklyGoal} redaç${weeklyGoal === 1 ? 'ão' : 'ões'} esta semana`, href: '/aluno/redacoes/nova', kind: 'write' }
    if (weeklyCount >= weeklyGoal && creditsLeft > 0)
      return { label: 'Meta semanal atingida 🎉', sub: 'Envie mais para acelerar sua evolução', href: '/aluno/redacoes/nova', kind: 'write' }
    if (daysSinceLastCorrection !== null && daysSinceLastCorrection <= 4 && lastCorrectedEssayId)
      return { label: 'Revisar sua última devolutiva', sub: daysSinceLastCorrection === 0 ? 'Recebida hoje' : `Recebida há ${daysSinceLastCorrection} dia${daysSinceLastCorrection !== 1 ? 's' : ''}`, href: `/aluno/redacoes/${lastCorrectedEssayId}`, kind: 'review' }
    if (worstCompKey)
      return { label: `Treinar ${COMP_SHORT_MAP[worstCompKey]} com a Biia`, sub: 'Exercício direcionado na competência mais fraca', href: '/aluno/biia', kind: 'practice' }
    return { label: 'Enviar nova redação', sub: 'Cada envio traz um diagnóstico de evolução', href: '/aluno/redacoes/nova', kind: 'write' }
  })()

  // Next-step card: detect unviewed correction using real viewed_at field (R1)
  const hasUnviewedCorrection = (() => {
    if (!lastCorrection?.corrected_at) return false
    return lastCorrection.viewed_at === null
  })()

  // Suggested goal: 100 pts above current average, capped at 1000
  const suggestedGoal = avgScore !== null ? Math.min(1000, Math.ceil((avgScore + 100) / 20) * 20) : 700

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

  // First-time student: show premium onboarding experience instead of empty shell
  if (essays.length === 0) {
    return (
      <OnboardingDashboard
        firstName={firstName}
        planName={planName}
        creditsLeft={creditsLeft}
      />
    )
  }

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
        weeklyCount={weeklyCount}
        lastCorrectedEssayId={lastCorrectedEssayId}
        upgradeSignal={upgradeSignal}
        planTierNextPlan={planTier.nextPlan}
      />

      {/* ── 1b. Next Step — always visible, always actionable ───────────── */}
      <NextStepCard
        totalEssays={essays.length}
        pendingCount={pendingCount}
        lastCorrectedEssayId={lastCorrectedEssayId}
        hasUnviewedCorrection={hasUnviewedCorrection}
        creditsLeft={creditsLeft}
        lastScore={lastCorrection?.total_score ?? null}
      />

      {/* ── 1c. Progress Loop — reinforce progress ────────────────────── */}
      <ProgressLoop
        totalEssays={essays.length}
        avgScore={avgScore}
        lastScore={lastCorrection?.total_score ?? null}
        suggestedGoal={suggestedGoal}
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

      {/* ── 3. Habit bar — streak · weekly goal · recommended action ─────────── */}
      <HabitBar
        streak={weekStreak}
        weeklyCount={weeklyCount}
        weeklyGoal={weeklyGoal}
        recommendedAction={recommendedAction}
      />

      {/* ── 4. Core: Correções + Biia ────────────────────────────────────────
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
            daysSinceLastCorrection={daysSinceLastCorrection}
            lastCorrectedEssayId={lastCorrectedEssayId}
            streak={weekStreak}
          />
        </div>
      </div>

      {/* ── 5. Adaptive content ─────────────────────────────────────────────── */}
      <AdaptiveContent
        patterns={patterns}
        worstCompKey={worstCompKey}
        nextStep={nextStep ?? null}
        lastCorrectionDate={lastCorrection?.corrected_at ?? null}
      />

      {/* ── 6. Resources ────────────────────────────────────────────────────── */}
      <SectionLabel>Recursos de estudo</SectionLabel>
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <ThemesSection worstCompKey={worstCompKey} />
        <LessonsGrid />
        <SimuladosSection />
      </div>

      {/* ── 7. Community ────────────────────────────────────────────────────── */}
      <SectionLabel>Comunidade e aprofundamento</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <MentoriasSection />
        <ClubeLivroSection />
      </div>

      {/* ── 8. Corretor VIP ──────────────────────────────────────────────────── */}
      <SectionLabel>Plano Intensivo</SectionLabel>
      <CorrectorSelection />

    </div>
  )
}
