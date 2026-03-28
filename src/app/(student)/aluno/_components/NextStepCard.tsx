import Link from 'next/link'
import { PenLine, Clock, Eye, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react'

// ─── State machine ───────────────────────────────────────────────────────────
//
// PRIORITY ORDER (strict — first match wins, no overlapping states):
//
//   P0  no_essays           — user has never submitted → first essay CTA
//   P1  correction_ready    — corrected + viewed_at IS NULL → see correction now
//   P2  waiting_correction  — essays in pending/in_review → waiting state
//   P3  low_credits         — 0 credits, no pending, no unviewed → upgrade CTA
//   P4  viewed_correction   — default: all corrections viewed → next essay CTA
//
// Rationale:
// - P0 is highest because first essay is the activation gate.
// - P1 > P2: seeing a ready correction is more valuable than knowing another is pending.
// - P3 only fires when there's nothing actionable left except upgrading.
// - P4 is the steady-state loop driver.

type StepCase =
  | 'no_essays'
  | 'correction_ready'
  | 'waiting_correction'
  | 'low_credits'
  | 'viewed_correction'

interface NextStepConfig {
  case: StepCase
  icon: React.ReactNode
  headline: string
  subtext: string
  ctaLabel: string
  ctaHref: string
  accent: string
  ctaClass: string
}

interface NextStepCardProps {
  totalEssays: number
  pendingCount: number
  /** ID of most recently corrected essay (null if none corrected yet) */
  lastCorrectedEssayId: string | null
  /** Real DB field: corrections.viewed_at IS NULL for last corrected essay */
  hasUnviewedCorrection: boolean
  creditsLeft: number
  lastScore: number | null
}

function resolveStep(props: NextStepCardProps): NextStepConfig {
  const { totalEssays, pendingCount, lastCorrectedEssayId, hasUnviewedCorrection, creditsLeft, lastScore } = props

  // P0 — No essays ever submitted (activation gate)
  if (totalEssays === 0) {
    return {
      case: 'no_essays',
      icon: <PenLine size={18} />,
      headline: 'Envie sua primeira redação',
      subtext: 'Leva menos de 2 minutos. Você receberá uma devolutiva C1–C5 em até 24h.',
      ctaLabel: 'Começar agora',
      ctaHref: '/aluno/redacoes/nova',
      accent: 'border-purple-500/20 bg-purple-500/[0.04]',
      ctaClass: 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.25)]',
    }
  }

  // P1 — Correction ready but not viewed (based on real viewed_at field)
  if (hasUnviewedCorrection && lastCorrectedEssayId) {
    return {
      case: 'correction_ready',
      icon: <Eye size={18} />,
      headline: 'Sua devolutiva está pronta!',
      subtext: lastScore
        ? `Nota: ${lastScore}/1000 — veja o feedback detalhado por competência.`
        : 'Veja sua nota e o feedback detalhado por competência.',
      ctaLabel: 'Ver correção agora',
      ctaHref: `/aluno/redacoes/${lastCorrectedEssayId}`,
      accent: 'border-green-500/20 bg-green-500/[0.04]',
      ctaClass: 'bg-green-600 hover:bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]',
    }
  }

  // P2 — Essay submitted, waiting for correction
  if (pendingCount > 0) {
    return {
      case: 'waiting_correction',
      icon: <Clock size={18} />,
      headline: 'Sua redação está em correção',
      subtext: `${pendingCount} redaç${pendingCount === 1 ? 'ão' : 'ões'} sendo analisada${pendingCount === 1 ? '' : 's'} — devolutiva em até 24h.`,
      ctaLabel: 'Falar com Biia enquanto aguarda',
      ctaHref: '/aluno/biia',
      accent: 'border-amber-500/20 bg-amber-500/[0.04]',
      ctaClass: 'bg-purple-700 hover:bg-purple-600',
    }
  }

  // P3 — No credits left (only when nothing else is actionable)
  if (creditsLeft === 0) {
    return {
      case: 'low_credits',
      icon: <AlertTriangle size={18} />,
      headline: 'Suas correções acabaram neste ciclo',
      subtext: lastScore
        ? `Sua última nota foi ${lastScore} pts. Para continuar evoluindo, renove ou faça upgrade do plano.`
        : 'Suas correções serão renovadas no próximo ciclo, ou faça upgrade para continuar agora.',
      ctaLabel: 'Ver planos e continuar',
      ctaHref: '/aluno/upgrade',
      accent: 'border-amber-500/20 bg-amber-500/[0.04]',
      ctaClass: 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    }
  }

  // P4 — Steady state: all corrections viewed, has credits → next essay
  // Sub-variant: last credit warning (honest, not aggressive)
  const isLastCredit = creditsLeft === 1
  return {
    case: 'viewed_correction',
    icon: <TrendingUp size={18} />,
    headline: isLastCredit
      ? 'Última correção deste ciclo'
      : 'Envie sua próxima redação',
    subtext: isLastCredit
      ? 'Use sua última correção com estratégia. Foque na competência que mais precisa de atenção.'
      : lastScore
        ? `Sua última nota: ${lastScore} pts. Cada redação é uma chance de melhorar.`
        : 'Cada nova redação traz um diagnóstico mais preciso da sua evolução.',
    ctaLabel: isLastCredit ? 'Usar última correção' : 'Escrever nova redação',
    ctaHref: '/aluno/redacoes/nova',
    accent: isLastCredit
      ? 'border-amber-500/15 bg-amber-500/[0.03]'
      : 'border-purple-500/20 bg-purple-500/[0.04]',
    ctaClass: 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.25)]',
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function NextStepCard(props: NextStepCardProps) {
  const step = resolveStep(props)

  return (
    <div className={`mb-6 rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${step.accent}`}>
      {/* Icon */}
      <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border ${step.accent}`}>
        <div className="text-white">{step.icon}</div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600 mb-1">
          Próximo passo
        </p>
        <h3 className="text-sm font-bold text-white leading-snug mb-0.5">
          {step.headline}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          {step.subtext}
        </p>
      </div>

      {/* CTA */}
      <Link
        href={step.ctaHref}
        className={`shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] ${step.ctaClass}`}
      >
        {step.ctaLabel}
        <ArrowRight size={13} />
      </Link>
    </div>
  )
}
