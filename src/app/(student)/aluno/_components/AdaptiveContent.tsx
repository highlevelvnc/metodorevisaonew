import Link from 'next/link'
import { ArrowRight, TrendingDown, Lightbulb, Target, ChevronRight } from 'lucide-react'

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

const PATTERN_INFO: Record<string, {
  label: string; description: string; tip: string; trains: string; comp: string
}> = {
  c1_score: {
    comp:        'C1',
    label:       'Erros gramaticais recorrentes',
    description: 'Concordância, pontuação ou ortografia aparecem com frequência.',
    tip:         'Releia em voz alta — o ouvido captura o que o olho ignora.',
    trains:      'Norma Culta',
  },
  c2_score: {
    comp:        'C2',
    label:       'Tangência ao tema',
    description: 'Seus textos desviam do foco — a tese não sustenta todos os parágrafos.',
    tip:         'Escreva a tese em uma frase antes de começar qualquer parágrafo.',
    trains:      'Compreensão da Proposta',
  },
  c3_score: {
    comp:        'C3',
    label:       'Argumentação no senso comum',
    description: 'Os argumentos ficam genéricos por falta de dados ou referências.',
    tip:         'Pesquise 2–3 referências concretas antes de escrever.',
    trains:      'Seleção de Argumentos',
  },
  c4_score: {
    comp:        'C4',
    label:       'Conectivos repetidos ou ausentes',
    description: '"Porém" e "mas" dominam — pouca variação nos operadores argumentativos.',
    tip:         'Use "ademais", "nesse sentido", "entretanto", "outrossim".',
    trains:      'Mecanismos de Coesão',
  },
  c5_score: {
    comp:        'C5',
    label:       'Proposta incompleta',
    description: 'Um ou mais dos 4 elementos (agente, ação, modo, finalidade) estão ausentes.',
    tip:         'Responda: quem? faz o quê? como? para quê?',
    trains:      'Proposta de Intervenção',
  },
}

function severityBadge(avg: number): { text: string; cls: string } {
  if (avg < 80)  return { text: 'Crítico',   cls: 'bg-red-500/10 text-red-400 border-red-500/20'     }
  if (avg < 120) return { text: 'Atenção',   cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
  return              { text: 'Em melhora', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20'    }
}

function PatternCard({ item }: { item: PatternItem }) {
  const info   = PATTERN_INFO[item.key]
  const badge  = severityBadge(item.avg)
  const pct    = Math.min(100, (item.avg / 200) * 100)
  const barCls = pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 hover:border-white/[0.12] hover:bg-white/[0.03] transition-all">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] font-bold text-gray-400">
            {info?.comp}
          </span>
          <p className="text-[12px] font-semibold text-gray-300 leading-snug">{info?.label}</p>
        </div>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border whitespace-nowrap shrink-0 ${badge.cls}`}>
          {badge.text}
        </span>
      </div>

      {/* Description */}
      <p className="text-[11px] text-gray-600 leading-relaxed">{info?.description}</p>

      {/* Score bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-gray-700">{info?.trains}</span>
          <span className="text-[11px] font-bold tabular-nums text-gray-400">{item.avg} pts</span>
        </div>
        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barCls}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Tip */}
      <div className="pt-2 border-t border-white/[0.05]">
        <p className="text-[11px] leading-snug text-purple-400/80">
          <span className="font-semibold text-purple-400">Dica: </span>
          {info?.tip}
        </p>
      </div>
    </div>
  )
}

export function AdaptiveContent({ patterns, worstCompKey, nextStep, lastCorrectionDate }: AdaptiveContentProps) {
  // Empty state — not enough data
  if (!worstCompKey && patterns.length === 0) {
    return (
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Target size={14} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold text-white">Conteúdo Adaptativo</h2>
            <p className="text-[11px] text-gray-600 mt-0.5">Análise personalizada por competência</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
          <p className="text-[12px] text-gray-500 leading-relaxed">
            Corrija ao menos <span className="text-white font-medium">2 redações</span> para ativar o painel adaptativo.
            Ele mostrará exatamente onde focar para subir a nota, com dicas e exercícios direcionados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-dark rounded-2xl p-5 mb-6">
      {/* Section header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Target size={14} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold text-white">Conteúdo Adaptativo</h2>
            <p className="text-[11px] text-gray-600 mt-0.5">
              {lastCorrectionDate ? 'Baseado nas suas últimas devolutivas' : 'Análise personalizada por competência'}
            </p>
          </div>
        </div>
        <Link
          href="/aluno/evolucao"
          className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-purple-400 transition-colors"
        >
          Análise completa <ArrowRight size={10} />
        </Link>
      </div>

      {/* Highlight: next step */}
      {nextStep && worstCompKey && (
        <div className="mb-5 rounded-xl border-l-2 border-purple-500 bg-purple-500/[0.05] border border-purple-500/15 px-4 py-4 flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-600/15 border border-purple-500/20 flex items-center justify-center mt-0.5">
            <Lightbulb size={14} className="text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-purple-300 uppercase tracking-wide mb-1.5">
              Próximo passo prioritário
            </p>
            <p className="text-[13px] font-medium text-white leading-snug mb-1">{nextStep.focus}</p>
            <p className="text-[12px] text-gray-400 leading-relaxed">{nextStep.tip}</p>
          </div>
          <Link
            href="/aluno/biia"
            className="shrink-0 flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors mt-0.5 font-medium"
          >
            Praticar <ChevronRight size={10} />
          </Link>
        </div>
      )}

      {/* Pattern grid */}
      {patterns.length > 0 && (
        <>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-700 mb-3">
            Padrões identificados nas suas redações
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {patterns.slice(0, 3).map(item => (
              <PatternCard key={item.key} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
