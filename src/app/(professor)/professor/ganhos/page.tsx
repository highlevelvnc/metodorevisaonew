import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Banknote, FileText, Video, TrendingUp, ChevronRight, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RATE_ESSAY, RATE_LESSON, formatBRL } from '@/lib/professor/rates'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Professor — Ganhos',
  robots: { index: false, follow: false },
}

type DailyRow = { date: string; essays: number; lessons: number; total: number }

function formatDateLabel(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}

export default async function ProfessorGanhosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  const profile = profileRaw as { role: string } | null
  if (!profile || !['admin', 'reviewer'].includes(profile.role)) redirect('/aluno')

  const now           = new Date()
  const firstOfMonth  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  // Date-only strings for lesson_sessions.session_date (type: date)
  const firstDateStr  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const lastDateStr   = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                          .toISOString().split('T')[0]
  const monthLabel    = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
  const capLabel      = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  // ── Parallel queries ─────────────────────────────────────────────────────────
  const [
    { data: monthCorrectionsRaw },
    { data: rateRow },
    { count: lessonsCountRaw },
  ] = await Promise.all([

    // 1. This professor's corrections this month — source of truth for earnings
    supabase
      .from('corrections')
      .select('corrected_at')
      .eq('reviewer_id', user.id)
      .gte('corrected_at', firstOfMonth)
      .order('corrected_at', { ascending: false }),

    // 2. Active rate override for this professor (null → use constants)
    supabase
      .from('professor_rates')
      .select('essay_rate, lesson_rate')
      .eq('professor_id', user.id)
      .is('valid_to', null)
      .order('valid_from', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // 3. Completed lesson sessions this month
    supabase
      .from('lesson_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('professor_id', user.id)
      .eq('status', 'completed')
      .gte('session_date', firstDateStr)
      .lte('session_date', lastDateStr),
  ])

  // Effective rates — DB row takes precedence over shared constants
  const effectiveEssayRate  = rateRow?.essay_rate  ?? RATE_ESSAY
  const effectiveLessonRate = rateRow?.lesson_rate ?? RATE_LESSON

  const monthCorrections: { corrected_at: string }[] = monthCorrectionsRaw ?? []
  const essaysCount  = monthCorrections.length
  const lessonsCount = lessonsCountRaw ?? 0

  const ganhoCorrecoes = essaysCount  * effectiveEssayRate
  const ganhoAulas     = lessonsCount * effectiveLessonRate
  const totalParcial   = ganhoCorrecoes + ganhoAulas

  const dayOfMonth    = now.getDate()
  const daysInMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const diasRestantes = daysInMonth - dayOfMonth
  const avgPerDay     = dayOfMonth > 0 ? essaysCount / dayOfMonth : 0
  const projectedTotal = Math.round(avgPerDay * daysInMonth) * effectiveEssayRate

  // ── Daily breakdown ──────────────────────────────────────────────────────────
  const dailyMap = new Map<string, number>()
  for (const c of monthCorrections) {
    const d = (c.corrected_at as string).split('T')[0]
    dailyMap.set(d, (dailyMap.get(d) ?? 0) + 1)
  }
  const daily: DailyRow[] = Array.from(dailyMap.entries())
    .map(([date, essays]) => ({
      date,
      essays,
      lessons: 0,  // lesson breakdown by day: future — requires session_date grouping
      total: essays * effectiveEssayRate,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))

  const progressPct = projectedTotal > 0
    ? Math.min(100, Math.round((totalParcial / projectedTotal) * 100))
    : essaysCount > 0 ? 100 : 0

  // Flag if a non-default rate is active
  const hasCustomRate = rateRow !== null

  return (
    <div className="max-w-4xl space-y-6">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Ganhos — {capLabel}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {diasRestantes > 0
              ? `${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} restantes neste ciclo`
              : 'Ciclo encerrado — aguardando fechamento'}
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-full">
          Em aberto
        </span>
      </div>

      {/* ── KPI row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="card-dark p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <FileText size={12} className="text-amber-400" />
            </div>
            <span className="text-[11px] text-gray-500">Correções</span>
          </div>
          <p className="text-3xl font-bold text-white tabular-nums">{essaysCount}</p>
          <p className="text-[11px] text-gray-600 mt-0.5">no mês</p>
        </div>

        <div className="card-dark p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Video size={12} className={lessonsCount > 0 ? 'text-purple-400' : 'text-purple-400/35'} />
            </div>
            <span className={`text-[11px] ${lessonsCount > 0 ? 'text-gray-500' : 'text-gray-600'}`}>Aulas</span>
          </div>
          <p className={`text-3xl font-bold tabular-nums ${lessonsCount > 0 ? 'text-white' : 'text-gray-700'}`}>
            {lessonsCount}
          </p>
          <p className="text-[11px] text-gray-700 mt-0.5">
            {lessonsCount > 0 ? 'sessões concluídas' : 'nenhuma este mês'}
          </p>
        </div>

        <div className="card-dark p-5 rounded-2xl border border-green-500/[0.10]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Banknote size={12} className="text-green-400" />
            </div>
            <span className="text-[11px] text-gray-500">Ganho parcial</span>
          </div>
          <p className="text-3xl font-bold text-green-400 tabular-nums">{formatBRL(totalParcial)}</p>
          <p className="text-[11px] text-gray-600 mt-0.5">acumulado no mês</p>
        </div>

        <div className="card-dark p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <TrendingUp size={12} className="text-blue-400" />
            </div>
            <span className="text-[11px] text-gray-500">Projeção</span>
          </div>
          <p className="text-3xl font-bold text-white tabular-nums">
            {projectedTotal > 0 ? formatBRL(projectedTotal) : '—'}
          </p>
          <p className="text-[11px] text-gray-600 mt-0.5">projeção de fechamento</p>
        </div>

      </div>

      {/* ── Breakdown + cycle progress ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Composition */}
        <div className="card-dark rounded-2xl p-5">
          <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-5">
            Composição do mês
          </h2>

          <div className="space-y-5">

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-sm text-gray-300">Correções de redação</span>
                </div>
                <span className="text-sm font-bold text-white tabular-nums">{formatBRL(ganhoCorrecoes)}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-700"
                    style={{ width: essaysCount > 0 ? '100%' : '0%' }}
                  />
                </div>
                <span className="text-[11px] text-gray-600 w-28 text-right shrink-0 tabular-nums">
                  {essaysCount} × {formatBRL(effectiveEssayRate)}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${lessonsCount > 0 ? 'bg-purple-500' : 'bg-purple-500/25'}`} />
                  <span className={`text-sm ${lessonsCount > 0 ? 'text-gray-300' : 'text-gray-600'}`}>
                    Aulas (30 min)
                  </span>
                </div>
                <span className={`text-sm font-bold tabular-nums ${lessonsCount > 0 ? 'text-white' : 'text-gray-700'}`}>
                  {formatBRL(ganhoAulas)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${lessonsCount > 0 ? 'bg-purple-500' : 'bg-purple-500/20'}`}
                    style={{
                      width: totalParcial > 0 && lessonsCount > 0
                        ? `${Math.round((ganhoAulas / totalParcial) * 100)}%`
                        : '0%',
                    }}
                  />
                </div>
                <span className={`text-[11px] w-28 text-right shrink-0 tabular-nums ${lessonsCount > 0 ? 'text-gray-600' : 'text-gray-700'}`}>
                  {lessonsCount} × {formatBRL(effectiveLessonRate)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-300">Total parcial</span>
                <span className="text-base font-bold text-green-400 tabular-nums">{formatBRL(totalParcial)}</span>
              </div>
              {projectedTotal > 0 && (
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-gray-600">Projeção de fechamento</span>
                  <span className="text-xs font-semibold text-gray-500 tabular-nums">{formatBRL(projectedTotal)}</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Cycle progress + rates */}
        <div className="card-dark rounded-2xl p-5">
          <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-5">
            Progresso do ciclo
          </h2>

          <div className="mb-6">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-400 font-semibold tabular-nums">{formatBRL(totalParcial)}</span>
              <span className="text-gray-600 tabular-nums">
                meta: {projectedTotal > 0 ? formatBRL(projectedTotal) : '—'}
              </span>
            </div>
            <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-700 to-green-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <p className="text-[11px] text-gray-700">Dia {dayOfMonth} de {daysInMonth}</p>
              <p className="text-[11px] text-gray-700">{progressPct}% do ciclo</p>
            </div>
          </div>

          {/* Rate table */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Taxas vigentes</p>
              {hasCustomRate && (
                <span className="text-[9px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                  personalizada
                </span>
              )}
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                  <FileText size={11} className="text-amber-400/60" />
                  Correção de redação
                </span>
                <span className="text-xs font-bold text-amber-400 tabular-nums">
                  {formatBRL(effectiveEssayRate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Video size={11} className="text-purple-400/60" />
                  Aula de 30 minutos
                </span>
                <span className="text-xs font-bold text-purple-400 tabular-nums">
                  {formatBRL(effectiveLessonRate)}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/professor/fechamento"
            className="flex items-center justify-between text-xs text-gray-500 hover:text-amber-400 transition-colors group"
          >
            <span>Ver histórico de fechamentos</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>

      {/* ── Daily history table ────────────────────────────────────── */}
      <div className="card-dark rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Histórico diário — {capLabel}</h2>
          {daily.length > 0 && (
            <span className="text-xs text-gray-600 tabular-nums">
              {daily.length} dia{daily.length !== 1 ? 's' : ''} com atividade
            </span>
          )}
        </div>

        {daily.length === 0 ? (
          <div className="py-12 text-center">
            <Banknote size={22} className="text-gray-700 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">Nenhuma correção registrada este mês.</p>
            <p className="text-xs text-gray-700 mt-1">As entradas aparecerão aqui conforme você corrigir.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                  Data
                </th>
                <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-20">
                  Correções
                </th>
                <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-16">
                  Aulas
                </th>
                <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-32">
                  Valor do dia
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {daily.map(row => (
                <tr key={row.date} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-sm text-gray-300 capitalize">
                    {formatDateLabel(row.date)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-amber-400 text-center tabular-nums">
                    {row.essays}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center tabular-nums">
                    {row.lessons > 0 ? row.lessons : '—'}
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-white text-right tabular-nums">
                    {formatBRL(row.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-white/[0.035] border-t border-white/[0.08]">
                <td className="px-5 py-3.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Total do mês
                </td>
                <td className="px-4 py-3.5 text-sm font-bold text-amber-400 text-center tabular-nums">
                  {essaysCount}
                </td>
                <td className="px-4 py-3.5 text-sm font-bold text-gray-600 text-center tabular-nums">
                  {lessonsCount > 0 ? lessonsCount : '—'}
                </td>
                <td className="px-5 py-3.5 text-sm font-bold text-green-400 text-right tabular-nums">
                  {formatBRL(totalParcial)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* ── Info notice ───────────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
        <Info size={13} className="text-gray-600 mt-0.5 shrink-0" />
        <p className="text-xs text-gray-600 leading-relaxed">
          Ganhos calculados a partir das correções registradas em seu nome este mês.
          O módulo de aulas registrará sessões automaticamente quando disponível.
          O fechamento mensal ocorre no último dia de cada mês.{' '}
          <Link href="/professor/fechamento" className="text-gray-400 hover:text-white transition-colors underline underline-offset-2">
            Ver histórico de fechamentos →
          </Link>
        </p>
      </div>

    </div>
  )
}
