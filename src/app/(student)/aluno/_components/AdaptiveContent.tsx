import Link from 'next/link'
import { ArrowRight, TrendingDown, Lightbulb, Target } from 'lucide-react'

type CompKey = 'c1_score' | 'c2_score' | 'c3_score' | 'c4_score' | 'c5_score'

interface PatternItem {
  key: CompKey
  avg: number
}

interface AdaptiveContentProps {
  patterns: PatternItem[]
  worstCompKey: CompKey | null
  nextStep: { focus: string; tip: string } | null
  lastCorrectionDate: string | null
}

const PATTERN_LABELS: Record<string, { label: string; description: string; tip: string; example: string; trains: string }> = {
  c1_score: {
    label:       'Erros gramaticais recorrentes',
    description: 'Concordância, pontuação ou ortografia aparecem com frequência nas redações analisadas.',
    tip:         'Releia em voz alta antes de entregar — o ouvido captura o que o olho ignora.',
    example:     '"Os dados indica" → "Os dados indicam"',
    trains:      'C1 — Norma Culta',
  },
  c2_score: {
    label:       'Tangência ao tema',
    description: 'Seus textos começam no foco correto mas desviam — a tese não sustenta todos os parágrafos.',
    tip:         'Escreva a tese em uma frase antes de começar qualquer parágrafo.',
    example:     'Escrever sobre "bem-estar geral" num tema de "saúde mental jovem"',
    trains:      'C2 — Compreensão da Proposta',
  },
  c3_score: {
    label:       'Argumentação no senso comum',
    description: 'Os argumentos ficam genéricos por falta de dados, autores ou referências concretas.',
    tip:         'Pesquise 2–3 referências antes de escrever qualquer parágrafo.',
    example:     '"É notório que o desemprego causa problemas" — sem dados ou autores',
    trains:      'C3 — Seleção de Argumentos',
  },
  c4_score: {
    label:       'Conectivos repetidos ou ausentes',
    description: '"Porém" e "mas" dominam o texto — pouca variação nos operadores argumentativos.',
    tip:         'Use "ademais", "nesse sentido", "entretanto", "outrossim".',
    example:     'Usar "portanto" 3 vezes no mesmo parágrafo',
    trains:      'C4 — Mecanismos de Coesão',
  },
  c5_score: {
    label:       'Proposta de intervenção incompleta',
    description: 'Um ou mais dos 4 elementos (agente, ação, modo, finalidade) estão ausentes ou vagos.',
    tip:         'Responda explicitamente: quem? faz o quê? como? para quê?',
    example:     '"O governo deve investir em educação" — falta o modo e a finalidade',
    trains:      'C5 — Proposta de Intervenção',
  },
}

const COMP_SHORT: Record<string, string> = {
  c1_score: 'C1', c2_score: 'C2', c3_score: 'C3', c4_score: 'C4', c5_score: 'C5',
}

function scoreLabel(avg: number): { text: string; color: string } {
  if (avg < 80)  return { text: 'Crítico',  color: 'text-red-400 bg-red-500/10 border-red-500/20' }
  if (avg < 120) return { text: 'Atenção',  color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
  return              { text: 'Em melhora', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' }
}

export function AdaptiveContent({ patterns, worstCompKey, nextStep, lastCorrectionDate }: AdaptiveContentProps) {
  // No data state
  if (!worstCompKey && patterns.length === 0) {
    return (
      <div className="card-dark rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2.5 mb-2">
          <Target size={16} className="text-purple-400" />
          <h2 className="text-sm font-semibold text-white">Conteúdo Adaptativo</h2>
        </div>
        <p className="text-sm text-gray-500">
          Envie e corrija ao menos 2 redações para ativar o painel adaptativo. Ele mostrará exatamente onde focar para subir a nota.
        </p>
      </div>
    )
  }

  const displayPatterns = patterns.slice(0, 3)

  return (
    <div className="card-dark rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Target size={16} className="text-purple-400" />
          <div>
            <h2 className="text-sm font-semibold text-white">Conteúdo Adaptativo</h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Baseado nas suas {lastCorrectionDate ? 'últimas devolutivas' : 'redações corrigidas'}
            </p>
          </div>
        </div>
        <Link
          href="/aluno/evolucao"
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          Ver análise completa <ArrowRight size={11} />
        </Link>
      </div>

      {/* Next step — most impactful action */}
      {nextStep && worstCompKey && (
        <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/[0.06] p-4 flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/20 flex items-center justify-center mt-0.5">
            <Lightbulb size={15} className="text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-purple-300 mb-1">
              Próximo passo — {COMP_SHORT[worstCompKey]}: {nextStep.focus}
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">{nextStep.tip}</p>
          </div>
        </div>
      )}

      {/* Pattern cards */}
      {displayPatterns.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Padrões identificados</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayPatterns.map(({ key, avg }) => {
              const info    = PATTERN_LABELS[key]
              const { text: badge, color: badgeColor } = scoreLabel(avg)
              return (
                <div key={key} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <TrendingDown size={12} className="text-red-400 flex-shrink-0" />
                      <span className="text-xs font-medium text-gray-300 leading-tight">{info?.label}</span>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border whitespace-nowrap ${badgeColor}`}>
                      {badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed mb-2">{info?.description}</p>
                  <div className="border-t border-white/[0.05] pt-2 mt-2">
                    <p className="text-[11px] text-purple-400 leading-snug">
                      <span className="font-medium">Dica: </span>{info?.tip}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[10px] text-gray-600">{info?.trains}</span>
                    <span className="text-xs font-bold text-amber-400">{avg} pts</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
