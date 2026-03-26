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
  sub?: string
  accent?: 'green' | 'purple' | 'amber' | 'red' | 'default'
}

function StatCard({ icon, label, value, sub, accent = 'default' }: StatCardProps) {
  const accentMap = {
    green:   'text-green-400',
    purple:  'text-purple-400',
    amber:   'text-amber-400',
    red:     'text-red-400',
    default: 'text-gray-300',
  }
  const iconBg = {
    green:   'bg-green-500/10 text-green-400',
    purple:  'bg-purple-500/10 text-purple-400',
    amber:   'bg-amber-500/10 text-amber-400',
    red:     'bg-red-500/10 text-red-400',
    default: 'bg-white/[0.05] text-gray-400',
  }
  return (
    <div className="card-dark rounded-xl p-4 flex items-start gap-3.5">
      <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${iconBg[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className={`text-xl font-bold leading-none ${accentMap[accent]}`}>{value}</p>
        {sub && <p className="text-xs text-gray-600 mt-1 leading-tight">{sub}</p>}
      </div>
    </div>
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
  const deltaStr =
    delta === null     ? undefined :
    delta > 0          ? `+${delta} pts na última` :
    delta < 0          ? `${delta} pts na última` :
                         'Mesma nota na última'

  const creditAccent: StatCardProps['accent'] =
    creditsLeft === 0 ? 'red' :
    creditsLeft === 1 ? 'amber' :
    'purple'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <StatCard
        icon={<FileText size={16} />}
        label="Redações"
        value={String(totalEssays)}
        sub={correctedCount > 0 ? `${correctedCount} corrigida${correctedCount > 1 ? 's' : ''}` : 'Nenhuma corrigida ainda'}
        accent="default"
      />
      <StatCard
        icon={<TrendingUp size={16} />}
        label="Nota atual"
        value={avgScore !== null ? `${avgScore}` : '—'}
        sub={deltaStr ?? (avgScore !== null ? 'de média geral' : 'Sem dados ainda')}
        accent={avgScore !== null && avgScore >= 700 ? 'green' : avgScore !== null ? 'amber' : 'default'}
      />
      <StatCard
        icon={<Zap size={16} />}
        label="Créditos"
        value={String(creditsLeft)}
        sub={creditsLeft === 0 ? 'Ciclo esgotado' : `disponíve${creditsLeft === 1 ? 'l' : 'is'} neste ciclo`}
        accent={creditAccent}
      />
      <StatCard
        icon={<Clock size={16} />}
        label="Em correção"
        value={String(pendingCount)}
        sub={pendingCount === 0 ? 'Nenhuma aguardando' : `aguardando devolutiva`}
        accent={pendingCount > 0 ? 'amber' : 'default'}
      />
    </div>
  )
}
