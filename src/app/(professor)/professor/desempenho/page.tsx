import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { BarChart3, Clock, Target, TrendingUp, CheckCircle2, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buildMonthWindows, formatBRL, RATE_ESSAY, RATE_LESSON } from '@/lib/professor/rates'
import type { MonthlyPayoutRow } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Professor — Desempenho',
  robots: { index: false, follow: false },
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface CorrectionWithEssay {
  corrected_at: string
  total_score:  number
  c1_score:     number
  c2_score:     number
  c3_score:     number
  c4_score:     number
  c5_score:     number
  essays: { submitted_at: string } | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function avg(arr: number[]): number {
  if (!arr.length) return 0
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function round1(n: number): string {
  return n.toFixed(1)
}


// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProfessorDesempenhoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  const profile = profileRaw as { role: string } | null
  if (!profile || !['admin', 'reviewer'].includes(profile.role)) redirect('/aluno')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const now     = new Date()
  const windows = buildMonthWindows(6, now)

  const sixMonthsAgo = windows[windows.length - 1].first
  const firstOfMonth = windows[0].first

  // Build reference-month keys for payout lookup
  const refMonths = windows.map(w => {
    const mm = String(w.month + 1).padStart(2, '0')
    return `${w.year}-${mm}-01`
  })

  const [
    { data: correctionsRaw },
    { data: payoutRowsRaw },
    { data: lessonsAllRaw },
    { count: thisMonthEssays },
  ] = await Promise.all([
    // All corrections in 6-month window with essay submitted_at for time calc
    supabase.from('corrections')
      .select('corrected_at, total_score, c1_score, c2_score, c3_score, c4_score, c5_score, essays(submitted_at)')
      .eq('reviewer_id', user.id)
      .gte('corrected_at', sixMonthsAgo)
      .order('corrected_at', { ascending: false }),

    // Confirmed payout rows
    db.from('monthly_payouts')
      .select('reference_month, essays_count, lessons_count, total_amount, status')
      .eq('professor_id', user.id)
      .in('reference_month', refMonths),

    // Lesson sessions 6 months
    db.from('lesson_sessions')
      .select('session_date, status, duration_min')
      .eq('professor_id', user.id)
      .gte('session_date', refMonths[refMonths.length - 1]),

    // Current month corrections for live count
    supabase.from('corrections')
      .select('*', { count: 'exact', head: true })
      .eq('reviewer_id', user.id)
      .gte('corrected_at', firstOfMonth),
  ])

  const corrections: CorrectionWithEssay[] = (correctionsRaw as unknown as CorrectionWithEssay[]) ?? []
  const payoutRows: MonthlyPayoutRow[]      = payoutRowsRaw ?? []
  const lessonsAll: { session_date: string; status: string; duration_min: number }[] = lessonsAllRaw ?? []

  const payoutByMonth = new Map(payoutRows.map(r => [r.reference_month.slice(0, 7), r]))

  // ── Overall stats ─────────────────────────────────────────────────────────
  const totalCorrections = corrections.length
  const scores           = corrections.map(c => c.total_score)
  const avgScore         = avg(scores)

  const c1Avg = avg(corrections.map(c => c.c1_score))
  const c2Avg = avg(corrections.map(c => c.c2_score))
  const c3Avg = avg(corrections.map(c => c.c3_score))
  const c4Avg = avg(corrections.map(c => c.c4_score))
  const c5Avg = avg(corrections.map(c => c.c5_score))

  // On-time rate (corrected within 48h of submission)
  const withTimes = corrections.filter(c => c.essays?.submitted_at)
  const onTime    = withTimes.filter(c => {
    const diff = new Date(c.corrected_at).getTime() - new Date(c.essays!.submitted_at).getTime()
    return diff <= 48 * 3_600_000
  })
  const onTimeRate = withTimes.length ? Math.round((onTime.length / withTimes.length) * 100) : null

  // Avg correction time in hours
  const times = withTimes.map(c =>
    (new Date(c.corrected_at).getTime() - new Date(c.essays!.submitted_at).getTime()) / 3_600_000
  )
  const avgTimeHours = times.length ? Math.round(avg(times)) : null

  // Current month live
  const currentMonthCount = thisMonthEssays ?? 0

  // ── Monthly breakdown ─────────────────────────────────────────────────────

  interface MonthBreakdown {
    label:           string
    windowKey:       string
    corrections:     number
    lessons:         number
    earnings:        number
    isConfirmed:     boolean
    isCurrent:       boolean
  }

  // Group corrections and lessons by month key
  const corrsByMonth = new Map<string, number>()
  for (const c of corrections) {
    const key = c.corrected_at.slice(0, 7)
    corrsByMonth.set(key, (corrsByMonth.get(key) ?? 0) + 1)
  }

  const lessonsByMonth = new Map<string, number>()
  for (const l of lessonsAll) {
    if (l.status === 'completed') {
      const key = l.session_date.slice(0, 7)
      lessonsByMonth.set(key, (lessonsByMonth.get(key) ?? 0) + 1)
    }
  }

  const monthBreakdowns: MonthBreakdown[] = windows.map((w, i) => {
    const windowKey  = `${w.year}-${String(w.month + 1).padStart(2, '0')}`
    const payout     = payoutByMonth.get(windowKey)
    const isCurrent  = i === 0

    if (payout && !isCurrent) {
      return {
        label:       w.label,
        windowKey,
        corrections: payout.essays_count,
        lessons:     payout.lessons_count,
        earnings:    payout.total_amount,
        isConfirmed: true,
        isCurrent:   false,
      }
    }

    const corrections = isCurrent ? currentMonthCount : (corrsByMonth.get(windowKey) ?? 0)
    const lessons     = lessonsByMonth.get(windowKey) ?? 0
    return {
      label:       w.label,
      windowKey,
      corrections,
      lessons,
      earnings:    corrections * RATE_ESSAY + lessons * RATE_LESSON,
      isConfirmed: false,
      isCurrent,
    }
  })

  const competencies = [
    { label: 'C1 — Norma culta',         avg: c1Avg },
    { label: 'C2 — Tema e gênero',        avg: c2Avg },
    { label: 'C3 — Seleção de argumentos', avg: c3Avg },
    { label: 'C4 — Coesão',               avg: c4Avg },
    { label: 'C5 — Proposta de intervenção', avg: c5Avg },
  ]

  const completedLessonsTotal = lessonsAll.filter(l => l.status === 'completed').length

  return (
    <div className="max-w-4xl space-y-6">

      {/* ── Header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Desempenho</h1>
        <p className="text-gray-500 text-sm mt-0.5">Análises de produtividade e qualidade — últimos 6 meses</p>
      </div>

      {/* ── KPI cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-dark rounded-xl p-4">
          <BarChart3 size={14} className="text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-white tabular-nums">{totalCorrections}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">Correções (6 meses)</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <Star size={14} className="text-yellow-400 mb-2" />
          <p className="text-2xl font-bold text-white tabular-nums">
            {totalCorrections ? Math.round(avgScore) : '—'}
          </p>
          <p className="text-[10px] text-gray-600 mt-0.5">Nota média atribuída</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <Clock size={14} className="text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white tabular-nums">
            {avgTimeHours !== null ? `${avgTimeHours}h` : '—'}
          </p>
          <p className="text-[10px] text-gray-600 mt-0.5">Tempo médio de correção</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <CheckCircle2 size={14} className="text-green-400 mb-2" />
          <p className="text-2xl font-bold text-white tabular-nums">
            {onTimeRate !== null ? `${onTimeRate}%` : '—'}
          </p>
          <p className="text-[10px] text-gray-600 mt-0.5">Entrega no prazo (48h)</p>
        </div>
      </div>

      {/* ── Monthly breakdown ─────────────────────────────────── */}
      <div className="card-dark rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Produtividade mensal</h2>
          <p className="text-xs text-gray-600 mt-0.5">Correções · aulas · ganhos por ciclo</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Mês</th>
              <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-24">Correções</th>
              <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-20">Aulas</th>
              <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-32">Ganhos</th>
              <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-28">Origem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {monthBreakdowns.map(m => (
              <tr key={m.windowKey} className={`hover:bg-white/[0.02] transition-colors ${m.isCurrent ? 'bg-amber-500/[0.03]' : ''}`}>
                <td className="px-5 py-3.5">
                  <p className="text-xs font-semibold text-gray-200">{m.label}</p>
                  {m.isCurrent && (
                    <p className="text-[10px] text-amber-500/70 mt-0.5">Mês atual</p>
                  )}
                </td>
                <td className="px-4 py-3.5 text-sm font-bold text-gray-200 text-center tabular-nums">{m.corrections}</td>
                <td className="px-4 py-3.5 text-sm text-gray-500 text-center tabular-nums">{m.lessons || '—'}</td>
                <td className={`px-5 py-3.5 text-sm font-bold text-right tabular-nums ${m.earnings > 0 ? 'text-amber-400' : 'text-gray-700'}`}>
                  {m.earnings > 0 ? formatBRL(m.earnings) : '—'}
                </td>
                <td className="px-5 py-3.5 text-right">
                  {m.isConfirmed ? (
                    <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                      Confirmado
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-700">Provisório</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Competency averages ───────────────────────────────── */}
      {totalCorrections > 0 && (
        <div className="card-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Target size={14} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Notas médias por competência</h2>
            <span className="ml-auto text-[10px] text-gray-600">Escala: 0 – 200</span>
          </div>
          <div className="space-y-4">
            {competencies.map(({ label, avg: a }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-xs font-bold text-white tabular-nums">{round1(a)}</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      a / 200 >= 0.8 ? 'bg-green-500' :
                      a / 200 >= 0.6 ? 'bg-amber-500' :
                      a / 200 >= 0.4 ? 'bg-orange-500' :
                                       'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((a / 200) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Lessons & delivery summary ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-dark rounded-xl p-5">
          <TrendingUp size={14} className="text-purple-400 mb-3" />
          <p className="text-xs text-gray-600 mb-1">Aulas concluídas (6 meses)</p>
          <p className="text-2xl font-bold text-white tabular-nums">{completedLessonsTotal}</p>
          <p className="text-xs text-gray-700 mt-2">
            {formatBRL(completedLessonsTotal * RATE_LESSON)} em ganhos de aulas
          </p>
        </div>

        <div className="card-dark rounded-xl p-5">
          <Clock size={14} className="text-blue-400 mb-3" />
          <p className="text-xs text-gray-600 mb-1">Pontualidade de entrega</p>
          <p className="text-2xl font-bold text-white tabular-nums">
            {onTimeRate !== null ? `${onTimeRate}%` : '—'}
          </p>
          <p className="text-xs text-gray-700 mt-2">
            {onTime.length} de {withTimes.length} correções entregues em até 48h
          </p>
        </div>
      </div>

    </div>
  )
}
