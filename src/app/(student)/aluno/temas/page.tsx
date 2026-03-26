import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Biblioteca de Temas | Método Revisão' }

const YEARS = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015']

// Comp-driven theme suggestions — mirrors dashboard SUGGESTED_THEMES
const COMP_THEME_SUGGESTION: Record<string, { title: string; reason: string; trains: string }> = {
  c1_score: {
    title: 'O impacto das redes sociais na língua portuguesa',
    reason: 'Temas linguísticos exigem vocabulário preciso e atenção redobrada à norma culta — o contexto força o cuidado com a escrita.',
    trains: 'C1 — Domínio da Norma Culta',
  },
  c2_score: {
    title: 'Os desafios da educação ambiental no Brasil',
    reason: 'Tema com múltiplas perspectivas que exige uma tese clara e foco constante — ideal para treinar compreensão da proposta.',
    trains: 'C2 — Compreensão da Proposta',
  },
  c3_score: {
    title: 'A influência da inteligência artificial no mercado de trabalho',
    reason: 'Tema contemporâneo com amplo repertório disponível — permite trabalhar dados, estudos e referências de forma natural.',
    trains: 'C3 — Seleção de Argumentos',
  },
  c4_score: {
    title: 'O papel da cultura popular na construção da identidade nacional',
    reason: 'Tema que exige conexões entre diferentes exemplos — treina o uso de conectivos e a articulação entre parágrafos.',
    trains: 'C4 — Mecanismos de Coesão',
  },
  c5_score: {
    title: 'A violência contra a mulher no Brasil: causas e soluções',
    reason: 'Tema social concreto com proposta de intervenção exigida — ideal para praticar os 4 elementos obrigatórios.',
    trains: 'C5 — Proposta de Intervenção',
  },
}

const COMP_LABELS: Record<string, string> = {
  c1_score: 'C1', c2_score: 'C2', c3_score: 'C3', c4_score: 'C4', c5_score: 'C5',
}
const COMP_NAMES: Record<string, string> = {
  c1_score: 'Norma culta', c2_score: 'Compreensão do tema',
  c3_score: 'Seleção de argumentos', c4_score: 'Mecanismos de coesão',
  c5_score: 'Proposta de intervenção',
}

type Theme = { id: string; title: string; year: number | null; category: string | null }

export default async function TemasPage({
  searchParams,
}: {
  searchParams: { ano?: string; treino?: string }
}) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: { user } } = await supabase.auth.getUser()

  /* ── Parallel data fetching ─────────────────────────────────────────────── */
  let themeQuery = db
    .from('themes')
    .select('id, title, year, category')
    .order('year', { ascending: false })
    .order('title')

  if (searchParams.ano) themeQuery = themeQuery.eq('year', parseInt(searchParams.ano))

  const [{ data: themesRaw }, { data: essaysRaw }, { data: latestCorrRaw }] = await Promise.all([
    themeQuery,
    user
      ? db.from('essays').select('theme_id').eq('student_id', user.id).not('theme_id', 'is', null)
      : Promise.resolve({ data: [] }),
    user
      ? db
          .from('essays')
          .select('corrections(c1_score, c2_score, c3_score, c4_score, c5_score)')
          .eq('student_id', user.id)
          .eq('status', 'corrected')
          .order('submitted_at', { ascending: false })
          .limit(1)
      : Promise.resolve({ data: [] }),
  ])

  /* ── Essay counts per theme ─────────────────────────────────────────────── */
  const essayCounts: Record<string, number> = {}
  for (const row of (essaysRaw ?? []) as { theme_id: string }[]) {
    if (row.theme_id) essayCounts[row.theme_id] = (essayCounts[row.theme_id] ?? 0) + 1
  }

  /* ── Weakest competency ──────────────────────────────────────────────────── */
  const compKeys = ['c1_score', 'c2_score', 'c3_score', 'c4_score', 'c5_score']
  const latestCorr = (latestCorrRaw as any[])?.[0]?.corrections?.[0] ?? null
  let weakestCompKey: string | null = null
  if (latestCorr) {
    weakestCompKey = compKeys.reduce((minKey, k) =>
      (latestCorr[k] ?? 0) < (latestCorr[minKey] ?? 0) ? k : minKey
    )
  }
  const suggestion = weakestCompKey ? COMP_THEME_SUGGESTION[weakestCompKey] : null

  /* ── Apply treino filter ─────────────────────────────────────────────────── */
  let allThemes = (themesRaw ?? []) as Theme[]
  const treinoFilter = searchParams.treino ?? null
  if (treinoFilter === 'novo') {
    allThemes = allThemes.filter((t) => !essayCounts[t.id])
  } else if (treinoFilter === 'treinado') {
    allThemes = allThemes.filter((t) => !!essayCounts[t.id])
  }

  const novosCount   = ((themesRaw ?? []) as Theme[]).filter((t) => !essayCounts[t.id]).length
  const treinadosCount = ((themesRaw ?? []) as Theme[]).filter((t) => !!essayCounts[t.id]).length
  const selectedYear = searchParams.ano ?? null

  return (
    <div className="max-w-4xl">
      {/* Masthead */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Biblioteca de Temas</h1>
        <p className="text-sm text-gray-500">
          Temas reais do ENEM e vestibulares para praticar com contexto e profundidade.
        </p>
      </div>

      {/* Suggestion card — only when we know the weakest comp */}
      {suggestion && weakestCompKey && (
        <div className="rounded-2xl border border-purple-500/[0.2] bg-gradient-to-br from-purple-900/20 to-purple-950/10 p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Sugerido para você agora
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  Treina {COMP_LABELS[weakestCompKey]} — {COMP_NAMES[weakestCompKey]}
                </span>
              </div>
              <p className="text-sm font-bold text-white mb-1.5 leading-snug">{suggestion.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{suggestion.reason}</p>
              <Link
                href={`/aluno/redacoes/nova?tema_livre=${encodeURIComponent(suggestion.title)}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Escrever este tema agora
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        {/* Treino filter */}
        <div className="flex items-center gap-1.5">
          {[
            { value: null,       label: 'Todos' },
            { value: 'novo',     label: `Novos${novosCount > 0 ? ` · ${novosCount}` : ''}` },
            { value: 'treinado', label: `Já treinados${treinadosCount > 0 ? ` · ${treinadosCount}` : ''}` },
          ].map(({ value, label }) => {
            const active = treinoFilter === value
            const href = value
              ? `/aluno/temas?${new URLSearchParams({ ...(selectedYear ? { ano: selectedYear } : {}), treino: value }).toString()}`
              : `/aluno/temas${selectedYear ? `?ano=${selectedYear}` : ''}`
            return (
              <Link
                key={label}
                href={href}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  active
                    ? 'bg-purple-700/20 border-purple-600/30 text-purple-300'
                    : 'border-white/[0.08] text-gray-500 hover:text-white hover:border-white/[0.18]'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-4 bg-white/[0.08]" />

        {/* Year filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link
            href={treinoFilter ? `/aluno/temas?treino=${treinoFilter}` : '/aluno/temas'}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              !selectedYear
                ? 'bg-white/[0.08] border-white/[0.12] text-gray-300'
                : 'border-white/[0.06] text-gray-600 hover:text-white hover:border-white/[0.14]'
            }`}
          >
            Todos os anos
          </Link>
          {YEARS.map((yr) => {
            const params = new URLSearchParams({ ano: yr, ...(treinoFilter ? { treino: treinoFilter } : {}) })
            return (
              <Link
                key={yr}
                href={`/aluno/temas?${params.toString()}`}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedYear === yr
                    ? 'bg-white/[0.08] border-white/[0.12] text-gray-300'
                    : 'border-white/[0.06] text-gray-600 hover:text-white hover:border-white/[0.14]'
                }`}
              >
                {yr}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Themes list */}
      {allThemes.length === 0 ? (
        <div className="card-dark rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-white mb-1">Nenhum tema encontrado</p>
          <p className="text-xs text-gray-600 max-w-xs mx-auto">
            {treinoFilter === 'treinado' ? 'Você ainda não treinou nenhum tema com este filtro.' : 'Tente outro filtro de ano ou categoria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {allThemes.map((theme) => {
            const count = essayCounts[theme.id] ?? 0
            const alreadyTrained = count > 0
            return (
              <div
                key={theme.id}
                className={`rounded-2xl p-4 flex items-center justify-between gap-4 border transition-all ${
                  alreadyTrained
                    ? 'bg-white/[0.015] border-white/[0.04] hover:border-white/[0.07]'
                    : 'card-dark hover:border-white/[0.10]'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Trained indicator */}
                  <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                    alreadyTrained
                      ? 'bg-emerald-500/15 border border-emerald-500/25'
                      : 'bg-white/[0.04] border border-white/[0.08]'
                  }`}>
                    {alreadyTrained ? (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/[0.15]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {theme.year && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/[0.04] ${alreadyTrained ? 'text-gray-700' : 'text-gray-500'}`}>
                          {theme.year}
                        </span>
                      )}
                      {theme.category && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          alreadyTrained
                            ? 'bg-white/[0.03] border-white/[0.06] text-gray-600'
                            : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                        }`}>
                          {theme.category}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-semibold leading-snug ${alreadyTrained ? 'text-gray-500' : 'text-white'}`}>
                      {theme.title}
                    </p>
                    {alreadyTrained && (
                      <p className="text-[11px] text-gray-700 mt-0.5">
                        {count === 1 ? '1 redação escrita' : `${count} redações escritas`}
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  href={`/aluno/redacoes/nova?tema=${theme.id}`}
                  className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    alreadyTrained
                      ? 'border-white/[0.08] text-gray-600 hover:text-gray-300 hover:border-white/[0.16]'
                      : 'border-purple-600/30 bg-purple-700/15 text-purple-300 hover:bg-purple-700/25'
                  }`}
                >
                  {alreadyTrained ? 'Escrever novamente' : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Escrever
                    </>
                  )}
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {/* Count footer */}
      {allThemes.length > 0 && (
        <p className="mt-5 text-xs text-gray-700 text-center">
          {allThemes.length} tema{allThemes.length !== 1 ? 's' : ''}
          {treinoFilter === 'novo' ? ' ainda não treinados' : treinoFilter === 'treinado' ? ' já treinados' : ''}
          {selectedYear ? ` de ${selectedYear}` : ' disponíveis'}
        </p>
      )}
    </div>
  )
}
