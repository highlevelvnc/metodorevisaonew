import type { Metadata } from 'next'
import { redirect }      from 'next/navigation'
import { createClient }  from '@/lib/supabase/server'
import Link              from 'next/link'
import {
  ArrowLeft, ArrowRight, Star, Clock, MessageCircle, CheckCircle2,
  Award, Shield, Users,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Solicitar Correção · Método Revisão',
  robots: { index: false, follow: false },
}

// Plan tier check must never be stale-cached
export const dynamic = 'force-dynamic'

type CompKey = 'C1' | 'C2' | 'C3' | 'C4' | 'C5'

interface Corrector {
  id: string
  name: string
  title: string
  initials: string
  avatarGradient: string
  rating: number
  reviews: number
  avgTime: string
  specialties: CompKey[]
  tags: string[]
  bio: string
  available: boolean
}

const CORRECTORS: Record<string, Corrector> = {
  '1': {
    id: '1',
    name: 'Camila Torres',
    title: 'Especialista ENEM · 8 anos de experiência',
    initials: 'CT',
    avatarGradient: 'from-purple-600 to-violet-800',
    rating: 4.9,
    reviews: 312,
    avgTime: '24h',
    specialties: ['C5', 'C3'],
    tags: ['Temas sociais', 'Intervenção', 'Argumentação'],
    bio: 'Mais de 4.000 redações corrigidas. Especialista em proposta de intervenção (C5) e seleção de argumentos (C3). Devolutivas detalhadas com exemplos concretos de melhoria.',
    available: true,
  },
  '2': {
    id: '2',
    name: 'Rafael Nogueira',
    title: 'Corretor sênior · Ciências Sociais',
    initials: 'RN',
    avatarGradient: 'from-blue-600 to-indigo-800',
    rating: 4.8,
    reviews: 198,
    avgTime: '36h',
    specialties: ['C2', 'C4'],
    tags: ['Repertório filosófico', 'Coesão', 'Tese'],
    bio: 'Mestre em Sociologia pela USP. Especialista em repertório filosófico e sociológico. Devolutivas com sugestão de autores, dados e perspectivas.',
    available: true,
  },
  '4': {
    id: '4',
    name: 'Bruno Alves',
    title: 'Especialista C2 · Análise do Tema',
    initials: 'BA',
    avatarGradient: 'from-rose-600 to-pink-800',
    rating: 4.8,
    reviews: 167,
    avgTime: '24h',
    specialties: ['C2', 'C3'],
    tags: ['Compreensão do tema', 'Tangenciamento', 'Argumentação'],
    bio: 'Foco em C2 — identifica quando a redação foge do tema antes que isso custe 200 pontos.',
    available: true,
  },
}

const COMP_COLOR: Record<CompKey, string> = {
  C1: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  C2: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  C3: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  C4: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  C5: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
}

export default async function CorrectorDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: subRaw } = await db
    .from('subscriptions')
    .select('plans(name)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const planName = (subRaw as { plans?: { name: string } | null } | null)?.plans?.name ?? 'Trial'
  const isVIP    = planName === 'Intensivo'

  const corrector = CORRECTORS[params.id]
  if (!corrector) redirect('/aluno/corretores')

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <Link
        href="/aluno/corretores"
        className="inline-flex items-center gap-1.5 text-[12px] text-gray-600 hover:text-gray-300 transition-colors mb-5"
      >
        <ArrowLeft size={13} />
        Voltar para corretores
      </Link>

      {/* Profile card */}
      <div className="card-dark rounded-2xl p-6 mb-4">
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${corrector.avatarGradient} flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.4)] flex-shrink-0`}>
            <span className="text-lg font-bold text-white">{corrector.initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-bold text-white">{corrector.name}</h1>
                <p className="text-[12px] text-gray-600 mt-0.5">{corrector.title}</p>
              </div>
              {corrector.available && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  Disponível
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-[12px] font-semibold text-gray-300">{corrector.rating}</span>
                <span className="text-[11px] text-gray-700">({corrector.reviews} avaliações)</span>
              </div>
              <span className="text-gray-800">·</span>
              <div className="flex items-center gap-1 text-[11px] text-gray-600">
                <Clock size={10} />
                Retorno em até {corrector.avgTime}
              </div>
            </div>
          </div>
        </div>

        <p className="text-[13px] text-gray-400 leading-relaxed mb-4">{corrector.bio}</p>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5">
          {corrector.specialties.map(s => (
            <span key={s} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${COMP_COLOR[s]}`}>
              {s}
            </span>
          ))}
          {corrector.tags.map(t => (
            <span key={t} className="text-[11px] px-2.5 py-1 rounded-full border border-white/[0.08] text-gray-600">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Request correction */}
      {isVIP ? (
        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={15} className="text-purple-400" />
            <h2 className="text-[14px] font-semibold text-white">Solicitar correção</h2>
          </div>
          <p className="text-[12px] text-gray-500 leading-relaxed mb-4">
            Envie uma redação pelo fluxo padrão e selecione <strong className="text-gray-300">{corrector.name.split(' ')[0]}</strong> como corretor preferido na etapa de envio.
          </p>
          <Link
            href="/aluno/redacoes/nova"
            className="btn-primary gap-2 inline-flex"
          >
            <MessageCircle size={14} />
            Enviar redação para {corrector.name.split(' ')[0]}
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.05] p-5">
          <div className="flex items-start gap-3">
            <Award size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-amber-300 mb-1">Exclusivo do plano Intensivo</p>
              <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
                Faça upgrade para escolher este corretor e receber devolutivas prioritárias.
              </p>
              <Link href="/aluno/upgrade" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                Conhecer plano Intensivo <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Trust signals */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { icon: Shield, text: 'Correção revisada e aprovada' },
          { icon: CheckCircle2, text: 'Devolutiva detalhada garantida' },
          { icon: Users, text: 'Suporte via chat se precisar' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="card-dark rounded-xl p-3 text-center">
            <Icon size={14} className="text-gray-600 mx-auto mb-1.5" />
            <p className="text-[10px] text-gray-700 leading-snug">{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
