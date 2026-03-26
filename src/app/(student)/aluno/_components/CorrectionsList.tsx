import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock, FileText, Plus } from 'lucide-react'

type CorrectionData = {
  c1_score: number; c2_score: number; c3_score: number
  c4_score: number; c5_score: number; total_score: number
  reviewer_name: string; corrected_at: string
}
type EssayData = {
  id: string; theme_title: string; status: string
  submitted_at: string; corrections: CorrectionData[]
}

interface CorrectionsListProps {
  essays: EssayData[]
}

const STATUS_CONFIG: Record<string, { label: string; pill: string; icon: React.ReactNode }> = {
  corrected: {
    label: 'Corrigida',
    pill: 'bg-green-500/10 text-green-400 border-green-500/20',
    icon: <CheckCircle2 size={10} />,
  },
  in_review: {
    label: 'Em análise',
    pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: <Clock size={10} />,
  },
  pending: {
    label: 'Aguardando',
    pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: <Clock size={10} />,
  },
  draft: {
    label: 'Rascunho',
    pill: 'bg-white/[0.05] text-gray-500 border-white/[0.08]',
    icon: <FileText size={10} />,
  },
}

const compKeys = ['c1_score','c2_score','c3_score','c4_score','c5_score'] as const

function scoreColor(score: number) {
  if (score >= 800) return 'text-green-400'
  if (score >= 600) return 'text-purple-400'
  if (score >= 400) return 'text-amber-400'
  return 'text-red-400'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function MiniBar({ score }: { score: number }) {
  const pct = Math.min(100, (score / 200) * 100)
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-purple-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500/80'
  return (
    <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function EssayRow({ essay }: { essay: EssayData }) {
  const correction = essay.corrections?.[0] ?? null
  const cfg        = STATUS_CONFIG[essay.status] ?? STATUS_CONFIG['pending']

  return (
    <Link
      href={`/aluno/redacoes/${essay.id}`}
      className="group flex items-start gap-3 px-4 py-3.5 rounded-xl hover:bg-white/[0.03] transition-colors -mx-1"
    >
      {/* Status indicator */}
      <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${cfg.pill}`}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <p className="text-sm font-medium text-gray-300 leading-snug line-clamp-1 group-hover:text-white transition-colors">
            {essay.theme_title || 'Tema não informado'}
          </p>
          <span className="text-[11px] text-gray-700 shrink-0 tabular-nums">{formatDate(essay.submitted_at)}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${cfg.pill}`}>
            {cfg.icon}
            {cfg.label}
          </span>
          {correction && (
            <>
              <span className={`text-sm font-bold tabular-nums ${scoreColor(correction.total_score)}`}>
                {correction.total_score} pts
              </span>
              {correction.reviewer_name && (
                <span className="text-[10px] text-gray-700 truncate hidden sm:block">
                  por {correction.reviewer_name}
                </span>
              )}
            </>
          )}
        </div>

        {/* Competency bars */}
        {correction && (
          <div className="mt-2.5 grid grid-cols-5 gap-2">
            {compKeys.map((key, i) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-medium text-gray-700">C{i + 1}</span>
                  <span className="text-[9px] text-gray-600 tabular-nums">{correction[key]}</span>
                </div>
                <MiniBar score={correction[key]} />
              </div>
            ))}
          </div>
        )}
      </div>

      <ArrowRight
        size={14}
        className="mt-1.5 shrink-0 text-gray-700 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"
      />
    </Link>
  )
}

export function CorrectionsList({ essays }: CorrectionsListProps) {
  const displayed = essays.slice(0, 6)

  return (
    <div className="card-dark rounded-2xl p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-[13px] font-semibold text-white">Minhas Redações</h2>
          <p className="text-[11px] text-gray-600 mt-0.5">Histórico e devolutivas</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/aluno/redacoes/nova"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-purple-600/15 border border-purple-500/25 text-purple-400 hover:bg-purple-600/25 hover:text-purple-300 transition-all"
          >
            <Plus size={11} />
            Nova
          </Link>
          <Link
            href="/aluno/redacoes"
            className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1"
          >
            Ver todas <ArrowRight size={10} />
          </Link>
        </div>
      </div>

      <div className="my-4 h-px bg-white/[0.05]" />

      {/* List */}
      <div className="flex-1">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
                <FileText size={22} className="text-gray-700" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <Plus size={12} className="text-purple-400" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400 mb-1">Nenhuma redação enviada</p>
              <p className="text-[11px] text-gray-600 max-w-[200px] leading-relaxed">
                Envie sua primeira redação e receba uma devolutiva detalhada C1–C5.
              </p>
            </div>
            <Link href="/aluno/redacoes/nova" className="btn-primary py-2 px-5 text-xs">
              Enviar primeira redação
            </Link>
          </div>
        ) : (
          <div className="space-y-0.5">
            {displayed.map(essay => (
              <EssayRow key={essay.id} essay={essay} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {essays.length > 6 && (
        <div className="mt-4 pt-4 border-t border-white/[0.05]">
          <Link
            href="/aluno/redacoes"
            className="flex items-center justify-center gap-1.5 text-[11px] text-gray-600 hover:text-gray-400 transition-colors py-1 w-full"
          >
            Mais {essays.length - 6} redaç{essays.length - 6 !== 1 ? 'ões' : 'ão'} no histórico
            <ArrowRight size={10} />
          </Link>
        </div>
      )}
    </div>
  )
}
