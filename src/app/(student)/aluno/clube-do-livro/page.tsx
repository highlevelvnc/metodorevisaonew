'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Library, Star, BookOpen, ChevronRight, ArrowRight,
  CalendarDays, Users, Bookmark, Quote, Flame,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Book {
  id: string
  title: string
  author: string
  comp: 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'Geral'
  rating: number
  reviews: number
  pages: number
  description: string
  how_to_use: string
  quote: string
  gradient: string
  tags: string[]
  featured?: boolean
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MONTHLY_PICK: Book = {
  id: 'raizes-brasil',
  title: 'Raízes do Brasil',
  author: 'Sérgio Buarque de Holanda',
  comp: 'C3',
  rating: 4.9,
  reviews: 214,
  pages: 220,
  description:
    'Uma das obras mais importantes da historiografia brasileira. Analisa a formação cultural do Brasil, com foco nas raízes ibéricas e no conceito do "homem cordial" — base de repertório para temas como cidadania, democracia e identidade nacional.',
  how_to_use:
    'Use o conceito de "homem cordial" em temas de corrupção, nepotismo ou falta de civismo. O argumento da herança colonial funciona em praticamente qualquer tema sobre desigualdade ou educação.',
  quote: '"A democracia no Brasil sempre foi um mal-entendido."',
  gradient: 'from-amber-700 to-orange-900',
  tags: ['Identidade nacional', 'Democracia', 'Desigualdade', 'Cidadania'],
  featured: true,
}

const LIBRARY: Book[] = [
  {
    id: 'povo-brasileiro',
    title: 'O Povo Brasileiro',
    author: 'Darcy Ribeiro',
    comp: 'C3',
    rating: 4.8,
    reviews: 189,
    pages: 476,
    description: 'Análise da formação étnica e cultural do Brasil. Indispensável para temas de diversidade, racismo e identidade nacional.',
    how_to_use: 'Cite Darcy Ribeiro ao falar sobre herança cultural, mestiçagem e formação do povo brasileiro em temas de identidade ou inclusão.',
    quote: '"O Brasil não é um país subdesenvolvido; é um país injustiçado."',
    gradient: 'from-red-700 to-rose-900',
    tags: ['Identidade nacional', 'Racismo', 'Diversidade'],
  },
  {
    id: 'capital-seculo21',
    title: 'O Capital no Século XXI',
    author: 'Thomas Piketty',
    comp: 'C3',
    rating: 4.7,
    reviews: 156,
    pages: 696,
    description: 'Análise econômica da desigualdade de renda e riqueza no mundo. Dados essenciais para argumentar sobre concentração de renda.',
    how_to_use: 'Use dados do Piketty (retorno do capital > crescimento da renda) para argumentar sobre desigualdade econômica com embasamento quantitativo.',
    quote: '"Quando a taxa de retorno do capital supera a taxa de crescimento, a desigualdade aumenta."',
    gradient: 'from-blue-700 to-indigo-900',
    tags: ['Desigualdade', 'Economia', 'Capitalismo'],
  },
  {
    id: 'democracia-em-vertigem',
    title: 'Democracia em Vertigem',
    author: 'Petra Costa',
    comp: 'C2',
    rating: 4.6,
    reviews: 142,
    pages: 0,
    description: 'Documentário e livro sobre a crise democrática brasileira. Perspectiva sobre polarização, desinformação e participação cidadã.',
    how_to_use: 'Perfeito para temas de democracia, fake news ou participação política. Conecta história recente ao tema de forma objetiva.',
    quote: '"A democracia não é uma conquista definitiva."',
    gradient: 'from-violet-700 to-purple-900',
    tags: ['Democracia', 'Política', 'Desinformação'],
  },
  {
    id: 'vale-lagrimas',
    title: 'Vale de Lágrimas',
    author: 'Afonso Arinos',
    comp: 'C3',
    rating: 4.5,
    reviews: 98,
    pages: 384,
    description: 'Obra clássica sobre a formação do sertão brasileiro e as desigualdades regionais. Essencial para temas sobre nordeste, seca e exclusão.',
    how_to_use: 'Use para conectar desigualdades regionais e históricas do Brasil. Ótimo para temas de migração, exclusão social e seca.',
    quote: '"O sertão é o Brasil esquecido por si mesmo."',
    gradient: 'from-yellow-700 to-amber-900',
    tags: ['Desigualdade regional', 'Nordeste', 'Exclusão social'],
  },
  {
    id: 'pedagogy-oppressed',
    title: 'Pedagogia do Oprimido',
    author: 'Paulo Freire',
    comp: 'C3',
    rating: 4.9,
    reviews: 267,
    pages: 253,
    description: 'Obra fundacional da educação crítica. Conceitos de educação bancária, consciência crítica e emancipação — essenciais para temas de educação.',
    how_to_use: 'Cite Freire em qualquer tema de educação. "Educação bancária" vs "educação problematizadora" é um par conceitual que impressiona corretores.',
    quote: '"Ninguém educa ninguém, ninguém se educa sozinho, os homens se educam em comunhão."',
    gradient: 'from-emerald-700 to-teal-900',
    tags: ['Educação', 'Cidadania', 'Desigualdade'],
  },
  {
    id: 'morte-e-vida-severina',
    title: 'Morte e Vida Severina',
    author: 'João Cabral de Melo Neto',
    comp: 'C3',
    rating: 4.8,
    reviews: 203,
    pages: 96,
    description: 'Poema épico que retrata a vida precária no sertão nordestino. Leitura rápida com repertório poderoso sobre exclusão e dignidade humana.',
    how_to_use: 'Cite o poema para humanizar argumentos sobre pobreza, seca e desigualdade regional. O contraste vida/morte no título já é um argumento retórico.',
    quote: '"O homem, bicho da terra tão pequeno, / chega a ser grande, João?"',
    gradient: 'from-slate-600 to-gray-900',
    tags: ['Nordeste', 'Pobreza', 'Dignidade humana'],
  },
]

const COMP_COLOR: Record<string, string> = {
  C1: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  C2: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  C3: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  C4: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  C5: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Geral: 'text-gray-400 bg-white/[0.04] border-white/[0.08]',
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={10}
          className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}
        />
      ))}
      <span className="text-[11px] font-semibold text-gray-300 ml-0.5">{rating}</span>
      <span className="text-[10px] text-gray-700">({reviews})</span>
    </div>
  )
}

function BookCard({ book, expanded, onToggle }: { book: Book; expanded: boolean; onToggle: () => void }) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        expanded
          ? 'border-white/[0.12] bg-white/[0.03]'
          : 'border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.02] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left"
      >
        <div className="flex items-start gap-4 p-4">
          {/* Spine */}
          <div className={`w-10 h-14 rounded-lg bg-gradient-to-br ${book.gradient} flex-shrink-0 flex items-end justify-center pb-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.4)]`}>
            <span className="text-[9px] font-bold text-white/70 writing-vertical">{book.comp}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <p className="text-[13px] font-semibold text-gray-200 leading-tight">{book.title}</p>
                <p className="text-[11px] text-gray-600 mt-0.5">{book.author}</p>
              </div>
              <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${COMP_COLOR[book.comp]}`}>
                {book.comp}
              </span>
            </div>
            <StarRating rating={book.rating} reviews={book.reviews} />
            {!expanded && (
              <p className="text-[11px] text-gray-600 mt-2 leading-relaxed line-clamp-2">{book.description}</p>
            )}
          </div>

          <ChevronRight
            size={14}
            className={`flex-shrink-0 text-gray-600 transition-transform mt-1 ${expanded ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.05] pt-3">
          <p className="text-[12px] text-gray-500 leading-relaxed">{book.description}</p>

          {/* Quote */}
          <div className="flex gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <Quote size={14} className="text-purple-500/50 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-400 italic leading-relaxed">{book.quote}</p>
          </div>

          {/* How to use */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.05] px-3.5 py-3">
            <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-1">Como usar na redação</p>
            <p className="text-[12px] text-gray-400 leading-relaxed">{book.how_to_use}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {book.tags.map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.07] text-gray-600 bg-white/[0.02]">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClubeLivroPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedFeatured, setExpandedFeatured] = useState(false)

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id)

  return (
    <div className="max-w-5xl">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/25 flex items-center justify-center">
            <Library size={15} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Clube do Livro</h1>
            <p className="text-[12px] text-gray-600">Repertório literário para construir argumentos de alto impacto</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">

        {/* ── Left: featured pick + library ───────────────────────────────── */}
        <div className="space-y-5">

          {/* Monthly pick */}
          <div className="relative rounded-2xl border border-purple-500/25 overflow-hidden">
            {/* Gradient bg */}
            <div className={`absolute inset-0 bg-gradient-to-br ${MONTHLY_PICK.gradient} opacity-15`} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />

            <div className="relative p-5">
              {/* Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-600/20 border border-purple-500/30">
                  <Flame size={10} className="text-purple-400" />
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Escolha do Mês</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-600">
                  <CalendarDays size={9} />
                  Março 2026
                </div>
              </div>

              <div className="flex gap-5">
                {/* Book spine — larger */}
                <div className={`w-14 h-20 rounded-xl bg-gradient-to-br ${MONTHLY_PICK.gradient} flex-shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-end justify-center pb-2`}>
                  <span className="text-[10px] font-bold text-white/60">{MONTHLY_PICK.comp}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-white leading-tight mb-0.5">{MONTHLY_PICK.title}</p>
                  <p className="text-[12px] text-gray-500 mb-2">{MONTHLY_PICK.author}</p>
                  <StarRating rating={MONTHLY_PICK.rating} reviews={MONTHLY_PICK.reviews} />
                  {!expandedFeatured && (
                    <p className="text-[12px] text-gray-500 mt-2 leading-relaxed line-clamp-3">{MONTHLY_PICK.description}</p>
                  )}
                </div>
              </div>

              {/* Expanded section */}
              {expandedFeatured && (
                <div className="mt-4 space-y-3 border-t border-white/[0.07] pt-4">
                  <p className="text-[12px] text-gray-400 leading-relaxed">{MONTHLY_PICK.description}</p>

                  <div className="flex gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    <Quote size={14} className="text-purple-400/50 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-gray-300 italic leading-relaxed">{MONTHLY_PICK.quote}</p>
                  </div>

                  <div className="rounded-xl border border-purple-500/25 bg-purple-500/[0.07] px-4 py-3">
                    <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-1.5">Como usar na redação</p>
                    <p className="text-[12px] text-gray-300 leading-relaxed">{MONTHLY_PICK.how_to_use}</p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {MONTHLY_PICK.tags.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08] text-gray-500 bg-white/[0.03]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setExpandedFeatured(p => !p)}
                className="mt-4 flex items-center gap-1.5 text-[12px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
              >
                {expandedFeatured ? 'Mostrar menos' : 'Ver como usar na redação'}
                <ArrowRight size={11} className={`transition-transform ${expandedFeatured ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>

          {/* Library */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700">Biblioteca de repertório</p>
              <span className="text-[11px] text-gray-600">{LIBRARY.length} obras</span>
            </div>
            <div className="space-y-2">
              {LIBRARY.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  expanded={expandedId === book.id}
                  onToggle={() => toggle(book.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Right sidebar ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Reading challenge */}
          <div className="card-dark rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Flame size={12} className="text-amber-400" />
              </div>
              <p className="text-[12px] font-semibold text-white">Desafio de leitura</p>
            </div>
            <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
              Leia 1 obra por mês e registre 1 citação usável na redação.
            </p>
            {/* Progress */}
            <div className="space-y-2.5">
              {['Jan', 'Fev', 'Mar'].map((month, i) => (
                <div key={month} className="flex items-center gap-2.5">
                  <span className="text-[10px] text-gray-600 w-6">{month}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${i < 2 ? 'bg-green-500' : 'bg-purple-600 animate-pulse'}`}
                      style={{ width: i < 2 ? '100%' : '35%' }}
                    />
                  </div>
                  {i < 2
                    ? <span className="text-[9px] text-green-400">✓</span>
                    : <span className="text-[9px] text-gray-600">em curso</span>
                  }
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
              <p className="text-[10px] text-gray-700">Sequência atual</p>
              <p className="text-[15px] font-bold text-white tabular-nums">2 <span className="text-[11px] text-gray-600 font-normal">meses seguidos</span></p>
            </div>
          </div>

          {/* This month's tip */}
          <div className="card-dark rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700 mb-3">Dica do mês</p>
            <div className="flex gap-2.5 rounded-xl border border-purple-500/20 bg-purple-500/[0.05] p-3 mb-3">
              <Quote size={12} className="text-purple-400/50 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-400 italic leading-relaxed">
                "Não cite autores que você não leu. Um dado concreto vale mais do que um nome famoso mal usado."
              </p>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Corretores do ENEM identificam rapidamente citações genéricas ou fora de contexto. Foque em 3–4 referências que você domina.
            </p>
          </div>

          {/* By competency quick links */}
          <div className="card-dark rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700 mb-3">Por competência</p>
            <div className="space-y-1">
              {(['C2', 'C3', 'C5'] as const).map(comp => {
                const count = [MONTHLY_PICK, ...LIBRARY].filter(b => b.comp === comp).length
                return (
                  <div key={comp} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${COMP_COLOR[comp]}`}>
                        {comp}
                      </span>
                      <span className="text-[12px] text-gray-500">
                        {comp === 'C2' ? 'Compreensão' : comp === 'C3' ? 'Argumentação' : 'Intervenção'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-600">{count} obras</span>
                      <ChevronRight size={11} className="text-gray-700" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mentoria CTA */}
          <div className="card-dark rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={12} className="text-gray-600" />
              <p className="text-[12px] font-semibold text-white">Clube ao vivo</p>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
              Próxima sessão de debate literário — <strong className="text-gray-400">Sábado, 29 Mar · 10h</strong>
            </p>
            <Link
              href="/aluno/mentoria"
              className="flex items-center justify-center gap-1.5 w-full h-8 rounded-xl text-[12px] font-semibold bg-white/[0.05] border border-white/[0.10] text-gray-300 hover:bg-white/[0.09] hover:text-white transition-all"
            >
              <BookOpen size={11} />
              Ver mentoria
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
