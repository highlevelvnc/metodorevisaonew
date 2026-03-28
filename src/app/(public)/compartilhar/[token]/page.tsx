import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { COMP_COLORS, type CompKey } from '@/lib/competency-colors'

export const dynamic = 'force-dynamic'

const COMPETENCIES: { key: CompKey; label: string; name: string }[] = [
  { key: 'c1', label: 'C1', name: 'Domínio da Norma Culta' },
  { key: 'c2', label: 'C2', name: 'Compreensão da Proposta' },
  { key: 'c3', label: 'C3', name: 'Seleção de Argumentos' },
  { key: 'c4', label: 'C4', name: 'Mecanismos de Coesão' },
  { key: 'c5', label: 'C5', name: 'Proposta de Intervenção' },
]

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  return {
    title: 'Devolutiva de Redação | Método Revisão',
    description: 'Relatório de correção de redação ENEM — Método Revisão',
    robots: { index: false, follow: false },
    openGraph: {
      title: 'Devolutiva de Redação | Método Revisão',
      description: 'Veja o resultado da correção ENEM com análise por competência.',
      type: 'article',
    },
  }
}

type SharedCorrection = {
  c1_score: number; c2_score: number; c3_score: number
  c4_score: number; c5_score: number; total_score: number
  reviewer_name: string; corrected_at: string
}

export default async function SharedReportPage({ params }: { params: { token: string } }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) notFound()

  // Use service role to bypass RLS — share_token lookup is the auth gate
  const supabase = createClient(supabaseUrl, serviceKey)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: essay } = await db
    .from('essays')
    .select('id, theme_title, submitted_at, status, corrections(c1_score, c2_score, c3_score, c4_score, c5_score, total_score, reviewer_name, corrected_at), users!essays_student_id_fkey(full_name)')
    .eq('share_token', params.token)
    .eq('status', 'corrected')
    .single()

  if (!essay) notFound()

  const correction = (essay.corrections as SharedCorrection[])?.[0]
  if (!correction) notFound()

  const studentName = (essay.users as { full_name: string } | null)?.full_name ?? 'Aluno'
  const firstName = studentName.split(' ')[0]

  const compScores = COMPETENCIES.map(c => {
    const scoreKey = `${c.key}_score` as keyof SharedCorrection
    const score = Math.max(0, Math.min(200, (correction[scoreKey] as number) ?? 0))
    return { ...c, score }
  })

  const strongest = compScores.reduce((a, b) => a.score >= b.score ? a : b)
  const weakest = compScores.reduce((a, b) => a.score <= b.score ? a : b)

  return (
    <div className="min-h-screen bg-[#080d18]">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 mb-4">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Relatório de Correção
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
            {essay.theme_title}
          </h1>
          <p className="text-sm text-gray-500">
            Devolutiva de {firstName} · Corrigida por <span className="text-gray-400">{correction.reviewer_name}</span> · {formatDate(correction.corrected_at)}
          </p>
        </div>

        {/* ── Score Hero ── */}
        <div className="card-dark rounded-2xl p-8 text-center mb-6">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Pontuação Total</p>
          <div className="text-7xl font-extrabold text-white leading-none mb-1">
            {correction.total_score}
          </div>
          <p className="text-sm text-gray-600">de 1000 pontos</p>
          <div className="mt-5 h-2.5 bg-white/[0.06] rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
              style={{ width: `${(correction.total_score / 1000) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Competency breakdown ── */}
        <div className="card-dark rounded-2xl p-5 mb-6">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4">Competências ENEM</p>
          <div className="space-y-3">
            {compScores.map(c => {
              const colors = COMP_COLORS[c.key]
              const pct = (c.score / 200) * 100
              return (
                <div key={c.key} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${colors.border} ${colors.bg}`}>
                    <span className={`text-[10px] font-bold ${colors.text}`}>{c.label}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">{c.name}</span>
                      <span className={`text-xs font-bold tabular-nums ${colors.text}`}>
                        {c.score}<span className="text-gray-600 font-normal">/200</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Highlights ── */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card-dark rounded-2xl p-4 text-center">
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2">Mais forte</p>
            <p className="text-sm font-bold text-green-400">{strongest.label} — {strongest.name}</p>
            <p className="text-lg font-extrabold text-white mt-1">{strongest.score}/200</p>
          </div>
          <div className="card-dark rounded-2xl p-4 text-center">
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2">Foco de melhoria</p>
            <p className="text-sm font-bold text-amber-400">{weakest.label} — {weakest.name}</p>
            <p className="text-lg font-extrabold text-white mt-1">{weakest.score}/200</p>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="card-dark rounded-2xl p-6 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Quer receber devolutivas assim para suas redações?
          </p>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm py-3 px-6 rounded-xl transition-colors shadow-[0_4px_20px_rgba(124,58,237,0.3)]"
          >
            Criar conta no Método Revisão
          </Link>
          <p className="text-[10px] text-gray-700 mt-3">
            Correção estratégica de redação ENEM com devolutiva C1–C5
          </p>
        </div>

        {/* ── Footer ── */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-700">
            Relatório gerado pelo Método Revisão · Este link pode ser revogado pelo aluno a qualquer momento · <a href="mailto:suporte@metodorevisao.com" className="hover:text-gray-500 transition-colors">suporte@metodorevisao.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}
