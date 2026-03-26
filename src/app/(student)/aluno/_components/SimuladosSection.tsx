import Link from 'next/link'
import { ArrowRight, ClipboardList, Lock, Trophy } from 'lucide-react'

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
  { id: '1', title: 'Simulado ENEM 2023 — Linguagens',                 questoes: 45, tempo: '90 min', area: 'LC',   locked: false, bestScore: 720, maxScore: 1000 },
  { id: '2', title: 'Simulado ENEM 2023 — Ciências Humanas',            questoes: 45, tempo: '90 min', area: 'CH',   locked: false, bestScore: null, maxScore: 1000 },
  { id: '3', title: 'Simulado ENEM 2022 — Matemática',                  questoes: 45, tempo: '90 min', area: 'MT',   locked: true,  bestScore: null, maxScore: 1000 },
  { id: '4', title: 'Treino de Redação — Temas sociais contemporâneos', questoes: 1,  tempo: '60 min', area: 'RED',  locked: false, bestScore: null, maxScore: 1000 },
]

const AREA_COLORS: Record<string, string> = {
  LC:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  CH:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CN:  'bg-green-500/10 text-green-400 border-green-500/20',
  MT:  'bg-rose-500/10 text-rose-400 border-rose-500/20',
  RED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

function ScoreIndicator({ score, max }: { score: number; max: number }) {
  const pct = (score / max) * 100
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-medium ${pct >= 70 ? 'text-green-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
        {score}
      </span>
    </div>
  )
}

export function SimuladosSection() {
  return (
    <div className="card-dark rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <ClipboardList size={14} className="text-purple-400" />
            Simulados
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">Treine com questões reais do ENEM</p>
        </div>
        <Link href="/aluno/simulados" className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
          Ver todos <ArrowRight size={11} />
        </Link>
      </div>

      <div className="space-y-2.5">
        {SIMULADOS.map(s => (
          <Link
            key={s.id}
            href={s.locked ? '#' : `/aluno/simulados/${s.id}`}
            onClick={e => s.locked && e.preventDefault()}
            className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
              s.locked
                ? 'border-white/[0.05] opacity-60 cursor-not-allowed'
                : 'border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.03]'
            }`}
          >
            {/* Area badge */}
            <div className={`flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold border mt-0.5 ${AREA_COLORS[s.area] ?? AREA_COLORS['LC']}`}>
              {s.area}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors leading-snug line-clamp-2">
                  {s.title}
                </p>
                {s.locked
                  ? <Lock size={13} className="text-gray-600 shrink-0 mt-0.5" />
                  : <ArrowRight size={13} className="text-gray-700 group-hover:text-gray-400 transition-colors shrink-0 mt-0.5" />
                }
              </div>
              <p className="text-[11px] text-gray-600 mb-2">
                {s.questoes} questão{s.questoes > 1 ? 'ões' : ''} · {s.tempo}
              </p>
              {s.bestScore !== null && (
                <div>
                  <p className="text-[10px] text-gray-600 mb-1 flex items-center gap-1">
                    <Trophy size={9} className="text-amber-400" />
                    Melhor TRI
                  </p>
                  <ScoreIndicator score={s.bestScore} max={s.maxScore} />
                </div>
              )}
              {s.bestScore === null && !s.locked && (
                <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                  Não realizado
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
