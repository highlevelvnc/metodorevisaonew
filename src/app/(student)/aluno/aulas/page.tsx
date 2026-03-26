import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Videoaulas Estratégicas | Método Revisão' }

type Lesson = {
  id: string
  title: string
  duration: string
  description: string
  available: boolean
}

type CompSection = {
  key: string
  label: string
  name: string
  color: string
  lessons: Lesson[]
}

const COMP_SECTIONS: CompSection[] = [
  {
    key: 'c1',
    label: 'C1',
    name: 'Domínio da norma culta',
    color: 'from-blue-700/20 to-blue-900/10',
    lessons: [
      {
        id: 'c1-1',
        title: 'Os 7 erros que mais reprovam no C1',
        duration: '21 min',
        description: 'Concordância, regência e pontuação: os erros recorrentes e como evitá-los definitivamente.',
        available: true,
      },
      {
        id: 'c1-2',
        title: 'Pontuação que valoriza o texto',
        duration: '16 min',
        description: 'Uso estratégico de vírgula, ponto e travessão para clareza e elegância.',
        available: false,
      },
    ],
  },
  {
    key: 'c2',
    label: 'C2',
    name: 'Compreensão do tema',
    color: 'from-emerald-700/20 to-emerald-900/10',
    lessons: [
      {
        id: 'c2-1',
        title: 'Como ler os textos motivadores',
        duration: '13 min',
        description: 'Técnica para extrair argumentos dos textos de apoio sem copiar e sem fugir ao tema.',
        available: true,
      },
      {
        id: 'c2-2',
        title: 'Delimitação e recorte temático',
        duration: '11 min',
        description: 'Por que temas amplos pedem um recorte preciso — e como fazê-lo.',
        available: false,
      },
    ],
  },
  {
    key: 'c3',
    label: 'C3',
    name: 'Seleção e organização de argumentos',
    color: 'from-amber-700/20 to-amber-900/10',
    lessons: [
      {
        id: 'c3-1',
        title: 'O modelo tese–argumento–dado–conclusão',
        duration: '19 min',
        description: 'Estrutura clara de parágrafo argumentativo com exemplos reais corrigidos.',
        available: true,
      },
      {
        id: 'c3-2',
        title: 'Argumentos por causa, consequência e exemplificação',
        duration: '15 min',
        description: 'Os três tipos de argumento mais eficazes e quando usar cada um.',
        available: false,
      },
    ],
  },
  {
    key: 'c4',
    label: 'C4',
    name: 'Coesão textual',
    color: 'from-rose-700/20 to-rose-900/10',
    lessons: [
      {
        id: 'c4-1',
        title: 'Conectivos além do "portanto" e "além disso"',
        duration: '17 min',
        description: 'Amplie seu repertório de conectivos e use cada um com precisão lógica.',
        available: false,
      },
      {
        id: 'c4-2',
        title: 'Referenciação e progressão temática',
        duration: '13 min',
        description: 'Como retomar e avançar o argumento sem repetir palavras.',
        available: false,
      },
    ],
  },
  {
    key: 'c5',
    label: 'C5',
    name: 'Proposta de intervenção',
    color: 'from-purple-700/20 to-purple-900/10',
    lessons: [
      {
        id: 'c5-1',
        title: 'Os 5 elementos da proposta nota 200',
        duration: '22 min',
        description: 'Agente, ação, modo/meio, efeito e detalhamento — com exemplos comentados passo a passo.',
        available: true,
      },
      {
        id: 'c5-2',
        title: 'Propostas criativas que não perdem pontos',
        duration: '14 min',
        description: 'Como ser original na intervenção sem arriscar fuga ao tema ou proposta vaga.',
        available: false,
      },
      {
        id: 'c5-3',
        title: 'Erros fatais na conclusão',
        duration: '10 min',
        description: 'Os equívocos que fazem corretores zerar a C5 e como garantir os 200 pontos.',
        available: false,
      },
    ],
  },
]

const GERAL_SECTION: CompSection = {
  key: 'geral',
  label: 'Geral',
  name: 'Fundamentos da Redação ENEM',
  color: 'from-slate-700/40 to-slate-800/20',
  lessons: [
    {
      id: 'g1',
      title: 'A estrutura da redação nota 1000',
      duration: '18 min',
      description: 'Entenda o que os corretores realmente avaliam e como estruturar cada parte do texto.',
      available: true,
    },
    {
      id: 'g2',
      title: 'Como usar o repertório sociocultural',
      duration: '14 min',
      description: 'Técnicas para citar filósofos, dados e obras sem parecer forçado.',
      available: true,
    },
    {
      id: 'g3',
      title: 'Gestão de tempo na prova',
      duration: '9 min',
      description: 'Como distribuir os 5 minutos de cada competência no momento da prova.',
      available: false,
    },
  ],
}

// Map DB column key → section key
const COMP_KEY_TO_SECTION: Record<string, string> = {
  c1_score: 'c1', c2_score: 'c2', c3_score: 'c3', c4_score: 'c4', c5_score: 'c5',
}
const COMP_KEY_NAMES: Record<string, string> = {
  c1_score: 'Norma Culta', c2_score: 'Compreensão do Tema',
  c3_score: 'Seleção de Argumentos', c4_score: 'Mecanismos de Coesão',
  c5_score: 'Proposta de Intervenção',
}
const COMP_KEY_LABELS: Record<string, string> = {
  c1_score: 'C1', c2_score: 'C2', c3_score: 'C3', c4_score: 'C4', c5_score: 'C5',
}

export default async function AulasPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: { user } } = await supabase.auth.getUser()

  /* ── Weakest competency ──────────────────────────────────────────────────── */
  let weakestKey: string | null = null
  let weakestScore: number | null = null

  if (user) {
    const { data } = await db
      .from('essays')
      .select('corrections(c1_score, c2_score, c3_score, c4_score, c5_score)')
      .eq('student_id', user.id)
      .eq('status', 'corrected')
      .order('submitted_at', { ascending: false })
      .limit(1)

    const corr = (data as any[])?.[0]?.corrections?.[0] ?? null
    if (corr) {
      const compKeys = ['c1_score', 'c2_score', 'c3_score', 'c4_score', 'c5_score']
      weakestKey = compKeys.reduce((minK, k) =>
        (corr[k] ?? 0) < (corr[minK] ?? 0) ? k : minK
      )
      weakestScore = corr[weakestKey] ?? null
    }
  }

  const focusSectionKey = weakestKey ? COMP_KEY_TO_SECTION[weakestKey] : null

  /* ── Order sections: weakest first (after Geral) ────────────────────────── */
  const orderedCompSections = focusSectionKey
    ? [
        ...COMP_SECTIONS.filter((s) => s.key === focusSectionKey),
        ...COMP_SECTIONS.filter((s) => s.key !== focusSectionKey),
      ]
    : COMP_SECTIONS

  const allSections = [GERAL_SECTION, ...orderedCompSections]

  const availableCount = allSections.reduce(
    (acc, s) => acc + s.lessons.filter((l) => l.available).length,
    0
  )

  return (
    <div className="max-w-4xl">
      {/* Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Videoaulas Estratégicas</h1>
          <p className="text-sm text-gray-500">
            Aulas curtas e diretas sobre cada competência — feitas para quem quer evoluir, não apenas assistir.
          </p>
        </div>
        <div className="shrink-0 card-dark rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
          <p className="text-2xl font-bold text-white tabular-nums">{availableCount}</p>
          <p className="text-[11px] text-gray-600">disponíveis</p>
        </div>
      </div>

      {/* Focus banner — shown when we know the weakest comp */}
      {focusSectionKey && weakestKey && (
        <div className="rounded-2xl border border-amber-500/[0.18] bg-amber-500/[0.03] px-5 py-4 mb-6 flex items-start gap-3">
          <div className="shrink-0 w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mt-0.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-400 mb-0.5">
              Seu foco agora: {COMP_KEY_LABELS[weakestKey]} — {COMP_KEY_NAMES[weakestKey]}
              {weakestScore !== null && (
                <span className="font-normal text-amber-400/60 ml-1.5">({weakestScore}/200 pts na última correção)</span>
              )}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              As aulas desta competência aparecem primeiro. Assista as disponíveis antes de avançar para as outras.
            </p>
          </div>
        </div>
      )}

      {/* No corrections yet — neutral suggestion */}
      {!focusSectionKey && user && (
        <div className="card-dark rounded-2xl px-5 py-4 mb-6">
          <p className="text-[12px] font-semibold text-gray-400 mb-1">Sugestão de ordem</p>
          <p className="text-[12px] text-gray-600 leading-relaxed">
            Comece pelo bloco Geral, depois siga C1 → C5 em ordem. Depois de receber sua primeira correção,
            as aulas serão reorganizadas pelo que mais importa para você.
          </p>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-5">
        {allSections.map((section) => {
          const isFocus = section.key === focusSectionKey
          return (
            <div
              key={section.key}
              className={`card-dark rounded-2xl overflow-hidden ${
                isFocus ? 'ring-1 ring-amber-500/20' : ''
              }`}
            >
              {/* Section header */}
              <div className={`bg-gradient-to-r ${section.color} px-5 py-4 border-b border-white/[0.06]`}>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/[0.10] flex items-center justify-center text-[10px] font-black text-white">
                    {section.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-white">{section.name}</p>
                      {isFocus && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400">
                          Foco atual
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {section.lessons.filter((l) => l.available).length} de {section.lessons.length} aulas disponíveis
                    </p>
                  </div>
                </div>
              </div>

              {/* Lessons */}
              <div className="divide-y divide-white/[0.04]">
                {section.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className={`flex items-start gap-4 px-5 py-4 ${lesson.available ? 'group cursor-pointer hover:bg-white/[0.02]' : 'opacity-50'}`}
                  >
                    {/* Play / Lock */}
                    <div
                      className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border mt-0.5 transition-all ${
                        lesson.available
                          ? 'bg-purple-700/20 border-purple-600/30 group-hover:bg-purple-700/35'
                          : 'bg-white/[0.04] border-white/[0.06]'
                      }`}
                    >
                      {lesson.available ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-purple-300 ml-0.5">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className={`text-sm font-semibold leading-snug ${lesson.available ? 'text-white' : 'text-gray-500'}`}>
                          {lesson.title}
                        </p>
                        <span className="shrink-0 text-[11px] text-gray-600 mt-0.5">{lesson.duration}</span>
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${lesson.available ? 'text-gray-500' : 'text-gray-700'}`}>
                        {lesson.description}
                      </p>
                      {!lesson.available && (
                        <span className="inline-block mt-2 text-[10px] font-semibold text-gray-700 border border-white/[0.06] px-2 py-0.5 rounded-full">
                          Em breve
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-gray-700 text-center leading-relaxed">
        Novas aulas são adicionadas a cada semana. Acompanhe as competências que você mais precisa evoluir.
      </p>
    </div>
  )
}
