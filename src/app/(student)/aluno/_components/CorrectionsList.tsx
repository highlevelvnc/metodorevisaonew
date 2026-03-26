import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock, FileText, AlertCircle } from 'lucide-react'

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

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  corrected: {
    label: 'Corrigida',
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
    icon:  <CheckCircle2 size={11} />,
  },
  in_review: {
    label: 'Em análise',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon:  <Clock size={11} />,
  },
  pending: {
    label: 'Aguardando',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon:  <Clock size={11} />,
  },
  draft: {
    label: 'Rascunho',
    color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    icon:  <FileText size={11} />,
  },
}

function scoreColor(score: number): string {
  if (score >= 800) return 'text-green-400'
  if (score >= 600) return 'text-purple-400'
  if (score >= 400) return 'text-amber-400'
  return 'text-red-400'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function ScoreBar({ score, max = 200 }: { score: number; max?: number }) {
  const pct = Math.min(100, (score / max) * 100)
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-purple-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function EssayRow({ essay }: { essay: EssayData }) {
  const correction = essay.corrections?.[0] ?? null
  const status     = STATUS_LABELS[essay.status] ?? STATUS_LABELS['pending']
  const compKeys   = ['c1_score','c2_score','c3_score','c4_score','c5_score'] as const

  return (
    <Link
      href={`/aluno/redacoes/${essay.id}`}
      className="group flex items-start gap-3.5 p-3.5 rounded-xl hover:bg-white/[0.03] transition-colors"
    >
      {/* Status icon column */}
      <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${status.color}`}>
        {status.icon}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-medium text-gray-200 leading-tight line-clamp-1 group-hover:text-white transition-colors">
            {essay.theme_title || 'Tema não informado'}
          </p>
          <span className="text-xs text-gray-600 shrink-0">{formatDate(essay.submitted_at)}</span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${status.color}`}>
            {status.icon}
            {status.label}
          </span>
          {correction && (
            <span className={`text-sm font-bold ${scoreColor(correction.total_score)}`}>
              {correction.total_score} pts
            </span>
          )}
          {correction?.reviewer_name && (
            <span className="text-[10px] text-gray-600">por {correction.reviewer_name}</span>
          )}
        </div>

        {/* Competency bars — only if corrected */}
        {correction && (
          <div className="grid grid-cols-5 gap-x-2 gap-y-1">
            {compKeys.map((key, i) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[9px] text-gray-600">C{i + 1}</span>
                  <span className="text-[9px] text-gray-500">{correction[key]}</span>
                </div>
                <ScoreBar score={correction[key]} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Arrow */}
      <ArrowRight size={14} className="text-gray-700 group-hover:text-gray-400 transition-colors mt-1 shrink-0" />
    </Link>
  )
}

export function CorrectionsList({ essays }: CorrectionsListProps) {
  const displayed = essays.slice(0, 6)

  return (
    <div className="card-dark rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Minhas Redações</h2>
          <p className="text-xs text-gray-600 mt-0.5">Histórico e devolutivas</p>
        </div>
        <Link
          href="/aluno/redacoes"
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          Ver todas <ArrowRight size={11} />
        </Link>
      </div>

      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <FileText size={20} className="text-gray-600" />
          </div>
          <p className="text-sm text-gray-500 text-center">Nenhuma redação enviada ainda.</p>
          <Link href="/aluno/redacoes/nova" className="btn-primary text-sm py-2 px-4">
            Enviar primeira redação
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {displayed.map(essay => (
            <EssayRow key={essay.id} essay={essay} />
          ))}
        </div>
      )}

      {essays.length > 6 && (
        <div className="mt-3 pt-3 border-t border-white/[0.05]">
          <Link
            href="/aluno/redacoes"
            className="w-full text-center text-xs text-gray-500 hover:text-gray-400 transition-colors block py-1"
          >
            Ver mais {essays.length - 6} redaç{essays.length - 6 === 1 ? 'ão' : 'ões'}
          </Link>
        </div>
      )}
    </div>
  )
}
