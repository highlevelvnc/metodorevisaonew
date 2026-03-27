import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { TrendingUp, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Devolutiva',
  robots: { index: false, follow: false },
}

const COMPETENCIES = [
  { key: 'c1_score' as const, label: 'C1', name: 'Domínio da Norma Culta',  desc: 'Ortografia, acentuação, gramática e vocabulário' },
  { key: 'c2_score' as const, label: 'C2', name: 'Compreensão da Proposta', desc: 'Adequação ao tema e ao tipo textual' },
  { key: 'c3_score' as const, label: 'C3', name: 'Seleção de Argumentos',   desc: 'Autoria, repertório e defesa de ponto de vista' },
  { key: 'c4_score' as const, label: 'C4', name: 'Mecanismos de Coesão',    desc: 'Coerência, coesão e conectivos' },
  { key: 'c5_score' as const, label: 'C5', name: 'Proposta de Intervenção', desc: 'Agente, ação, modo e finalidade' },
]

// 3 specific actions per competency — shown in "Plano para a próxima"
const PLAN_ACTIONS: Record<string, { weekFocus: string; actions: string[] }> = {
  c1_score: {
    weekFocus: 'Domínio da Norma Culta',
    actions: [
      'Releia em voz alta antes de entregar — o ouvido detecta erros que o olho ignora',
      'Revise concordância verbal e nominal em cada parágrafo separadamente',
      'Use vírgula apenas onde há pausa natural — evite excesso ou falta',
    ],
  },
  c2_score: {
    weekFocus: 'Compreensão da Proposta',
    actions: [
      'Escreva sua tese em uma frase antes de começar — ela deve responder exatamente ao tema',
      'A cada novo parágrafo, pergunte: isso ainda serve à minha tese?',
      'Releia o enunciado na metade da escrita para verificar que ainda está no foco',
    ],
  },
  c3_score: {
    weekFocus: 'Seleção de Argumentos',
    actions: [
      'Pesquise 2–3 dados, estudos ou referências históricas antes de escrever',
      'Estruture cada argumento: afirmação → repertório → análise → conexão com a tese',
      'Argumentos sem embasamento raramente passam de 80/200 — sempre fundamente',
    ],
  },
  c4_score: {
    weekFocus: 'Mecanismos de Coesão',
    actions: [
      'Varie os conectivos: "Ademais", "Nesse sentido", "Por outro lado", "Desse modo"',
      'Releia a última frase de cada parágrafo — ela deve conectar com o próximo',
      'Substitua "porém" e "mas" repetidos por "todavia", "entretanto", "contudo"',
    ],
  },
  c5_score: {
    weekFocus: 'Proposta de Intervenção',
    actions: [
      'Use a estrutura: Quem age (agente)? O quê (ação)? Como (modo/meio)? Para quê (finalidade)?',
      'Todos os 4 elementos precisam aparecer de forma explícita — não subentendidos',
      'Evite propostas genéricas como "o governo deve agir" — seja específico',
    ],
  },
}

// Maintenance tip per competency when score >= 140 — "O que manter"
const MAINTAIN_TIPS: Record<string, string> = {
  c1_score: 'Domínio consistente da norma culta — continue revisando antes de entregar.',
  c2_score: 'Você mantém o foco no tema com clareza — essa disciplina é rara e valiosa.',
  c3_score: 'Argumentação sólida com repertório — continue embasando com dados e referências.',
  c4_score: 'Boa coesão textual — a variedade de conectivos já é parte do seu estilo.',
  c5_score: 'Proposta de intervenção completa e específica — mantenha os 4 elementos sempre explícitos.',
}

// Contextual first-person phrase from reviewer — shown inside the feedback card header
function generateReviewerPhrase(
  score: number,
  delta: number | null,
  weakestKey: string,
): string {
  const improving  = delta !== null && delta > 0
  const regressing = delta !== null && delta < 0
  const firstEssay = delta === null

  if (score >= 800) {
    return improving
      ? 'Evolução consistente. Os ajustes agora são de precisão — exatamente o que separa uma nota acima de 900.'
      : 'Redação de alto nível. O refinamento agora está nos detalhes que fazem a diferença entre 800 e 960.'
  }
  if (score >= 640) {
    if (firstEssay)  return 'Boa redação de partida. A partir daqui, cada ciclo vai mostrar onde você está evoluindo com mais clareza.'
    if (improving)   return 'Sua evolução é clara e vai na direção certa. Continue com essa consistência e os resultados aparecem.'
    if (regressing)  return 'Nem toda redação é igual — o importante é entender o que variou. Você tem a base para retomar.'
    return 'Redação sólida. Seu caminho agora é transformar esse patamar em consistência cíclica.'
  }
  if (score >= 480) {
    if (firstEssay) return 'Esta é sua redação de partida. Vou acompanhar sua evolução a partir daqui — o potencial para crescer é claro.'
    if (improving)  return 'Você está evoluindo — isso é o mais importante. Cada redação corrigida é um passo que a maioria dos candidatos não dá.'
    return 'Há pontos sólidos aqui e espaço concreto para crescer. As orientações desta devolutiva são o caminho mais direto.'
  }
  if (firstEssay) return 'Toda trajetória começa com um ponto de partida honesto. Esta devolutiva é o mapa — agora é sobre execução.'
  if (improving)  return 'Você está evoluindo mesmo com muito espaço pela frente. Continue submetendo — é assim que a nota sobe.'
  return `Há muito espaço para crescer, e isso é oportunidade. As orientações abaixo são diretas e aplicáveis já na próxima redação.`
}

// Personalized note — specific "Recado da corretora" for the student's next essay
function generateReviewerNote(
  delta: number | null,
  weakestKey: string,
  weakestName: string,
  weakestScore: number,
  mostImprovedName: string | null,
  mostImprovedDelta: number | null,
  keepCount: number,
  totalScore: number,
): string {
  const gap = 200 - weakestScore

  // Highlight meaningful improvement first
  if (mostImprovedDelta !== null && mostImprovedDelta >= 40 && mostImprovedName) {
    return `Notei uma evolução real em ${mostImprovedName} — +${mostImprovedDelta} pts é um salto significativo, que mostra que você aplicou o que foi trabalhado. Para a próxima redação, quero ver esse mesmo nível de atenção em ${weakestName}: ainda há ${gap} pontos disponíveis aqui, e é onde o seu crescimento vai ser mais visível.`
  }

  // Strong base, precision refinement
  if (totalScore >= 700 && keepCount >= 3) {
    return `Você já tem uma base muito sólida — ${keepCount} competências acima de 140 pontos é consistência real. O que vai fazer a diferença agora é precisão em ${weakestName}. Com ${gap} pontos ainda disponíveis, um trabalho focado aqui pode levar sua nota a outro patamar.`
  }

  // First essay — competency-specific coaching
  if (delta === null) {
    const FIRST: Record<string, string> = {
      c1_score: `Na sua primeira redação já identifiquei o padrão: a norma culta precisa de atenção sistemática. A técnica mais eficaz é simples — leia em voz alta antes de entregar. O ouvido pega o que o olho ignora. Quero ver esse cuidado na próxima.`,
      c2_score: `O que mais chamou minha atenção foi a âncora da tese ao enunciado. Antes de escrever a próxima, escreva sua tese em uma frase e pergunte: ela responde diretamente ao que foi pedido? Se não, reescreva antes de avançar.`,
      c3_score: `O potencial argumentativo aparece — mas precisa de embasamento concreto. Antes de começar a próxima redação, anote 2–3 dados, referências ou exemplos históricos que vão sustentar sua tese. Argumento sem apoio raramente passa de 80/200.`,
      c4_score: `Percebi que a coesão ainda está em desenvolvimento — os parágrafos precisam se conectar melhor entre si. Na próxima, preste atenção à última frase de cada parágrafo: ela deve criar uma ponte natural para o seguinte.`,
      c5_score: `A proposta de intervenção é o ponto que mais cresce com prática dirigida. Memorize a estrutura: agente, ação, modo e finalidade — todos os quatro precisam aparecer de forma explícita, sem subentendidos.`,
    }
    return FIRST[weakestKey] ?? `Esta foi sua redação de partida, e o mapa já está claro. Foco em ${weakestName} vai trazer os maiores ganhos nas próximas redações.`
  }

  // Returning student — per-weakness coaching note
  const RETURNING: Record<string, string> = {
    c1_score: `Quero ver uma revisão mais cuidadosa da norma culta na próxima. Reserve os últimos 5 minutos da escrita só para reler em busca de concordância e pontuação — esse hábito vale pontos diretos.`,
    c2_score: `Meu ponto de atenção para a próxima é a aderência ao tema. Antes de começar, escreva sua tese em uma frase. Se ela não responder diretamente ao enunciado, reescreva antes de avançar.`,
    c3_score: `Quero ver argumentação com mais embasamento na próxima. Antes de escrever, anote pelo menos dois dados ou referências concretas que vão sustentar sua tese. Argumento sem embasamento raramente passa de 80/200.`,
    c4_score: `Na próxima redação, quero ver mais variedade nos conectivos e melhor articulação entre parágrafos. Releia a última frase de cada parágrafo separadamente — ela deve criar uma ponte natural para o seguinte.`,
    c5_score: `Quero ver uma proposta de intervenção completa e específica na próxima. Anote mentalmente: agente, ação, modo, finalidade — os quatro precisam estar lá, de forma explícita, sem subentendidos.`,
  }
  return RETURNING[weakestKey] ?? `Meu foco para a próxima é ${weakestName}. Com ${gap} pontos ainda disponíveis, um trabalho direcionado aqui vai fazer diferença na nota.`
}

// Most urgent fix for weakest competency — "O que corrigir imediatamente"
const FIX_QUICKLY: Record<string, string> = {
  c1_score: 'Revise cada parágrafo em busca de erros de concordância e pontuação antes de entregar. Um erro evitado já vale pontos.',
  c2_score: 'Escreva sua tese em uma frase antes de começar e releia o enunciado na metade do texto. Tangência é o erro mais caro do ENEM.',
  c3_score: 'Escolha um dado concreto ou referência para cada argumento. Sem embasamento, dificilmente você passa de 80/200 nesta competência.',
  c4_score: 'Substitua conectivos repetidos por variações — "todavia", "ademais", "nesse sentido". A variedade demonstra domínio linguístico.',
  c5_score: 'Verifique explicitamente: agente, ação, modo e finalidade estão todos presentes na proposta? A falta de um elemento já reduz a nota.',
}

type PrevCorrection = {
  c1_score: number; c2_score: number; c3_score: number
  c4_score: number; c5_score: number; total_score: number
}

function scoreColor(score: number, max = 200) {
  const pct = score / max
  if (pct >= 0.8) return { bar: 'bg-green-500',  text: 'text-green-400',  bg: 'bg-green-500/10' }
  if (pct >= 0.6) return { bar: 'bg-purple-500', text: 'text-purple-400', bg: 'bg-purple-500/10' }
  return                  { bar: 'bg-amber-500',  text: 'text-amber-400',  bg: 'bg-amber-500/10' }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

/**
 * Escapes HTML special characters to prevent XSS before markdown transforms.
 * Must be called on raw text BEFORE any dangerouslySetInnerHTML rendering.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Renders the reviewer's markdown feedback with visual cues:
 * - ✅ lines → green callout box (positive points)
 * - ⚠️ lines → amber callout box (improvement areas)
 * - --- → visual divider
 * - **bold** → <strong>
 * - single \n → <br />
 *
 * HTML is escaped first to prevent XSS from reviewer-controlled content.
 */
function renderFeedback(text: string) {
  const paragraphs = text.split(/\n{2,}/)
  return paragraphs.map((para, i) => {
    // Escape HTML entities first, then apply safe markdown transforms
    const trimmed = escapeHtml(para.trim())

    // Section headers with special styling
    if (trimmed.startsWith('✅') || trimmed.toLowerCase().startsWith('✅')) {
      const html = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-green-300">$1</strong>')
      return (
        <div key={i} className="rounded-xl bg-green-500/[0.06] border border-green-500/15 px-4 py-3 mb-4">
          <p className="text-sm text-green-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )
    }

    if (trimmed.startsWith('⚠️') || trimmed.startsWith('⚠')) {
      const html = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-amber-300">$1</strong>')
      return (
        <div key={i} className="rounded-xl bg-amber-500/[0.06] border border-amber-500/15 px-4 py-3 mb-4">
          <p className="text-sm text-amber-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )
    }

    if (trimmed === '---' || trimmed === '—') {
      return <hr key={i} className="border-white/[0.06] my-4" />
    }

    const html = trimmed
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      .replace(/\n/g, '<br />')
      .replace(/⭐/g, '<span class="text-amber-400">⭐</span>')
    return (
      <p key={i} className="text-sm text-gray-400 leading-relaxed mb-4"
        dangerouslySetInnerHTML={{ __html: html }} />
    )
  })
}

type Correction = {
  c1_score: number; c2_score: number; c3_score: number
  c4_score: number; c5_score: number; total_score: number
  reviewer_name: string; corrected_at: string; general_feedback: string
}
type Essay = {
  id: string; theme_title: string; status: string
  submitted_at: string; content_text: string | null; student_id: string
  corrections: Correction[]
}

export default async function DevolutivaPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [{ data: essayRaw }, { data: prevRaw }] = await Promise.all([
    db.from('essays')
      .select('id, theme_title, status, submitted_at, content_text, student_id, corrections(c1_score, c2_score, c3_score, c4_score, c5_score, total_score, reviewer_name, corrected_at, general_feedback)')
      .eq('id', params.id)
      .single(),
    // Fetch the most recent corrected essay by this student (other than this one) for comparison
    db.from('essays')
      .select('corrections(c1_score, c2_score, c3_score, c4_score, c5_score, total_score)')
      .eq('student_id', user.id)
      .eq('status', 'corrected')
      .neq('id', params.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const essay = essayRaw as Essay | null
  if (!essay || essay.student_id !== user.id) notFound()

  const correction = essay.corrections?.[0] ?? null

  /* ── Waiting state ─────────────────────────────────────────────── */
  if (!correction) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/aluno/redacoes" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-white">{essay.theme_title}</h1>
        </div>
        <div className="card-dark rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-1">
            {essay.status === 'in_review' ? 'A corretora está revisando sua redação' : 'Redação na fila de correção'}
          </h3>
          <p className="text-gray-600 text-sm">Sua devolutiva estará pronta em até 24h a partir do envio.</p>
        </div>

        {essay.content_text && (() => {
          const isImage = essay.content_text!.startsWith('[IMAGEM] ')
          const imageUrl = isImage ? essay.content_text!.slice('[IMAGEM] '.length) : null
          return (
            <div className="mt-5 card-dark rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Sua redação</h2>
                {!isImage && (
                  <span className="text-xs text-gray-600">{essay.content_text!.trim().split(/\s+/).length} palavras</span>
                )}
              </div>
              {isImage && imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Sua redação" className="w-full rounded-xl border border-white/[0.08] object-contain" />
              ) : (
                <div className="text-sm text-gray-300 leading-[1.9] whitespace-pre-wrap border-l-2 border-white/[0.06] pl-4">
                  {essay.content_text}
                </div>
              )}
            </div>
          )
        })()}
      </div>
    )
  }

  const prevCorrection = (prevRaw as { corrections: PrevCorrection[] } | null)?.corrections?.[0] ?? null
  const totalDelta     = prevCorrection ? correction.total_score - prevCorrection.total_score : null

  // Per-competency scores with comparison to previous essay
  const compData = COMPETENCIES.map(c => {
    const score     = correction[c.key]
    const prevScore = prevCorrection ? (prevCorrection[c.key] as number) : null
    return { ...c, score, prevScore, delta: prevScore !== null ? score - prevScore : null }
  })

  const weakest          = compData.reduce((a, b) => a.score <= b.score ? a : b)
  const positiveDeltas   = compData.filter(c => (c.delta ?? 0) > 0)
  const mostImproved     = positiveDeltas.length > 0
    ? positiveDeltas.reduce((a, b) => a.delta! >= b.delta! ? a : b)
    : null

  const plan       = PLAN_ACTIONS[weakest.key]
  const keepComps  = compData.filter(c => c.score >= 140)
  const fixComp    = weakest
  const nextTarget = correction.total_score + 40

  const reviewerPhrase = generateReviewerPhrase(correction.total_score, totalDelta, weakest.key)
  const reviewerNote   = generateReviewerNote(
    totalDelta,
    weakest.key,
    weakest.name,
    weakest.score,
    mostImproved ? mostImproved.name : null,
    mostImproved ? mostImproved.delta : null,
    keepComps.length,
    correction.total_score,
  )

  return (
    <div className="max-w-4xl">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-start gap-3">
          <Link href="/aluno/redacoes" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all mt-0.5 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border bg-green-500/10 border-green-500/20 text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Devolutiva pronta
              </span>
            </div>
            <h1 className="text-xl font-bold text-white leading-snug">{essay.theme_title}</h1>
            <p className="text-xs mt-0.5 text-gray-500">
              Corrigida por{' '}
              <span className="text-gray-300 font-medium">{correction.reviewer_name}</span>
              {' '}· {formatDate(correction.corrected_at)}
            </p>
          </div>
        </div>
        <Link href="/aluno/redacoes/nova" className="btn-primary self-start sm:self-auto text-sm py-2 px-4 flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Enviar próxima redação
        </Link>
      </div>

      {/* ── 1. Score hero + Comparação ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        {/* Total + delta */}
        <div className="card-dark rounded-2xl p-6 flex flex-col justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pontuação total</p>
          <div>
            <div className="text-6xl font-extrabold text-white leading-none">{correction.total_score}</div>
            <div className="text-sm text-gray-600 mt-1">de 1000 pontos</div>
            {totalDelta !== null && (
              <div className={`inline-flex items-center gap-1 mt-3 text-xs font-semibold rounded-full px-2.5 py-1 ${
                totalDelta > 0 ? 'text-green-400 bg-green-500/10 border border-green-500/20' :
                totalDelta < 0 ? 'text-red-400 bg-red-500/10 border border-red-500/20' :
                                 'text-gray-400 bg-white/[0.06] border border-white/[0.08]'
              }`}>
                <TrendingUp size={10} />
                {totalDelta > 0 ? `+${totalDelta}` : totalDelta} vs redação anterior
              </div>
            )}
          </div>
          <div className="mt-4 h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
              style={{ width: `${(correction.total_score / 1000) * 100}%` }}
            />
          </div>
        </div>

        {/* 2. Competências com delta ─────────────────────────────── */}
        <div className="sm:col-span-2 card-dark rounded-2xl p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Por competência</p>
          <div className="space-y-3.5">
            {compData.map(c => {
              const { bar, text } = scoreColor(c.score)
              const pct = (c.score / 200) * 100
              return (
                <div key={c.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-gray-500 w-5">{c.label}</span>
                      <span className="text-xs text-gray-400">{c.name}</span>
                      {c.key === weakest.key && (
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-1.5 py-0.5">🎯 foco</span>
                      )}
                      {mostImproved && c.key === mostImproved.key && (
                        <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-1.5 py-0.5">↑ evoluiu</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {c.delta !== null && c.delta !== 0 && (
                        <span className={`text-[10px] font-bold tabular-nums ${c.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {c.delta > 0 ? '+' : ''}{c.delta}
                        </span>
                      )}
                      <span className={`text-xs font-bold ${text}`}>
                        {c.score}<span className="text-gray-600 font-normal">/200</span>
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${bar} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── 3. Resumo desta devolutiva ─────────────────────────── */}
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">📋</span>
          <h2 className="text-sm font-bold text-white">Resumo desta devolutiva</h2>
        </div>

        {/* O que manter */}
        {keepComps.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-green-400 mb-2">✅ Seus pontos sólidos</p>
            <div className="space-y-2">
              {keepComps.map(c => (
                <div key={c.key} className="flex items-center gap-3 rounded-xl bg-green-500/[0.04] border border-green-500/10 px-4 py-3">
                  <span className="text-xs font-bold text-green-400 flex-shrink-0 w-5">{c.label}</span>
                  <p className="text-xs text-gray-300 leading-relaxed flex-1">{MAINTAIN_TIPS[c.key]}</p>
                  <span className="text-xs font-bold text-green-400 tabular-nums flex-shrink-0">{c.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* O que corrigir imediatamente */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-amber-400 mb-2">🔧 O que corrigir imediatamente</p>
          <div className="rounded-xl bg-amber-500/[0.05] border border-amber-500/15 px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-amber-400">{fixComp.label} — {fixComp.name}</span>
              <span className="ml-auto text-xs font-bold text-amber-400 tabular-nums">{fixComp.score}/200</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{FIX_QUICKLY[fixComp.key]}</p>
            <p className="text-[10px] text-amber-400/60 mt-2">
              {200 - fixComp.score} pts ainda disponíveis nesta competência — a maior oportunidade desta devolutiva.
            </p>
          </div>
        </div>

        {/* Meta para a próxima */}
        <div>
          <p className="text-xs font-semibold text-purple-400 mb-2">🏆 Meta para a próxima</p>
          <div className="rounded-xl bg-purple-500/[0.06] border border-purple-500/15 px-4 py-3">
            <p className="text-sm font-bold text-white mb-1">
              Atingir <span className="text-purple-300">{nextTarget} pontos</span>
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              +40 pts em relação a esta redação, equivalente a um nível acima em {fixComp.label} — {fixComp.name}.
            </p>
            {totalDelta !== null && totalDelta > 0 && (
              <p className="text-[10px] text-purple-400/70 mt-1.5">
                Você já ganhou +{totalDelta} pts desde a última redação — a trajetória está no rumo certo.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. Feedback da corretora ────────────────────────────── */}
      <div className="card-dark rounded-2xl p-6 mb-6">
        {/* Reviewer presence — prominent */}
        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-white/[0.06]">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-700/30 to-purple-900/20 border border-purple-500/30 flex items-center justify-center text-base font-bold text-purple-200 flex-shrink-0">
            {correction.reviewer_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <p className="text-sm font-bold text-white">{correction.reviewer_name}</p>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                Especialista ENEM
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{reviewerPhrase}</p>
          </div>
        </div>
        {/* Feedback content */}
        <div className="prose-feedback">
          {renderFeedback(correction.general_feedback)}
        </div>
        {/* Reviewer sign-off */}
        <div className="mt-5 pt-5 border-t border-white/[0.06] flex items-center justify-between">
          <p className="text-xs text-gray-600 italic">— {correction.reviewer_name} · Especialista ENEM</p>
          <p className="text-xs text-gray-700">{formatDate(correction.corrected_at)}</p>
        </div>
      </div>

      {/* ── 4b. Recado da corretora ─────────────────────────────── */}
      <div className="rounded-2xl border border-amber-500/[0.18] bg-amber-500/[0.03] p-5 mb-6">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-amber-400">Recado da corretora</p>
            <p className="text-[10px] text-amber-400/50">{correction.reviewer_name} · para a sua próxima redação</p>
          </div>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{reviewerNote}</p>
      </div>

      {/* ── 5. Plano para a próxima ─────────────────────────────── */}
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">🎯</span>
          <h2 className="text-sm font-bold text-white">Plano para a próxima redação</h2>
        </div>

        {/* Week focus */}
        <div className="rounded-xl bg-amber-500/[0.05] border border-amber-500/15 p-4 mb-4">
          <p className="text-xs font-semibold text-amber-400 mb-1">Foco da semana</p>
          <p className="text-sm font-bold text-white">
            {weakest.label} — {plan.weekFocus}
          </p>
          <p className="text-xs text-amber-400/70 mt-0.5">
            Sua maior oportunidade de ganho de pontos agora.
          </p>
        </div>

        {/* 3 specific actions */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">3 ações práticas</p>
        <div className="space-y-2.5 mb-5">
          {plan.actions.map((action, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-600/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-purple-400">{i + 1}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{action}</p>
            </div>
          ))}
        </div>

        {/* Most improved — positive reinforcement */}
        {mostImproved && (
          <div className="rounded-xl bg-green-500/[0.05] border border-green-500/15 p-4 mb-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={13} className="text-green-400" />
              <p className="text-xs font-semibold text-green-400">
                {mostImproved.label} evoluiu +{mostImproved.delta} pontos
              </p>
            </div>
            <p className="text-xs text-green-400/70">
              Continue com essa estratégia — você está no caminho certo.
            </p>
          </div>
        )}

        {/* CTA */}
        <Link href="/aluno/redacoes/nova" className="btn-primary w-full justify-center">
          Aplicar e enviar próxima redação
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* ── 6. Texto / imagem da redação (contexto) ─────────────── */}
      {essay.content_text && (() => {
        const isImage = essay.content_text!.startsWith('[IMAGEM] ')
        const imageUrl = isImage ? essay.content_text!.slice('[IMAGEM] '.length) : null
        return (
          <div className="card-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Sua redação</h2>
              {!isImage && (
                <span className="text-xs text-gray-600">{essay.content_text!.trim().split(/\s+/).length} palavras</span>
              )}
            </div>
            {isImage && imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Sua redação" className="w-full rounded-xl border border-white/[0.08] object-contain" />
            ) : (
              <div className="text-sm text-gray-300 leading-[1.9] whitespace-pre-wrap border-l-2 border-white/[0.06] pl-4">
                {essay.content_text}
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}
