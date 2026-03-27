import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Minha Evolução',
  robots: { index: false, follow: false },
}

const COMPETENCIES = [
  { key: 'c1_score' as const, label: 'C1', name: 'Norma culta',             fullName: 'Domínio da Norma Culta' },
  { key: 'c2_score' as const, label: 'C2', name: 'Compreensão do tema',     fullName: 'Compreensão da Proposta' },
  { key: 'c3_score' as const, label: 'C3', name: 'Seleção de argumentos',   fullName: 'Seleção de Argumentos' },
  { key: 'c4_score' as const, label: 'C4', name: 'Mecanismos de coesão',    fullName: 'Mecanismos de Coesão' },
  { key: 'c5_score' as const, label: 'C5', name: 'Proposta de intervenção', fullName: 'Proposta de Intervenção' },
]

type CompKey = 'c1_score' | 'c2_score' | 'c3_score' | 'c4_score' | 'c5_score'
const compKeys: CompKey[] = ['c1_score', 'c2_score', 'c3_score', 'c4_score', 'c5_score']

type CorrectionData = {
  c1_score: number; c2_score: number; c3_score: number
  c4_score: number; c5_score: number; total_score: number
  reviewer_name: string; corrected_at: string
}
type EssayData = {
  id: string; theme_title: string; status: string
  submitted_at: string; corrections: CorrectionData[]
}

function scoreStyle(score: number, max = 200) {
  const pct = score / max
  if (pct >= 0.8) return { bar: 'bg-green-500', text: 'text-green-400' }
  if (pct >= 0.6) return { bar: 'bg-purple-500', text: 'text-purple-400' }
  return { bar: 'bg-amber-500', text: 'text-amber-400' }
}

export default async function EvolucaoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: essaysRaw } = await db
    .from('essays')
    .select('id, theme_title, status, submitted_at, corrections(c1_score, c2_score, c3_score, c4_score, c5_score, total_score, reviewer_name, corrected_at)')
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(200)

  // Normalize: corrections: null from PostgREST (no rows) → []; only reject truly malformed ids
  const essays: EssayData[] = ((essaysRaw ?? []) as unknown[])
    .filter((e) => e !== null && typeof (e as EssayData).id === 'string')
    .map((e) => {
      const raw = e as Record<string, unknown>
      return {
        ...(raw as EssayData),
        corrections: Array.isArray(raw.corrections) ? (raw.corrections as CorrectionData[]) : [],
      }
    })
  const correctedEssays = essays.filter(e => e.status === 'corrected' && e.corrections.length > 0)

  /* ── Empty state ──────────────────────────────────────────────────────────── */
  if (correctedEssays.length === 0) {
    return (
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Minha Evolução</h1>
          <p className="text-gray-500 text-sm">Acompanhe sua progressão em cada competência do ENEM</p>
        </div>
        <div className="card-dark rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={22} className="text-purple-400" />
          </div>
          <h3 className="text-white font-semibold mb-1">Sua jornada começa na primeira devolutiva</h3>
          <p className="text-gray-600 text-sm mb-5 max-w-sm mx-auto leading-relaxed">
            Assim que sua primeira redação for corrigida, você verá aqui sua evolução completa — nota, competências e tendências.
          </p>
          <Link href="/aluno/redacoes/nova" className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            Enviar minha primeira redação
          </Link>
        </div>
      </div>
    )
  }

  /* ── Computations ─────────────────────────────────────────────────────────── */
  const correctedCount = correctedEssays.length
  const chrono         = [...correctedEssays].reverse() // oldest → newest for chart

  const lastCorrected  = correctedEssays[0]
  const firstCorrected = correctedEssays[correctedCount - 1]
  const lastCorr       = lastCorrected.corrections?.[0]
  const firstCorr      = firstCorrected.corrections?.[0]

  const lastScore    = lastCorr?.total_score ?? 0
  const firstScore   = firstCorr?.total_score ?? 0
  const bestScore    = Math.max(...correctedEssays.map(e => e.corrections[0]?.total_score ?? 0))
  const overallDelta = correctedCount >= 2 ? lastScore - firstScore : null

  // Per-competency evolution: current vs first, delta, avg
  const compEvolution = COMPETENCIES.map(c => {
    const currentScore = lastCorr?.[c.key] ?? 0
    const startScore   = correctedCount >= 2 ? (firstCorr?.[c.key] ?? 0) : null
    const delta        = startScore !== null ? currentScore - startScore : null
    const avg          = Math.round(
      correctedEssays.reduce((s, e) => s + (e.corrections[0]?.[c.key] ?? 0), 0) / correctedCount
    )
    return { ...c, currentScore, startScore, delta, avg }
  })

  // Most improved (biggest positive first→last delta)
  const withPositiveDelta  = compEvolution.filter(c => c.delta !== null && c.delta > 0)
  const mostImproved       = withPositiveDelta.length > 0
    ? withPositiveDelta.reduce((a, b) => (a.delta ?? 0) >= (b.delta ?? 0) ? a : b)
    : null
  // Weakest (focus): lowest current score
  const focusComp          = compEvolution.reduce((a, b) => a.currentScore <= b.currentScore ? a : b)

  // Achievements
  type Achievement = { icon: string; label: string; cls: string }
  const achievements: Achievement[] = []
  if (lastScore >= 600) achievements.push({ icon: '📊', label: 'Acima da média ENEM', cls: 'text-green-400 bg-green-500/10 border-green-500/20' })
  if (lastScore >= 800) achievements.push({ icon: '🌟', label: 'Nota avançada', cls: 'text-purple-400 bg-purple-500/10 border-purple-500/20' })
  if (overallDelta !== null && overallDelta >= 80) achievements.push({ icon: '🚀', label: `+${overallDelta} pontos de evolução`, cls: 'text-green-400 bg-green-500/10 border-green-500/20' })
  if (correctedCount >= 5) achievements.push({ icon: '🎯', label: '5 redações corrigidas', cls: 'text-purple-400 bg-purple-500/10 border-purple-500/20' })
  if (correctedCount >= 10) achievements.push({ icon: '💎', label: '10 redações corrigidas', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' })
  const maxAnyComp = Math.max(...compKeys.map(k => lastCorr?.[k] ?? 0))
  if (maxAnyComp >= 200) achievements.push({ icon: '⭐', label: 'Nota máxima em uma competência', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' })
  if (correctedCount >= 3) {
    const last3 = correctedEssays.slice(0, 3).map(e => e.corrections[0]?.total_score ?? 0)
    if (last3[0] > last3[1] && last3[1] > last3[2]) {
      achievements.push({ icon: '🔥', label: '3 redações em melhora contínua', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' })
    }
  }
  if (bestScore === lastScore && correctedCount > 1) {
    achievements.push({ icon: '🏆', label: 'Melhor nota histórica', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' })
  }

  // Chart: last 12 corrected essays in chronological order
  const chartEssays = chrono.slice(-12)
  const chartMax    = Math.max(...chartEssays.map(e => e.corrections[0]?.total_score ?? 0), 400)

  // Next target: round up to next 40-point milestone above bestScore
  const nextTarget = Math.min(1000, Math.ceil((bestScore + 1) / 40) * 40)

  return (
    <div className="max-w-4xl">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Minha Evolução</h1>
          <p className="text-gray-500 text-sm">
            {correctedCount} redaç{correctedCount !== 1 ? 'ões' : 'ão'} corrigida{correctedCount !== 1 ? 's' : ''} · acompanhe sua progressão
          </p>
        </div>
        <Link href="/aluno/redacoes/nova" className="btn-primary self-start sm:self-auto">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Enviar próxima redação
        </Link>
      </div>

      {/* ── 1. Stats hero ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Nota atual */}
        <div className="card-dark p-5 rounded-2xl">
          <p className="text-xs text-gray-500 mb-2">Nota atual</p>
          <p className="text-3xl font-extrabold text-white tabular-nums">{lastScore}</p>
          <p className="text-xs text-gray-600 mt-0.5">de 1000 pontos</p>
          {overallDelta !== null && overallDelta > 0 && (
            <p className="text-xs font-semibold text-green-400 mt-1.5">↑ Evoluiu +{overallDelta} pts</p>
          )}
          {overallDelta !== null && overallDelta < 0 && (
            <p className="text-xs font-semibold text-red-400 mt-1.5">↓ {Math.abs(overallDelta)} pts vs início</p>
          )}
        </div>

        {/* Melhor nota */}
        <div className="card-dark p-5 rounded-2xl">
          <p className="text-xs text-gray-500 mb-2">Melhor nota</p>
          <p className="text-3xl font-extrabold text-white tabular-nums">{bestScore}</p>
          <p className="text-xs text-gray-600 mt-0.5">melhor resultado</p>
          {bestScore === lastScore && correctedCount > 1 && (
            <p className="text-xs font-semibold text-amber-400 mt-1.5">🏆 Recorde pessoal</p>
          )}
        </div>

        {/* Evolução total */}
        <div className="card-dark p-5 rounded-2xl">
          <p className="text-xs text-gray-500 mb-2">Evolução total</p>
          {overallDelta !== null ? (
            <>
              <p className={`text-3xl font-extrabold tabular-nums ${overallDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {overallDelta >= 0 ? '+' : ''}{overallDelta}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">desde a primeira</p>
            </>
          ) : (
            <>
              <p className="text-3xl font-extrabold text-gray-600">—</p>
              <p className="text-xs text-gray-600 mt-0.5">envie mais uma</p>
            </>
          )}
        </div>

        {/* Total corrigidas */}
        <div className="card-dark p-5 rounded-2xl">
          <p className="text-xs text-gray-500 mb-2">Redações</p>
          <p className="text-3xl font-extrabold text-white tabular-nums">{correctedCount}</p>
          <p className="text-xs text-gray-600 mt-0.5">corrigidas</p>
          {correctedCount >= 3 && (
            <p className="text-xs font-semibold text-purple-400 mt-1.5">💪 Consistência</p>
          )}
        </div>
      </div>

      {/* ── 2. Conquistas ───────────────────────────────────────── */}
      {achievements.length > 0 && (
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-3">🏅 Conquistas desbloqueadas</p>
          <div className="flex flex-wrap gap-2">
            {achievements.map((a, i) => (
              <span key={i} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${a.cls}`}>
                {a.icon} {a.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Histórico — bar chart ────────────────────────────── */}
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Seu percurso</h2>
            <p className="text-xs text-gray-600 mt-0.5">
              {chartEssays.length < correctedCount
                ? `Últimas ${chartEssays.length} de ${correctedCount} redações`
                : `${correctedCount} redaç${correctedCount !== 1 ? 'ões' : 'ão'} corrigida${correctedCount !== 1 ? 's' : ''}`}
              {' · '}clique para ver a devolutiva
            </p>
          </div>
          {overallDelta !== null && (
            <div className={`text-xs font-semibold rounded-full px-2.5 py-1 border ${
              overallDelta > 0  ? 'text-green-400 bg-green-500/10 border-green-500/20'
              : overallDelta < 0 ? 'text-red-400 bg-red-500/10 border-red-500/20'
              : 'text-gray-400 bg-white/[0.04] border-white/[0.08]'
            }`}>
              {overallDelta > 0 ? `↑ +${overallDelta} pts` : overallDelta < 0 ? `↓ ${Math.abs(overallDelta)} pts` : '= estável'}
            </div>
          )}
        </div>

        {/* Bars */}
        <div className="flex items-end gap-1.5 mb-3" style={{ height: '96px' }}>
          {chartEssays.map((essay, i) => {
            const score    = essay.corrections[0]?.total_score ?? 0
            const isBest   = score === bestScore
            const isLatest = i === chartEssays.length - 1
            const barH     = Math.max(Math.round((score / chartMax) * 80), 6)
            // Essay number in chronological order (1 = oldest corrected)
            const essayNum = correctedCount - (chrono.indexOf(essay))
            return (
              <Link
                key={essay.id}
                href={`/aluno/redacoes/${essay.id}`}
                className="flex-1 flex flex-col items-center gap-1 group"
                title={`${essay.theme_title} — ${score} pontos`}
              >
                <span className={`text-[9px] font-semibold tabular-nums leading-none transition-colors ${
                  isLatest ? 'text-white' : 'text-gray-700 group-hover:text-gray-400'
                }`}>{score}</span>
                <div
                  className={`w-full rounded-t-sm transition-all duration-200 ${
                    isLatest       ? 'bg-purple-500 group-hover:bg-purple-400'
                    : isBest       ? 'bg-amber-500/80 group-hover:bg-amber-400'
                    : 'bg-white/[0.08] group-hover:bg-white/[0.18]'
                  }`}
                  style={{ height: `${barH}px` }}
                />
                <span className={`text-[8px] tabular-nums leading-none ${
                  isLatest ? 'text-purple-400' : 'text-gray-700'
                }`}>#{essayNum}</span>
              </Link>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 pt-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
            <span className="text-[10px] text-gray-600">Última</span>
          </div>
          {correctedCount > 1 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/80" />
              <span className="text-[10px] text-gray-600">Melhor ({bestScore} pts)</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-white/[0.08]" />
            <span className="text-[10px] text-gray-600">Anteriores</span>
          </div>
        </div>
      </div>

      {/* ── 4. Evolução por competência ────────────────────────── */}
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">Evolução por competência</h2>
          {correctedCount < 2 && (
            <span className="text-xs text-gray-600">Envie mais 1 redação para ver a evolução</span>
          )}
        </div>
        <div className="space-y-5">
          {compEvolution.map(c => {
            const { bar, text } = scoreStyle(c.currentScore)
            const pct      = (c.currentScore / 200) * 100
            const isFocus  = focusComp.key === c.key
            const isChamp  = mostImproved?.key === c.key && (c.delta ?? 0) > 0
            return (
              <div key={c.key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-gray-500 w-5 flex-shrink-0">{c.label}</span>
                    <span className="text-sm font-medium text-white">{c.name}</span>
                    {isFocus && (
                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-1.5 py-0.5">🎯 foco</span>
                    )}
                    {isChamp && (
                      <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-1.5 py-0.5">↑ maior evolução</span>
                    )}
                  </div>

                  {/* Score display */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {c.startScore !== null && c.delta !== null ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-gray-600 tabular-nums">{c.startScore}</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-700">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                        <span className={`font-bold tabular-nums ${text}`}>{c.currentScore}</span>
                        <span className={`text-[10px] font-bold tabular-nums ${
                          c.delta > 0 ? 'text-green-400' : c.delta < 0 ? 'text-red-400' : 'text-gray-600'
                        }`}>
                          {c.delta > 0 ? `+${c.delta}` : c.delta < 0 ? `${c.delta}` : '='}
                        </span>
                      </div>
                    ) : (
                      <span className={`text-sm font-bold tabular-nums ${text}`}>
                        {c.currentScore}<span className="text-gray-600 text-xs font-normal">/200</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${bar} transition-all duration-300`} style={{ width: `${pct}%` }} />
                </div>

                {/* Sub-labels */}
                {correctedCount >= 2 && (
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-gray-700">Média histórica: {c.avg}/200</span>
                    <span className="text-[9px] text-gray-700">{Math.round(pct)}% do máximo</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 5. Destaque de evolução ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Maior evolução */}
        <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-5">
          <p className="text-xs font-semibold text-green-400 mb-3">💪 Maior evolução</p>
          {mostImproved && (mostImproved.delta ?? 0) > 0 ? (
            <>
              <p className="text-sm font-bold text-white">{mostImproved.label} — {mostImproved.name}</p>
              <p className="text-3xl font-extrabold text-green-400 mt-2 tabular-nums">
                +{mostImproved.delta}
                <span className="text-sm font-normal text-gray-500 ml-1">pontos</span>
              </p>
              <p className="text-xs text-green-400/70 mt-2 leading-relaxed">
                {mostImproved.startScore} → {mostImproved.currentScore}/200 desde a primeira redação
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-600">Envie mais redações para ver qual competência mais evoluiu.</p>
          )}
        </div>

        {/* Maior oportunidade */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
          <p className="text-xs font-semibold text-amber-400 mb-3">🎯 Maior oportunidade</p>
          <p className="text-sm font-bold text-white">{focusComp.label} — {focusComp.name}</p>
          <p className="text-3xl font-extrabold text-amber-400 mt-2 tabular-nums">
            {focusComp.currentScore}
            <span className="text-sm font-normal text-gray-500 ml-1">/200</span>
          </p>
          <p className="text-xs text-amber-400/70 mt-2 leading-relaxed">
            {focusComp.currentScore < 120
              ? 'Melhorar esta competência é o caminho mais rápido para subir a nota total.'
              : 'Ainda há espaço para crescimento — cada +40 pontos aqui conta.'}
          </p>
        </div>
      </div>

      {/* ── 6. Próxima meta + CTA ───────────────────────────────── */}
      <div className="relative rounded-2xl border border-purple-600/30 bg-gradient-to-br from-purple-900/20 to-purple-800/5 p-5 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider mb-2">🎯 Próxima meta</p>
            {nextTarget <= 1000 ? (
              <>
                <p className="text-base font-bold text-white">
                  Superar <span className="text-purple-300">{nextTarget} pontos</span>
                </p>
                <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">
                  {nextTarget > lastScore
                    ? `Faltam ${nextTarget - lastScore} pontos. Foco em ${focusComp.label} pode chegar lá na próxima redação.`
                    : 'Você já alcançou essa meta — defina a próxima!'}
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-bold text-white">Nota máxima: <span className="text-purple-300">1000 pontos</span></p>
                <p className="text-sm text-gray-400 mt-0.5">Você está em nível avançado. Continue refinando cada competência.</p>
              </>
            )}
          </div>
          <Link href="/aluno/redacoes/nova" className="btn-primary flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            Continuar evoluindo
          </Link>
        </div>
      </div>
    </div>
  )
}
