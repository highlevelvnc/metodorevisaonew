import Link from 'next/link'
import { ArrowRight, BookOpen, Star } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  reason: string
  trains: string
  rating: number
  gradient: string
  labelColor: string
}

const BOOKS: Book[] = [
  {
    id: '1',
    title: 'Vidas Secas',
    author: 'Graciliano Ramos',
    reason: 'Desigualdade, seca e exclusão social — altamente cobrados no ENEM.',
    trains: 'C3',
    rating: 5,
    gradient: 'from-amber-800 to-amber-950',
    labelColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: '2',
    title: 'O Cortiço',
    author: 'Aluísio Azevedo',
    reason: 'Urbanização, classe social e identidade — essencial para temas de sociedade.',
    trains: 'C2 + C3',
    rating: 5,
    gradient: 'from-purple-800 to-purple-950',
    labelColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    reason: 'Vigilância, desinformação e poder — perfeito para fake news e tecnologia.',
    trains: 'C3',
    rating: 5,
    gradient: 'from-blue-800 to-blue-950',
    labelColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={9}
          className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-800'}
        />
      ))}
    </div>
  )
}

export function ClubeLivroSection() {
  return (
    <div className="card-dark rounded-2xl p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <BookOpen size={14} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold text-white">Clube do Livro</h2>
            <p className="text-[11px] text-gray-600 mt-0.5">Leituras que ampliam seu repertório</p>
          </div>
        </div>
        <Link
          href="/aluno/clube-do-livro"
          className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-purple-400 transition-colors"
        >
          Biblioteca <ArrowRight size={10} />
        </Link>
      </div>

      {/* Book list */}
      <div className="flex-1 space-y-2.5">
        {BOOKS.map(book => (
          <Link
            key={book.id}
            href={`/aluno/clube-do-livro/${book.id}`}
            className="group flex gap-3.5 p-3 rounded-xl border border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.02] transition-all"
          >
            {/* Book spine */}
            <div className={`flex-shrink-0 w-9 h-[52px] rounded-md bg-gradient-to-b ${book.gradient} border border-white/[0.08] flex flex-col items-center justify-end pb-1 gap-0.5 overflow-hidden`}>
              <BookOpen size={9} className="text-white/30" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <p className="text-[12px] font-semibold text-gray-300 group-hover:text-white transition-colors leading-tight">
                  {book.title}
                </p>
                <span className={`flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded border ${book.labelColor}`}>
                  {book.trains}
                </span>
              </div>
              <p className="text-[10px] text-gray-700 mb-1.5">{book.author}</p>
              <div className="flex items-center gap-2 mb-1.5">
                <StarRating rating={book.rating} />
              </div>
              <p className="text-[11px] text-gray-600 leading-snug line-clamp-2">{book.reason}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Monthly tip */}
      <div className="mt-4 rounded-xl bg-purple-500/[0.05] border border-purple-500/15 p-3.5">
        <p className="text-[11px] text-gray-500 leading-relaxed">
          <span className="font-semibold text-purple-400">Dica do mês: </span>
          Ao ler, anote frases que podem virar argumento. Uma citação de Graciliano Ramos bem aplicada vale mais do que 10 frases genéricas.
        </p>
      </div>
    </div>
  )
}
