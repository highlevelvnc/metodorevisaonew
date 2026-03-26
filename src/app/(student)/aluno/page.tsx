import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FileText, TrendingUp, Zap, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Sua evolução',
  robots: { index: false, follow: false },
}

const COMPETENCIES = [
  { key: 'c1_score', label: 'C1', name: 'Norma culta' },
  { key: 'c2_score', label: 'C2', name: 'Compreensão do tema' },
  { key: 'c3_score', label: 'C3', name: 'Seleção de argumentos' },
  { key: 'c4_score', label: 'C4', name: 'Mecanismos de coesão' },
  { key: 'c5_score', label: 'C5', name: 'Proposta de intervenção' },
] as const

type CompKey = 'c1_score' | 'c2_score' | 'c3_score' | 'c4_score' | 'c5_score'
const compKeys: CompKey[] = ['c1_score', 'c2_score', 'c3_score', 'c4_score', 'c5_score']

// Short coaching tip per competency — drives "Seu próximo passo"
const NEXT_STEP_SHORT: Record<string, { focus: string; tip: string }> = {
  c1_score: { focus: 'Norma culta',             tip: 'Releia em voz alta para capturar erros de concordância e pontuação.' },
  c2_score: { focus: 'Compreensão do tema',     tip: 'Escreva sua tese em uma frase antes de começar — garante foco total.' },
  c3_score: { focus: 'Seleção de argumentos',   tip: 'Pesquise 2–3 dados ou referências antes de escrever qualquer parágrafo.' },
  c4_score: { focus: 'Mecanismos de coesão',    tip: 'Varie os conectivos: "Ademais", "Nesse sentido", "Por outro lado".' },
  c5_score: { focus: 'Proposta de intervenção', tip: 'Inclua explicitamente: agente, ação, modo/meio e finalidade.' },
}

// Enhanced patterns — label + description + tip + concrete example
const PATTERN_LABELS: Record<string, { label: string; description: string; tip: string; example: string }> = {
  c1_score: {
    label:       'Erros gramaticais recorrentes',
    description: 'Concordância, pontuação ou ortografia aparecem com frequência em todas as redações analisadas',
    tip:         'Releia em voz alta antes de entregar',
    example:     'Ex: "Os dados indica" → "Os dados indicam". Cada erro sinaliza descuido com a norma culta.',
  },
  c2_score: {
    label:       'Tangência ao tema',
    description: 'Seus textos começam no foco correto mas desviam — a tese não sustenta todos os parágrafos',
    tip:         'Escreva a tese em uma frase antes de começar',
    example:     'Ex: escrever sobre "bem-estar geral" num tema de "saúde mental jovem" — pauta diferente do que foi pedido.',
  },
  c3_score: {
    label:       'Argumentação no senso comum',
    description: 'Os argumentos ficam genéricos por falta de dados, autores ou referências concretas',
    tip:         'Pesquise 2–3 referências antes de escrever',
    example:     'Ex: "É notório que o desemprego causa problemas" — sem dados, datas ou autores específicos.',
  },
  c4_score: {
    label:       'Conectivos repetidos ou ausentes',
    description: '"Porém" e "mas" dominam o texto — pouca variação nos operadores argumentativos',
    tip:         'Use "ademais", "nesse sentido", "entretanto"',
    example:     'Ex: usar "portanto" 3 vezes no mesmo parágrafo — sinaliza vocabulário argumentativo restrito.',
  },
  c5_score: {
    label:       'Intervenção sempre incompleta',
    description: 'Um ou mais dos 4 elementos (agente, ação, modo, finalidade) estão ausentes ou vagos',
    tip:         'Responda: quem? faz o quê? como? para quê?',
    example:     'Ex: "O governo deve investir em educação" — falta o modo (como?) e a finalidade explícita (para quê?).',
  },
}

// Per-competency weekly plan — drives "Seu plano da semana"
const WEEKLY_PLAN: Record<string, { actions: string[]; errorToAvoid: string; weekGoal: string }> = {
  c1_score: {
    actions: [
      'Releia cada parágrafo em voz alta — o ouvido detecta erros que o olho ignora',
      'Revise concordância verbal e nominal separadamente de pontuação',
      'Pesquise uma regra gramatical que você erra com frequência e pratique com exemplos',
    ],
    errorToAvoid: 'Não entregue sem reler — a maioria dos erros de norma culta aparece na releitura, não na escrita.',
    weekGoal: 'Escrever uma redação completa e zerar erros de concordância na releitura.',
  },
  c2_score: {
    actions: [
      'Escreva sua tese em uma frase antes de começar qualquer parágrafo',
      'A cada parágrafo, pergunte: isso ainda serve diretamente à minha tese?',
      'Releia o enunciado na metade da escrita para garantir que continua no foco',
    ],
    errorToAvoid: 'Não desvie o tema nos parágrafos de desenvolvimento — tangência é o erro mais caro do ENEM.',
    weekGoal: 'Escrever uma redação onde cada parágrafo pode ser ligado diretamente à tese.',
  },
  c3_score: {
    actions: [
      'Antes de escrever, liste 2–3 dados, autores ou referências históricas para usar',
      'Estruture cada argumento: afirmação → dado concreto → análise → conexão com a tese',
      'Evite frases como "é notório que" sem embasar — substitua sempre por evidência real',
    ],
    errorToAvoid: 'Argumentar apenas com senso comum — sem repertório, dificilmente passa de 80/200 nesta competência.',
    weekGoal: 'Escrever um parágrafo de desenvolvimento com pelo menos um dado ou referência concretos.',
  },
  c4_score: {
    actions: [
      'Liste 10 conectivos que você não costuma usar e inclua ao menos 3 na próxima redação',
      'Releia a última frase de cada parágrafo — ela deve fazer ponte com o próximo',
      'Substitua "porém" e "mas" repetidos por "todavia", "entretanto" ou "contudo"',
    ],
    errorToAvoid: 'Repetir os mesmos conectivos em todos os parágrafos — demonstra vocabulário limitado e prejudica a coesão.',
    weekGoal: 'Usar pelo menos 5 conectivos diferentes ao longo da redação.',
  },
  c5_score: {
    actions: [
      'Escreva a proposta respondendo explicitamente: quem? o quê? como? para quê?',
      'Revise: todos os 4 elementos (agente, ação, modo, finalidade) estão presentes e explícitos?',
      'Evite propostas genéricas como "o governo deve agir" — seja sempre específico',
    ],
    errorToAvoid: 'Proposta vaga ou incompleta — a falta de um único elemento (modo ou finalidade) já custa pontos.',
    weekGoal: 'Elaborar uma proposta de intervenção completa com os 4 elementos explícitos.',
  },
}

// Per-competency suggested essay theme — drives "Tema sugerido"
const SUGGESTED_THEMES: Record<string, { title: string; reason: string; trains: string }> = {
  c1_score: {
    title: 'O impacto das redes sociais na língua portuguesa',
    reason: 'Temas linguísticos exigem domínio vocabular preciso e atenção redobrada à norma culta — o contexto força o cuidado com a escrita.',
    trains: 'C1 — Domínio da Norma Culta',
  },
  c2_score: {
    title: 'Os desafios da educação ambiental no Brasil',
    reason: 'Tema com múltiplas perspectivas — exige que você defina uma tese clara e mantenha o foco sem desviar para subtemas periféricos.',
    trains: 'C2 — Compreensão da Proposta',
  },
  c3_score: {
    title: 'A influência da inteligência artificial no mercado de trabalho',
    reason: 'Tema contemporâneo com amplo repertório disponível — permite trabalhar dados, estudos e referências de forma natural e convincente.',
    trains: 'C3 — Seleção de Argumentos',
  },
  c4_score: {
    title: 'O papel da cultura popular na construção da identidade nacional',
    reason: 'Tema que exige conexões entre diferentes exemplos e argumentos — treina o uso de conectivos e a articulação entre parágrafos.',
    trains: 'C4 — Mecanismos de Coesão',
  },
  c5_score: {
    title: 'A violência contra a mulher no Brasil: causas e soluções',
    reason: 'Tema social concreto que exige uma proposta de intervenção detalhada e viável — ideal para praticar os 4 elementos obrigatórios.',
    trains: 'C5 — Proposta de Intervenção',
  },
}

// Plan progression data — used for contextual upgrade suggestions
const PLAN_TIERS: Record<string, {
  nextPlan: string | null; nextEssays: number | null
  nextBenefit: string; color: string
}> = {
  'Trial':      { nextPlan: 'Evolução',    nextEssays: 3, nextBenefit: '3 redações por ciclo com devolutiva completa C1–C5',      color: 'text-gray-400'   },
  'Evolução':   { nextPlan: 'Estratégia',  nextEssays: 5, nextBenefit: '5 redações + acompanhamento de padrões prioritário',       color: 'text-gray-400'   },
  'Estratégia': { nextPlan: 'Intensivo',   nextEssays: 8, nextBenefit: '8 redações + correção prioritária em até 24h',             color: 'text-purple-400' },
  'Intensivo':  { nextPlan: null,          nextEssays: null, nextBenefit: '',                                                      color: 'text-amber-400'  },
}

function generateCycleNarrative(
  count: number,
  correctedCount: number,
  avg: number | null,
  bestGain: number | null,
  focusKey: string | null
): { headline: string; support: string } {
  const focusLabel: Record<string, string> = { c1_score: 'C1', c2_score: 'C2', c3_score: 'C3', c4_score: 'C4', c5_score: 'C5' }
  const focusFullName: Record<string, string> = { c1_score: 'Norma Culta', c2_score: 'Compreensão do Tema', c3_score: 'Seleção de Argumentos', c4_score: 'Mecanismos de Coesão', c5_score: 'Proposta de Intervenção' }
  const label = focusKey ? (focusLabel[focusKey] ?? '') : ''
  const name  = focusKey ? (focusFullName[focusKey] ?? '') : ''

  if (correctedCount === 0) {
    return count === 1
      ? { headline: 'Primeira redação enviada — aguarde a devolutiva.', support: 'Sua análise por competência estará disponível em até 48h. Use esse tempo para reler as orientações do ENEM.' }
      : { headline: `${count} redações enviadas este mês.`, support: 'Assim que as devolutivas chegarem, o painel vai indicar exatamente onde focar para subir a nota.' }
  }
  if (avg !== null && avg >= 800) {
    return bestGain && bestGain > 0
      ? { headline: `Ciclo excelente: média ${avg} pts e maior salto de +${bestGain} pts.`, support: 'Você está operando no nível das melhores notas do ENEM. Mantenha a cadência e expanda o repertório de argumentos.' }
      : { headline: `Ciclo excelente: média ${avg} pts.`, support: 'Consistência acima de 800 é rara — você está acima da média nacional. Próximo alvo: refinamento da proposta de intervenção para 1000.' }
  }
  if (avg !== null && avg >= 600) {
    return label
      ? { headline: `Bom ciclo — média ${avg} pts. ${label} ainda é a maior alavanca.`, support: `Foco em ${name} pode render ganhos expressivos${bestGain && bestGain > 0 ? ` — você já provou isso com +${bestGain} pts entre duas redações` : ' nas próximas redações'}.` }
      : { headline: `Bom ciclo com média ${avg} pts.`, support: 'Cada devolutiva traz um padrão claro. Aplique um ajuste por redação e a curva sobe de forma consistente.' }
  }
  if (bestGain !== null && bestGain > 0) {
    return label
      ? { headline: `+${bestGain} pts de evolução neste ciclo.`, support: `O foco em ${name} (${label}) está gerando resultado concreto. Continue aplicando a mesma estratégia na próxima redação.` }
      : { headline: `+${bestGain} pts de evolução neste ciclo.`, support: 'O esforço está convertendo em pontos. Mantenha a consistência de envio para acelerar a curva.' }
  }
  return correctedCount >= 2
    ? { headline: `${correctedCount} devolutivas concluídas neste ciclo.`, support: 'Analise os padrões repetidos e aplique um ajuste específico por redação — é assim que a nota sobe de forma sustentável.' }
    : { headline: 'Ciclo em andamento.', support: 'A consistência de envio já é o primeiro passo. Cada redação corrigida revela um padrão que você pode eliminar.' }
}

function generateThemeContext(worstCompKey: string, delta: number | null, worstAvg: number): string {
  const compName: Record<string, string> = {
    c1_score: 'Norma Culta', c2_score: 'Compreensão do Tema',
    c3_score: 'Seleção de Argumentos', c4_score: 'Mecanismos de Coesão',
    c5_score: 'Proposta de Intervenção',
  }
  const name = compName[worstCompKey] ?? worstCompKey
  if (worstAvg < 80) {
    return `${name} está abaixo de 80 pts de média — cada redação neste tema cria uma oportunidade direta de recuperar pontos que hoje ficam na mesa.`
  }
  if (delta !== null && delta < 0) {
    return `${name} recuou na última devolutiva. Escrever sobre um tema que força esse músculo agora ajuda a reverter a queda antes que vire padrão.`
  }
  if (delta !== null && delta > 20) {
    return `${name} ganhou +${delta} pts na última redação — o momento é ideal para consolidar esse avanço com mais uma repetição direcionada.`
  }
  return `${name} é sua maior alavanca de pontos neste momento. Um tema alinhado a essa competência maximiza o retorno de cada hora de treino.`
}

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
      .order('submitted_at', { ascending: false })
      .limit(200),
  ])

  const profile  = profileRaw as { full_name: string } | null
  const sub      = subRaw as SubData | null
  const essays   = (essaysRaw as EssayData[]) ?? []

  const firstName    = profile?.full_name?.split(' ')[0] ?? 'Aluno'
  const planName     = sub?.plans?.name ?? 'Trial'
  const creditsLeft  = sub ? Math.max(0, sub.essays_limit - sub.essays_used) : 0
  const creditsTotal = sub?.essays_limit ?? 1

  const correctedEssays = essays.filter(e => e.status === 'corrected' && e.corrections?.length > 0)
  const lastEssay       = correctedEssays[0] ?? null
  const lastCorrection  = lastEssay?.corrections?.[0] ?? null
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

  // Sparkline: last 6 corrected, oldest → newest
  const sparkHistory = correctedEssays.length >= 2 ? correctedEssays.slice(0, 6).reverse() : []

  // Weakest/strongest competency from most recent correction
  const worstCompKey = lastCorrection
    ? compKeys.reduce((a, b) => (lastCorrection[a] ?? 0) <= (lastCorrection[b] ?? 0) ? a : b)
    : null
  const bestCompKey = lastCorrection
    ? compKeys.reduce((a, b) => (lastCorrection[a] ?? 0) >= (lastCorrection[b] ?? 0) ? a : b)
    : null
  const nextStep = worstCompKey ? NEXT_STEP_SHORT[worstCompKey] : null

  // Average score for the worst competency across all corrected essays (used by generateThemeContext)
  const worstCompAvg = worstCompKey && correctedEssays.length > 0
    ? Math.round(correctedEssays.reduce((s, e) => s + (e.corrections[0]?.[worstCompKey as CompKey] ?? 0), 0) / correctedEssays.length)
    : 0

  // "Seus padrões" — competencies that average < 100 across all corrected essays
  const compAvgs = correctedEssays.length >= 2
    ? compKeys.map(key => ({
        key,
        avg: Math.round(correctedEssays.reduce((s, e) => s + (e.corrections[0]?.[key] ?? 0), 0) / correctedEssays.length),
      }))
    : []
  const patterns = compAvgs.filter(c => c.avg < 100)

  // ── "Resumo do ciclo" — last 30 days ────────────────────────────────────
  const thirtyDaysAgo   = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const cycleEssays     = essays.filter(e => e.submitted_at >= thirtyDaysAgo)
  const cycleCorrected  = cycleEssays.filter(e => e.status === 'corrected' && e.corrections?.length > 0)
  const cycleAvg        = cycleCorrected.length
    ? Math.round(cycleCorrected.reduce((s, e) => s + (e.corrections[0]?.total_score ?? 0), 0) / cycleCorrected.length)
    : null
  // Biggest gain between consecutive cycle corrected essays (chronological)
  const cycleChron      = [...cycleCorrected].reverse()
  let bestCycleGain: number | null = null
  for (let i = 1; i < cycleChron.length; i++) {
    const gain = (cycleChron[i].corrections[0]?.total_score ?? 0) - (cycleChron[i - 1].corrections[0]?.total_score ?? 0)
    if (bestCycleGain === null || gain > bestCycleGain) bestCycleGain = gain
  }
  // Main focus this cycle (worst avg comp among cycle corrected essays)
  const cycleFocusKey = cycleCorrected.length > 0
    ? compKeys.reduce((worst, k) => {
        const wAvg = cycleCorrected.reduce((s, e) => s + (e.corrections[0]?.[worst] ?? 0), 0) / cycleCorrected.length
        const kAvg = cycleCorrected.reduce((s, e) => s + (e.corrections[0]?.[k] ?? 0), 0) / cycleCorrected.length
        return kAvg < wAvg ? k : worst
      }, compKeys[0])
    : null
  const showCycle = cycleEssays.length >= 1 // show block if there was any activity this month
  const bestCycleScore = cycleCorrected.length > 0
    ? Math.max(...cycleCorrected.map(e => e.corrections[0]?.total_score ?? 0))
    : null
  // Per-comp deltas within this cycle (oldest → newest corrected essay)
  const cycleCompDeltas: { key: CompKey; delta: number; last: number }[] = cycleCorrected.length >= 2
    ? compKeys.map(key => ({
        key,
        delta: (cycleChron[cycleChron.length - 1].corrections[0]?.[key] ?? 0) - (cycleChron[0].corrections[0]?.[key] ?? 0),
        last:  cycleChron[cycleChron.length - 1].corrections[0]?.[key] ?? 0,
      }))
    : []

  const cycleNarrative = showCycle
    ? generateCycleNarrative(cycleEssays.length, cycleCorrected.length, cycleAvg, bestCycleGain, cycleFocusKey)
    : null

  // ── Monetização contextual ────────────────────────────────────────────────
  const creditsPct      = creditsTotal > 0 ? Math.round((creditsLeft / creditsTotal) * 100) : 0
  const planTier        = PLAN_TIERS[planName] ?? PLAN_TIERS['Evolução']
  const upgradeAvailable = planTier.nextPlan !== null
  // "Evoluindo bem" = ganhou mais de 60 pts no geral, ou média do ciclo ≥ 560
  const isEvolving      = (overallDelta !== null && overallDelta > 60) || (cycleAvg !== null && cycleAvg >= 560)
  // "Ciclo intenso" = usou ≥ 66% dos créditos disponíveis
  const cycleIsIntense  = cycleEssays.length >= Math.max(2, Math.ceil(creditsTotal * 0.66))

  type UpgradeSignal = 'last_credit_evolving' | 'exhausted' | 'halfway_evolving' | null
  const upgradeSignal: UpgradeSignal = (() => {
    if (!upgradeAvailable) return null
    if (creditsLeft === 0 && correctedEssays.length > 0) return 'exhausted'
    if (creditsLeft === 1 && isEvolving) return 'last_credit_evolving'
    if (creditsPct <= 50 && isEvolving && cycleIsIntense) return 'halfway_evolving'
    return null
  })()

  return (
    <div className="max-w-4xl">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Olá, {firstName} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Plano <span className="text-purple-400 font-medium">{planName}</span>
            {' · '}
            {creditsLeft === 0 ? (
              <span className="text-red-400 font-medium">
                Créditos esgotados —{' '}
                <Link href="/aluno/upgrade" className="underline hover:text-red-300">fazer upgrade</Link>
              </span>
            ) : (
              <span className={creditsLeft === 1 ? 'text-amber-400' : 'text-gray-400'}>
                {creditsLeft} crédito{creditsLeft !== 1 ? 's' : ''} restante{creditsLeft !== 1 ? 's' : ''}
              </span>
            )}
          </p>
          {overallDelta !== null && overallDelta > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-0.5 text-green-400 bg-green-500/10 border border-green-500/20 mt-1.5">
              🏆 +{overallDelta} pts desde o início
            </span>
          )}
        </div>
        {creditsLeft > 0 ? (
          <Link href="/aluno/redacoes/nova" className="btn-primary self-start sm:self-auto">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            Enviar próxima redação
          </Link>
        ) : (
          <Link href="/aluno/upgrade" className="self-start sm:self-auto inline-flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-xl transition-colors text-red-300 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20">
            Fazer upgrade →
          </Link>
        )}
      </div>

      {/* ── 🎯 Seu próximo passo ────────────────────────────────── */}
      {nextStep ? (
        <div className="relative rounded-2xl border border-purple-600/30 bg-gradient-to-br from-purple-900/20 to-purple-800/5 p-5 mb-6 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">🎯 Seu próximo passo</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-base font-bold text-white mb-1">
                  Foco em{' '}
                  <span className="text-purple-300">
                    {COMPETENCIES.find(c => c.key === worstCompKey)?.label} — {nextStep.focus}
                  </span>
                </p>
                <p className="text-sm text-gray-400 leading-relaxed">{nextStep.tip}</p>
              </div>
              {creditsLeft > 0 ? (
                <Link
                  href="/aluno/redacoes/nova"
                  className="flex-shrink-0 inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white font-bold px-5 py-3 rounded-xl transition-colors text-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                  Enviar próxima redação
                </Link>
              ) : (
                <Link
                  href="/aluno/upgrade"
                  className="flex-shrink-0 inline-flex items-center gap-2 text-red-300 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 font-bold px-5 py-3 rounded-xl transition-colors text-sm"
                >
                  Créditos esgotados — fazer upgrade →
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl border border-purple-600/30 bg-gradient-to-br from-purple-900/20 to-purple-800/5 p-5 mb-6">
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">🎯 Comece agora</p>
          <p className="text-base font-bold text-white mb-1">Pronto para a primeira devolutiva?</p>
          <p className="text-sm text-gray-400 mb-4 leading-relaxed">
            Envie sua redação e receba uma análise completa por competência em até 48h.
          </p>
          {creditsLeft > 0 ? (
            <Link
              href="/aluno/redacoes/nova"
              className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white font-bold px-5 py-3 rounded-xl transition-colors text-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
              Enviar minha primeira redação
            </Link>
          ) : (
            <Link
              href="/aluno/upgrade"
              className="inline-flex items-center gap-2 text-red-300 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 font-bold px-5 py-3 rounded-xl transition-colors text-sm"
            >
              Fazer upgrade para continuar →
            </Link>
          )}
        </div>
      )}

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <span className="text-xs text-gray-500">Nota atual</span>
          </div>
          <p className="text-3xl font-bold text-white">{avgScore ?? '—'}</p>
          <p className="text-xs text-gray-600 mt-0.5">de 1000 pontos</p>
          {delta !== null && (
            <p className={`text-xs mt-1 font-semibold ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {delta >= 0 ? `↑ +${delta}` : `↓ ${delta}`} última vs anterior
            </p>
          )}
        </div>

        <div className={`p-5 rounded-2xl ${
          creditsLeft === 0 ? 'card-dark border-red-500/20' :
          creditsLeft === 1 ? 'card-dark border-amber-500/20' : 'card-dark'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              creditsLeft === 0 ? 'bg-red-500/10 border border-red-500/15' :
              creditsLeft === 1 ? 'bg-amber-500/15 border border-amber-500/20' :
              'bg-amber-500/10 border border-amber-500/15'
            }`}>
              <Zap size={15} className={creditsLeft === 0 ? 'text-red-400' : 'text-amber-400'} />
            </div>
            {/* Plan name as label context */}
            <span className={`text-xs font-medium ${planTier.color}`}>{planName}</span>
          </div>
          <p className={`text-3xl font-bold ${creditsLeft === 0 ? 'text-red-400' : 'text-white'}`}>{creditsLeft}</p>
          <p className="text-xs text-gray-600 mt-0.5">
            {sub ? `${sub.essays_used} usada${sub.essays_used !== 1 ? 's' : ''} de ${creditsTotal}` : `de ${creditsTotal} neste ciclo`}
          </p>
          {/* Dot indicators — visual credit tracking */}
          {creditsTotal <= 8 ? (
            <div className="flex gap-1 mt-2.5">
              {Array.from({ length: creditsTotal }).map((_, i) => {
                const usedCount = creditsTotal - creditsLeft
                const isUsed    = i < usedCount
                return (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      creditsLeft === 0 ? 'bg-red-500/40' :
                      isUsed ? 'bg-white/[0.10]' : 'bg-amber-400'
                    }`}
                  />
                )
              })}
            </div>
          ) : (
            <div className="mt-2.5 h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  creditsLeft === 0 ? 'bg-red-500' : 'bg-amber-400'
                }`}
                style={{ width: creditsTotal > 0 ? `${(creditsLeft / creditsTotal) * 100}%` : '0%' }}
              />
            </div>
          )}
          {creditsLeft === 1 && (
            <p className="text-[11px] font-semibold text-amber-400 mt-2">Última redação do ciclo</p>
          )}
          {creditsLeft === 0 && planTier.nextPlan && (
            <Link href="/aluno/upgrade" className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-red-400 hover:text-red-300 transition-colors">
              → {planTier.nextPlan}: {planTier.nextEssays} redações
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

      {/* ── Resumo do ciclo (últimos 30 dias) ──────────────────── */}
      {showCycle && (
        <div className="card-dark rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Relatório do ciclo</h2>
              <p className="text-xs text-gray-600 mt-0.5">Últimos 30 dias</p>
            </div>
            <Link href="/aluno/evolucao" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              Ver relatório completo →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Enviadas */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-center">
              <p className="text-2xl font-bold text-white tabular-nums">{cycleEssays.length}</p>
              <p className="text-xs text-gray-600 mt-0.5">enviada{cycleEssays.length !== 1 ? 's' : ''}</p>
            </div>
            {/* Corrigidas */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-center">
              <p className="text-2xl font-bold text-white tabular-nums">{cycleCorrected.length}</p>
              <p className="text-xs text-gray-600 mt-0.5">corrigida{cycleCorrected.length !== 1 ? 's' : ''}</p>
            </div>
            {/* Média do ciclo */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-center">
              {cycleAvg !== null ? (
                <>
                  <p className="text-2xl font-bold text-white tabular-nums">{cycleAvg}</p>
                  <p className="text-xs text-gray-600 mt-0.5">média</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-600">—</p>
                  <p className="text-xs text-gray-600 mt-0.5">média</p>
                </>
              )}
            </div>
            {/* Maior ganho */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-center">
              {bestCycleGain !== null && bestCycleGain > 0 ? (
                <>
                  <p className="text-2xl font-bold text-green-400 tabular-nums">+{bestCycleGain}</p>
                  <p className="text-xs text-gray-600 mt-0.5">maior ganho</p>
                </>
              ) : cycleFocusKey ? (
                <>
                  <p className="text-sm font-bold text-amber-400 mt-1">
                    {COMPETENCIES.find(c => c.key === cycleFocusKey)?.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">foco do mês</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-600">—</p>
                  <p className="text-xs text-gray-600 mt-0.5">maior ganho</p>
                </>
              )}
            </div>
            {/* Melhor nota do ciclo */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-center">
              {bestCycleScore !== null ? (
                <>
                  <p className="text-2xl font-bold text-purple-400 tabular-nums">{bestCycleScore}</p>
                  <p className="text-xs text-gray-600 mt-0.5">melhor nota</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-600">—</p>
                  <p className="text-xs text-gray-600 mt-0.5">melhor nota</p>
                </>
              )}
            </div>
          </div>
          {/* Per-comp cycle deltas — only when ≥2 corrected essays in cycle */}
          {cycleCompDeltas.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/[0.05]">
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2.5">Evolução por competência no ciclo</p>
              <div className="grid grid-cols-5 gap-2">
                {cycleCompDeltas.map(({ key, delta, last }) => {
                  const comp = COMPETENCIES.find(c => c.key === key)
                  return (
                    <div key={key} className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2 text-center">
                      <p className="text-[10px] font-semibold text-gray-500 mb-1">{comp?.label}</p>
                      <p className="text-sm font-bold text-white tabular-nums leading-none">{last}</p>
                      {delta !== 0 && (
                        <p className={`text-[10px] font-semibold mt-0.5 tabular-nums ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {delta > 0 ? `+${delta}` : delta}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {/* Cycle narrative card */}
          {cycleNarrative && (
            <div className="mt-4 pt-4 border-t border-white/[0.05]">
              <div className="rounded-xl bg-purple-500/[0.06] border border-purple-500/15 px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white leading-snug mb-1">{cycleNarrative.headline}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{cycleNarrative.support}</p>
                  </div>
                  {cycleFocusKey && cycleCorrected.length >= 1 && (
                    <span className="flex-shrink-0 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 whitespace-nowrap">
                      🎯 {COMPETENCIES.find(c => c.key === cycleFocusKey)?.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Upgrade contextual ──────────────────────────────────── */}
      {upgradeSignal === 'exhausted' && planTier.nextPlan && (
        <div className="card-dark rounded-2xl p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Ciclo {planName} concluído
              </p>
              <p className="text-base font-bold text-white mb-1">
                Com o plano{' '}
                <span className="text-purple-400">{planTier.nextPlan}</span>
                , você teria{' '}
                <span className="text-purple-400">{planTier.nextEssays} redações</span>
                {' '}por ciclo
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">{planTier.nextBenefit}</p>
              {/* Personalised context based on student evolution */}
              {isEvolving && overallDelta !== null && overallDelta > 0 && (
                <p className="text-xs text-green-400 mt-2 leading-relaxed">
                  Com +{overallDelta} pts de evolução em {correctedEssays.length} redaç{correctedEssays.length !== 1 ? 'ões' : 'ão'}, mais ciclos acelerariam significativamente sua nota.
                </p>
              )}
            </div>
            <Link
              href="/aluno/upgrade"
              className="flex-shrink-0 self-start sm:self-center inline-flex items-center gap-2 text-sm font-bold text-purple-400 bg-purple-600/10 border border-purple-500/20 rounded-xl px-4 py-2.5 hover:bg-purple-600/20 transition-colors whitespace-nowrap"
            >
              Ver planos →
            </Link>
          </div>
        </div>
      )}
      {(upgradeSignal === 'last_credit_evolving' || upgradeSignal === 'halfway_evolving') && planTier.nextPlan && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-purple-500/15 bg-purple-500/[0.04] px-4 py-3.5">
          <p className="text-xs text-gray-300 leading-relaxed">
            {upgradeSignal === 'last_credit_evolving'
              ? <><span className="text-purple-400 font-semibold">Você está evoluindo bem.</span> No plano {planTier.nextPlan} teria {planTier.nextEssays} redações por ciclo — {(planTier.nextEssays ?? 0) - creditsTotal} a mais para manter o ritmo.</>
              : <><span className="text-purple-400 font-semibold">{cycleEssays.length} redações enviadas este ciclo.</span> Com o plano {planTier.nextPlan} você teria {planTier.nextEssays} disponíveis — {(planTier.nextEssays ?? 0) - creditsTotal} a mais para continuar evoluindo.</>
            }
          </p>
          <Link href="/aluno/upgrade" className="flex-shrink-0 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors whitespace-nowrap">
            Ver planos →
          </Link>
        </div>
      )}

      {/* ── 📅 Seu plano da semana ──────────────────────────────── */}
      {worstCompKey && WEEKLY_PLAN[worstCompKey] && (() => {
        const weekPlan = WEEKLY_PLAN[worstCompKey]
        const weekComp = COMPETENCIES.find(c => c.key === worstCompKey)
        return (
          <div className="card-dark rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">📅</span>
              <h2 className="text-sm font-bold text-white">Seu plano da semana</h2>
              {weekComp && (
                <span className="ml-auto text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5">
                  Foco: {weekComp.label}
                </span>
              )}
            </div>
            <div className="space-y-2.5 mb-4">
              {weekPlan.actions.map((action, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-600/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-purple-400">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{action}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-red-500/[0.05] border border-red-500/15 px-4 py-3 mb-3">
              <p className="text-xs font-semibold text-red-400 mb-1">⚠️ Erro para evitar</p>
              <p className="text-sm text-gray-400 leading-relaxed">{weekPlan.errorToAvoid}</p>
            </div>
            <div className="rounded-xl bg-purple-500/[0.06] border border-purple-500/15 px-4 py-3">
              <p className="text-xs font-semibold text-purple-400 mb-1">🏆 Meta da semana</p>
              <p className="text-sm text-gray-300 leading-relaxed">{weekPlan.weekGoal}</p>
            </div>
          </div>
        )
      })()}

      {/* ── Última devolutiva ───────────────────────────────────── */}
      {lastCorrection && (
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
                <div className="flex-shrink-0 text-center sm:text-left">
                  <div className="text-4xl font-extrabold text-white leading-none">{lastCorrection.total_score}</div>
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
                <div className="hidden sm:block w-px bg-white/[0.06] self-stretch" />
                <div className="flex-1 space-y-2.5">
                  <p className="text-sm font-medium text-gray-300 mb-3 line-clamp-1">{lastEssay!.theme_title}</p>
                  {COMPETENCIES.map(c => {
                    const score = lastCorrection[c.key] as number
                    return (
                      <div key={c.key} className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-gray-500 w-4">{c.label}</span>
                        <div className="flex-1"><ScoreBar score={score} /></div>
                        <span className="text-[11px] text-gray-400 w-8 text-right">{score}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="hidden sm:flex items-center self-center text-gray-700 group-hover:text-purple-400 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ── Histórico de pontuação ──────────────────────────────── */}
      {sparkHistory.length >= 2 && (
        <div className="mb-6 card-dark rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Histórico de pontuação</h2>
            <Link href="/aluno/evolucao" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              Ver relatório completo →
            </Link>
          </div>
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
                ? `↑ +${overallDelta} pontos desde a primeira redação — continue assim!`
                : `↓ ${Math.abs(overallDelta)} pontos. Revise as devolutivas anteriores para identificar padrões.`}
            </p>
          )}
        </div>
      )}

      {/* ── 💪 Ponto forte + 🎯 Foco agora ─────────────────────── */}
      {lastCorrection && (() => {
        const compScores = COMPETENCIES.map(c => ({ ...c, score: lastCorrection[c.key] as number }))
        const best  = compScores.find(c => c.key === bestCompKey) ?? compScores.reduce((a, b) => a.score >= b.score ? a : b)
        const worst = compScores.find(c => c.key === worstCompKey) ?? compScores.reduce((a, b) => a.score <= b.score ? a : b)
        return (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-4">
              <p className="text-xs font-semibold text-green-400 mb-2.5">💪 Ponto forte</p>
              <p className="text-sm font-semibold text-white leading-snug">{best.label} · {best.name}</p>
              <p className="text-2xl font-bold text-white mt-1.5 tabular-nums">
                {best.score}<span className="text-xs text-gray-600 font-normal ml-0.5">/200</span>
              </p>
              <p className="text-[11px] text-green-400/70 mt-1.5 leading-snug">
                {best.score >= 160
                  ? 'Desempenho de elite — mantenha e use como base para elevar as demais.'
                  : best.score >= 120
                  ? 'Sólido. Continue refinando para chegar ainda mais perto de 200.'
                  : 'Seu ponto mais alto agora — construa sobre ele nas próximas redações.'}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
              <p className="text-xs font-semibold text-amber-400 mb-2.5">🎯 Foco agora</p>
              <p className="text-sm font-semibold text-white leading-snug">{worst.label} · {worst.name}</p>
              <p className="text-2xl font-bold text-white mt-1.5 tabular-nums">
                {worst.score}<span className="text-xs text-gray-600 font-normal ml-0.5">/200</span>
              </p>
              <p className="text-[11px] text-amber-400/70 mt-1.5 leading-snug">
                {worst.score < 80
                  ? 'Prioridade máxima — maior potencial de ganho de pontos agora.'
                  : worst.score < 120
                  ? 'Cada ponto aqui vale mais: ainda está abaixo da sua média geral.'
                  : 'Ainda há margem — um ajuste específico aqui pode fechar a lacuna.'}
              </p>
            </div>
          </div>
        )
      })()}

      {/* ── 💡 Tema sugerido ────────────────────────────────────── */}
      {worstCompKey && SUGGESTED_THEMES[worstCompKey] && lastCorrection && (() => {
        const theme        = SUGGESTED_THEMES[worstCompKey]
        const weekPlan     = WEEKLY_PLAN[worstCompKey]
        const themeContext = generateThemeContext(worstCompKey, delta, worstCompAvg)
        return (
          <div className="card-dark rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">💡</span>
              <h2 className="text-sm font-bold text-white">Tema sugerido para você</h2>
            </div>
            {/* Theme title + pedagogical reason */}
            <div className="rounded-xl bg-blue-500/[0.05] border border-blue-500/15 p-4 mb-3">
              <p className="text-sm font-semibold text-white leading-snug mb-2">&ldquo;{theme.title}&rdquo;</p>
              <p className="text-xs text-gray-500 leading-relaxed">{theme.reason}</p>
            </div>
            {/* Por que agora — dynamic context */}
            <div className="rounded-xl bg-amber-500/[0.04] border border-amber-500/15 px-4 py-3 mb-3">
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Por que agora</p>
              <p className="text-xs text-gray-400 leading-relaxed">{themeContext}</p>
            </div>
            {/* Connection to weekly plan */}
            {weekPlan && (
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 py-3 mb-3">
                <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-1.5">Meta da semana ligada a este tema</p>
                <p className="text-xs text-gray-300 leading-relaxed">{weekPlan.weekGoal}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2.5 py-1">
                Treina: {theme.trains}
              </span>
              <Link href="/aluno/redacoes/nova" className="ml-auto text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                Escrever sobre este tema →
              </Link>
            </div>
          </div>
        )
      })()}

      {/* ── 📊 Seus padrões (enhanced) ──────────────────────────── */}
      {patterns.length > 0 && (
        <div className="card-dark rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">📊 Seus padrões</h2>
            <span className="text-xs text-gray-600">base: {correctedEssays.length} redações</span>
          </div>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Estes erros aparecem de forma consistente. Trabalhar cada um diretamente é o caminho mais rápido para subir a nota.
          </p>
          <div className="space-y-3">
            {patterns.map(p => {
              const info = PATTERN_LABELS[p.key]
              const potentialGain = 200 - p.avg
              return (
                <div key={p.key} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                  {/* Header: label + score + potential */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{info.label}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{info.description}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-purple-500 flex-shrink-0">
                          <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                        </svg>
                        <p className="text-[11px] text-purple-400">{info.tip}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-amber-400 tabular-nums leading-none">{p.avg}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">/200 média</p>
                      <span className="inline-block mt-1.5 text-[10px] font-semibold text-green-400/80 bg-green-500/[0.08] border border-green-500/15 rounded-full px-1.5 py-0.5">
                        +{potentialGain} potencial
                      </span>
                    </div>
                  </div>
                  {/* Concrete example */}
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Exemplo real</p>
                    <p className="text-[11px] text-gray-400 leading-relaxed italic">{info.example}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <Link href="/aluno/redacoes/nova" className="flex items-center justify-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              Aplicar o foco e enviar próxima redação →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
