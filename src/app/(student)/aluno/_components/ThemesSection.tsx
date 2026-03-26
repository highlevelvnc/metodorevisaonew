'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, BookOpen, ArrowRight } from 'lucide-react'

interface Theme {
  id: string
  title: string
  tags: string[]
  difficulty: 'Básico' | 'Médio' | 'Avançado'
}

const SEED_THEMES: Theme[] = [
  { id: '1', title: 'O impacto das redes sociais na língua portuguesa',        tags: ['C1', 'Linguagem'],     difficulty: 'Médio'    },
  { id: '2', title: 'Desafios da educação ambiental no Brasil',                tags: ['C2', 'Meio ambiente'], difficulty: 'Médio'    },
  { id: '3', title: 'A influência da IA no mercado de trabalho',               tags: ['C3', 'Tecnologia'],    difficulty: 'Avançado' },
  { id: '4', title: 'O papel da cultura popular na identidade nacional',       tags: ['C4', 'Cultura'],       difficulty: 'Médio'    },
  { id: '5', title: 'Violência contra a mulher: causas e soluções',            tags: ['C5', 'Sociedade'],     difficulty: 'Avançado' },
  { id: '6', title: 'Mobilidade urbana e desigualdade social',                 tags: ['C3', 'Urbanismo'],     difficulty: 'Básico'   },
  { id: '7', title: 'O avanço das fake news e a desinformação',                tags: ['C2', 'Mídia'],         difficulty: 'Médio'    },
  { id: '8', title: 'Saúde mental dos jovens no Brasil pós-pandemia',          tags: ['C5', 'Saúde'],         difficulty: 'Médio'    },
  { id: '9', title: 'Desigualdade no acesso à tecnologia no Brasil',           tags: ['C3', 'Tecnologia'],    difficulty: 'Básico'   },
]

const DIFFICULTY_CONFIG = {
  Básico:   'text-green-400  bg-green-500/10  border-green-500/20',
  Médio:    'text-amber-400  bg-amber-500/10  border-amber-500/20',
  Avançado: 'text-red-400    bg-red-500/10    border-red-500/20',
}

const TAG_FILTERS = ['Todos', 'C1', 'C2', 'C3', 'C4', 'C5']

export function ThemesSection() {
  const [query,     setQuery]     = useState('')
  const [activeTag, setActiveTag] = useState('Todos')

  const filtered = SEED_THEMES.filter(t => {
    const matchQ   = !query || t.title.toLowerCase().includes(query.toLowerCase())
    const matchTag = activeTag === 'Todos' || t.tags.includes(activeTag)
    return matchQ && matchTag
  })

  return (
    <div className="card-dark rounded-2xl p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <BookOpen size={14} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold text-white">Banco de Temas</h2>
            <p className="text-[11px] text-gray-600 mt-0.5">Temas selecionados para o ENEM</p>
          </div>
        </div>
        <Link
          href="/aluno/temas"
          className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-purple-400 transition-colors"
        >
          Ver todos <ArrowRight size={10} />
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar tema…"
          className="w-full h-9 pl-8 pr-3 rounded-xl border border-white/[0.07] bg-white/[0.03] text-[13px] text-white placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500/40 focus:border-purple-500/30 transition-all"
        />
      </div>

      {/* Tag pills */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {TAG_FILTERS.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
              activeTag === tag
                ? 'bg-purple-600/25 text-purple-300 border-purple-500/40 shadow-[0_0_0_1px_rgba(124,58,237,0.2)]'
                : 'bg-transparent text-gray-600 border-white/[0.06] hover:border-white/[0.12] hover:text-gray-400'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Theme list */}
      <div className="flex-1 space-y-1">
        {filtered.length === 0 ? (
          <p className="text-[12px] text-gray-700 text-center py-6">
            Nenhum tema encontrado{query ? ` para "${query}"` : ''}.
          </p>
        ) : (
          filtered.slice(0, 5).map(theme => (
            <Link
              key={theme.id}
              href={`/aluno/temas/${theme.id}`}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.07] transition-all"
            >
              {/* Comp badge */}
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-[10px] font-bold text-gray-500 group-hover:border-purple-500/20 group-hover:text-purple-400 transition-all">
                {theme.tags[0]}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-gray-400 group-hover:text-gray-200 transition-colors leading-snug line-clamp-1">
                  {theme.title}
                </p>
              </div>

              <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded border ${DIFFICULTY_CONFIG[theme.difficulty]}`}>
                {theme.difficulty}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
