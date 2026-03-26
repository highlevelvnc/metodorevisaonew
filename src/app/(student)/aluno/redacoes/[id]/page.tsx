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
  { key: 'c1_score' as const, label: 'C1', name: 'Domínio da Norma Culta',    desc: 'Ortografia, acentuação, gramática e vocabulário' },
  { key: 'c2_score' as const, label: 'C2', name: 'Compreensão da Proposta',   desc: 'Adequação ao tema e ao tipo textual' },
  { key: 'c3_score' as const, label: 'C3', name: 'Seleção de Argumentos',     desc: 'Autoria, repertório e defesa de ponto de vista' },
  { key: 'c4_score' as const, label: 'C4', name: 'Mecanismos de Coesão',      desc: 'Coerência, coesão e conectivos' },
  { key: 'c5_score' as const, label: 'C5', name: 'Proposta de Intervenção',   desc: 'Agente, ação, modo e finalidade' },
]

// Actionable coaching tip per competency shown in "Plano para a próxima" section
const NEXT_STEP_TIPS: Record<string, string> = {
  c1_score: 'Releia em voz alta antes de entregar — ajuda a capturar erros de concordância, pontuação e ortografia que passam despercebidos na leitura silenciosa.',
  c2_score: 'Sublinhe as palavras-chave do tema e escreva sua tese em uma frase antes de escrever. Garante que cada parágrafo sirva essa ideia central.',
  c3_score: 'Pesquise 2-3 dados, estudos ou referências históricas antes de escrever. Argumentos sem repertório raramente passam de 80/200.',
  c4_score: 'Varie os conectivos: "Ademais", "Nesse sentido", "Por outro lado", "Desse modo". Evite repetir "porém" e "mas" — isso limita a C4.',
  c5_score: 'Use a estrutura completa: Quem age (agente)? O quê (ação)? Como (modo/meio)? Para quê (finalidade)? Todos os 4 precisam aparecer explicitamente.',
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

function renderFeedback(text: string) {
  // Split on one or more blank lines to get paragraphs
  return text.split(/\n{2,}/).map((para, i) => {
    const html = para
      // Bold: **text**
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      // Single line breaks → <br>
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
          <p className="text-gray-600 text-sm">Sua devolutiva estará pronta em até 48h a partir do envio.</p>
        </div>

        {/* Texto / imagem da redação */}
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
            <p className="text-gray-600 text-xs mt-0.5">
              Corrigida por {correction.reviewer_name} · {formatDate(correction.corrected_at)}
            </p>
          </div>
        </div>
        <Link href="/aluno/redacoes/nova" className="btn-primary self-start sm:self-auto text-sm py-2 px-4 flex-shrink-0">
          + Nova redação
        </Link>
      </div>

      {/* ── Score hero + C1-C5 ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        {/* Total */}
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

        {/* C1-C5 */}
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
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-1.5 py-0.5">foco</span>
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

      {/* ── Feedback da corretora ───────────────────────────────── */}
      <div className="card-dark rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-full bg-purple-600/20 border border-purple-500/25 flex items-center justify-center text-sm font-bold text-purple-300 flex-shrink-0">
            {correction.reviewer_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{correction.reviewer_name}</p>
            <p className="text-xs text-gray-600">Corretora especialista · ENEM</p>
          </div>
        </div>
        <div className="prose-feedback">
          {renderFeedback(correction.general_feedback)}
        </div>
      </div>

      {/* ── Texto / imagem da redação ──────────────────────────── */}
      {essay.content_text && (() => {
        const isImage = essay.content_text!.startsWith('[IMAGEM] ')
        const imageUrl = isImage ? essay.content_text!.slice('[IMAGEM] '.length) : null
        return (
          <div className="card-dark rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Sua redação</h2>
              {!isImage && (
                <span className="text-xs text-gray-600">{essay.content_text!.trim().split(/\s+/).length} palavras</span>
              )}
            </div>
            {isImage && imageUrl ? (
              <img src={imageUrl} alt="Sua redação" className="w-full rounded-xl border border-white/[0.08] object-contain" />
            ) : (
              <div className="text-sm text-gray-300 leading-[1.9] whitespace-pre-wrap border-l-2 border-white/[0.06] pl-4">
                {essay.content_text}
              </div>
            )}
          </div>
        )
      })()}

      {/* ── Plano para a próxima ────────────────────────────────── */}
      <div className="card-dark rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white">🎯 Plano para a próxima redação</h2>

        {/* Weakest comp — specific actionable coaching tip */}
        <div className="flex items-start gap-3 rounded-xl bg-amber-500/[0.05] border border-amber-500/15 p-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-300">{weakest.label} – {weakest.name}</p>
            <p className="text-xs text-amber-400/80 mt-0.5 leading-relaxed">{NEXT_STEP_TIPS[weakest.key]}</p>
          </div>
        </div>

        {/* Most improved — positive reinforcement (only if comparing to a previous essay) */}
        {mostImproved && (
          <div className="flex items-start gap-3 rounded-xl bg-green-500/[0.05] border border-green-500/15 p-4">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <TrendingUp size={14} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-300">
                {mostImproved.label} evoluiu +{mostImproved.delta} pontos
              </p>
              <p className="text-xs text-green-400/75 mt-0.5">
                Continue com essa estratégia — você está no caminho certo.
              </p>
            </div>
          </div>
        )}

        <Link href="/aluno/redacoes/nova" className="btn-primary w-full justify-center">
          Aplicar e enviar próxima redação
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}
