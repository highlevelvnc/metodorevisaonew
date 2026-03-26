import type { Metadata } from 'next'
import { redirect }      from 'next/navigation'
import { createClient }  from '@/lib/supabase/server'
import { Sparkles, TrendingUp, BookOpen, Flame } from 'lucide-react'
import { BiiaChat }      from './BiiaChat'

export const metadata: Metadata = {
  title: 'Biia AI · Método Revisão',
  robots: { index: false, follow: false },
}

type CompKey = 'c1_score' | 'c2_score' | 'c3_score' | 'c4_score' | 'c5_score'
const compKeys: CompKey[] = ['c1_score', 'c2_score', 'c3_score', 'c4_score', 'c5_score']

const COMP_NAMES: Record<CompKey, string> = {
  c1_score: 'Norma Culta (C1)',
  c2_score: 'Compreensão do Tema (C2)',
  c3_score: 'Seleção de Argumentos (C3)',
  c4_score: 'Mecanismos de Coesão (C4)',
  c5_score: 'Proposta de Intervenção (C5)',
}

const COMP_SHORT: Record<CompKey, string> = {
  c1_score: 'C1',
  c2_score: 'C2',
  c3_score: 'C3',
  c4_score: 'C4',
  c5_score: 'C5',
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

  const profile    = profileRaw as { full_name: string } | null
  const essays     = (essaysRaw as EssayRow[]) ?? []
  const firstName  = profile?.full_name?.split(' ')[0] ?? 'Aluno'

  const corrected  = essays.filter(e => e.status === 'corrected' && e.corrections?.length > 0)
  const lastEssay  = essays[0] ?? null
  const lastTheme  = lastEssay?.theme_title ?? null

  const avgScore   = corrected.length
    ? Math.round(corrected.reduce((s, e) => s + (e.corrections[0]?.total_score ?? 0), 0) / corrected.length)
    : null

  const lastCorrection = corrected[0]?.corrections?.[0] ?? null
  const worstCompKey: CompKey | null = lastCorrection
    ? compKeys.reduce((a, b) => ((lastCorrection[a] ?? 0) <= (lastCorrection[b] ?? 0) ? a : b))
    : null

  // Compute per-comp averages for the context panel
  const compAverages = corrected.length >= 2
    ? compKeys.map(key => ({
        key,
        name: COMP_SHORT[key],
        full: COMP_NAMES[key],
        avg: Math.round(corrected.reduce((s, e) => s + (e.corrections[0]?.[key] ?? 0), 0) / corrected.length),
      }))
    : null

  const delta = corrected.length >= 2
    ? (corrected[0].corrections[0]?.total_score ?? 0) - (corrected[corrected.length - 1].corrections[0]?.total_score ?? 0)
    : null

  return (
    <div className="max-w-6xl">

      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/25 flex items-center justify-center">
            <Sparkles size={15} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Biia AI</h1>
            <p className="text-[12px] text-gray-600">Tutora de redação com inteligência artificial</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">

        {/* ── Chat panel ─────────────────────────────────────────────────────── */}
        <div className="card-dark rounded-2xl p-5 flex flex-col min-h-[560px] lg:min-h-[640px]">
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
              <Sparkles size={9} className="text-purple-400" />
              <span className="text-[10px] font-semibold text-purple-400">IA</span>
            </div>
          </div>

          {/* Chat component — fills remaining height */}
          <div className="flex-1 flex flex-col min-h-0">
            <BiiaChat
              firstName={firstName}
              worstCompKey={worstCompKey}
              avgScore={avgScore}
              lastTheme={lastTheme}
            />
          </div>
        </div>

        {/* ── Context sidebar ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Student snapshot */}
          <div className="card-dark rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700 mb-3">Seu perfil atual</p>

            {avgScore !== null ? (
              <div className="space-y-3">
                {/* Average score */}
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-500">Média geral</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[15px] font-bold tabular-nums text-white">{avgScore}</span>
                    <span className="text-[10px] text-gray-600">pts</span>
                    {delta !== null && delta > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-400">
                        <Flame size={9} />+{delta}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comp bars */}
                {compAverages && (
                  <div className="space-y-2">
                    {compAverages.map(c => {
                      const pct = Math.round((c.avg / 200) * 100)
                      const isWorst = c.key === worstCompKey
                      return (
                        <div key={c.key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[11px] ${isWorst ? 'text-amber-400 font-semibold' : 'text-gray-600'}`}>
                              {c.name} {isWorst && '← foco'}
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

                {worstCompKey && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-3 py-2.5">
                    <p className="text-[11px] font-semibold text-amber-300 mb-0.5">Foco sugerido</p>
                    <p className="text-[11px] text-gray-500">{COMP_NAMES[worstCompKey]}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                  <TrendingUp size={16} className="text-gray-700" />
                </div>
                <p className="text-[12px] text-gray-600 leading-relaxed">
                  Envie sua primeira redação para ver seu perfil de competências aqui.
                </p>
              </div>
            )}
          </div>

          {/* Last theme context */}
          {lastTheme && (
            <div className="card-dark rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={12} className="text-gray-600" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700">Última redação</p>
              </div>
              <p className="text-[12px] text-gray-400 leading-relaxed">{lastTheme}</p>
              <p className="text-[11px] text-gray-700 mt-2">
                Posso ajudar com repertório ou revisar sua proposta para este tema.
              </p>
            </div>
          )}

          {/* How to use tip */}
          <div className="card-dark rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700 mb-3">Como usar a Biia</p>
            <ul className="space-y-2.5">
              {[
                'Cole um trecho da sua redação e peça análise',
                'Pergunte sobre qualquer critério do ENEM',
                'Peça um plano para o próximo mês',
                'Solicite repertório para um tema específico',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-600/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[8px] font-bold text-purple-400">{i + 1}</span>
                  </span>
                  <span className="text-[11px] text-gray-600 leading-snug">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}
