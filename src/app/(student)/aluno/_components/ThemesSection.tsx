'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, BookOpen, ArrowRight, Tag } from 'lucide-react'

interface Theme {
  id: string
  title: string
  tags: string[]
  trains: string
  difficulty: 'Básico' | 'Médio' | 'Avançado'
}

// Static seed themes — in production these would come from the DB
const SEED_THEMES: Theme[] = [
  { id: '1', title: 'O impacto das redes sociais na língua portuguesa',        tags: ['C1', 'Linguagem'],     trains: 'C1', difficulty: 'Médio'    },
  { id: '2', title: 'Desafios da educação ambiental no Brasil',                tags: ['C2', 'Meio ambiente'], trains: 'C2', difficulty: 'Médio'    },
  { id: '3', title: 'A influência da IA no mercado de trabalho',               tags: ['C3', 'Tecnologia'],    trains: 'C3', difficulty: 'Avançado' },
  { id: '4', title: 'O papel da cultura popular na identidade nacional',       tags: ['C4', 'Cultura'],       trains: 'C4', difficulty: 'Médio'    },
  { id: '5', title: 'Violência contra a mulher: causas e soluções',            tags: ['C5', 'Sociedade'],     trains: 'C5', difficulty: 'Avançado' },
  { id: '6', title: 'Mobilidade urbana e desigualdade social',                 tags: ['C3', 'Urbanismo'],     trains: 'C3', difficulty: 'Básico'   },
  { id: '7', title: 'O avanço das fake news e a desinformação',                tags: ['C2', 'Mídia'],         trains: 'C2', difficulty: 'Médio'    },
  { id: '8', title: 'Saúde mental dos jovens no Brasil pós-pandemia',          tags: ['C5', 'Saúde'],         trains: 'C5', difficulty: 'Médio'    },
  { id: '9', title: 'Desigualdade no acesso à tecnologia no Brasil',           tags: ['C3', 'Tecnologia'],    trains: 'C3', difficulty: 'Básico'   },
]

const DIFFICULTY_COLORS: Record<string, string> = {
  Básico:   'text-green-400 bg-green-500/10 border-green-500/20',
  Médio:    'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Avançado: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const ALL_TAGS = ['Todos', 'C1', 'C2', 'C3', 'C4', 'C5', 'Tecnologia', 'Sociedade', 'Cultura', 'Saúde']

export function ThemesSection() {
  const [query,      setQuery]      = useState('')
  const [activeTag,  setActiveTag]  = useState('Todos')

  const filtered = SEED_THEMES.filter(t => {
    const matchQ   = !query || t.title.toLowerCase().includes(query.toLowerCase())
    const matchTag = activeTag === 'Todos' || t.tags.includes(activeTag)
    return matchQ && matchTag
  })

  return (
    <div className="card-dark rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <BookOpen size={14} className="text-purple-400" />
            Banco de Temas
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">Temas selecionados para o ENEM</p>
        </div>
        <Link href="/aluno/temas" className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
          Ver todos <ArrowRight size={11} />
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar tema…"
          className="w-full h-9 pl-8 pr-4 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30"
        />
      </div>

      {/* Tag filter */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {ALL_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              activeTag === tag
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/40'
                : 'bg-white/[0.03] text-gray-500 border-white/[0.06] hover:border-white/[0.12] hover:text-gray-400'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Theme list */}
      <div className="space-y-2">
        {filtered.slice(0, 5).map(theme => (
          <Link
            key={theme.id}
            href={`/aluno/temas/${theme.id}`}
            className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mt-0.5">
              <Tag size={11} className="text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300 group-hover:text-white transition-colors leading-snug line-clamp-2">
                {theme.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {theme.tags.map(t => (
                  <span key={t} className="text-[10px] text-gray-600 bg-white/[0.03] border border-white/[0.06] px-1.5 py-0.5 rounded">
                    {t}
                  </span>
                ))}
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[theme.difficulty]}`}>
                  {theme.difficulty}
                </span>
              </div>
            </div>
            <ArrowRight size={13} className="text-gray-700 group-hover:text-gray-400 transition-colors mt-1 shrink-0" />
          </Link>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-gray-600 text-center py-6">Nenhum tema encontrado para "{query}"</p>
        )}
      </div>
    </div>
  )
}
