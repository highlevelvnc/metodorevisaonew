import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PrintButton } from './PrintButton'

export const metadata: Metadata = {
  title: 'Relatório de Evolução',
  robots: { index: false, follow: false },
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COMPETENCIES = [
  { key: 'c1_score' as const, label: 'C1', name: 'Domínio da Norma Culta' },
  { key: 'c2_score' as const, label: 'C2', name: 'Compreensão da Proposta' },
  { key: 'c3_score' as const, label: 'C3', name: 'Seleção de Argumentos' },
  { key: 'c4_score' as const, label: 'C4', name: 'Mecanismos de Coesão' },
  { key: 'c5_score' as const, label: 'C5', name: 'Proposta de Intervenção' },
]

type CompKey = 'c1_score' | 'c2_score' | 'c3_score' | 'c4_score' | 'c5_score'
const compKeys: CompKey[] = ['c1_score', 'c2_score', 'c3_score', 'c4_score', 'c5_score']

// 3 practical actions per competency — shown in "Próximos Passos"
const NEXT_STEPS: Record<CompKey, string[]> = {
  c1_score: [
    'Reserve os últimos 5 minutos antes de enviar para reler a redação em voz alta — o ouvido detecta erros de concordância que o olho ignora.',
    'Revise concordância verbal e nominal em cada parágrafo separadamente, antes de verificar a coesão global.',
    'Use vírgula apenas onde há pausa natural na fala — evite excesso e ausência com igual cuidado.',
  ],
  c2_score: [
    'Antes de escrever o primeiro parágrafo, escreva sua tese em uma frase. Ela deve responder diretamente ao enunciado proposto.',
    'Na metade da redação, releia o enunciado e pergunte: cada parágrafo ainda serve à sua tese central?',
    'Tangência é o erro mais caro do ENEM — se um argumento não defende sua tese diretamente, corte ou reformule.',
  ],
  c3_score: [
    'Pesquise 2–3 dados, estudos ou referências históricas antes de começar — cada argumento precisa de embasamento concreto.',
    'Estruture cada argumento: afirmação → repertório concreto → análise → conexão explícita com a tese.',
    'Argumento sem embasamento raramente passa de 80/200 — escolha sempre uma referência específica por ideia.',
  ],
  c4_score: [
    'Varie os conectivos: "Ademais", "Nesse sentido", "Por outro lado", "Entretanto", "Desse modo" — a variedade demonstra domínio.',
    'Releia a última frase de cada parágrafo antes de escrever o próximo — ela deve criar uma ponte natural.',
    'Substitua conectivos repetidos ("mas", "porém") por variações que mostram riqueza lexical e maturidade textual.',
  ],
  c5_score: [
    'Estruture de forma explícita: Quem age (agente)? O quê faz (ação)? De que modo (meio)? Com qual finalidade?',
    'Todos os 4 elementos devem aparecer de forma explícita e específica — nunca subentendidos ou genéricos.',
    'Evite propostas vagas como "o governo deve agir" — especifique qual instância, qual ação, qual mecanismo.',
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreBenchmark(score: number): string {
  if (score >= 900) return 'no nível de excelência'
  if (score >= 800) return 'em nível avançado'
  if (score >= 700) return 'acima da média dos candidatos aprovados nos cursos mais concorridos'
  if (score >= 600) return 'acima da média geral dos candidatos'
  if (score >= 500) return 'na média dos candidatos do ENEM'
  if (score >= 400) return 'próximo da média geral'
  return 'em fase de construção da base argumentativa'
}

function generateNarrative(p: {
  correctedCount: number
  firstScore: number
  lastScore: number
  overallDelta: number | null
  focusComp: { label: string; name: string; currentScore: number }
  strongComp: { label: string; name: string; currentScore: number }
  mostImproved: { name: string; delta: number } | null
}): { overview: string; trajectory: string | null; opportunity: string } {
  const { correctedCount, firstScore, lastScore, overallDelta,
          focusComp, strongComp, mostImproved } = p
  const benchmark = scoreBenchmark(lastScore)
  const gap = 200 - focusComp.currentScore

  // ── Overview: where they stand today ──────────────────────
  let overview: string
  if (correctedCount === 1) {
    overview = `Esta é a sua primeira devolutiva no Método Revisão. Com nota de ${lastScore} pontos, você está ${benchmark}. A partir desta redação, cada ciclo vai revelar com precisão onde estão suas maiores oportunidades de crescimento — e é aqui que o acompanhamento começa a fazer diferença.`
  } else if (lastScore >= 700) {
    overview = `Com ${correctedCount} redações corrigidas e nota atual de ${lastScore} pontos, você está ${benchmark}. Seu histórico mostra consistência na aplicação das competências-chave — o que diferencia candidatos neste patamar são os ajustes precisos nas competências ainda abaixo do potencial máximo.`
  } else if (lastScore >= 500) {
    overview = `Com ${correctedCount} redações corrigidas e nota atual de ${lastScore} pontos, você está ${benchmark}. O trabalho realizado até aqui já construiu uma base sólida. O próximo patamar é alcançável com foco direcionado nas competências identificadas neste relatório.`
  } else {
    overview = `Com ${correctedCount} redação${correctedCount > 1 ? 'ões' : ''} corrigida${correctedCount > 1 ? 's' : ''} e nota de ${lastScore} pontos, você está ${benchmark}. O processo de desenvolvimento está em andamento — cada redação submetida é um dado concreto de onde investir o estudo para crescimento mais rápido.`
  }

  // ── Trajectory: how they got here ─────────────────────────
  let trajectory: string | null = null
  if (overallDelta !== null) {
    if (overallDelta >= 80) {
      trajectory = `Sua evolução de +${overallDelta} pontos desde a primeira redação é uma das mais expressivas de qualquer trajetória de acompanhamento.${mostImproved ? ` A maior transformação ocorreu em ${mostImproved.name} (+${mostImproved.delta} pts), demonstrando que o trabalho direcionado gera resultado concreto.` : ''} Seu ponto forte atual é ${strongComp.label} — ${strongComp.name} (${strongComp.currentScore}/200).`
    } else if (overallDelta > 0) {
      trajectory = `Sua evolução de +${overallDelta} pontos desde a primeira redação demonstra uma trajetória positiva e consistente.${mostImproved ? ` A competência com maior ganho foi ${mostImproved.name} (+${mostImproved.delta} pts), confirmando que o foco direcionado produz resultado.` : ''} Seu ponto forte atual é ${strongComp.label} — ${strongComp.name} (${strongComp.currentScore}/200).`
    } else if (overallDelta === 0) {
      trajectory = `Sua nota se mantém estável desde a primeira redação (${firstScore} pts), o que indica consistência no domínio das competências já construídas. Seu ponto forte atual é ${strongComp.label} — ${strongComp.name} (${strongComp.currentScore}/200). O próximo salto virá do foco nas competências ainda abaixo do seu potencial máximo.`
    } else {
      trajectory = `Houve uma variação de ${overallDelta} pontos em relação à primeira redação — parte natural de qualquer trajetória. Seu ponto forte atual é ${strongComp.label} — ${strongComp.name} (${strongComp.currentScore}/200), e as orientações deste relatório apontam o caminho mais direto para retomar a curva ascendente.`
    }
  }

  // ── Opportunity: strategic next step ──────────────────────
  const opportunity = `Sua maior oportunidade de crescimento está em ${focusComp.label} — ${focusComp.name} (${focusComp.currentScore}/200). Com ${gap} pontos ainda disponíveis nesta competência, um trabalho direcionado aqui representa o maior retorno por redação disponível na sua trajetória atual. As 3 ações práticas ao final deste relatório foram selecionadas especificamente para esse desenvolvimento.`

  return { overview, trajectory, opportunity }
}

function scoreColor(score: number, max = 200) {
  const pct = score / max
  if (pct >= 0.8) return { bar: 'bg-green-500',  text: 'text-green-400',  badge: 'text-green-400 bg-green-500/10' }
  if (pct >= 0.6) return { bar: 'bg-purple-500', text: 'text-purple-400', badge: 'text-purple-400 bg-purple-500/10' }
  return                  { bar: 'bg-amber-500',  text: 'text-amber-400',  badge: 'text-amber-400 bg-amber-500/10'  }
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ─── Types ────────────────────────────────────────────────────────────────────

type CorrectionData = {
  c1_score: number; c2_score: number; c3_score: number
  c4_score: number; c5_score: number; total_score: number
  reviewer_name: string; corrected_at: string
}
type EssayData = {
  id: string; theme_title: string; status: string
  submitted_at: string; corrections: CorrectionData[]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RelatorioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [{ data: essaysRaw }, { data: profileRaw }] = await Promise.all([
    db.from('essays')
      .select('id, theme_title, status, submitted_at, corrections(c1_score, c2_score, c3_score, c4_score, c5_score, total_score, reviewer_name, corrected_at)')
      .eq('student_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(200),
    db.from('users').select('full_name').eq('id', user.id).single(),
  ])

  const essays          = (essaysRaw as EssayData[]) ?? []
  const correctedEssays = essays.filter(e => e.status === 'corrected' && e.corrections?.length > 0)
  const studentName     = (profileRaw?.full_name as string | null) || user.email?.split('@')[0] || 'Aluno'
  const today           = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  /* ── Empty state ──────────────────────────────────────────── */
  if (correctedEssays.length === 0) {
    return (
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Relatório de Evolução</h1>
          <p className="text-gray-500 text-sm">Seu documento de acompanhamento personalizado</p>
        </div>
        <div className="card-dark rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={22} className="text-purple-400" />
          </div>
          <h3 className="text-white font-semibold mb-1">Relatório disponível após a primeira devolutiva</h3>
          <p className="text-gray-600 text-sm mb-5 max-w-sm mx-auto leading-relaxed">
            Assim que sua primeira redação for corrigida, este relatório será gerado com sua análise completa de evolução — pronto para consultar e exportar.
          </p>
          <Link href="/aluno/redacoes/nova" className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Enviar minha primeira redação
          </Link>
        </div>
      </div>
    )
  }

  /* ── Computations ─────────────────────────────────────────── */
  const correctedCount = correctedEssays.length
  const chrono         = [...correctedEssays].reverse() // oldest → newest

  const lastCorrected  = correctedEssays[0]
  const firstCorrected = correctedEssays[correctedCount - 1]
  const lastCorr       = lastCorrected.corrections?.[0]
  const firstCorr      = firstCorrected.corrections?.[0]

  const lastScore    = lastCorr?.total_score ?? 0
  const firstScore   = firstCorr?.total_score ?? 0
  const bestScore    = Math.max(...correctedEssays.map(e => e.corrections[0]?.total_score ?? 0))
  const overallDelta = correctedCount >= 2 ? lastScore - firstScore : null
  const avgScore     = Math.round(
    correctedEssays.reduce((s, e) => s + (e.corrections[0]?.total_score ?? 0), 0) / correctedCount
  )

  // Per-competency stats
  const compEvolution = COMPETENCIES.map(c => {
    const currentScore = lastCorr?.[c.key] ?? 0
    const startScore   = correctedCount >= 2 ? (firstCorr?.[c.key] ?? 0) : null
    const delta        = startScore !== null ? currentScore - startScore : null
    const avg          = Math.round(
      correctedEssays.reduce((s, e) => s + (e.corrections[0]?.[c.key] ?? 0), 0) / correctedCount
    )
    return { ...c, currentScore, startScore, delta, avg }
  })

  const withPositiveDelta = compEvolution.filter(c => c.delta !== null && c.delta > 0)
  const mostImproved      = withPositiveDelta.length > 0
    ? withPositiveDelta.reduce((a, b) => (a.delta ?? 0) >= (b.delta ?? 0) ? a : b)
    : null
  const focusComp  = compEvolution.reduce((a, b) => a.currentScore <= b.currentScore ? a : b)
  const strongComp = compEvolution.reduce((a, b) => a.currentScore >= b.currentScore ? a : b)

  // Achievements
  type Achievement = { icon: string; label: string; cls: string }
  const achievements: Achievement[] = []
  if (lastScore >= 600) achievements.push({ icon: '📊', label: 'Acima da média ENEM',            cls: 'text-green-400 bg-green-500/10 border-green-500/20'  })
  if (lastScore >= 800) achievements.push({ icon: '🌟', label: 'Nota avançada',                   cls: 'text-purple-400 bg-purple-500/10 border-purple-500/20' })
  if (overallDelta !== null && overallDelta >= 80)
    achievements.push({ icon: '🚀', label: `+${overallDelta} pts de evolução`,                    cls: 'text-green-400 bg-green-500/10 border-green-500/20'  })
  if (correctedCount >= 5)
    achievements.push({ icon: '🎯', label: '5+ redações corrigidas',                              cls: 'text-purple-400 bg-purple-500/10 border-purple-500/20' })
  if (correctedCount >= 10)
    achievements.push({ icon: '💎', label: '10+ redações corrigidas',                             cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20'  })
  const maxComp = compKeys.find(k => (lastCorr[k] as number) >= 200)
  if (maxComp) {
    const idx = compKeys.indexOf(maxComp) + 1
    achievements.push({ icon: '⭐', label: `Nota máxima em C${idx}`,                              cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20'  })
  }
  if (bestScore === lastScore && correctedCount > 1)
    achievements.push({ icon: '🏆', label: 'Melhor nota histórica',                               cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20'  })
  if (correctedCount >= 3) {
    const last3 = correctedEssays.slice(0, 3).map(e => e.corrections[0]?.total_score ?? 0)
    if (last3[0] > last3[1] && last3[1] > last3[2])
      achievements.push({ icon: '🔥', label: '3 redações em alta consecutiva',                    cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20'  })
  }

  // Narrative + next steps
  const narrative = generateNarrative({
    correctedCount, firstScore, lastScore, overallDelta,
    focusComp:   { label: focusComp.label,  name: focusComp.name,  currentScore: focusComp.currentScore  },
    strongComp:  { label: strongComp.label, name: strongComp.name, currentScore: strongComp.currentScore },
    mostImproved: mostImproved ? { name: mostImproved.name, delta: mostImproved.delta! } : null,
  })

  const steps      = NEXT_STEPS[focusComp.key]
  const nextTarget = Math.min(1000, Math.ceil((bestScore + 1) / 40) * 40)

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div className="max-w-4xl">

      {/* ── Masthead ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Relatório de Evolução
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-0.5">{studentName}</h1>
          <p className="text-gray-500 text-sm">
            {correctedCount} redaç{correctedCount !== 1 ? 'ões' : 'ão'} corrigida{correctedCount !== 1 ? 's' : ''}
            {' '}·{' '}
            última devolutiva: {formatDate(lastCorr?.corrected_at)}
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto print:hidden">
          <PrintButton />
          <Link href="/aluno/redacoes/nova" className="btn-primary text-sm py-2 px-4">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nova redação
          </Link>
        </div>
      </div>

      {/* ── 1. Stats hero ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Nota atual */}
        <div className="card-dark rounded-2xl p-5 flex flex-col justify-between">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Nota atual
          </p>
          <div>
            <p className="text-4xl font-extrabold text-white tabular-nums leading-none">{lastScore}</p>
            <div className="h-1 bg-white/[0.06] rounded-full mt-3 mb-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                style={{ width: `${(lastScore / 1000) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-600">
              {Math.round((lastScore / 1000) * 100)}% do máximo
            </p>
            {overallDelta !== null && overallDelta > 0 && (
              <p className="text-[10px] font-semibold text-green-400 mt-1">↑ +{overallDelta} pts de evolução</p>
            )}
          </div>
        </div>

        {/* Melhor nota */}
        <div className="card-dark rounded-2xl p-5 flex flex-col justify-between">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Melhor nota
          </p>
          <div>
            <p className="text-4xl font-extrabold text-white tabular-nums leading-none">{bestScore}</p>
            <div className="h-1 bg-white/[0.06] rounded-full mt-3 mb-1.5 overflow-hidden">
              <div className="h-full bg-amber-500/60 rounded-full" style={{ width: `${(bestScore / 1000) * 100}%` }} />
            </div>
            <p className="text-[10px] text-gray-600">
              {bestScore === lastScore && correctedCount > 1 ? '🏆 Recorde pessoal' : 'melhor resultado'}
            </p>
          </div>
        </div>

        {/* Evolução total */}
        <div className="card-dark rounded-2xl p-5 flex flex-col justify-between">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Evolução total
          </p>
          <div>
            {overallDelta !== null ? (
              <>
                <p className={`text-4xl font-extrabold tabular-nums leading-none ${
                  overallDelta > 0 ? 'text-green-400' : overallDelta < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {overallDelta > 0 ? '+' : ''}{overallDelta}
                </p>
                <div className="h-1 bg-white/[0.06] rounded-full mt-3 mb-1.5" />
                <p className="text-[10px] text-gray-600">
                  {firstScore} → {lastScore} pts
                </p>
              </>
            ) : (
              <>
                <p className="text-4xl font-extrabold text-gray-600 tabular-nums leading-none">—</p>
                <div className="h-1 bg-white/[0.06] rounded-full mt-3 mb-1.5" />
                <p className="text-[10px] text-gray-600">envie mais uma redação</p>
              </>
            )}
          </div>
        </div>

        {/* Redações */}
        <div className="card-dark rounded-2xl p-5 flex flex-col justify-between">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Redações
          </p>
          <div>
            <p className="text-4xl font-extrabold text-white tabular-nums leading-none">{correctedCount}</p>
            <div className="h-1 bg-white/[0.06] rounded-full mt-3 mb-1.5" />
            <p className="text-[10px] text-gray-600">
              corrigidas · média {avgScore} pts
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. Análise narrativa ──────────────────────────────── */}
      <div className="card-dark rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/[0.06]">
          <div className="w-1 h-4 rounded-full bg-purple-500 flex-shrink-0" />
          <h2 className="text-sm font-bold text-white">Análise de Evolução</h2>
          <span className="ml-auto text-[10px] text-gray-600 font-medium tabular-nums hidden sm:block">
            Gerado em {today}
          </span>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-300 leading-[1.8]">{narrative.overview}</p>
          {narrative.trajectory && (
            <p className="text-sm text-gray-300 leading-[1.8]">{narrative.trajectory}</p>
          )}
          <div className="rounded-xl bg-purple-500/[0.05] border border-purple-500/15 px-4 py-3.5">
            <p className="text-sm text-gray-300 leading-[1.8]">{narrative.opportunity}</p>
          </div>
        </div>
      </div>

      {/* ── 3. Evolução por competência ───────────────────────── */}
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 rounded-full bg-purple-500 flex-shrink-0" />
            <h2 className="text-sm font-bold text-white">Evolução por Competência</h2>
          </div>
          {correctedCount < 2 && (
            <span className="text-xs text-gray-600">Envie mais 1 redação para ver a evolução</span>
          )}
        </div>
        <div className="space-y-5">
          {compEvolution.map(c => {
            const { bar, text, badge } = scoreColor(c.currentScore)
            const pct      = (c.currentScore / 200) * 100
            const isFocus  = focusComp.key === c.key
            const isStrong = strongComp.key === c.key && c.key !== focusComp.key
            const isChamp  = mostImproved?.key === c.key && (c.delta ?? 0) > 0
            return (
              <div key={c.key}>
                <div className="flex items-center justify-between mb-2 gap-3">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="text-xs font-bold text-gray-600 w-5 flex-shrink-0">{c.label}</span>
                    <span className="text-xs font-medium text-white truncate">{c.name}</span>
                    {isFocus  && <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-1.5 py-0.5 flex-shrink-0">🎯 foco</span>}
                    {isStrong && <span className="text-[10px] font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-1.5 py-0.5 flex-shrink-0">💪 forte</span>}
                    {isChamp  && <span className="text-[10px] font-medium text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-1.5 py-0.5 flex-shrink-0">↑ maior evolução</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {c.startScore !== null && c.delta !== null ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-gray-600 tabular-nums">{c.startScore}</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-700">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                        <span className={`font-bold tabular-nums ${text}`}>{c.currentScore}</span>
                        <span className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full ${
                          c.delta > 0 ? 'text-green-400 bg-green-500/10' :
                          c.delta < 0 ? 'text-red-400 bg-red-500/10'    : 'text-gray-600'
                        }`}>
                          {c.delta > 0 ? `+${c.delta}` : c.delta < 0 ? `${c.delta}` : '='}
                        </span>
                      </div>
                    ) : (
                      <span className={`text-sm font-bold tabular-nums ${text}`}>
                        {c.currentScore}
                        <span className="text-gray-600 text-xs font-normal">/200</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${bar} transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className={`text-[9px] font-medium tabular-nums ${badge} px-1.5 py-0.5 rounded-full`}>
                    {Math.round(pct)}% do máximo
                  </span>
                  <span className="text-[9px] text-gray-700">
                    Média histórica: {c.avg}/200
                    {correctedCount >= 2 && c.startScore !== null && ` · início: ${c.startScore}`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 4. Destaques: forte / oportunidade / evolução ─────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Ponto forte */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-5">
          <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-3">
            💪 Ponto forte
          </p>
          <p className="text-xs font-bold text-white mb-1 leading-snug">
            {strongComp.label} — {strongComp.name}
          </p>
          <p className="text-3xl font-extrabold text-purple-400 tabular-nums mt-2 leading-none">
            {strongComp.currentScore}
            <span className="text-sm font-normal text-gray-600 ml-1">/200</span>
          </p>
          <p className="text-[10px] text-purple-400/60 mt-2 leading-relaxed">
            {strongComp.currentScore >= 160
              ? 'Competência dominada — mantenha esse nível de forma consistente.'
              : 'Seu melhor resultado atual. Continue aplicando essa estratégia.'}
          </p>
        </div>

        {/* Principal oportunidade */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
          <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-3">
            🎯 Oportunidade
          </p>
          <p className="text-xs font-bold text-white mb-1 leading-snug">
            {focusComp.label} — {focusComp.name}
          </p>
          <p className="text-3xl font-extrabold text-amber-400 tabular-nums mt-2 leading-none">
            {focusComp.currentScore}
            <span className="text-sm font-normal text-gray-600 ml-1">/200</span>
          </p>
          <p className="text-[10px] text-amber-400/60 mt-2 leading-relaxed">
            {200 - focusComp.currentScore} pts ainda disponíveis — maior ganho potencial.
          </p>
        </div>

        {/* Maior evolução */}
        <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-5">
          <p className="text-[10px] font-semibold text-green-400 uppercase tracking-wider mb-3">
            📈 Maior evolução
          </p>
          {mostImproved && (mostImproved.delta ?? 0) > 0 ? (
            <>
              <p className="text-xs font-bold text-white mb-1 leading-snug">
                {mostImproved.label} — {mostImproved.name}
              </p>
              <p className="text-3xl font-extrabold text-green-400 tabular-nums mt-2 leading-none">
                +{mostImproved.delta}
                <span className="text-sm font-normal text-gray-600 ml-1">pts</span>
              </p>
              <p className="text-[10px] text-green-400/60 mt-2 leading-relaxed">
                {mostImproved.startScore ?? '—'} → {mostImproved.currentScore}/200 desde a primeira
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-white mb-1">—</p>
              <p className="text-[10px] text-gray-600 mt-2 leading-relaxed">
                Envie mais redações para ver qual competência mais evoluiu.
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── 5. Conquistas ─────────────────────────────────────── */}
      {achievements.length > 0 && (
        <div className="card-dark rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-4 rounded-full bg-amber-500 flex-shrink-0" />
            <h2 className="text-sm font-bold text-white">Conquistas</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {achievements.map((a, i) => (
              <span key={i} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${a.cls}`}>
                {a.icon} {a.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. Próximos passos ────────────────────────────────── */}
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 rounded-full bg-amber-500 flex-shrink-0" />
            <h2 className="text-sm font-bold text-white">Próximos Passos</h2>
          </div>
          <span className="text-xs text-gray-600">
            Foco: {focusComp.label} — {focusComp.name}
          </span>
        </div>

        <div className="space-y-3 mb-5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-amber-400">{i + 1}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>

        {/* Meta */}
        <div className="rounded-xl bg-purple-500/[0.06] border border-purple-500/15 px-4 py-3.5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={12} className="text-purple-400 flex-shrink-0" />
            <p className="text-xs font-bold text-white">
              Meta: atingir{' '}
              <span className="text-purple-300">{nextTarget} pontos</span>{' '}
              na próxima redação
            </p>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            {nextTarget > lastScore
              ? `+${nextTarget - lastScore} pts em relação à nota atual. Um nível acima em ${focusComp.label} é o caminho mais direto.`
              : 'Você já alcançou essa meta — continue avançando para o próximo patamar.'}
          </p>
        </div>
      </div>

      {/* ── 7. Histórico de redações ──────────────────────────── */}
      {correctedCount >= 2 && (
        <div className="card-dark rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-4 rounded-full bg-gray-700 flex-shrink-0" />
            <h2 className="text-sm font-bold text-white">Histórico</h2>
            <span className="ml-auto text-xs text-gray-600">
              {chrono.length > 8 ? `Últimas 8 de ${correctedCount}` : `${correctedCount} redações`}
            </span>
          </div>
          <div className="space-y-1">
            {chrono.slice(-8).map((essay, i) => {
              const score   = essay.corrections[0]?.total_score ?? 0
              const isBest  = score === bestScore
              const isLast  = essay.id === correctedEssays[0].id
              const { text } = scoreColor(score)
              return (
                <Link
                  key={essay.id}
                  href={`/aluno/redacoes/${essay.id}`}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/[0.04] transition-colors group print:hidden"
                >
                  <span className="text-[10px] text-gray-700 w-4 tabular-nums flex-shrink-0">
                    #{i + 1}
                  </span>
                  <p className="text-xs text-gray-400 flex-1 min-w-0 truncate group-hover:text-white transition-colors">
                    {essay.theme_title}
                  </p>
                  {isBest && (
                    <span className="text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-1.5 py-0.5 flex-shrink-0">
                      melhor
                    </span>
                  )}
                  {isLast && (
                    <span className="text-[9px] text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-1.5 py-0.5 flex-shrink-0">
                      última
                    </span>
                  )}
                  <span className={`text-xs font-bold tabular-nums flex-shrink-0 ${text}`}>
                    {score}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="text-gray-700 group-hover:text-purple-400 transition-colors flex-shrink-0">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              )
            })}
          </div>
          {/* Print-only version: just scores, no links */}
          <div className="hidden print:block space-y-1">
            {chrono.slice(-8).map((essay, i) => {
              const score = essay.corrections[0]?.total_score ?? 0
              const { text } = scoreColor(score)
              return (
                <div key={essay.id} className="flex items-center gap-3 py-2 px-3">
                  <span className="text-[10px] text-gray-500 w-4 tabular-nums">#{i + 1}</span>
                  <p className="text-xs text-gray-400 flex-1 min-w-0 truncate">{essay.theme_title}</p>
                  <span className={`text-xs font-bold tabular-nums ${text}`}>{score}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-5 border-t border-white/[0.06]">
        <p className="text-xs text-gray-700">
          Método Revisão · Relatório de Evolução · Gerado em {today}
        </p>
        <p className="text-xs text-gray-700">
          {studentName} · {correctedCount} redaç{correctedCount !== 1 ? 'ões' : 'ão'} corrigida{correctedCount !== 1 ? 's' : ''}
          {' '}· nota atual: {lastScore}/1000
        </p>
      </div>
    </div>
  )
}
