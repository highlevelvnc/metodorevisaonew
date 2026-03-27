import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Biblioteca de Temas | Método Revisão' }
export const dynamic = 'force-dynamic'

// ─── Year chips ───────────────────────────────────────────────────────────────

const YEARS = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015']

// ─── Seed themes ─ curated ENEM themes, always shown when DB is empty ─────────
// These are verified real ENEM themes or high-probability future topics.

const SEED_THEMES = [
  {
    title: 'Os desafios da inclusão digital no Brasil',
    tag: 'Tecnologia',
    insight: 'Tema muito recorrente no ENEM — apareceu em edições recentes',
  },
  {
    title: 'A violência contra a mulher no Brasil: causas e soluções',
    tag: 'Direitos Humanos',
    insight: 'Tema ENEM 2015 — cobrado com frequência em simulados',
  },
  {
    title: 'Fake news e os impactos na democracia brasileira',
    tag: 'Tecnologia / Política',
    insight: 'Alta probabilidade no ENEM — amplo repertório disponível',
  },
  {
    title: 'Os impactos da inteligência artificial no mercado de trabalho',
    tag: 'Tecnologia',
    insight: 'Tema em ascensão — forte para argumentação e C3',
  },
  {
    title: 'Desafios para a preservação da Amazônia no Brasil',
    tag: 'Meio Ambiente',
    insight: 'Clássico ENEM — excelente para treinar proposta de intervenção C5',
  },
  {
    title: 'A saúde mental dos jovens no Brasil pós-pandemia',
    tag: 'Saúde',
    insight: 'Tema emergente — muitos dados disponíveis para C3',
  },
  {
    title: 'Desigualdade racial no sistema educacional brasileiro',
    tag: 'Educação / Direitos',
    insight: 'Alta frequência no ENEM — dados do IBGE facilitam argumentação',
  },
  {
    title: 'O papel das redes sociais na construção da identidade dos jovens',
    tag: 'Tecnologia / Cultura',
    insight: 'Tema contemporâneo com múltiplas perspectivas — ótimo para C4',
  },
]

// ─── Comp-driven theme suggestions ───────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

type OfficialTheme = { id: string; title: string; year: number | null; category: string | null }
type SourceTag = 'oficial' | 'mais-praticado' | 'recente' | 'comunidade' | 'em-alta'

interface CommunityTheme {
  title: string
  count: number
  lastSeen: string
  source: SourceTag
  isTrending: boolean
}

// ─── Tag taxonomy ── keyword-based grouping for "related themes" ───────────────

type ThemeTag =
  | 'tecnologia' | 'educação' | 'meio ambiente'
  | 'saúde' | 'direitos humanos' | 'desigualdade'
  | 'democracia' | 'cultura' | 'economia'

function getThemeTags(title: string): ThemeTag[] {
  const t = normalizeTitle(title)
  const tags: ThemeTag[] = []
  if (/tecnolog|digital|internet|inteligencia artificial|\bia\b|redes sociais|fake news|desinformac|privacidade/.test(t)) tags.push('tecnologia')
  if (/educac|escola|ensino|aluno|professor|universidade|evasao|letramento|alfabetiz/.test(t)) tags.push('educação')
  if (/meio ambiente|floresta|clima|sustentab|ambiental|carbono|desmatament|amazonia|biodiversidade|lixo|residuos/.test(t)) tags.push('meio ambiente')
  if (/saude|mental|depressao|ansiedade|suicid|pandemia|doenca|sistema de saude|bem estar/.test(t)) tags.push('saúde')
  if (/mulher|genero|femini|violencia|racismo|racial|negro|negra|indigena|lgbtq|deficiente|acessib|minorias/.test(t)) tags.push('direitos humanos')
  if (/desigualdade|pobreza|fome|exclusao|vulnerab|renda|trabalhador|concentrac/.test(t)) tags.push('desigualdade')
  if (/democracia|politica|corrupcao|eleitoral|cidadania|estado|republica|polarizac/.test(t)) tags.push('democracia')
  if (/cultura|identidade|arte|literatura|musica|patrimonio|folclore|popular|religiao/.test(t)) tags.push('cultura')
  if (/economia|mercado|emprego|trabalho|renda basica|inflacao|industria|producao/.test(t)) tags.push('economia')
  return tags.slice(0, 2)
}

// ─── Text helpers ────────────────────────────────────────────────────────────

function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isQualityTitle(raw: string): boolean {
  const t = raw.trim()
  if (t.split(/\s+/).length < 5) return false
  if (t.length < 25) return false
  if (t === t.toUpperCase() && /[A-ZÁÀÃÂÉÊÍÓÔÕÚÇ]{4,}/.test(t)) return false
  if (/^(teste|test\s|redaç[aã]o\s|minha\s|exerc[ií]cio|treino|tema\s(livre|do)\s|escreva|dissert)/i.test(t)) return false
  if (/^[\W\d\s]+$/.test(t)) return false
  if (!/[a-záàãâéêíóôõúüç]{4,}/i.test(t)) return false
  return true
}

// ─── Source pill styles ───────────────────────────────────────────────────────

const SOURCE_CONFIG: Record<SourceTag, { label: string; pill: string }> = {
  'oficial':         { label: 'Oficial ENEM',   pill: 'text-purple-400 bg-purple-500/10 border-purple-500/25' },
  'mais-praticado':  { label: 'Mais praticado', pill: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
  'em-alta':         { label: '🔥 Em alta',     pill: 'text-orange-400 bg-orange-500/10 border-orange-500/25' },
  'recente':         { label: 'Recente',         pill: 'text-blue-400 bg-blue-500/10 border-blue-500/25' },
  'comunidade':      { label: 'Comunidade',      pill: 'text-gray-400 bg-white/[0.04] border-white/[0.10]' },
}

// ─── Biia prompt helper ───────────────────────────────────────────────────────

function biiaPrompt(title: string): string {
  return `/aluno/biia?prompt=${encodeURIComponent(
    `Me dê um repertório completo de argumentos, dados e referências para escrever sobre: "${title}". Inclua pelo menos 3 dados estatísticos, 2 autores ou pensadores e 1 referência jurídica ou histórica.`
  )}`
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

function IconPen() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
function IconSparkle() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
function IconArrow() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}
function IconBook() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

// ─── Section divider ─────────────────────────────────────────────────────────

function SectionDivider({ children, right }: { children: React.ReactNode; right?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 px-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 whitespace-nowrap">
        {children}
      </p>
      <div className="flex-1 h-px bg-white/[0.05]" />
      {right && <p className="text-[10px] text-gray-700 whitespace-nowrap">{right}</p>}
    </div>
  )
}

// ─── Seed theme row ── shown when DB is empty ─────────────────────────────────

function SeedThemeRow({ theme }: { theme: typeof SEED_THEMES[number] }) {
  return (
    <div className="card-dark rounded-2xl p-4 flex items-center justify-between gap-4 border border-white/[0.07] hover:border-purple-500/20 hover:shadow-[0_2px_16px_rgba(124,58,237,0.08)] transition-all duration-200">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="shrink-0 w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400/40" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-gray-400 bg-white/[0.04] border-white/[0.10]">
              {theme.tag}
            </span>
            <span className="text-[10px] text-gray-700 italic">{theme.insight}</span>
          </div>
          <p className="text-sm font-semibold text-white leading-snug">{theme.title}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href={biiaPrompt(theme.title)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-purple-600/20 bg-purple-700/10 text-purple-400 hover:bg-purple-700/25 hover:border-purple-500/40 hover:scale-[1.02] transition-all duration-150"
        >
          <IconSparkle />
          Repertório Biia
        </a>
        <Link
          href={`/aluno/redacoes/nova?tema_livre=${encodeURIComponent(theme.title)}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-purple-600/30 bg-purple-700/15 text-purple-300 hover:bg-purple-700/25 hover:scale-[1.02] transition-all duration-150"
        >
          <IconPen />
          Escrever
        </Link>
      </div>
    </div>
  )
}

// ─── Community theme row ──────────────────────────────────────────────────────

function CommunityThemeRow({ theme }: { theme: CommunityTheme }) {
  const cfg = SOURCE_CONFIG[theme.source]
  return (
    <div className="card-dark rounded-2xl p-4 flex items-center justify-between gap-4 border border-white/[0.07] hover:border-white/[0.12] hover:shadow-[0_2px_16px_rgba(124,58,237,0.07)] transition-all duration-200">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="shrink-0 w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/[0.15]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.pill}`}>
              {cfg.label}
            </span>
            {theme.count >= 2 && (
              <span className="text-[10px] text-gray-600 tabular-nums">
                {theme.count}× praticado{theme.count !== 1 ? 's' : ''}
              </span>
            )}
            {theme.isTrending && (
              <span className="text-[10px] font-medium text-orange-400/80">↑ em alta esta semana</span>
            )}
          </div>
          <p className="text-sm font-semibold text-white leading-snug">{theme.title}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href={biiaPrompt(theme.title)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-purple-600/20 bg-purple-700/10 text-purple-400 hover:bg-purple-700/25 hover:border-purple-500/40 hover:scale-[1.02] transition-all duration-150"
        >
          <IconSparkle />
          Repertório Biia
        </a>
        <Link
          href={`/aluno/redacoes/nova?tema_livre=${encodeURIComponent(theme.title)}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/[0.09] text-gray-500 hover:text-gray-300 hover:border-white/[0.18] hover:scale-[1.02] transition-all duration-150"
        >
          <IconPen />
          Escrever
        </Link>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TemasPage({
  searchParams,
}: {
  searchParams: { ano?: string; treino?: string; fonte?: string }
}) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: { user } } = await supabase.auth.getUser()

  /* ── Parallel data fetching ──────────────────────────────────────────────── */
  let themeQuery = db
    .from('themes')
    .select('id, title, year, category')
    .order('year', { ascending: false })
    .order('title')

  if (searchParams.ano) themeQuery = themeQuery.eq('year', parseInt(searchParams.ano))

  const sevenDaysAgo  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: themesRaw },
    { data: essaysRaw },
    { data: latestCorrRaw },
    { data: communityEssaysRaw },
  ] = await Promise.all([
    themeQuery,

    // Student's essay-theme counts (for trained/untrained filter)
    user
      ? db.from('essays').select('theme_id').eq('student_id', user.id).not('theme_id', 'is', null)
      : Promise.resolve({ data: [] }),

    // Weakest competency from most recent correction
    user
      ? db
          .from('essays')
          .select('corrections(c1_score, c2_score, c3_score, c4_score, c5_score)')
          .eq('student_id', user.id)
          .eq('status', 'corrected')
          .order('submitted_at', { ascending: false })
          .limit(1)
      : Promise.resolve({ data: [] }),

    // Community free-text themes from all platform essays (last 500)
    db
      .from('essays')
      .select('theme_title, submitted_at')
      .is('theme_id', null)
      .not('theme_title', 'is', null)
      .order('submitted_at', { ascending: false })
      .limit(500),
  ])

  /* ── Essay counts per official theme ─────────────────────────────────────── */
  const essayCounts: Record<string, number> = {}
  for (const row of (essaysRaw ?? []) as { theme_id: string }[]) {
    if (row.theme_id) essayCounts[row.theme_id] = (essayCounts[row.theme_id] ?? 0) + 1
  }

  /* ── Weakest competency ───────────────────────────────────────────────────── */
  const compKeys = ['c1_score', 'c2_score', 'c3_score', 'c4_score', 'c5_score']
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const latestCorr = (latestCorrRaw as any[])?.[0]?.corrections?.[0] ?? null
  let weakestCompKey: string | null = null
  if (latestCorr) {
    weakestCompKey = compKeys.reduce((minKey, k) =>
      (latestCorr[k] ?? 0) < (latestCorr[minKey] ?? 0) ? k : minKey
    )
  }
  const suggestion = weakestCompKey ? COMP_THEME_SUGGESTION[weakestCompKey] : null

  /* ── Build official themes list ───────────────────────────────────────────── */
  const officialNorms = new Set<string>()
  const allOfficial = ((themesRaw ?? []) as OfficialTheme[]).map(t => {
    officialNorms.add(normalizeTitle(t.title))
    return t
  })

  /* ── Build related-themes map (keyword tag similarity) ───────────────────── */
  // Pre-compute tags for every official theme once
  const themeTagsMap = new Map<string, ThemeTag[]>()
  for (const t of allOfficial) {
    themeTagsMap.set(t.id, getThemeTags(t.title))
  }
  function getRelatedThemes(id: string, max = 2): OfficialTheme[] {
    const myTags = themeTagsMap.get(id) ?? []
    if (myTags.length === 0) return []
    return allOfficial
      .filter(t => t.id !== id)
      .filter(t => {
        const their = themeTagsMap.get(t.id) ?? []
        return their.some(tag => (myTags as string[]).includes(tag))
      })
      .slice(0, max)
  }

  /* ── Build community themes ───────────────────────────────────────────────── */
  const communityMap = new Map<string, { title: string; count: number; lastSeen: string }>()
  for (const row of (communityEssaysRaw ?? []) as { theme_title: string; submitted_at: string }[]) {
    if (!row.theme_title?.trim()) continue
    const norm = normalizeTitle(row.theme_title)
    if (officialNorms.has(norm)) continue           // skip official theme duplicates
    if (!isQualityTitle(row.theme_title)) continue  // reject noise
    const existing = communityMap.get(norm)
    if (existing) {
      communityMap.set(norm, {
        title: existing.title,
        count: existing.count + 1,
        lastSeen: existing.lastSeen > row.submitted_at ? existing.lastSeen : row.submitted_at,
      })
    } else {
      communityMap.set(norm, { title: row.theme_title.trim(), count: 1, lastSeen: row.submitted_at })
    }
  }

  // Tag and classify community themes
  const allCommunity: CommunityTheme[] = Array.from(communityMap.values())
    .map(t => {
      const isTrending = t.lastSeen >= sevenDaysAgo
      let source: SourceTag = 'comunidade'
      if (isTrending && t.count >= 2) source = 'em-alta'
      else if (t.count >= 4)          source = 'mais-praticado'
      else if (t.lastSeen >= thirtyDaysAgo) source = 'recente'
      return { ...t, source, isTrending }
    })
    .sort((a, b) => {
      // em-alta → mais-praticado → recente → comunidade, then by count
      const order: SourceTag[] = ['em-alta', 'mais-praticado', 'recente', 'comunidade']
      const diff = order.indexOf(a.source) - order.indexOf(b.source)
      return diff !== 0 ? diff : b.count - a.count
    })
    .slice(0, 50)

  // Split into display groups
  const trendingThemes  = allCommunity.filter(t => t.source === 'em-alta').slice(0, 6)
  const popularThemes   = allCommunity.filter(t => t.source === 'mais-praticado').slice(0, 6)
  const generalThemes   = allCommunity.filter(t => !['em-alta', 'mais-praticado'].includes(t.source)).slice(0, 20)

  /* ── Apply filters ────────────────────────────────────────────────────────── */
  let filteredOfficial = allOfficial
  const treinoFilter = searchParams.treino ?? null
  const selectedYear  = searchParams.ano ?? null

  if (treinoFilter === 'novo') {
    filteredOfficial = filteredOfficial.filter(t => !essayCounts[t.id])
  } else if (treinoFilter === 'treinado') {
    filteredOfficial = filteredOfficial.filter(t => !!essayCounts[t.id])
  }

  const novosCount     = allOfficial.filter(t => !essayCounts[t.id]).length
  const treinadosCount = allOfficial.filter(t => !!essayCounts[t.id]).length

  // Community sections only when no year/treino filter
  const showCommunity = !selectedYear && !treinoFilter

  // Whether DB official themes are empty (triggers seed fallback)
  const dbIsEmpty = allOfficial.length === 0

  // Total community count for stats
  const totalCommunity = allCommunity.length

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl">

      {/* Masthead */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Biblioteca de Temas</h1>
        <p className="text-sm text-gray-500">
          {dbIsEmpty
            ? 'Temas curados para o ENEM · mais praticados na plataforma · recomendados pela Biia'
            : 'Temas oficiais do ENEM · mais praticados na plataforma · recentes da comunidade'}
        </p>
      </div>

      {/* ── 🎯 Recomendado para você ── competency-aware suggestion card ──────── */}
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
                  🎯 Recomendado para você agora
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  Treina {COMP_LABELS[weakestCompKey]} — {COMP_NAMES[weakestCompKey]}
                </span>
              </div>
              <p className="text-sm font-bold text-white mb-1.5 leading-snug">{suggestion.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{suggestion.reason}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/aluno/redacoes/nova?tema_livre=${encodeURIComponent(suggestion.title)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 hover:scale-[1.02] text-white transition-all duration-150"
                >
                  <IconPen />
                  Escrever este tema
                </Link>
                <a
                  href={biiaPrompt(suggestion.title)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-purple-600/30 bg-purple-700/10 text-purple-300 hover:bg-purple-700/20 hover:scale-[1.02] transition-all duration-150"
                >
                  <IconSparkle />
                  Gerar repertório com a Biia
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-5 text-xs text-gray-600 flex-wrap">
        {dbIsEmpty ? (
          <span><span className="text-white font-semibold">{SEED_THEMES.length}</span> temas curados</span>
        ) : (
          <span className="tabular-nums"><span className="text-white font-semibold">{allOfficial.length}</span> temas oficiais</span>
        )}
        {totalCommunity > 0 && (
          <>
            <span className="text-white/10">·</span>
            <span className="tabular-nums"><span className="text-white font-semibold">{totalCommunity}</span> da comunidade</span>
          </>
        )}
        {trendingThemes.length > 0 && (
          <>
            <span className="text-white/10">·</span>
            <span className="text-orange-400 font-semibold tabular-nums">🔥 {trendingThemes.length} em alta esta semana</span>
          </>
        )}
        {treinadosCount > 0 && (
          <>
            <span className="text-white/10">·</span>
            <span className="tabular-nums"><span className="text-green-400 font-semibold">{treinadosCount}</span> já treinados</span>
          </>
        )}
      </div>

      {/* Filters row — only show when DB has official themes */}
      {!dbIsEmpty && (
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
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          BRANCH A — DB IS EMPTY → show curated seed themes
         ══════════════════════════════════════════════════════════════════════ */}
      {dbIsEmpty && (
        <div className="mb-6">
          <SectionDivider right="Temas ENEM selecionados para praticar">
            ✨ Sugestões para começar
          </SectionDivider>
          <div className="space-y-2">
            {SEED_THEMES.map((theme, i) => (
              <SeedThemeRow key={i} theme={theme} />
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-700 text-center">
            {SEED_THEMES.length} temas curados para o ENEM
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          BRANCH B — DB has official themes
         ══════════════════════════════════════════════════════════════════════ */}
      {!dbIsEmpty && (
        <>
          {/* Official themes list — enhanced with Biia CTA + related themes */}
          {filteredOfficial.length === 0 ? (
            <div className="mb-6">
              {/* Smart empty state — NEVER just "nothing found" */}
              <div className="card-dark rounded-2xl p-8 text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <IconBook />
                </div>
                <p className="text-sm font-semibold text-white mb-1">
                  {treinoFilter === 'treinado'
                    ? 'Você ainda não treinou nenhum tema'
                    : `Nenhum tema oficial de ${selectedYear ?? 'este filtro'}`}
                </p>
                <p className="text-xs text-gray-600 max-w-xs mx-auto mb-4">
                  {treinoFilter === 'treinado'
                    ? 'Escreva sua primeira redação com um tema oficial para aparecer aqui.'
                    : 'Experimente remover o filtro de ano ou treino.'}
                </p>
                <Link
                  href="/aluno/temas"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border border-white/[0.10] text-gray-400 hover:text-white hover:border-white/[0.20] transition-all"
                >
                  <IconArrow />
                  Ver todos os temas
                </Link>
              </div>
              {/* Fallback: show seed themes even when filter returns nothing */}
              <SectionDivider right="Pratique enquanto isso">
                Temas recomendados
              </SectionDivider>
              <div className="space-y-2">
                {SEED_THEMES.slice(0, 4).map((theme, i) => (
                  <SeedThemeRow key={i} theme={theme} />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2 mb-6">
              {filteredOfficial.map((theme) => {
                const count        = essayCounts[theme.id] ?? 0
                const alreadyDone  = count > 0
                const related      = getRelatedThemes(theme.id)
                const tags         = themeTagsMap.get(theme.id) ?? []

                return (
                  <div
                    key={theme.id}
                    className={`rounded-2xl p-4 border transition-all duration-200 ${
                      alreadyDone
                        ? 'bg-white/[0.015] border-white/[0.04] hover:border-white/[0.08]'
                        : 'card-dark hover:border-purple-500/20 hover:shadow-[0_2px_16px_rgba(124,58,237,0.08)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: indicator + metadata + title */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          alreadyDone
                            ? 'bg-emerald-500/15 border border-emerald-500/25'
                            : 'bg-white/[0.04] border border-white/[0.08]'
                        }`}>
                          {alreadyDone ? (
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-white/[0.15]" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Pills row */}
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {theme.year && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/[0.04] ${alreadyDone ? 'text-gray-700' : 'text-gray-500'}`}>
                                {theme.year}
                              </span>
                            )}
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${SOURCE_CONFIG['oficial'].pill}`}>
                              {SOURCE_CONFIG['oficial'].label}
                            </span>
                            {theme.category && (
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                alreadyDone
                                  ? 'bg-white/[0.03] border-white/[0.06] text-gray-600'
                                  : 'bg-white/[0.04] border-white/[0.09] text-gray-500'
                              }`}>
                                {theme.category}
                              </span>
                            )}
                            {/* Keyword tags */}
                            {tags.map(tag => (
                              <span key={tag} className="text-[10px] text-gray-700 italic">{tag}</span>
                            ))}
                          </div>

                          {/* Title */}
                          <p className={`text-sm font-semibold leading-snug ${alreadyDone ? 'text-gray-500' : 'text-white'}`}>
                            {theme.title}
                          </p>

                          {/* Count + related themes */}
                          <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                            {alreadyDone && (
                              <span className="text-[11px] text-gray-700">
                                {count === 1 ? '1 redação escrita' : `${count} redações escritas`}
                              </span>
                            )}
                            {related.length > 0 && (
                              <span className="flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-700">Relacionados:</span>
                                {related.map(rt => (
                                  <Link
                                    key={rt.id}
                                    href={`/aluno/redacoes/nova?tema=${rt.id}`}
                                    title={rt.title}
                                    className="text-[10px] text-gray-600 hover:text-purple-400 underline decoration-dotted underline-offset-2 transition-colors truncate max-w-[140px]"
                                  >
                                    {rt.title.length > 35 ? rt.title.slice(0, 35) + '…' : rt.title}
                                  </Link>
                                ))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={biiaPrompt(theme.title)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-purple-600/20 bg-purple-700/10 text-purple-400 hover:bg-purple-700/25 hover:border-purple-500/40 hover:scale-[1.02] transition-all duration-150"
                        >
                          <IconSparkle />
                          <span className="hidden sm:inline">Repertório Biia</span>
                          <span className="sm:hidden">Biia</span>
                        </a>
                        <Link
                          href={`/aluno/redacoes/nova?tema=${theme.id}`}
                          className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all duration-150 hover:scale-[1.02] ${
                            alreadyDone
                              ? 'border-white/[0.08] text-gray-600 hover:text-gray-300 hover:border-white/[0.16]'
                              : 'border-purple-600/30 bg-purple-700/15 text-purple-300 hover:bg-purple-700/25'
                          }`}
                        >
                          {alreadyDone ? (
                            'Escrever novamente'
                          ) : (
                            <>
                              <IconPen />
                              Escrever
                            </>
                          )}
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Count footer */}
          {filteredOfficial.length > 0 && (
            <p className="mb-8 text-xs text-gray-700 text-center">
              {filteredOfficial.length} tema{filteredOfficial.length !== 1 ? 's' : ''}
              {treinoFilter === 'novo' ? ' ainda não treinados' : treinoFilter === 'treinado' ? ' já treinados' : ' oficiais'}
              {selectedYear ? ` de ${selectedYear}` : ''}
            </p>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          COMMUNITY SECTIONS — always shown when showCommunity is true
          Order: Em alta → Mais praticados → Comunidade geral
         ══════════════════════════════════════════════════════════════════════ */}

      {showCommunity && (

        <div className="space-y-8">

          {/* 🔥 Em alta — trending last 7 days */}
          {trendingThemes.length > 0 && (
            <div>
              <SectionDivider right="últimos 7 dias">
                🔥 Em alta na plataforma
              </SectionDivider>
              <div className="space-y-2">
                {trendingThemes.map((theme, i) => (
                  <CommunityThemeRow key={i} theme={theme} />
                ))}
              </div>
            </div>
          )}

          {/* 📈 Mais praticados — all-time frequency */}
          {popularThemes.length > 0 && (
            <div>
              <SectionDivider right={`${popularThemes.reduce((s, t) => s + t.count, 0)} redações enviadas`}>
                📈 Mais praticados na plataforma
              </SectionDivider>
              <div className="space-y-2">
                {popularThemes.map((theme, i) => (
                  <CommunityThemeRow key={i} theme={theme} />
                ))}
              </div>
            </div>
          )}

          {/* Comunidade geral — recent but not yet trending/popular */}
          {generalThemes.length > 0 && (
            <div>
              <SectionDivider right="Mais recentes">
                Temas da comunidade
              </SectionDivider>
              <div className="space-y-2">
                {generalThemes.map((theme, i) => (
                  <CommunityThemeRow key={i} theme={theme} />
                ))}
              </div>
              <p className="mt-5 text-xs text-gray-700 text-center">
                {generalThemes.length} tema{generalThemes.length !== 1 ? 's' : ''} enviados pela comunidade
              </p>
            </div>
          )}

          {/* If DB is empty AND community is also empty → show full seed + note */}
          {dbIsEmpty && trendingThemes.length === 0 && popularThemes.length === 0 && generalThemes.length === 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
              <p className="text-xs text-gray-600">
                Os temas mais praticados pela comunidade aparecerão aqui conforme os alunos enviarem redações.
              </p>
            </div>
          )}

        </div>
      )}

      {/* Community stats footer */}
      {showCommunity && totalCommunity === 0 && !dbIsEmpty && (
        <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="text-xs text-gray-600">
            Os temas mais praticados pela comunidade aparecerão aqui em breve.
          </p>
          <a
            href={biiaPrompt('um tema atual do ENEM com alta probabilidade de cair no próximo exame')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors mt-2"
          >
            <IconSparkle />
            Pedir sugestão de tema para a Biia
          </a>
        </div>
      )}

    </div>
  )
}
