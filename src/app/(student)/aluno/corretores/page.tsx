import type { Metadata } from 'next'
import { redirect }      from 'next/navigation'
import { createClient }  from '@/lib/supabase/server'
import Link              from 'next/link'
import {
  Award, Star, Clock, MessageCircle, CheckCircle2,
  ArrowRight, Lock, Flame, Users, Shield,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Corretores VIP · Método Revisão',
  robots: { index: false, follow: false },
}

// Always fetch fresh plan data — plan tier determines what the user can access
export const dynamic = 'force-dynamic'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Corrector {
  id: string
  name: string
  title: string
  initials: string
  avatarGradient: string
  rating: number
  reviews: number
  avgTime: string
  turnaround: string
  specialties: CompKey[]
  tags: string[]
  bio: string
  stats: { label: string; value: string }[]
  available: boolean
}

type CompKey = 'C1' | 'C2' | 'C3' | 'C4' | 'C5'

// ─── Data ─────────────────────────────────────────────────────────────────────

const CORRECTORS: Corrector[] = [
  {
    id: '1',
    name: 'Camila Torres',
    title: 'Especialista ENEM · 8 anos de experiência',
    initials: 'CT',
    avatarGradient: 'from-purple-600 to-violet-800',
    rating: 4.9,
    reviews: 312,
    avgTime: '24h',
    turnaround: 'Até 24 horas',
    specialties: ['C5', 'C3'],
    tags: ['Temas sociais', 'Intervenção', 'Argumentação'],
    bio: 'Mais de 4.000 redações corrigidas. Especialista em proposta de intervenção (C5) e seleção de argumentos (C3). Devolutivas detalhadas com exemplos concretos de melhoria e pontos positivos identificados.',
    stats: [
      { label: 'Redações corrigidas', value: '4.000+' },
      { label: 'Nota média das alunas', value: '720 pts' },
      { label: 'Taxa de melhoria', value: '91%' },
    ],
    available: true,
  },
  {
    id: '2',
    name: 'Rafael Nogueira',
    title: 'Corretor sênior · Ciências Sociais',
    initials: 'RN',
    avatarGradient: 'from-blue-600 to-indigo-800',
    rating: 4.8,
    reviews: 198,
    avgTime: '36h',
    turnaround: 'Até 36 horas',
    specialties: ['C2', 'C4'],
    tags: ['Repertório filosófico', 'Coesão', 'Tese'],
    bio: 'Mestre em Sociologia pela USP. Especialista em repertório filosófico e sociológico. Devolutivas com sugestão de autores, dados e perspectivas para cada argumento apresentado.',
    stats: [
      { label: 'Redações corrigidas', value: '2.800+' },
      { label: 'Nota média dos alunos', value: '700 pts' },
      { label: 'Especialidade', value: 'Repertório' },
    ],
    available: true,
  },
  {
    id: '3',
    name: 'Ana Lima',
    title: 'Correção rápida · Gramática e Coesão',
    initials: 'AL',
    avatarGradient: 'from-emerald-600 to-teal-800',
    rating: 4.7,
    reviews: 145,
    avgTime: '12h',
    turnaround: 'Até 12 horas',
    specialties: ['C1', 'C4'],
    tags: ['Gramática', 'Coesão', 'Correção rápida'],
    bio: 'Especialista em gramática e coesão textual. Devolutivas objetivas e diretas, identificando padrões de erro com exemplos corretos. Ideal para quem precisa de retorno rápido antes de uma prova.',
    stats: [
      { label: 'Redações corrigidas', value: '1.900+' },
      { label: 'Retorno médio', value: '10 horas' },
      { label: 'Satisfação', value: '4.7 ★' },
    ],
    available: false,
  },
  {
    id: '4',
    name: 'Bruno Alves',
    title: 'Especialista C2 · Análise do Tema',
    initials: 'BA',
    avatarGradient: 'from-rose-600 to-pink-800',
    rating: 4.8,
    reviews: 167,
    avgTime: '24h',
    turnaround: 'Até 24 horas',
    specialties: ['C2', 'C3'],
    tags: ['Compreensão do tema', 'Tangenciamento', 'Argumentação'],
    bio: 'Foco em C2 — identifica quando a redação foge do tema antes que isso custe 200 pontos. Devolutivas com mapa argumentativo completo e sugestão de tese alternativa se necessário.',
    stats: [
      { label: 'Redações corrigidas', value: '2.200+' },
      { label: 'Alunos sem tangenciamento', value: '98%' },
      { label: 'Especialidade', value: 'Tema e tese' },
    ],
    available: true,
  },
]

const COMP_COLOR: Record<CompKey, string> = {
  C1: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  C2: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  C3: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  C4: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  C5: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
}

const COMP_FULL: Record<CompKey, string> = {
  C1: 'Norma Culta',
  C2: 'Compreensão do Tema',
  C3: 'Seleção de Argumentos',
  C4: 'Mecanismos de Coesão',
  C5: 'Proposta de Intervenção',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CorretoresPage() {
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

  const planName  = (subRaw as { plans?: { name: string } | null } | null)?.plans?.name ?? 'Trial'
  const isVIP     = planName === 'Intensivo'
  const available = CORRECTORS.filter(c => c.available)
  const busy      = CORRECTORS.filter(c => !c.available)

  return (
    <div className="max-w-5xl">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
            <Award size={15} className="text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Corretores VIP</h1>
              <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25 uppercase">
                Intensivo
              </span>
            </div>
            <p className="text-[12px] text-gray-600">Escolha um corretor especializado e receba devolutivas prioritárias</p>
          </div>
        </div>
      </div>

      {/* VIP gate banner — shown when not Intensivo */}
      {!isVIP && (
        <div className="relative mb-6 rounded-2xl border border-amber-500/25 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-transparent" />
          <div className="relative flex items-start gap-4 p-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
              <Lock size={16} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-amber-300 mb-1">
                Recurso exclusivo do plano Intensivo
              </p>
              <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
                No plano <strong className="text-gray-300">Intensivo</strong> você escolhe seu corretor preferido, recebe devolutivas em até 24h e tem prioridade na fila de correções. Você está no plano <strong className="text-gray-300">{planName}</strong>.
              </p>
              <Link
                href="/aluno/upgrade"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 hover:text-amber-200 transition-all"
              >
                <Flame size={11} />
                Fazer upgrade para Intensivo
                <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_280px] gap-5 items-start">

        {/* ── Corrector cards ──────────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Available */}
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700 px-0.5 mb-2">
            Disponíveis agora
          </p>

          {available.map(c => (
            <div
              key={c.id}
              className={`rounded-2xl border transition-all ${
                isVIP
                  ? 'border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.02] hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
                  : 'border-white/[0.07] opacity-75'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.avatarGradient} flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.4)]`}>
                      <span className="text-sm font-bold text-white">{c.initials}</span>
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0b1121]" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-semibold text-gray-100">{c.name}</p>
                        <p className="text-[11px] text-gray-600 mt-0.5">{c.title}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-green-400 flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Disponível
                      </div>
                    </div>

                    {/* Rating + time */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="text-[12px] font-semibold text-gray-300">{c.rating}</span>
                        <span className="text-[10px] text-gray-700">({c.reviews} avaliações)</span>
                      </div>
                      <span className="text-gray-800">·</span>
                      <div className="flex items-center gap-1 text-[11px] text-gray-600">
                        <Clock size={10} />
                        {c.turnaround}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-[12px] text-gray-500 leading-relaxed mt-3">{c.bio}</p>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {c.stats.map(stat => (
                    <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-center">
                      <p className="text-[13px] font-bold text-white">{stat.value}</p>
                      <p className="text-[9px] text-gray-700 leading-tight mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Specialties + tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {c.specialties.map(s => (
                    <span key={s} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${COMP_COLOR[s]}`}>
                      {s} · {COMP_FULL[s]}
                    </span>
                  ))}
                  {c.tags.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.07] text-gray-600">
                      {t}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-4">
                  {isVIP ? (
                    <Link
                      href={`/aluno/corretores/${c.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-purple-700/25 border border-purple-600/35 text-purple-300 hover:bg-purple-700/40 hover:text-purple-200 hover:border-purple-500/50 transition-all"
                    >
                      <MessageCircle size={13} />
                      Solicitar correção com {c.name.split(' ')[0]}
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-white/[0.03] border border-white/[0.06] text-gray-700 cursor-not-allowed"
                    >
                      <Lock size={13} />
                      Exclusivo Intensivo
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Unavailable */}
          {busy.length > 0 && (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700 px-0.5 mt-4 mb-2">
                Indisponíveis
              </p>
              {busy.map(c => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-white/[0.05] opacity-50"
                >
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.avatarGradient} flex items-center justify-center flex-shrink-0 grayscale`}>
                        <span className="text-sm font-bold text-white">{c.initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[13px] font-semibold text-gray-400">{c.name}</p>
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                            Indisponível
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-700 mt-0.5">{c.title}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Star size={10} className="text-gray-700 fill-gray-700" />
                          <span className="text-[11px] text-gray-600">{c.rating} · {c.reviews} avaliações</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-700">
                      <Clock size={11} />
                      Voltará em breve · {c.turnaround}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* ── Right sidebar ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* How it works */}
          <div className="card-dark rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700 mb-3">Como funciona</p>
            <ol className="space-y-3">
              {[
                { step: '1', text: 'Escolha o corretor com especialidade na sua competência mais fraca' },
                { step: '2', text: 'Envie sua redação pelo fluxo normal, selecionando o corretor preferido' },
                { step: '3', text: 'Receba a devolutiva personalizada no prazo indicado' },
                { step: '4', text: 'Aplique o feedback na próxima redação e acompanhe a evolução' },
              ].map(item => (
                <li key={item.step} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600/20 border border-purple-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[9px] font-bold text-purple-400">{item.step}</span>
                  </span>
                  <span className="text-[11px] text-gray-600 leading-snug">{item.text}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* VIP benefits */}
          <div className="card-dark rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={12} className="text-amber-400" />
              <p className="text-[12px] font-semibold text-white">Benefícios Intensivo</p>
            </div>
            <ul className="space-y-2">
              {[
                'Corretor dedicado de sua escolha',
                'Devolutiva prioritária (fila separada)',
                'Feedback de voz gravado por pedido',
                'Histórico e evolução por corretor',
                'Sessão mensal de 1:1 com mentor',
              ].map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] text-gray-500 leading-snug">{b}</span>
                </li>
              ))}
            </ul>
            {!isVIP && (
              <Link
                href="/aluno/upgrade"
                className="mt-4 flex items-center justify-center gap-1.5 w-full h-8 rounded-xl text-[12px] font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all"
              >
                <Flame size={11} />
                Assinar Intensivo
              </Link>
            )}
          </div>

          {/* Community stats */}
          <div className="card-dark rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={12} className="text-gray-600" />
              <p className="text-[12px] font-semibold text-white">Comunidade</p>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Corretores ativos', value: '4' },
                { label: 'Redações corrigidas', value: '10.900+' },
                { label: 'Nota média dos alunos VIP', value: '712 pts' },
                { label: 'Prazo médio de retorno', value: '22 horas' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between py-1 border-b border-white/[0.04] last:border-0">
                  <span className="text-[11px] text-gray-600">{stat.label}</span>
                  <span className="text-[12px] font-semibold text-gray-300">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
