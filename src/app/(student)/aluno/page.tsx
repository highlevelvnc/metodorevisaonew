import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FileText, TrendingUp, Zap, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

const COMPETENCIES = [
  { key: 'c1_score', label: 'C1', name: 'Norma culta' },
  { key: 'c2_score', label: 'C2', name: 'Compreensão do tema' },
  { key: 'c3_score', label: 'C3', name: 'Seleção de argumentos' },
  { key: 'c4_score', label: 'C4', name: 'Mecanismos de coesão' },
  { key: 'c5_score', label: 'C5', name: 'Proposta de intervenção' },
] as const

function ScoreBar({ score, max = 200 }: { score: number; max?: number }) {
  const pct = (score / max) * 100
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-purple-500' : 'bg-amber-500'
  return (
    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

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
      .order('submitted_at', { ascending: false }),
  ])

  const profile  = profileRaw as { full_name: string } | null
  const sub      = subRaw as SubData | null
  const essays   = (essaysRaw as EssayData[]) ?? []

  const firstName   = profile?.full_name?.split(' ')[0] ?? 'Aluno'
  const planName    = sub?.plans?.name ?? 'Trial'
  const creditsLeft = sub ? sub.essays_limit - sub.essays_used : 0
  const creditsTotal = sub?.essays_limit ?? 1

  const correctedEssays = essays.filter(e => e.status === 'corrected' && e.corrections?.length > 0)
  const lastEssay       = correctedEssays[0] ?? null
  const lastCorrection  = lastEssay?.corrections?.[0] ?? null

  const avgScore = correctedEssays.length
    ? Math.round(correctedEssays.reduce((s, e) => s + (e.corrections[0]?.total_score ?? 0), 0) / correctedEssays.length)
    : null

  const pendingCount = essays.filter(e => e.status === 'pending' || e.status === 'in_review').length

  const delta = correctedEssays.length >= 2
    ? (correctedEssays[0].corrections[0]?.total_score ?? 0) - (correctedEssays[1].corrections[0]?.total_score ?? 0)
    : null

  // Evolution from first to most recent corrected essay
  const overallDelta = correctedEssays.length >= 2
    ? (correctedEssays[0].corrections[0]?.total_score ?? 0) -
      (correctedEssays[correctedEssays.length - 1].corrections[0]?.total_score ?? 0)
    : null

  // Last 6 corrected essays in chronological order (oldest → newest) for sparkline
  const sparkHistory = correctedEssays.length >= 2
    ? correctedEssays.slice(0, 6).reverse()
    : []

  return (
    <div className="max-w-4xl">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Olá, {firstName} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Plano <span className="text-purple-400 font-medium">{planName}</span>
            {' · '}
            {creditsLeft === 0 ? (
              <span className="text-red-400 font-medium">
                Créditos esgotados —{' '}
                <Link href="/#planos" className="underline hover:text-red-300">fazer upgrade</Link>
              </span>
            ) : (
              <span className={creditsLeft === 1 ? 'text-amber-400' : 'text-gray-400'}>
                {creditsLeft} crédito{creditsLeft !== 1 ? 's' : ''} restante{creditsLeft !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <Link href="/aluno/redacoes/nova" className="btn-primary self-start sm:self-auto">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Nova redação
        </Link>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-dark p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/15 flex items-center justify-center">
              <FileText size={15} className="text-purple-400" />
            </div>
            <span className="text-xs text-gray-500">Redações</span>
          </div>
          <p className="text-3xl font-bold text-white">{essays.length}</p>
          <p className="text-xs text-gray-600 mt-0.5">enviadas</p>
        </div>

        <div className="card-dark p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/15 flex items-center justify-center">
              <TrendingUp size={15} className="text-green-400" />
            </div>
            <span className="text-xs text-gray-500">Média atual</span>
          </div>
          <p className="text-3xl font-bold text-white">{avgScore ?? '—'}</p>
          <p className="text-xs text-gray-600 mt-0.5">de 1000 pontos</p>
          {delta !== null && (
            <p className={`text-xs mt-1 font-semibold ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {delta >= 0 ? `↑ +${delta}` : `↓ ${delta}`} última vs anterior
            </p>
          )}
        </div>

        <div className={`p-5 rounded-2xl ${creditsLeft === 0 ? 'card-dark border-red-500/20' : 'card-dark'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              creditsLeft === 0 ? 'bg-red-500/10 border border-red-500/15' : 'bg-amber-500/10 border border-amber-500/15'
            }`}>
              <Zap size={15} className={creditsLeft === 0 ? 'text-red-400' : 'text-amber-400'} />
            </div>
            <span className="text-xs text-gray-500">Créditos</span>
          </div>
          <p className={`text-3xl font-bold ${creditsLeft === 0 ? 'text-red-400' : 'text-white'}`}>
            {creditsLeft}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">de {creditsTotal} neste ciclo</p>
          {/* Credits bar */}
          <div className="mt-2.5 h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                creditsLeft === 0 ? 'bg-red-500' :
                creditsLeft <= creditsTotal * 0.25 ? 'bg-amber-500' : 'bg-amber-400'
              }`}
              style={{ width: creditsTotal > 0 ? `${(creditsLeft / creditsTotal) * 100}%` : '0%' }}
            />
          </div>
          {creditsLeft === 0 && (
            <Link href="/#planos" className="inline-block mt-2 text-[11px] text-red-400 hover:text-red-300 transition-colors underline">
              Fazer upgrade →
            </Link>
          )}
        </div>

        <div className="card-dark p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
              <Clock size={15} className="text-blue-400" />
            </div>
            <span className="text-xs text-gray-500">Em revisão</span>
          </div>
          <p className="text-3xl font-bold text-white">{pendingCount}</p>
          <p className="text-xs text-gray-600 mt-0.5">aguardando devolutiva</p>
        </div>
      </div>

      {/* ── Última devolutiva ───────────────────────────────────── */}
      {lastCorrection ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Última devolutiva</h2>
            <Link href="/aluno/redacoes" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              Ver todas →
            </Link>
          </div>
          <Link href={`/aluno/redacoes/${lastEssay!.id}`} className="block">
            <div className="card-dark rounded-2xl p-5 hover:border-purple-600/30 transition-all duration-200 hover:-translate-y-0.5 group">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Score */}
                <div className="flex-shrink-0 text-center sm:text-left">
                  <div className="text-4xl font-extrabold text-white leading-none">
                    {lastCorrection.total_score}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">/ 1000</div>
                  {delta !== null && (
                    <div className={`inline-flex items-center gap-1 mt-1.5 text-xs font-semibold rounded-full px-2 py-0.5 ${
                      delta >= 0
                        ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                        : 'text-red-400 bg-red-500/10 border border-red-500/20'
                    }`}>
                      <TrendingUp size={10} />
                      {delta >= 0 ? '+' : ''}{delta}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px bg-white/[0.06] self-stretch" />

                {/* C1-C5 bars */}
                <div className="flex-1 space-y-2.5">
                  <p className="text-sm font-medium text-gray-300 mb-3 line-clamp-1">{lastEssay!.theme_title}</p>
                  {COMPETENCIES.map(c => {
                    const score = lastCorrection[c.key] as number
                    return (
                      <div key={c.key} className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-gray-500 w-4">{c.label}</span>
                        <div className="flex-1">
                          <ScoreBar score={score} />
                        </div>
                        <span className="text-[11px] text-gray-400 w-8 text-right">{score}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Arrow */}
                <div className="hidden sm:flex items-center self-center text-gray-700 group-hover:text-purple-400 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ) : (
        /* Empty state — primeiro envio */
        <div className="card-dark rounded-2xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-5">
            <FileText size={24} className="text-purple-400" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Pronto para a primeira devolutiva?
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Envie sua redação e receba uma análise detalhada por competência em até 48h.
          </p>
          <Link href="/aluno/redacoes/nova" className="btn-primary">
            Enviar minha primeira redação
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* ── Histórico de pontuação ──────────────────────────────── */}
      {sparkHistory.length >= 2 && (
        <div className="mt-6 card-dark rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Histórico de pontuação</h2>
            <Link href="/aluno/redacoes" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              Ver todas →
            </Link>
          </div>
          {/* Sparkline bars */}
          {(() => {
            const maxScore = Math.max(...sparkHistory.map(e => e.corrections[0]?.total_score ?? 0))
            return (
              <div className="flex items-end gap-2 h-14 mb-3">
                {sparkHistory.map((essay, i) => {
                  const score  = essay.corrections[0]?.total_score ?? 0
                  const pct    = maxScore > 0 ? Math.max((score / maxScore) * 100, 8) : 8
                  const isLast = i === sparkHistory.length - 1
                  return (
                    <Link key={essay.id} href={`/aluno/redacoes/${essay.id}`}
                      className="flex-1 flex flex-col items-center gap-1.5 group">
                      <span className={`text-[9px] font-medium transition-colors ${
                        isLast ? 'text-white' : 'text-gray-700 group-hover:text-gray-500'
                      }`}>{score}</span>
                      <div
                        className={`w-full rounded-sm transition-all ${
                          isLast ? 'bg-purple-500' : 'bg-white/[0.08] group-hover:bg-white/[0.14]'
                        }`}
                        style={{ height: `${Math.round(pct * 0.36)}px`, minHeight: '4px' }}
                      />
                    </Link>
                  )
                })}
              </div>
            )
          })()}
          {overallDelta !== null && overallDelta !== 0 && (
            <p className={`text-xs font-medium ${overallDelta > 0 ? 'text-green-400' : 'text-gray-500'}`}>
              {overallDelta > 0
                ? `↑ +${overallDelta} pontos de evolução desde a primeira redação`
                : `↓ ${Math.abs(overallDelta)} pontos. Revise as devolutivas anteriores para identificar padrões.`}
            </p>
          )}
        </div>
      )}

      {/* ── Competências: ponto forte + foco ────────────────────── */}
      {lastCorrection && (() => {
        const compScores = COMPETENCIES.map(c => ({ ...c, score: lastCorrection[c.key] as number }))
        const best  = compScores.reduce((a, b) => a.score >= b.score ? a : b)
        const worst = compScores.reduce((a, b) => a.score <= b.score ? a : b)
        return (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-4">
              <p className="text-xs font-semibold text-green-400 mb-2.5">💪 Ponto forte</p>
              <p className="text-sm font-semibold text-white leading-snug">{best.label} · {best.name}</p>
              <p className="text-2xl font-bold text-white mt-1.5 tabular-nums">
                {best.score}<span className="text-xs text-gray-600 font-normal ml-0.5">/200</span>
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
              <p className="text-xs font-semibold text-amber-400 mb-2.5">🎯 Foco agora</p>
              <p className="text-sm font-semibold text-white leading-snug">{worst.label} · {worst.name}</p>
              <p className="text-2xl font-bold text-white mt-1.5 tabular-nums">
                {worst.score}<span className="text-xs text-gray-600 font-normal ml-0.5">/200</span>
              </p>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
