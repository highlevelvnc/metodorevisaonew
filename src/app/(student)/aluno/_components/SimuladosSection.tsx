import Link from 'next/link'
import { ArrowRight, ClipboardList, Lock, Trophy, ArrowUpRight } from 'lucide-react'

interface Simulado {
  id: string
  title: string
  questoes: number
  tempo: string
  area: string
  locked: boolean
  bestScore: number | null
  maxScore: number
}

const SIMULADOS: Simulado[] = [
  { id: '1', title: 'Simulado ENEM 2023 — Linguagens',                  questoes: 45, tempo: '90 min', area: 'LC',  locked: false, bestScore: 720, maxScore: 1000 },
  { id: '2', title: 'Simulado ENEM 2023 — Ciências Humanas',             questoes: 45, tempo: '90 min', area: 'CH',  locked: false, bestScore: null, maxScore: 1000 },
  { id: '3', title: 'Simulado ENEM 2022 — Matemática',                   questoes: 45, tempo: '90 min', area: 'MT',  locked: true,  bestScore: null, maxScore: 1000 },
  { id: '4', title: 'Treino de Redação — Temas sociais contemporâneos',  questoes: 1,  tempo: '60 min', area: 'RED', locked: false, bestScore: null, maxScore: 1000 },
]

const AREA_CONFIG: Record<string, { color: string; bg: string }> = {
  LC:  { color: 'text-blue-400',   bg: 'bg-blue-500/10   border-blue-500/20'   },
  CH:  { color: 'text-amber-400',  bg: 'bg-amber-500/10  border-amber-500/20'  },
  CN:  { color: 'text-green-400',  bg: 'bg-green-500/10  border-green-500/20'  },
  MT:  { color: 'text-rose-400',   bg: 'bg-rose-500/10   border-rose-500/20'   },
  RED: { color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
}

function TriBar({ score, max }: { score: number; max: number }) {
  const pct    = Math.min(100, (score / max) * 100)
  const barCls = pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barCls}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[11px] font-bold tabular-nums ${
        pct >= 70 ? 'text-green-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'
      }`}>
        {score}
      </span>
    </div>
  )
}

export function SimuladosSection() {
  return (
    <div className="card-dark rounded-2xl p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <ClipboardList size={14} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold text-white">Simulados</h2>
            <p className="text-[11px] text-gray-600 mt-0.5">Questões reais do ENEM com TRI</p>
          </div>
        </div>
        <Link
          href="/aluno/simulados"
          className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-purple-400 transition-colors"
        >
          Ver todos <ArrowRight size={10} />
        </Link>
      </div>

      <div className="flex-1 space-y-2">
        {SIMULADOS.map(s => {
          const area = AREA_CONFIG[s.area] ?? AREA_CONFIG['LC']
          return (
            <Link
              key={s.id}
              href={s.locked ? '#' : `/aluno/simulados/${s.id}`}
              onClick={e => s.locked && e.preventDefault()}
              className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                s.locked
                  ? 'border-white/[0.04] opacity-55 cursor-not-allowed'
                  : 'border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.02]'
              }`}
            >
              {/* Area badge */}
              <span className={`flex-shrink-0 mt-0.5 inline-flex items-center justify-center w-10 h-7 rounded-md text-[10px] font-bold border ${area.bg} ${area.color}`}>
                {s.area}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-gray-300 group-hover:text-white transition-colors leading-snug line-clamp-1 mb-1">
                  {s.title}
                </p>
                <p className="text-[10px] text-gray-700 mb-2 tabular-nums">
                  {s.questoes} questão{s.questoes > 1 ? 'ões' : ''} · {s.tempo}
                </p>

                {s.bestScore !== null ? (
                  <div>
                    <p className="text-[9px] text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Trophy size={8} className="text-amber-500" />
                      Melhor TRI
                    </p>
                    <TriBar score={s.bestScore} max={s.maxScore} />
                  </div>
                ) : !s.locked ? (
                  <span className="text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                    Não realizado
                  </span>
                ) : null}
              </div>

              <div className="shrink-0 mt-0.5">
                {s.locked
                  ? <Lock size={12} className="text-gray-700" />
                  : <ArrowUpRight size={13} className="text-gray-700 group-hover:text-gray-400 transition-colors" />
                }
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
