import Link from 'next/link'
import { ArrowRight, Star, Award, Clock, MessageCircle, CheckCircle2 } from 'lucide-react'

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
  avatarGradient: string
}

const CORRECTORS: Corrector[] = [
  {
    id: '1',
    name: 'Camila Torres',
    title: 'Especialista ENEM · 8 anos',
    rating: 4.9,
    reviews: 312,
    avgTime: '24h',
    specialties: ['C5', 'C3', 'Temas sociais'],
    bio: 'Mais de 4.000 redações corrigidas. Foco em proposta de intervenção e argumentação qualificada.',
    available: true,
    initials: 'CT',
    avatarGradient: 'from-purple-600 to-violet-800',
  },
  {
    id: '2',
    name: 'Rafael Nogueira',
    title: 'Corretor sênior · Sociologia',
    rating: 4.8,
    reviews: 198,
    avgTime: '36h',
    specialties: ['C2', 'C4', 'Repertório'],
    bio: 'Especialista em repertório filosófico e sociológico. Devolutivas com exemplos concretos de melhoria.',
    available: true,
    initials: 'RN',
    avatarGradient: 'from-blue-600 to-indigo-800',
  },
  {
    id: '3',
    name: 'Ana Lima',
    title: 'Correção rápida · Gramática',
    rating: 4.7,
    reviews: 145,
    avgTime: '12h',
    specialties: ['C1', 'C4', 'Coesão'],
    bio: 'Especialista em gramática e coesão. Identifica padrões de erro com exemplos práticos e objetivos.',
    available: false,
    initials: 'AL',
    avatarGradient: 'from-emerald-600 to-teal-800',
  },
]

const SPEC_COLOR: Record<string, string> = {
  C1: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  C2: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  C3: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  C4: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  C5: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
}
const defaultSpec = 'text-gray-400 bg-white/[0.04] border-white/[0.08]'

export function CorrectorSelection() {
  return (
    <div className="card-dark rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Award size={14} className="text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[13px] font-semibold text-white">Escolha seu Corretor</h2>
              <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25 uppercase">
                VIP
              </span>
            </div>
            <p className="text-[11px] text-gray-600 mt-0.5">Exclusivo para assinantes Intensivo</p>
          </div>
        </div>
        <Link
          href="/aluno/corretores"
          className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-purple-400 transition-colors"
        >
          Ver todos <ArrowRight size={10} />
        </Link>
      </div>

      {/* Corrector cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {CORRECTORS.map(c => (
          <div
            key={c.id}
            className={`relative flex flex-col gap-3.5 rounded-xl border p-4 transition-all ${
              c.available
                ? 'border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.02] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'border-white/[0.05] opacity-50'
            }`}
          >
            {/* Available indicator */}
            {c.available && (
              <div className="absolute top-3 right-3 flex items-center gap-1 text-[9px] font-medium text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Disponível
              </div>
            )}
            {!c.available && (
              <div className="absolute top-3 right-3 flex items-center gap-1 text-[9px] font-medium text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                Indisponível
              </div>
            )}

            {/* Avatar + name */}
            <div className="flex items-center gap-3">
              <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${c.avatarGradient} flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]`}>
                <span className="text-xs font-bold text-white">{c.initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-200 truncate">{c.name}</p>
                <p className="text-[10px] text-gray-600 truncate">{c.title}</p>
              </div>
            </div>

            {/* Rating + time */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star size={10} className="text-amber-400 fill-amber-400" />
                <span className="text-[11px] font-semibold text-gray-300">{c.rating}</span>
                <span className="text-[10px] text-gray-700">({c.reviews})</span>
              </div>
              <span className="text-gray-800">·</span>
              <div className="flex items-center gap-1 text-[10px] text-gray-600">
                <Clock size={9} />
                {c.avgTime}
              </div>
            </div>

            {/* Bio */}
            <p className="text-[11px] text-gray-600 leading-relaxed flex-1">{c.bio}</p>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1">
              {c.specialties.map(s => (
                <span key={s} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${SPEC_COLOR[s] ?? defaultSpec}`}>
                  {s}
                </span>
              ))}
            </div>

            {/* CTA */}
            <Link
              href={c.available ? `/aluno/corretores/${c.id}` : '#'}
              onClick={e => !c.available && e.preventDefault()}
              className={`flex items-center justify-center gap-1.5 w-full h-8 rounded-lg text-[12px] font-semibold border transition-all ${
                c.available
                  ? 'bg-white/[0.05] border-white/[0.10] text-gray-300 hover:bg-white/[0.10] hover:text-white hover:border-white/[0.18]'
                  : 'bg-white/[0.02] border-white/[0.04] text-gray-700 cursor-not-allowed'
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

      {/* Upgrade CTA */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4 flex items-start gap-3">
        <CheckCircle2 size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-amber-300 mb-1">
            Recurso exclusivo do plano Intensivo
          </p>
          <p className="text-[11px] text-gray-600 leading-relaxed mb-2">
            Faça upgrade para escolher seu corretor preferido e receber devolutivas prioritárias em até 24h.
          </p>
          <Link
            href="/checkout/intensivo"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Conhecer plano Intensivo <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  )
}
