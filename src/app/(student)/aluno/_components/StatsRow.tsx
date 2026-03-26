import { FileText, TrendingUp, Zap, Clock } from 'lucide-react'

interface StatsRowProps {
  totalEssays: number
  correctedCount: number
  avgScore: number | null
  delta: number | null
  creditsLeft: number
  pendingCount: number
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  sub?: React.ReactNode
  iconClass: string
}

function StatCard({ icon, label, value, sub, iconClass }: StatCardProps) {
  return (
    <div className="card-dark rounded-2xl p-4 flex items-start gap-3.5 min-w-0">
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-600 uppercase tracking-wide font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-white leading-none tabular-nums tracking-tight">{value}</p>
        {sub && <div className="mt-1.5">{sub}</div>}
      </div>
    </div>
  )
}

function DeltaPill({ delta }: { delta: number }) {
  const positive = delta >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
      positive
        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
        : 'bg-red-500/10 text-red-400 border border-red-500/20'
    }`}>
      {positive ? '↑' : '↓'} {positive ? '+' : ''}{delta} pts
    </span>
  )
}

export function StatsRow({
  totalEssays,
  correctedCount,
  avgScore,
  delta,
  creditsLeft,
  pendingCount,
}: StatsRowProps) {
  const creditIconClass =
    creditsLeft === 0 ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
    creditsLeft <= 1  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
    'bg-purple-500/10 border border-purple-500/20 text-purple-400'

  const scoreIconClass =
    avgScore !== null && avgScore >= 700 ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
    avgScore !== null                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
    'bg-white/[0.05] border border-white/[0.08] text-gray-500'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <StatCard
        icon={<FileText size={17} />}
        label="Redações"
        value={String(totalEssays)}
        iconClass="bg-white/[0.05] border border-white/[0.08] text-gray-400"
        sub={
          <p className="text-[11px] text-gray-600">
            {correctedCount > 0
              ? `${correctedCount} corrigida${correctedCount !== 1 ? 's' : ''}`
              : 'Nenhuma corrigida'
            }
          </p>
        }
      />

      <StatCard
        icon={<TrendingUp size={17} />}
        label="Nota atual"
        value={avgScore !== null ? String(avgScore) : '—'}
        iconClass={scoreIconClass}
        sub={
          delta !== null
            ? <DeltaPill delta={delta} />
            : avgScore !== null
              ? <p className="text-[11px] text-gray-600">de média geral</p>
              : <p className="text-[11px] text-gray-600">Meta: <span className="text-purple-400 font-semibold">900 pts</span></p>
        }
      />

      <StatCard
        icon={<Zap size={17} />}
        label="Créditos"
        value={String(creditsLeft)}
        iconClass={creditIconClass}
        sub={
          <p className={`text-[11px] ${
            creditsLeft === 0 ? 'text-red-400' : creditsLeft <= 1 ? 'text-amber-400' : 'text-gray-600'
          }`}>
            {creditsLeft === 0 ? 'Ciclo esgotado' : `disponíve${creditsLeft === 1 ? 'l' : 'is'} neste ciclo`}
          </p>
        }
      />

      <StatCard
        icon={<Clock size={17} />}
        label="Em análise"
        value={String(pendingCount)}
        iconClass={
          pendingCount > 0
            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            : 'bg-white/[0.05] border border-white/[0.08] text-gray-500'
        }
        sub={
          <p className="text-[11px] text-gray-600">
            {pendingCount === 0 ? 'Nada aguardando' : `aguardando devolutiva`}
          </p>
        }
      />
    </div>
  )
}
