import Link from 'next/link'
import { BookOpen, ArrowRight, TrendingUp, Sparkles, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

// Competency-targeted theme suggestions
const COMP_THEMES: Record<string, { title: string; trains: string; reason: string }> = {
  c1_score: {
    title: 'O impacto das redes sociais na língua portuguesa',
    trains: 'C1',
    reason: 'Tema linguístico — escrever sobre linguagem exige atenção máxima à norma culta.',
  },
  c2_score: {
    title: 'Os desafios da educação ambiental no Brasil',
    trains: 'C2',
    reason: 'Múltiplas perspectivas exigem tese clara e foco constante no tema proposto.',
  },
  c3_score: {
    title: 'A influência da inteligência artificial no mercado de trabalho',
    trains: 'C3',
    reason: 'Amplo repertório disponível — dados, estudos e referências entram naturalmente.',
  },
  c4_score: {
    title: 'O papel da cultura popular na construção da identidade nacional',
    trains: 'C4',
    reason: 'Conectar exemplos variados treina o uso de conectivos e coesão entre parágrafos.',
  },
  c5_score: {
    title: 'A violência contra a mulher no Brasil: causas e soluções',
    trains: 'C5',
    reason: 'Tema social concreto que exige proposta de intervenção precisa com os 4 elementos.',
  },
}

// Fallback when DB has no community data yet
const FALLBACK_THEMES = [
  'Desafios para a inclusão digital no Brasil',
  'Saúde mental dos jovens no Brasil pós-pandemia',
  'Fake news e a crise da democracia brasileira',
  'Desigualdade racial no sistema educacional',
  'O impacto das redes sociais na saúde mental',
]

function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function ThemesSection({ worstCompKey }: { worstCompKey: string | null }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (await createClient()) as any

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Fetch community trending themes (platform-wide, last 30 days)
  // Wrapped in try/catch: this component must never crash the parent page.
  let rawTrending: { theme_title: string }[] | null = null
  try {
    const { data } = await db
      .from('essays')
      .select('theme_title')
      .is('theme_id', null)
      .not('theme_title', 'is', null)
      .gte('submitted_at', thirtyDaysAgo)
      .limit(300)
    rawTrending = data
  } catch {
    // Non-fatal: fall back to static themes below
    rawTrending = null
  }

  // Aggregate with deduplication
  const countMap = new Map<string, { title: string; count: number }>()
  for (const row of (rawTrending ?? []) as { theme_title: string }[]) {
    const raw = row.theme_title?.trim()
    if (!raw || raw.length < 25 || raw.split(/\s+/).length < 5) continue
    const norm = normalizeTitle(raw)
    const existing = countMap.get(norm)
    if (existing) {
      countMap.set(norm, { title: existing.title, count: existing.count + 1 })
    } else {
      countMap.set(norm, { title: raw, count: 1 })
    }
  }

  const trending = Array.from(countMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const displayThemes = trending.length >= 3
    ? trending
    : FALLBACK_THEMES.slice(0, 5).map(title => ({ title, count: 0 }))

  const recommended = worstCompKey ? COMP_THEMES[worstCompKey] : null

  return (
    <div className="card-dark rounded-2xl p-5 flex flex-col h-full">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <BookOpen size={14} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold text-white">Banco de Temas</h2>
            <p className="text-[11px] text-gray-600 mt-0.5">
              {trending.length >= 3 ? 'Em alta na plataforma · últimos 30 dias' : 'Temas recomendados para o ENEM'}
            </p>
          </div>
        </div>
        <Link
          href="/aluno/temas"
          className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-purple-400 transition-colors"
        >
          Biblioteca <ArrowRight size={10} />
        </Link>
      </div>

      {/* Recommended — personalised to weakest competency */}
      {recommended && (
        <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/[0.05] p-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles size={9} className="text-purple-400" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-400">
              Recomendado · treina {recommended.trains}
            </p>
          </div>
          <p className="text-[12px] font-semibold text-white leading-snug mb-1">
            {recommended.title}
          </p>
          <p className="text-[11px] text-gray-600 leading-relaxed mb-2.5">
            {recommended.reason}
          </p>
          <Link
            href={`/aluno/redacoes/nova?tema_livre=${encodeURIComponent(recommended.title)}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            <PenLine size={10} />
            Escrever este tema
          </Link>
        </div>
      )}

      {/* Trending / popular list */}
      <div className="flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-700 mb-2">
          {trending.length >= 3 ? 'Mais praticados' : 'Sugeridos para praticar'}
        </p>
        {displayThemes.map((theme, i) => (
          <Link
            key={i}
            href={`/aluno/redacoes/nova?tema_livre=${encodeURIComponent(theme.title)}`}
            className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.07] transition-all"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center group-hover:border-purple-500/20 transition-all">
              {theme.count >= 3 ? (
                <TrendingUp size={10} className="text-amber-400" />
              ) : (
                <span className="text-[10px] font-bold text-gray-700">{i + 1}</span>
              )}
            </div>
            <p className="flex-1 text-[12px] font-medium text-gray-400 group-hover:text-gray-200 transition-colors leading-snug line-clamp-2">
              {theme.title}
            </p>
            {theme.count >= 2 && (
              <span className="shrink-0 text-[10px] text-gray-700 tabular-nums">{theme.count}×</span>
            )}
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-white/[0.05]">
        <Link
          href="/aluno/temas"
          className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-gray-600 hover:text-gray-300 transition-colors"
        >
          Ver biblioteca completa de temas
          <ArrowRight size={10} />
        </Link>
      </div>
    </div>
  )
}
