import Link from 'next/link'
import { ArrowRight, MessageCircle, Sparkles, TrendingUp, Flame, Zap } from 'lucide-react'

interface DashboardHeroProps {
  firstName: string
  planName: string
  creditsLeft: number
  creditsTotal: number
  avgScore: number | null
  overallDelta: number | null
  pendingCount: number
  upgradeSignal: 'last_credit_evolving' | 'exhausted' | 'halfway_evolving' | null
  planTierNextPlan: string | null
}

const PLAN_CONFIG: Record<string, { color: string; dot: string; label: string }> = {
  Trial:      { color: 'text-gray-400  bg-white/[0.05]  border-white/[0.08]',          dot: 'bg-gray-400',   label: 'Trial'      },
  Evolução:   { color: 'text-blue-400  bg-blue-500/10   border-blue-500/20',            dot: 'bg-blue-400',   label: 'Evolução'   },
  Estratégia: { color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',         dot: 'bg-purple-400', label: 'Estratégia' },
  Intensivo:  { color: 'text-amber-400 bg-amber-500/10  border-amber-500/20',           dot: 'bg-amber-400',  label: 'Intensivo'  },
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

type MotivationLine =
  | { text: string }
  | { pre: string; highlight: string; post: string }

function getMotivationalLine(
  avgScore: number | null,
  overallDelta: number | null,
  pendingCount: number,
): MotivationLine {
  if (pendingCount > 0)
    return { text: `${pendingCount} redaç${pendingCount === 1 ? 'ão' : 'ões'} em análise — devolutiva em até 48h.` }
  if (overallDelta !== null && overallDelta > 60)
    return { pre: 'Você ganhou ', highlight: `+${overallDelta} pts`, post: ' na trajetória.' }
  if (avgScore !== null && avgScore >= 800)
    return { pre: 'Média de ', highlight: `${avgScore} pts`, post: ' — nível de destaque no ENEM.' }
  if (avgScore !== null && avgScore >= 600)
    return { text: 'Cada redação é um passo em direção aos 900+ pts.' }
  if (avgScore !== null)
    return { text: 'Cada devolutiva mostra exatamente onde subir a nota.' }
  return { text: 'Envie sua primeira redação e veja onde você está.' }
}

export function DashboardHero({
  firstName,
  planName,
  creditsLeft,
  creditsTotal,
  avgScore,
  overallDelta,
  pendingCount,
  upgradeSignal,
  planTierNextPlan,
}: DashboardHeroProps) {
  const plan       = PLAN_CONFIG[planName] ?? PLAN_CONFIG['Evolução']
  const greeting   = getGreeting()
  const motivation = getMotivationalLine(avgScore, overallDelta, pendingCount)
  const creditsPct = creditsTotal > 0 ? Math.round((creditsLeft / creditsTotal) * 100) : 0
  const barColor   = creditsPct > 50 ? 'bg-purple-500' : creditsPct > 20 ? 'bg-amber-500' : 'bg-red-500'
  const creditText = creditsLeft === 0
    ? 'Ciclo esgotado'
    : `${creditsLeft} crédito${creditsLeft !== 1 ? 's' : ''} restante${creditsLeft !== 1 ? 's' : ''}`

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b1121]">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      {/* Background glows */}
      <div
        className="pointer-events-none absolute -top-32 -right-20 h-72 w-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%)' }}
      />

      {/* Dot grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative px-6 py-7 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

          {/* ── Left: greeting + meta ── */}
          <div className="flex-1 min-w-0">

            {/* Plan + score pills */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${plan.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${plan.dot}`} />
                {plan.label}
              </span>

              {avgScore !== null && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.04] text-gray-400 border border-white/[0.07]">
                  <TrendingUp size={10} />
                  Média {avgScore} pts
                </span>
              )}

              {overallDelta !== null && overallDelta > 30 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                  <Flame size={10} />
                  +{overallDelta} pts na trajetória
                </span>
              )}
            </div>

            {/* Greeting */}
            <h1 className="text-2xl sm:text-[1.75rem] font-bold text-white tracking-tight leading-tight mb-2">
              {greeting}, {firstName} 👋
            </h1>

            {/* Motivation line */}
            <p className="text-sm text-gray-500 leading-relaxed max-w-md">
              {'text' in motivation
                ? motivation.text
                : (
                  <>
                    {motivation.pre}
                    <span className="text-white font-medium">{motivation.highlight}</span>
                    {motivation.post}
                  </>
                )
              }
            </p>

            {/* Credits bar */}
            <div className="mt-5 max-w-[280px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Redações disponíveis</span>
                <span className={`text-xs font-semibold tabular-nums ${
                  creditsLeft === 0 ? 'text-red-400' : creditsLeft <= 1 ? 'text-amber-400' : 'text-gray-300'
                }`}>
                  {creditText}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${creditsPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-gray-700">
                {creditsLeft} de {creditsTotal} neste ciclo
              </p>
            </div>
          </div>

          {/* ── Right: CTAs ── */}
          <div className="flex flex-row sm:flex-col items-start gap-2.5 sm:items-end shrink-0">
            <Link href="/aluno/redacoes/nova" className="btn-primary gap-2 whitespace-nowrap">
              <Sparkles size={14} />
              Enviar redação
            </Link>

            <Link href="/aluno/biia" className="btn-secondary gap-2 whitespace-nowrap">
              <MessageCircle size={14} />
              Falar com Biia
            </Link>

            {upgradeSignal && planTierNextPlan && (
              <Link
                href={`/checkout/${planTierNextPlan.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')}`}
                className="flex items-center gap-1.5 text-[11px] font-medium text-amber-400/80 hover:text-amber-300 transition-colors"
              >
                <Zap size={11} />
                Upgrade para {planTierNextPlan}
                <ArrowRight size={10} />
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
