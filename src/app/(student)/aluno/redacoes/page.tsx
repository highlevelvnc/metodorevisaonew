import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Minhas Redações',
  robots: { index: false, follow: false },
}

type EssayStatus = 'pending' | 'in_review' | 'corrected'

const STATUS_CONFIG: Record<EssayStatus, { label: string; dot: string; text: string; bg: string }> = {
  pending:   { label: 'Aguardando',        dot: 'bg-gray-500',               text: 'text-gray-400',  bg: 'bg-gray-500/10 border-gray-500/20' },
  in_review: { label: 'Em revisão',        dot: 'bg-blue-400 animate-pulse', text: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/20' },
  corrected: { label: 'Devolutiva pronta', dot: 'bg-green-400',              text: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
}

function relativeDate(iso: string | null | undefined) {
  if (!iso) return '—'
  const ms = new Date(iso).getTime()
  if (isNaN(ms)) return '—'
  const diff = Date.now() - ms
  if (diff < 0) return 'agora'
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return 'há menos de 1h'
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  return `há ${d} dia${d !== 1 ? 's' : ''}`
}

type CorrectionBrief = {
  total_score: number
  c1_score: number; c2_score: number; c3_score: number; c4_score: number; c5_score: number
}
type Essay = {
  id: string; theme_title: string; status: EssayStatus
  submitted_at: string; corrections: CorrectionBrief[]
}

// Shared inner card content — rendered inside either <Link> or <div>
function EssayCardContent({
  essay,
  cfg,
  correction,
  delta,
}: {
  essay: Essay
  cfg: (typeof STATUS_CONFIG)[EssayStatus]
  correction: CorrectionBrief | null
  delta: number | null
}) {
  const isCorrected = essay.status === 'corrected'
  return (
    <>
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
        {isCorrected ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-400">
            <path d="M9 12l2 2 4-4" />
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        ) : essay.status === 'in_review' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white line-clamp-1 mb-1">{essay.theme_title}</p>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
          <span className="text-xs text-gray-600">{relativeDate(essay.submitted_at)}</span>
        </div>
      </div>

      {/* Score (if corrected) */}
      {isCorrected && correction && (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xl font-bold text-white leading-none">{correction.total_score}</p>
            <p className="text-xs text-gray-600">/ 1000</p>
          </div>
          {delta !== null && (
            <div className={`text-xs font-semibold rounded-full px-2 py-0.5 border ${
              delta >= 0
                ? 'text-green-400 bg-green-500/10 border-green-500/20'
                : 'text-red-400 bg-red-500/10 border-red-500/20'
            }`}>
              {delta >= 0 ? '+' : ''}{delta}
            </div>
          )}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="text-gray-700 group-hover:text-purple-400 transition-colors flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      )}

      {/* Pending info */}
      {!isCorrected && (
        <p className="text-xs text-gray-600 sm:text-right flex-shrink-0">
          {essay.status === 'in_review' ? 'Corretora está trabalhando' : 'Entrega em até 24h'}
        </p>
      )}
    </>
  )
}

export default async function RedacoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: essaysRaw } = await (supabase as any)
    .from('essays')
    .select('id, theme_title, status, submitted_at, corrections(total_score, c1_score, c2_score, c3_score, c4_score, c5_score)')
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(200)

  const VALID_STATUSES = new Set(['pending', 'in_review', 'corrected'])
  const essays: Essay[] = (essaysRaw ?? []).filter((e: unknown) => {
    if (!e || typeof (e as Essay).id !== 'string') return false
    if (typeof (e as Essay).submitted_at !== 'string') return false
    const s = (e as Essay).status
    if (!VALID_STATUSES.has(s)) return false
    if (!Array.isArray((e as Essay).corrections)) return false
    return true
  })
  const correctedEssays = essays.filter(e => e.status === 'corrected' && (e.corrections?.length ?? 0) > 0)

  return (
    <div className="max-w-3xl">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Minhas Redações</h1>
          <p className="text-gray-500 text-sm">
            {essays.length} redaç{essays.length === 1 ? 'ão' : 'ões'} enviada{essays.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/aluno/redacoes/nova" className="btn-primary self-start sm:self-auto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Enviar próxima redação
        </Link>
      </div>

      {/* ── Evolução ────────────────────────────────────────────── */}
      {correctedEssays.length >= 2 && (() => {
        const firstScore = correctedEssays[correctedEssays.length - 1].corrections[0]?.total_score ?? 0
        const lastScore  = correctedEssays[0].corrections[0]?.total_score ?? 0
        const diff       = lastScore - firstScore
        const sparkData  = correctedEssays.slice(0, 8).reverse() // last 8, oldest first
        const maxScore   = Math.max(...sparkData.map(e => e.corrections[0]?.total_score ?? 0))

        // Best competency from the most recent correction
        const lastCorr = correctedEssays[0].corrections?.[0]
        const compKeys  = ['c1_score', 'c2_score', 'c3_score', 'c4_score', 'c5_score'] as const
        const compLabels: Record<string, string> = { c1_score: 'C1', c2_score: 'C2', c3_score: 'C3', c4_score: 'C4', c5_score: 'C5' }
        const bestKey  = lastCorr ? compKeys.reduce((a, b) => (lastCorr[a] ?? 0) >= (lastCorr[b] ?? 0) ? a : b) : 'c5_score'

        return (
          <div className="card-dark rounded-2xl p-5 mb-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-2">Sua evolução</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white tabular-nums">{lastScore}</span>
                  <span className="text-xs text-gray-600">pontos · última redação</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  {diff !== 0 && (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-0.5 ${
                      diff > 0
                        ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                        : 'text-red-400 bg-red-500/10 border border-red-500/20'
                    }`}>
                      {diff > 0 ? `↑ +${diff}` : `↓ ${diff}`} desde a primeira
                    </span>
                  )}
                  <span className="text-xs text-gray-600">
                    Melhor: <span className="text-purple-400 font-medium">{compLabels[bestKey]}</span>
                  </span>
                </div>
              </div>
              {/* Mini sparkline */}
              <div className="flex items-end gap-1 h-10 flex-shrink-0 self-end pb-0.5">
                {sparkData.map((essay, i) => {
                  const score  = essay.corrections[0]?.total_score ?? 0
                  const h      = maxScore > 0 ? Math.max(Math.round((score / maxScore) * 36), 3) : 3
                  const isLast = i === sparkData.length - 1
                  return (
                    <div
                      key={essay.id}
                      className={`w-4 rounded-sm ${isLast ? 'bg-purple-400' : 'bg-white/[0.10]'}`}
                      style={{ height: `${h}px` }}
                      title={String(score)}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}

      {essays.length === 0 ? (
        <div className="card-dark rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-1">Nenhuma redação ainda</h3>
          <p className="text-gray-600 text-sm mb-5 max-w-xs mx-auto">
            Envie sua primeira redação e receba uma análise detalhada em até 24h
          </p>
          <Link href="/aluno/redacoes/nova" className="btn-primary text-sm">
            Enviar primeira redação
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {essays.map((essay, index) => {
            const cfg        = STATUS_CONFIG[essay.status] ?? STATUS_CONFIG.pending
            const isCorrected = essay.status === 'corrected'
            const correction  = essay.corrections?.[0] ?? null
            // Delta: difference with the previous corrected essay
            const correctedIdx  = correctedEssays.findIndex(e => e.id === essay.id)
            const prevScore     = correctedIdx >= 0 && correctedIdx + 1 < correctedEssays.length
              ? correctedEssays[correctedIdx + 1].corrections?.[0]?.total_score ?? null
              : null
            const delta = correction && prevScore !== null ? correction.total_score - prevScore : null

            const baseClass = `card-dark rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-200`
            const hoverClass = isCorrected ? ' hover:border-purple-600/30 hover:-translate-y-0.5 cursor-pointer group' : ''

            return isCorrected ? (
              <Link key={essay.id} href={`/aluno/redacoes/${essay.id}`} className={baseClass + hoverClass}>
                <EssayCardContent essay={essay} cfg={cfg} correction={correction} delta={delta} />
              </Link>
            ) : (
              <div key={essay.id} className={baseClass}>
                <EssayCardContent essay={essay} cfg={cfg} correction={correction} delta={delta} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
