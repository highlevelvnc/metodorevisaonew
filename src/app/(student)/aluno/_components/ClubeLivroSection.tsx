import Link from 'next/link'
import { ArrowRight, BookOpen, Star } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  reason: string
  trains: string
  rating: number
  color: string
}

const BOOKS: Book[] = [
  {
    id: '1',
    title: 'Vidas Secas',
    author: 'Graciliano Ramos',
    reason: 'Repertório de desigualdade social, seca e exclusão — altamente cobrado no ENEM.',
    trains: 'C3 — Argumentação',
    rating: 5,
    color: 'from-amber-900/60 to-amber-700/20',
  },
  {
    id: '2',
    title: 'O Cortiço',
    author: 'Aluísio Azevedo',
    reason: 'Urbanização, classe social e identidade nacional — essencial para temas de sociedade.',
    trains: 'C2 + C3',
    rating: 5,
    color: 'from-purple-900/60 to-purple-700/20',
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    reason: 'Vigilância, desinformação e poder — perfeito para fake news e tecnologia.',
    trains: 'C3 — Repertório',
    rating: 5,
    color: 'from-blue-900/60 to-blue-700/20',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={10}
          className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}
        />
      ))}
    </div>
  )
}

export function ClubeLivroSection() {
  return (
    <div className="card-dark rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <BookOpen size={14} className="text-purple-400" />
            Clube do Livro
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">Leituras que ampliam seu repertório ENEM</p>
        </div>
        <Link href="/aluno/clube-do-livro" className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
          Ver biblioteca <ArrowRight size={11} />
        </Link>
      </div>

      <div className="space-y-3">
        {BOOKS.map(book => (
          <Link
            key={book.id}
            href={`/aluno/clube-do-livro/${book.id}`}
            className="group flex gap-3 p-3 rounded-xl border border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.03] transition-all"
          >
            {/* Book spine */}
            <div className={`flex-shrink-0 w-10 h-14 rounded-md bg-gradient-to-b ${book.color} border border-white/[0.08] flex items-end justify-center pb-1`}>
              <BookOpen size={10} className="text-white/40" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors leading-tight">
                {book.title}
              </p>
              <p className="text-[11px] text-gray-600 mb-1">{book.author}</p>
              <div className="flex items-center gap-2 mb-1.5">
                <StarRating rating={book.rating} />
                <span className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">
                  {book.trains}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 leading-snug line-clamp-2">{book.reason}</p>
            </div>

            <ArrowRight size={13} className="text-gray-700 group-hover:text-gray-400 transition-colors mt-1 shrink-0" />
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.05]">
        <div className="rounded-xl bg-purple-500/[0.06] border border-purple-500/20 p-3.5 flex items-start gap-2.5">
          <BookOpen size={13} className="text-purple-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="text-purple-300 font-medium">Dica do mês: </span>
            Ao ler, marque frases que podem virar argumento na redação. Uma frase de Graciliano Ramos bem aplicada vale mais do que 10 frases genéricas.
          </p>
        </div>
      </div>
    </div>
  )
}
