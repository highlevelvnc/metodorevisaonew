import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'

interface PlanCreditsCardProps {
  planName: string
  creditsLeft: number
  creditsTotal: number
  /** null = no next plan available (already at top tier) */
  nextPlanName: string | null
}

const PLAN_COLORS: Record<string, string> = {
  Trial:      'text-gray-400 bg-white/[0.05] border-white/[0.08]',
  Evolução:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Estratégia: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Intensivo:  'text-amber-400 bg-amber-500/10 border-amber-500/20',
}

export function PlanCreditsCard({ planName, creditsLeft, creditsTotal, nextPlanName }: PlanCreditsCardProps) {
  const creditsPct = creditsTotal > 0 ? Math.round((creditsLeft / creditsTotal) * 100) : 0
  const barColor = creditsPct > 50 ? 'bg-purple-500' : creditsPct > 20 ? 'bg-amber-500' : 'bg-red-500'
  const planColor = PLAN_COLORS[planName] ?? PLAN_COLORS['Evolução']

  // What happens when credits end
  const creditsExplanation = creditsLeft === 0
    ? 'Suas correções serão renovadas automaticamente no próximo ciclo de faturamento.'
    : creditsLeft === 1
      ? 'Essa é sua última correção deste ciclo. Use com estratégia.'
      : 'Cada correção = 1 redação corrigida com devolutiva C1–C5.'

  return (
    <div className="card-dark rounded-2xl p-5 mb-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/15 border border-purple-500/20 flex items-center justify-center">
            <Zap size={15} className="text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600">
              Plano e correções
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${planColor}`}>
                {planName}
              </span>
              <span className="text-xs text-gray-600">
                · {creditsTotal} correções/mês
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        {nextPlanName ? (
          <Link
            href="/aluno/upgrade"
            className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            {creditsLeft === 0 ? 'Fazer upgrade' : 'Ver planos'}
            <ArrowRight size={11} />
          </Link>
        ) : (
          <span className="text-[10px] font-medium text-amber-400/70 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">
            Plano máximo
          </span>
        )}
      </div>

      {/* Credits bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">Correções restantes</span>
          <span className={`text-xs font-bold tabular-nums ${
            creditsLeft === 0 ? 'text-red-400' : creditsLeft <= 1 ? 'text-amber-400' : 'text-white'
          }`}>
            {creditsLeft} de {creditsTotal}
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.max(creditsPct, 2)}%` }}
          />
        </div>
      </div>

      {/* Explanation */}
      <p className="text-[11px] text-gray-600 leading-relaxed">
        {creditsExplanation}
      </p>
    </div>
  )
}
