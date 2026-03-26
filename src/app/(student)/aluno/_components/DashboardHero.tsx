import Link from 'next/link'
import { ArrowRight, MessageCircle, Sparkles, TrendingUp, Award } from 'lucide-react'

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

const PLAN_COLORS: Record<string, string> = {
  Trial:      'bg-gray-500/15 text-gray-400 border-gray-500/20',
  Evolução:   'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Estratégia: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  Intensivo:  'bg-amber-500/15 text-amber-400 border-amber-500/20',
}

const PLAN_ICONS: Record<string, string> = {
  Trial: '○', Evolução: '◈', Estratégia: '◆', Intensivo: '★',
}

function getGreeting(firstName: string): string {
  const h = new Date().getHours()
  if (h < 12) return `Bom dia, ${firstName}`
  if (h < 18) return `Boa tarde, ${firstName}`
  return `Boa noite, ${firstName}`
}

function getMotivationalLine(
  avgScore: number | null,
  overallDelta: number | null,
  pendingCount: number,
): string {
  if (pendingCount > 0)
    return `${pendingCount} redaç${pendingCount === 1 ? 'ão em análise' : 'ões em análise'} — a devolutiva chega em até 48h.`
  if (overallDelta !== null && overallDelta > 60)
    return `Você evoluiu +${overallDelta} pts na trajetória. Continue assim.`
  if (avgScore !== null && avgScore >= 800)
    return 'Sua média está acima de 800 pts — nível de destaque no ENEM.'
  if (avgScore !== null && avgScore >= 600)
    return 'Boa consistência. Cada redação é um passo em direção aos 900+ pts.'
  if (avgScore !== null)
    return 'Cada devolutiva revela exatamente onde subir a nota. Use-as.'
  return 'Envie sua primeira redação e descubra onde você está.'
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
  const planColor  = PLAN_COLORS[planName] ?? PLAN_COLORS['Evolução']
  const planIcon   = PLAN_ICONS[planName]  ?? '◈'
  const greeting   = getGreeting(firstName)
  const motivation = getMotivationalLine(avgScore, overallDelta, pendingCount)
  const creditsPct = creditsTotal > 0 ? Math.round((creditsLeft / creditsTotal) * 100) : 0

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0d1220] via-[#0f1428] to-[#0d1220] p-6 sm:p-8 mb-6">
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        {/* Left — greeting + plan + motivation */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Plan badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${planColor}`}>
              <span className="text-[10px]">{planIcon}</span>
              Plano {planName}
            </span>

            {/* Score badge — only if they have data */}
            {avgScore !== null && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.05] text-gray-400 border border-white/[0.06]">
                <TrendingUp size={11} />
                Média {avgScore} pts
              </span>
            )}

            {/* Delta badge */}
            {overallDelta !== null && overallDelta > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                <Award size={10} />
                +{overallDelta} pts na trajetória
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1.5">
            {greeting} 👋
          </h1>
          <p className="text-sm text-gray-500 max-w-lg leading-relaxed">{motivation}</p>

          {/* Credits bar */}
          <div className="mt-4 max-w-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">Créditos restantes</span>
              <span className={`text-xs font-medium ${creditsLeft === 0 ? 'text-red-400' : creditsLeft === 1 ? 'text-amber-400' : 'text-gray-300'}`}>
                {creditsLeft} / {creditsTotal}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  creditsPct > 50 ? 'bg-purple-500' : creditsPct > 20 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${creditsPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right — CTAs */}
        <div className="flex flex-col gap-2.5 sm:items-end shrink-0">
          <Link
            href="/aluno/redacoes/nova"
            className="btn-primary justify-center sm:justify-start gap-2 whitespace-nowrap"
          >
            <Sparkles size={15} />
            Enviar redação
            <ArrowRight size={14} className="opacity-60" />
          </Link>

          <Link
            href="/aluno/biia"
            className="btn-secondary justify-center sm:justify-start gap-2 whitespace-nowrap"
          >
            <MessageCircle size={15} />
            Falar com Biia
          </Link>

          {/* Upgrade nudge */}
          {upgradeSignal && planTierNextPlan && (
            <Link
              href={`/checkout/${planTierNextPlan.toLowerCase().replace(' ', '-')}`}
              className="inline-flex items-center gap-1.5 text-xs text-amber-400/80 hover:text-amber-300 transition-colors mt-1"
            >
              <span className="text-[10px]">⚡</span>
              Fazer upgrade para {planTierNextPlan}
              <ArrowRight size={10} />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
