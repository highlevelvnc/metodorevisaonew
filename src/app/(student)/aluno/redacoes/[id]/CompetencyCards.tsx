'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Sparkles, ArrowRight } from 'lucide-react'
import { COMP_COLORS, type CompKey } from '@/lib/competency-colors'

// ── Per-competency improvement tips (shown on "O que faltou" / "Como melhorar") ──

const WHAT_WAS_MISSING: Record<CompKey, Record<number, string | null>> = {
  c1: {
    0:   'A redação apresenta desvios críticos que impossibilitam a avaliação da norma culta.',
    40:  'Graves problemas de ortografia e estrutura sintática comprometendo toda a leitura.',
    80:  'Muitos erros gramaticais — concordância, regência e pontuação foram os principais desvios.',
    120: 'Desvios de ortografia e concordância recorrentes. A leitura flui, mas os erros são frequentes.',
    160: 'Alguns deslizes pontuais de pontuação e concordância. Não comprometeram a comunicação.',
    200: null,
  },
  c2: {
    0:   'A redação fugiu completamente ao tema proposto.',
    40:  'Grande parte do texto não atendeu à proposta — fuga parcial ao tema central.',
    80:  'Tangência ao tema. O texto circulou ao redor da questão sem aprofundar o recorte proposto.',
    120: 'A tese está presente, mas o desenvolvimento se afastou do tema em vários momentos.',
    160: 'Boa compreensão da proposta com leve tangência em algum parágrafo.',
    200: null,
  },
  c3: {
    0:   'Nenhuma argumentação identificável no texto.',
    40:  'Argumentação apenas superficial — afirmações sem qualquer fundamentação.',
    80:  'Argumentação fraca. Faltaram dados, exemplos concretos ou autores que embasassem os pontos de vista.',
    120: 'Argumentação com algum repertório, mas os argumentos foram pouco desenvolvidos ou genéricos.',
    160: 'Boa seleção de argumentos. O repertório poderia ser mais aprofundado e diversificado.',
    200: null,
  },
  c4: {
    0:   'Ausência total de mecanismos de coesão — texto completamente fragmentado.',
    40:  'Grave déficit de coesão. Parágrafos desarticulados sem encadeamento.',
    80:  'Problemas de coesão que dificultam a progressão das ideias. Conectivos repetitivos.',
    120: 'Coesão parcial. Alguns parágrafos sem boa articulação e repetição de conectivos básicos.',
    160: 'Boa articulação entre as partes. Poucos deslizes no uso dos operadores argumentativos.',
    200: null,
  },
  c5: {
    0:   'Nenhuma proposta de intervenção foi apresentada.',
    40:  'Proposta muito vaga — apenas menção superficial ao problema sem solução concreta.',
    80:  'Proposta incompleta. Mencionou o problema, mas não articulou agente, ação, modo e finalidade.',
    120: 'Proposta com 2–3 elementos presentes. Faltou especificar melhor o modo/meio ou a finalidade.',
    160: 'Boa proposta. Os 4 elementos estão presentes, mas a ação poderia ser mais detalhada.',
    200: null,
  },
}

const HOW_TO_IMPROVE: Record<CompKey, Record<number, string[]>> = {
  c1: {
    0:   ['Releia um texto de referência ENEM antes de escrever', 'Foque em concordância verbal e nominal', 'Evite gírias e linguagem informal'],
    40:  ['Reserve 5 min para reler a redação antes de entregar', 'Revise cada parágrafo buscando erros de ortografia', 'Concentre-se em eliminar erros de regência verbal'],
    80:  ['Revise concordância nominal — adjetivos seguem o gênero do substantivo', 'Verifique o uso de vírgula — nunca entre sujeito e verbo', 'Estude as regras de crase antes da próxima redação'],
    120: ['Releia em voz alta — o ouvido detecta erros que o olho ignora', 'Foque em pontuação: ponto final no fim de cada parágrafo, vírgula nas orações adverbiais', 'Elimine os últimos deslizes e conquiste nota máxima'],
    160: ['Pequenos ajustes de pontuação podem elevar para 200', 'Atenção redobrada à acentuação de oxítonas terminadas em -em'],
    200: [],
  },
  c2: {
    0:   ['Leia o enunciado 3 vezes antes de começar', 'Escreva sua tese em uma frase antes de iniciar', 'Cada parágrafo deve responder: isso defende minha tese?'],
    40:  ['Identifique o recorte específico pedido — não apenas o tema geral', 'Escreva a tese antes de qualquer parágrafo de desenvolvimento', 'Releia o enunciado na metade da redação'],
    80:  ['Evite discutir "causas de X" quando a proposta pede "soluções para X"', 'Mantenha um fio condutor entre introdução, desenvolvimento e conclusão', 'Cada argumento deve defender diretamente sua tese central'],
    120: ['Releia o enunciado ao terminar cada parágrafo', 'Verifique se a conclusão retoma a tese com clareza', 'Elimine qualquer parágrafo que não contribua para a tese'],
    160: ['Pequeno ajuste de foco em algum parágrafo para conquistar nota máxima', 'Certifique-se de que a conclusão retoma o recorte exato do enunciado'],
    200: [],
  },
  c3: {
    0:   ['Pesquise 2–3 referências concretas sobre o tema antes de escrever', 'Estruture: afirmação → fundamento → análise', 'Evite apenas descrever o problema — argumente'],
    40:  ['Use dados estatísticos, nomes de autores ou eventos históricos', 'Cada parágrafo de desenvolvimento deve ter: argumento + embasamento + análise', 'Leia 2 redações nota 1000 para ver como o repertório funciona na prática'],
    80:  ['Traga pelo menos 2 referências por parágrafo de desenvolvimento', 'Conecte o repertório diretamente à tese — não apenas mencione, analise', 'Evite argumentos do senso comum como único fundamento'],
    120: ['Aprofunde a análise de cada argumento antes de avançar', 'Use repertório diversificado: dados + autor + análise própria', 'Quanto mais específico o exemplo, mais efetivo'],
    160: ['Mais um nível de aprofundamento analítico conquista nota máxima', 'Certifique-se de que cada referência está sendo analisada, não apenas citada'],
    200: [],
  },
  c4: {
    0:   ['Comece com: os parágrafos precisam se conectar entre si', 'Use "Nesse sentido", "Além disso", "Portanto" para articular', 'Cada parágrafo deve fazer referência à ideia anterior'],
    40:  ['Varie os conectivos: "ademais", "entretanto", "desse modo"', 'A última frase de cada parágrafo deve criar ponte para o próximo', 'Evite começar todos os parágrafos com "O" seguido do substantivo'],
    80:  ['Substitua "mas" e "porém" repetidos por: "todavia", "contudo", "no entanto"', 'Use pronomes demonstrativos para retomar ideias: "esse problema", "tal realidade"', 'Progressão temática: cada parágrafo deve avançar a argumentação'],
    120: ['Diversifique os conectivos de cada função: adição, oposição, conclusão, explicação', 'Revise as transições entre introdução→desenvolvimento→conclusão', 'Verifique se algum parágrafo parece "solto" no texto'],
    160: ['Refinar conectivos e progressão é o caminho para 200 em C4', 'Varie a estrutura sintática das frases de transição'],
    200: [],
  },
  c5: {
    0:   ['Estruture: QUEM age (agente) + O QUÊ faz (ação) + COMO (modo) + POR QUÊ (finalidade)', 'Dedique o último parágrafo inteiramente à proposta', 'Seja específico: nenhum elemento pode ser subentendido'],
    40:  ['Use os 4 elementos explicitamente — nunca implícitos', 'Evite "o governo deve fazer algo" — identifique qual instância específica', 'A proposta deve ser viável e conectada ao tema discutido'],
    80:  ['Complete os 4 elementos: agente + ação + modo + finalidade', 'O agente deve ser específico: Ministério da Educação, Estado, ONG, empresa', 'A finalidade deve conectar a proposta ao problema central do texto'],
    120: ['Explicite o elemento que faltou (geralmente o modo ou a finalidade)', 'Certifique-se de que cada elemento é explícito, não subentendido', 'A proposta deve ser realista e devidamente relacionada à argumentação'],
    160: ['Detalhe melhor a ação ou o modo para conquistar nota máxima', 'Verifique se a finalidade conecta a proposta à tese central do texto'],
    200: [],
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface CompCardData {
  key: CompKey
  label: string
  name: string
  score: number
  prevScore: number | null
  delta: number | null
  feedbackSnippet: string | null
}

interface Props {
  compData:   CompCardData[]
  themeTitle: string
  weakestKey: CompKey
}

function biiaPrompt(key: CompKey, score: number, theme: string): string {
  const prompts: Record<CompKey, string> = {
    c1: `Biia, minha nota em C1 (Norma Culta) foi ${score}/200. Explique os principais erros que devo corrigir e me dê 3 exercícios práticos.`,
    c2: `Biia, minha nota em C2 foi ${score}/200 no tema "${theme}". Como posso melhorar minha compreensão da proposta e evitar tangência?`,
    c3: `Biia, preciso de repertório sociocultural para o tema "${theme}". Me dê dados, autores e referências históricas relevantes.`,
    c4: `Biia, minha nota em C4 (Coesão) foi ${score}/200. Me ensine a usar conectivos corretamente e melhore a progressão textual da minha escrita.`,
    c5: `Biia, minha nota em C5 foi ${score}/200. Monte um plano para eu escrever uma proposta de intervenção perfeita com os 4 elementos.`,
  }
  return prompts[key]
}

// ── Score key normalization ────────────────────────────────────────────────────
// ENEM scores are multiples of 40 (0, 40, 80, 120, 160, 200).
// DB may occasionally return an off-grid value (e.g. 100, 180) due to manual overrides.
// Round to nearest valid key to prevent undefined lookups in WHAT_WAS_MISSING / HOW_TO_IMPROVE.
const SCORE_STEPS = [0, 40, 80, 120, 160, 200] as const

function nearestScore(score: number): 0 | 40 | 80 | 120 | 160 | 200 {
  const clamped = Math.max(0, Math.min(200, Math.round(score)))
  return SCORE_STEPS.reduce((prev, curr) =>
    Math.abs(curr - clamped) < Math.abs(prev - clamped) ? curr : prev
  ) as 0 | 40 | 80 | 120 | 160 | 200
}

export function CompetencyCards({ compData, themeTitle, weakestKey }: Props) {
  const [expanded, setExpanded] = useState<CompKey | null>(null)

  return (
    <div className="space-y-2">
      {compData.map(c => {
        const colors    = COMP_COLORS[c.key]
        const isOpen    = expanded === c.key
        const isWeakest = c.key === weakestKey
        const pct       = (c.score / 200) * 100
        const scoreKey  = nearestScore(c.score)
        const missing   = WHAT_WAS_MISSING[c.key][scoreKey] ?? null
        const improve   = HOW_TO_IMPROVE[c.key][scoreKey] ?? []
        const showBiia  = c.score < 120
        const biiaLink  = `/aluno/biia?prompt=${encodeURIComponent(biiaPrompt(c.key, c.score, themeTitle))}`

        return (
          <div
            key={c.key}
            className={`rounded-xl border transition-all duration-200 ${
              isOpen
                ? `${colors.border} ${colors.bg}`
                : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]'
            }`}
          >
            {/* Card header — always visible */}
            <button
              type="button"
              className="w-full px-4 py-3 flex items-center gap-3"
              onClick={() => setExpanded(isOpen ? null : c.key)}
            >
              {/* Color dot + label */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${colors.border} ${colors.bg}`}>
                <span className={`text-[10px] font-bold ${colors.text}`}>{c.label}</span>
              </div>

              {/* Name + weakest badge */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-white">{c.name}</span>
                  {isWeakest && (
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-1.5 py-0.5">🎯 foco</span>
                  )}
                </div>
                {/* Progress bar */}
                <div className="mt-1.5 h-1 bg-white/[0.06] rounded-full overflow-hidden w-full">
                  <div
                    className={`h-full rounded-full ${colors.bar} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Score + delta */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {c.delta !== null && c.delta !== 0 && (
                  <span className={`text-[10px] font-bold tabular-nums ${c.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {c.delta > 0 ? '+' : ''}{c.delta}
                  </span>
                )}
                <span className={`text-sm font-bold tabular-nums ${colors.text}`}>
                  {c.score}<span className="text-gray-600 text-xs font-normal">/200</span>
                </span>
                {isOpen
                  ? <ChevronUp size={13} className="text-gray-600" />
                  : <ChevronDown size={13} className="text-gray-600" />}
              </div>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="px-4 pb-4 pt-0 space-y-3 border-t border-white/[0.05]">

                {/* Teacher feedback snippet */}
                {c.feedbackSnippet && (
                  <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Feedback da corretora</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{c.feedbackSnippet}</p>
                  </div>
                )}

                {/* What was missing */}
                {missing && (
                  <div className={`rounded-xl border ${colors.border} ${colors.bg} px-3 py-2.5`}>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">O que faltou</p>
                    <p className={`text-xs leading-relaxed ${colors.text}`}>{missing}</p>
                  </div>
                )}

                {/* How to improve */}
                {improve.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Como melhorar</p>
                    <div className="space-y-1.5">
                      {improve.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${colors.border} ${colors.bg}`}>
                            <span className={`text-[8px] font-bold ${colors.text}`}>{i + 1}</span>
                          </div>
                          <p className="text-xs text-gray-300 leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {/* Biia CTA — shown for low scores */}
                  {showBiia && (
                    <Link
                      href={biiaLink}
                      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-lg border transition-all ${colors.pill} hover:opacity-80`}
                    >
                      <Sparkles size={9} />
                      Pedir ajuda à Biia
                    </Link>
                  )}

                  {/* Specific Biia actions */}
                  {c.key === 'c3' && c.score < 160 && (
                    <Link
                      href={`/aluno/biia?prompt=${encodeURIComponent(`Biia, me dê repertórios para o tema "${themeTitle}"`)}`}
                      className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] text-amber-400 hover:bg-amber-500/[0.1] transition-all"
                    >
                      <Sparkles size={9} />
                      Gerar repertório
                    </Link>
                  )}

                  {c.key === 'c5' && c.score < 200 && (
                    <Link
                      href={`/aluno/biia?prompt=${encodeURIComponent(`Biia, melhore minha proposta de intervenção para o tema "${themeTitle}" e mostre como estruturar os 4 elementos.`)}`}
                      className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-lg border border-pink-500/25 bg-pink-500/[0.06] text-pink-400 hover:bg-pink-500/[0.1] transition-all"
                    >
                      <Sparkles size={9} />
                      Melhorar C5
                    </Link>
                  )}

                  {/* Treinar essa competência */}
                  <Link
                    href={`/aluno/redacoes/nova?tema_livre=${encodeURIComponent(themeTitle)}`}
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
                  >
                    <ArrowRight size={9} />
                    Treinar esse tema
                  </Link>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
