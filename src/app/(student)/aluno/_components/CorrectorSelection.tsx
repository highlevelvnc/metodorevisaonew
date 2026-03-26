import Link from 'next/link'
import { ArrowRight, Star, Award, Clock, MessageCircle } from 'lucide-react'

interface Corrector {
  id: string
  name: string
  title: string
  rating: number
  reviews: number
  avgTime: string
  specialties: string[]
  bio: string
  available: boolean
  initials: string
  color: string
}

const CORRECTORS: Corrector[] = [
  {
    id: '1',
    name: 'Prof. Camila Torres',
    title: 'Especialista ENEM — 8 anos de correção',
    rating: 4.9,
    reviews: 312,
    avgTime: '24h',
    specialties: ['C5', 'C3', 'Temas sociais'],
    bio: 'Mais de 4.000 redações corrigidas com foco em proposta de intervenção e argumentação qualificada.',
    available: true,
    initials: 'CT',
    color: 'from-purple-600 to-purple-800',
  },
  {
    id: '2',
    name: 'Prof. Rafael Nogueira',
    title: 'Corretor sênior — Filosofia e Sociologia',
    rating: 4.8,
    reviews: 198,
    avgTime: '36h',
    specialties: ['C2', 'C4', 'Repertório'],
    bio: 'Especialista em repertório filosófico e sociológico. Devolutivas detalhadas com exemplos concretos de melhoria.',
    available: true,
    initials: 'RN',
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: '3',
    name: 'Prof. Ana Lima',
    title: 'Correção rápida — Foco em C1 e C4',
    rating: 4.7,
    reviews: 145,
    avgTime: '12h',
    specialties: ['C1', 'C4', 'Coesão'],
    bio: 'Especialista em gramática e coesão textual. Identifica e explica padrões de erro com exemplos práticos.',
    available: false,
    initials: 'AL',
    color: 'from-emerald-600 to-emerald-800',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={11} className="text-amber-400 fill-amber-400" />
      <span className="text-xs font-medium text-gray-300">{rating}</span>
    </div>
  )
}

export function CorrectorSelection() {
  return (
    <div className="card-dark rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Award size={13} className="text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Escolha seu Corretor</h2>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25">
                VIP
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">Recurso exclusivo do plano Intensivo</p>
          </div>
        </div>
        <Link href="/aluno/corretores" className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
          Ver todos <ArrowRight size={11} />
        </Link>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CORRECTORS.map(c => (
          <div
            key={c.id}
            className={`group rounded-xl border p-4 flex flex-col gap-3 transition-all ${
              c.available
                ? 'border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02] cursor-pointer'
                : 'border-white/[0.05] opacity-60'
            }`}
          >
            {/* Avatar + name */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-xs font-bold text-white">{c.initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{c.name}</p>
                <p className="text-[11px] text-gray-600 truncate">{c.title}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 flex-wrap">
              <StarRating rating={c.rating} />
              <span className="text-[10px] text-gray-600">({c.reviews} aval.)</span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                <Clock size={9} />
                {c.avgTime}
              </span>
            </div>

            {/* Bio */}
            <p className="text-[11px] text-gray-600 leading-relaxed flex-1">{c.bio}</p>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1">
              {c.specialties.map(s => (
                <span key={s} className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">
                  {s}
                </span>
              ))}
            </div>

            {/* Action */}
            <Link
              href={c.available ? `/aluno/corretores/${c.id}` : '#'}
              onClick={e => !c.available && e.preventDefault()}
              className={`flex items-center justify-center gap-1.5 w-full h-8 rounded-lg text-xs font-medium border transition-all ${
                c.available
                  ? 'bg-white/[0.04] border-white/[0.08] text-gray-300 hover:bg-white/[0.08] hover:text-white'
                  : 'bg-white/[0.02] border-white/[0.04] text-gray-600 cursor-not-allowed'
              }`}
            >
              {c.available
                ? <><MessageCircle size={11} /> Solicitar correção</>
                : <><Clock size={11} /> Indisponível</>
              }
            </Link>
          </div>
        ))}
      </div>

      {/* Upgrade nudge */}
      <div className="mt-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 p-3.5 flex items-start gap-2.5">
        <Award size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-amber-300 mb-0.5">Recurso exclusivo para assinantes Intensivo</p>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Faça upgrade para escolher seu corretor e receber devolutivas prioritárias em até 24h.
          </p>
          <Link href="/checkout/intensivo" className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors mt-2 font-medium">
            Conhecer plano Intensivo <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  )
}
