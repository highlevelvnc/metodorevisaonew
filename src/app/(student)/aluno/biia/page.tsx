import type { Metadata } from 'next'
import { redirect }      from 'next/navigation'
import { createClient }  from '@/lib/supabase/server'
import {
  Sparkles, TrendingUp, BookOpen, Flame,
  PenLine, Target, MessageCircle, Zap,
  FileText, GitBranch, Link2, GraduationCap,
} from 'lucide-react'
import { BiiaChat } from './BiiaChat'

export const metadata: Metadata = {
  title: 'Biia AI · Método Revisão',
  robots: { index: false, follow: false },
}

type CompKey = 'c1_score' | 'c2_score' | 'c3_score' | 'c4_score' | 'c5_score'
const compKeys: CompKey[] = ['c1_score', 'c2_score', 'c3_score', 'c4_score', 'c5_score']


const COMP_LABELS: Record<CompKey, string> = {
  c1_score: 'C1',
  c2_score: 'C2',
  c3_score: 'C3',
  c4_score: 'C4',
  c5_score: 'C5',
}

const COMP_DISPLAY: Record<CompKey, string> = {
  c1_score: 'Norma Culta (C1)',
  c2_score: 'Compreensão do Tema (C2)',
  c3_score: 'Seleção de Argumentos (C3)',
  c4_score: 'Mecanismos de Coesão (C4)',
  c5_score: 'Proposta de Intervenção (C5)',
}

type CorrectionRow = {
  c1_score: number; c2_score: number; c3_score: number
  c4_score: number; c5_score: number; total_score: number
  corrected_at: string
}
type EssayRow = {
  id: string; theme_title: string; status: string
  submitted_at: string
  corrections: CorrectionRow[]
}

// ─── Capability items ─────────────────────────────────────────────────────────

const CAPABILITIES = [
  {
    icon: FileText,
    label: 'Análise de texto',
    desc: 'Cole qualquer parágrafo — receba feedback C1 a C5',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: Target,
    label: 'Proposta de intervenção',
    desc: 'Aprenda os 4 elementos obrigatórios com exemplos reais',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: BookOpen,
    label: 'Repertório e argumentos',
    desc: 'Dados, autores e referências para qualquer tema',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
  {
    icon: GitBranch,
    label: 'Coesão e conectivos',
    desc: 'Arsenal completo de conectivos organizados por função',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: GraduationCap,
    label: 'Plano de estudos',
    desc: 'Cronograma personalizado para sua meta de pontuação',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    icon: Link2,
    label: 'Estrutura da redação',
    desc: 'Introdução, desenvolvimento e conclusão — passo a passo',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
]

// ─── Quick-access prompt links ─────────────────────────────────────────────────

const QUICK_PROMPTS = [
  {
    label: 'Analise meu parágrafo',
    prompt: 'Quero que você analise um parágrafo da minha redação. Vou colar o texto a seguir — por favor avalie coesão, argumento e adequação ao tema do ENEM:',
  },
  {
    label: 'Proposta nota 200',
    prompt: 'Me mostre como montar uma proposta de intervenção que garanta nota 200 na C5 com os 4 elementos obrigatórios.',
  },
  {
    label: 'Repertório para tema atual',
    prompt: 'Me dê um repertório sólido de dados, autores e referências para um tema atual do ENEM.',
  },
  {
    label: 'Plano para os próximos 30 dias',
    prompt: 'Monte um plano de estudo de 4 semanas para redação ENEM com foco nas competências mais importantes.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BiiaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [{ data: profileRaw }, { data: essaysRaw }] = await Promise.all([
    supabase.from('users').select('full_name').eq('id', user.id).single(),
    db.from('essays')
      .select('id, theme_title, status, submitted_at, corrections(c1_score, c2_score, c3_score, c4_score, c5_score, total_score, corrected_at)')
      .eq('student_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(50),
  ])

  const profile   = profileRaw as { full_name: string } | null
  const essays    = (essaysRaw as EssayRow[]) ?? []
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Aluno'
  const isNewUser = essays.length === 0

  const corrected     = essays.filter(e => e.status === 'corrected' && e.corrections?.length > 0)
  const lastCorrection = corrected[0]?.corrections?.[0] ?? null

  // Recent distinct themes (last 5, deduplicated)
  const recentThemes = Array.from(
    new Set(
      essays
        .filter(e => e.theme_title)
        .map(e => e.theme_title)
    )
  ).slice(0, 5)

  const lastTheme = recentThemes[0] ?? null

  const avgScore = corrected.length
    ? Math.round(corrected.reduce((s, e) => s + (e.corrections[0]?.total_score ?? 0), 0) / corrected.length)
    : null

  const lastScore = corrected[0]?.corrections?.[0]?.total_score ?? null
  const prevScore = corrected[1]?.corrections?.[0]?.total_score ?? null
  const delta = lastScore !== null && prevScore !== null ? lastScore - prevScore : null

  const overallDelta = corrected.length >= 2
    ? (corrected[0].corrections[0]?.total_score ?? 0) -
      (corrected[corrected.length - 1].corrections[0]?.total_score ?? 0)
    : null

  const worstCompKey: CompKey | null = lastCorrection
    ? compKeys.reduce((a, b) => ((lastCorrection[a] ?? 0) <= (lastCorrection[b] ?? 0) ? a : b))
    : null

  // Per-comp averages for sidebar bars
  const compAverages = corrected.length >= 1
    ? compKeys.map(key => ({
        key,
        label: COMP_LABELS[key],       // short: C1 … C5
        full: COMP_DISPLAY[key],       // full: Norma Culta (C1) …
        avg: Math.round(corrected.reduce((s, e) => s + (e.corrections[0]?.[key] ?? 0), 0) / corrected.length),
      }))
    : null

  return (
    <div className="max-w-6xl">

      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/25 flex items-center justify-center">
            <Sparkles size={16} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Biia AI</h1>
            <p className="text-[12px] text-gray-600">Tutora estratégica de redação · especialista ENEM</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-green-400">Online</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">

        {/* ── Chat panel ────────────────────────────────────────────────────── */}
        <div className="card-dark rounded-2xl p-5 flex flex-col min-h-[580px] lg:min-h-[660px]">
          {/* Chat header */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-purple-600/25 border border-purple-500/30 flex items-center justify-center">
                  <Sparkles size={16} className="text-purple-400" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0b1121]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">Biia</p>
                <p className="text-[11px] text-green-400">Online · responde em instantes</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Zap size={9} className="text-purple-400" />
              <span className="text-[10px] font-semibold text-purple-400">IA especialista ENEM</span>
            </div>
          </div>

          {/* Chat component */}
          <div className="flex-1 flex flex-col min-h-0">
            <BiiaChat
              firstName={firstName}
              worstCompKey={worstCompKey}
              avgScore={avgScore}
              lastTheme={lastTheme}
              isNewUser={isNewUser}
              recentThemes={recentThemes}
            />
          </div>
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* ── Student snapshot ────────────────────────────────────────────── */}
          <div className="card-dark rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700 mb-3">Seu perfil atual</p>

            {avgScore !== null ? (
              <div className="space-y-3">
                {/* Score row */}
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-500">Média geral</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[16px] font-bold tabular-nums text-white">{avgScore}</span>
                    <span className="text-[10px] text-gray-600">pts</span>
                    {delta !== null && delta > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-400">
                        <Flame size={9} />+{delta}
                      </span>
                    )}
                    {delta !== null && delta < 0 && (
                      <span className="text-[10px] font-semibold text-rose-400">{delta}</span>
                    )}
                  </div>
                </div>

                {/* Evolution pill */}
                {overallDelta !== null && overallDelta !== 0 && (
                  <div className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full ${
                    overallDelta > 0
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  }`}>
                    <TrendingUp size={9} />
                    {overallDelta > 0 ? `+${overallDelta} pts desde o início` : `${overallDelta} pts vs. primeira`}
                  </div>
                )}

                {/* Comp bars */}
                {compAverages && (
                  <div className="space-y-2 pt-1">
                    {compAverages.map(c => {
                      const pct = Math.round((c.avg / 200) * 100)
                      const isWorst = c.key === worstCompKey
                      return (
                        <div key={c.key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[11px] ${isWorst ? 'text-amber-400 font-semibold' : 'text-gray-600'}`}>
                              {c.label} {isWorst && '← foco'}
                            </span>
                            <span className={`text-[11px] tabular-nums font-medium ${isWorst ? 'text-amber-400' : 'text-gray-500'}`}>
                              {c.avg}
                            </span>
                          </div>
                          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isWorst ? 'bg-amber-500' : 'bg-purple-600/60'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Focus suggestion */}
                {worstCompKey && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-amber-300 mb-0.5">Foco sugerido pela Biia</p>
                    <p className="text-[11px] text-gray-400">{COMP_DISPLAY[worstCompKey]}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center py-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                    <TrendingUp size={16} className="text-gray-700" />
                  </div>
                  <p className="text-[12px] text-gray-600 leading-relaxed">
                    {isNewUser
                      ? 'Envie sua primeira redação para ver seu diagnóstico de competências aqui.'
                      : 'Aguardando a primeira correção para calcular seu perfil.'}
                  </p>
                </div>
                {/* Hint: what they'll see */}
                {isNewUser && (
                  <div className="space-y-1.5">
                    {compKeys.map(key => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-700">{COMP_LABELS[key]}</span>
                        <div className="flex-1 mx-2 h-1 rounded-full bg-white/[0.04]" />
                        <span className="text-[10px] text-gray-800">—</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Recent themes ────────────────────────────────────────────────── */}
          {recentThemes.length > 0 && (
            <div className="card-dark rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={12} className="text-gray-600" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700">Temas recentes</p>
              </div>
              <div className="space-y-1.5">
                {recentThemes.slice(0, 3).map((theme, i) => (
                  <a
                    key={i}
                    href={`/aluno/biia?prompt=${encodeURIComponent(`Me ajude com repertório para o tema: "${theme}"`)}`}
                    className="group flex items-start gap-2 px-3 py-2 rounded-xl border border-white/[0.05] hover:border-purple-500/20 hover:bg-purple-500/[0.04] transition-all cursor-pointer"
                  >
                    <PenLine size={10} className="text-gray-700 group-hover:text-purple-400 mt-0.5 flex-shrink-0 transition-colors" />
                    <p className="text-[11px] text-gray-500 group-hover:text-gray-300 leading-snug transition-colors line-clamp-2">
                      {theme}
                    </p>
                  </a>
                ))}
              </div>
              {recentThemes.length > 0 && (
                <p className="text-[10px] text-gray-700 mt-2 text-center">Clique para pedir repertório sobre o tema</p>
              )}
            </div>
          )}

          {/* ── Capacidades da Biia ──────────────────────────────────────────── */}
          <div className="card-dark rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={12} className="text-gray-600" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700">Capacidades da Biia</p>
            </div>
            <div className="space-y-2">
              {CAPABILITIES.map(({ icon: Icon, label, desc, color, bg }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${bg}`}>
                    <Icon size={11} className={color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-gray-400 leading-none mb-0.5">{label}</p>
                    <p className="text-[10px] text-gray-700 leading-snug">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Quick-access prompts ─────────────────────────────────────────── */}
          <div className="card-dark rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700 mb-3">Acesso rápido</p>
            <div className="space-y-1.5">
              {QUICK_PROMPTS.map(({ label, prompt }) => (
                <a
                  key={label}
                  href={`/aluno/biia?prompt=${encodeURIComponent(prompt)}`}
                  className="group flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.05] hover:border-purple-500/25 hover:bg-purple-500/[0.04] transition-all"
                >
                  <span className="w-1 h-1 rounded-full bg-purple-600/50 group-hover:bg-purple-400 flex-shrink-0 transition-colors" />
                  <span className="text-[11px] text-gray-600 group-hover:text-gray-300 transition-colors leading-snug">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
