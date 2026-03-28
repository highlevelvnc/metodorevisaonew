import { FileText, TrendingUp, Target } from 'lucide-react'

interface ProgressLoopProps {
  totalEssays: number
  avgScore: number | null
  lastScore: number | null
  suggestedGoal: number
}

export function ProgressLoop({ totalEssays, avgScore, lastScore, suggestedGoal }: ProgressLoopProps) {
  // Don't show for brand-new users (OnboardingDashboard handles them)
  if (totalEssays === 0) return null

  const goalPct = avgScore !== null && suggestedGoal > 0
    ? Math.min(100, Math.round((avgScore / suggestedGoal) * 100))
    : 0

  const goalColor = goalPct >= 100 ? 'bg-green-500' : goalPct >= 70 ? 'bg-purple-500' : 'bg-amber-500'

  return (
    <div className="mb-6 grid grid-cols-3 gap-3">

      {/* Essays submitted */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={13} className="text-gray-600" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Redações enviadas</p>
        </div>
        <p className="text-2xl font-bold text-white tabular-nums leading-none">
          {totalEssays}
        </p>
        <p className="text-[10px] text-gray-700 mt-1">
          {totalEssays === 1 ? 'Primeira entregue!' : `${totalEssays} redaç${totalEssays !== 1 ? 'ões' : 'ão'} no total`}
        </p>
      </div>

      {/* Last score */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={13} className="text-gray-600" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Última nota</p>
        </div>
        <p className="text-2xl font-bold text-white tabular-nums leading-none">
          {lastScore !== null ? lastScore : '—'}
        </p>
        <p className="text-[10px] text-gray-700 mt-1">
          {avgScore !== null && lastScore !== null
            ? lastScore >= avgScore
              ? '↑ Acima da média'
              : '↓ Abaixo da média'
            : 'Aguardando correção'}
        </p>
      </div>

      {/* Suggested goal */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
        <div className="flex items-center gap-2 mb-2">
          <Target size={13} className="text-gray-600" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Meta sugerida</p>
        </div>
        <p className="text-2xl font-bold text-white tabular-nums leading-none">
          {suggestedGoal}
        </p>
        {avgScore !== null ? (
          <div className="mt-2">
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${goalColor}`}
                style={{ width: `${goalPct}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-700 mt-1">
              {goalPct >= 100 ? 'Meta atingida! 🎉' : `${suggestedGoal - avgScore} pts para a meta`}
            </p>
          </div>
        ) : (
          <p className="text-[10px] text-gray-700 mt-1">Subir para {suggestedGoal} pts</p>
        )}
      </div>

    </div>
  )
}
