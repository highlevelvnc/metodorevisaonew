import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  AlertCircle,
  Users,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  Zap,
  Star,
  Trophy,
  Target,
  Activity,
  Timer,
  Flame,
  ChevronUp,
  ChevronDown,
  Banknote,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RATE_ESSAY, formatBRL } from '@/lib/professor/rates'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Professor — Dashboard',
  robots: { index: false, follow: false },
}

function msAgo(iso: string) { return Date.now() - new Date(iso).getTime() }

function relativeDate(iso: string) {
  const h = Math.floor(msAgo(iso) / 3_600_000)
  if (h < 1) return 'há menos de 1h'
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  return `há ${d} dia${d !== 1 ? 's' : ''}`
}

type PendingEssay = {
  id: string; theme_title: string; submitted_at: string
  student: { full_name: string } | null
}
type CorrectionsRow = {
  total_score: number; c5_score: number
}
type EssayTimeRow = {
  submitted_at: string; corrected_at: string
}

// ── Reward levels ─────────────────────────────────────────────────────────────
const REWARD_LEVELS: Array<{ name: string; pts: number; color: string; bar: string; ring: string }> = [
  { name: 'Iniciante', pts: 0,    color: 'text-gray-400',   bar: 'bg-gray-500/70',  ring: 'border-gray-500/40'   },
  { name: 'Bronze',    pts: 100,  color: 'text-amber-600',  bar: 'bg-amber-700',    ring: 'border-amber-600/50'  },
  { name: 'Prata',     pts: 300,  color: 'text-slate-300',  bar: 'bg-slate-400',    ring: 'border-slate-400/50'  },
  { name: 'Ouro',      pts: 600,  color: 'text-yellow-400', bar: 'bg-yellow-500',   ring: 'border-yellow-500/50' },
  { name: 'Diamante',  pts: 1200, color: 'text-cyan-300',   bar: 'bg-cyan-500',     ring: 'border-cyan-400/50'   },
]

export default async function ProfessorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Belt-and-suspenders role check (middleware is primary guard; this protects
  // against DEV_BYPASS_AUTH in development and any edge cases in production)
  const { data: profileRaw } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  const roleProfile = profileRaw as { role: string } | null
  if (!roleProfile || !['admin', 'reviewer'].includes(roleProfile.role)) redirect('/aluno')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: pendingCount },
    { count: inReviewCount },
    { count: correctedTodayCount },
    { count: correctedThisWeekCount },
    { count: correctedLastWeekCount },
    { count: correctedThisMonthCount },
    { count: studentCount },
    { data: pendingEssaysRaw },
    { data: correctionsRaw },
    { data: professorRaw },
    { data: essayTimesRaw },
  ] = await Promise.all([
    db.from('essays').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('essays').select('*', { count: 'exact', head: true }).eq('status', 'in_review'),
    supabase.from('corrections').select('*', { count: 'exact', head: true })
      .eq('reviewer_id', user.id).gte('corrected_at', todayStart),
    supabase.from('corrections').select('*', { count: 'exact', head: true })
      .eq('reviewer_id', user.id).gte('corrected_at', sevenDaysAgo),
    supabase.from('corrections').select('*', { count: 'exact', head: true })
      .eq('reviewer_id', user.id).gte('corrected_at', fourteenDaysAgo).lt('corrected_at', sevenDaysAgo),
    supabase.from('corrections').select('*', { count: 'exact', head: true })
      .eq('reviewer_id', user.id).gte('corrected_at', firstOfMonth),
    db.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    db.from('essays')
      .select('id, theme_title, submitted_at, student:users!essays_student_id_fkey(full_name)')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true })
      .limit(5),
    db.from('corrections').select('total_score, c5_score'),
    db.from('users').select('full_name').eq('id', user.id).single(),
    db.from('essays')
      .select('submitted_at, corrected_at')
      .eq('status', 'corrected')
      .not('corrected_at', 'is', null)
      .gte('corrected_at', fourteenDaysAgo),
  ])

  const pendingEssays: PendingEssay[] = pendingEssaysRaw ?? []
  const corrections: CorrectionsRow[] = correctionsRaw ?? []
  const essayTimes: EssayTimeRow[]    = essayTimesRaw ?? []
  const professorName: string = (professorRaw as { full_name: string } | null)?.full_name ?? 'Professor'

  const pending = pendingCount ?? 0
  const inReview = inReviewCount ?? 0
  const correctedToday = correctedTodayCount ?? 0
  const correctedThisWeek = correctedThisWeekCount ?? 0
  const correctedLastWeek = correctedLastWeekCount ?? 0
  const correctedThisMonth = correctedThisMonthCount ?? 0
  const students = studentCount ?? 0
  const queueTotal = pending + inReview

  const avgScore = corrections.length
    ? Math.round(corrections.reduce((s, c) => s + c.total_score, 0) / corrections.length)
    : 0
  const avgC5 = corrections.length
    ? Math.round(corrections.reduce((s, c) => s + c.c5_score, 0) / corrections.length)
    : 0

  // ── Performance metrics ────────────────────────────────────────────────────
  const avgCorrectionHours: number | null = essayTimes.length
    ? Math.round(
        essayTimes.reduce((s, e) => {
          const diff = new Date(e.corrected_at).getTime() - new Date(e.submitted_at).getTime()
          return s + diff / 3_600_000
        }, 0) / essayTimes.length
      )
    : null

  const onTimeRate: number | null = essayTimes.length
    ? Math.round(
        (essayTimes.filter(e => {
          const diff = new Date(e.corrected_at).getTime() - new Date(e.submitted_at).getTime()
          return diff <= 48 * 3_600_000
        }).length / essayTimes.length) * 100
      )
    : null

  const avgPerDay = correctedThisWeek > 0
    ? (correctedThisWeek / 7).toFixed(1)
    : '0'

  const weekDelta    = correctedThisWeek - correctedLastWeek
  const weeklyGoal   = Math.max(correctedLastWeek > 0 ? Math.ceil(correctedLastWeek * 1.15) : 15, 10)
  const weeklyGoalPct = Math.min(100, weeklyGoal > 0 ? Math.round((correctedThisWeek / weeklyGoal) * 100) : 0)

  const criticalCount = pendingEssays.filter(e => msAgo(e.submitted_at) >= 24 * 3_600_000).length

  // ── Reward system (derived preview) ────────────────────────────────────────
  // 10 pts per correction this month + 2 pts/correction last week (recency bonus)
  const estimatedPoints = correctedThisMonth * 10 + correctedLastWeek * 2

  let currentLevelIdx = 0
  for (let i = REWARD_LEVELS.length - 1; i >= 0; i--) {
    if (estimatedPoints >= REWARD_LEVELS[i].pts) { currentLevelIdx = i; break }
  }
  const currentLevel = REWARD_LEVELS[currentLevelIdx]
  const nextLevel    = REWARD_LEVELS[currentLevelIdx + 1] ?? null
  const levelPct     = nextLevel
    ? Math.min(100, Math.round(((estimatedPoints - currentLevel.pts) / (nextLevel.pts - currentLevel.pts)) * 100))
    : 100

  // ── Financial cockpit ──────────────────────────────────────────────────────
  const ganhoDoMes          = correctedThisMonth * RATE_ESSAY
  const dayOfMonth          = now.getDate()
  const daysInMonth         = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const diasRestantes       = daysInMonth - dayOfMonth
  const avgPerDayMonth      = dayOfMonth > 0 ? correctedThisMonth / dayOfMonth : 0
  const projectedEssays     = Math.round(avgPerDayMonth * daysInMonth)
  const projecaoFechamento  = projectedEssays * RATE_ESSAY
  const progressMes         = daysInMonth > 0 ? Math.round((dayOfMonth / daysInMonth) * 100) : 0

  // ── Dynamic insight
  const insight = pending > 10
    ? `Fila crítica — ${pending} redações aguardando`
    : pending === 0
    ? 'Fila limpa! Tudo em dia.'
    : `Faltam ${pending} correções na fila.`

  const insightColor = pending > 10 ? 'text-red-400' : pending === 0 ? 'text-green-400' : 'text-amber-400'
  const insightBg = pending > 10
    ? 'border-red-500/20 bg-red-500/[0.04]'
    : pending === 0
    ? 'border-green-500/20 bg-green-500/[0.04]'
    : 'border-amber-500/20 bg-amber-500/[0.04]'

  return (
    <div className="max-w-5xl space-y-8">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">Olá, {professorName.split(' ')[0]}</h1>
            <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Professor
            </span>
            {criticalCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/25 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {criticalCount} crítica{criticalCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            {correctedToday > 0
              ? `${correctedToday} devolutiva${correctedToday !== 1 ? 's' : ''} hoje · ${queueTotal} na fila`
              : `${queueTotal} redaç${queueTotal !== 1 ? 'ões' : 'ão'} aguardando correção`}
          </p>
        </div>
        {pendingEssays.length > 0 && (
          <Link
            href={`/professor/redacoes/${pendingEssays[0].id}`}
            className="shrink-0 flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:text-amber-200"
          >
            <Flame size={14} />
            Corrigir próxima
            <ArrowRight size={13} />
          </Link>
        )}
      </div>

      {/* ── Top KPI cards (4 columns) ───────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Pendentes */}
        <Link href="/professor/redacoes" className="card-dark p-5 rounded-2xl hover:border-amber-500/25 transition-colors group">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
              <AlertCircle size={15} className="text-amber-400" />
            </div>
            <span className="text-xs text-gray-500">Pendentes</span>
          </div>
          <p className={`text-3xl font-bold ${pending > 0 ? 'text-amber-400' : 'text-white'}`}>
            {pending}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">aguardando correção</p>
        </Link>

        {/* Corrigidas hoje */}
        <div className="card-dark p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/15 flex items-center justify-center">
              <CheckCircle2 size={15} className="text-green-400" />
            </div>
            <span className="text-xs text-gray-500">Corrigidas hoje</span>
          </div>
          <p className={`text-3xl font-bold ${correctedToday > 0 ? 'text-green-400' : 'text-white'}`}>
            {correctedToday}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-gray-600">devolutivas enviadas</p>
            {correctedToday > 0 && (
              <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full">✓</span>
            )}
          </div>
        </div>

        {/* Na fila total */}
        <div className="card-dark p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/15 flex items-center justify-center">
              <Clock size={15} className="text-purple-400" />
            </div>
            <span className="text-xs text-gray-500">Na fila total</span>
          </div>
          <p className={`text-3xl font-bold ${queueTotal > 0 ? 'text-purple-400' : 'text-white'}`}>
            {queueTotal}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">pendentes + em revisão</p>
        </div>

        {/* Média de nota */}
        <div className="card-dark p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
              <TrendingUp size={15} className="text-blue-400" />
            </div>
            <span className="text-xs text-gray-500">Média de nota</span>
          </div>
          <p className="text-3xl font-bold text-white">{avgScore || '—'}</p>
          <p className="text-xs text-gray-600 mt-0.5">pontos /1000</p>
        </div>

      </div>

      {/* ── Performance cockpit ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Esta semana + trend */}
        <div className="card-dark rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Activity size={12} className="text-gray-600" />
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Esta semana</p>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-xl font-bold text-white">{correctedThisWeek}</p>
            {correctedLastWeek > 0 && (
              <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold mb-0.5 ${
                weekDelta >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {weekDelta >= 0 ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                {Math.abs(weekDelta)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600">vs {correctedLastWeek} semana passada</p>
        </div>

        {/* Meta semanal */}
        <div className="card-dark rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={12} className="text-gray-600" />
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Meta semanal</p>
          </div>
          <div className="flex items-end gap-1.5 mb-2">
            <p className="text-xl font-bold text-white">{correctedThisWeek}</p>
            <p className="text-xs text-gray-600 mb-0.5">/ {weeklyGoal}</p>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                weeklyGoalPct >= 100 ? 'bg-green-500' : weeklyGoalPct >= 60 ? 'bg-amber-500' : 'bg-amber-600/60'
              }`}
              style={{ width: `${weeklyGoalPct}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-700 mt-1">{weeklyGoalPct}% da meta</p>
        </div>

        {/* Entrega 48h */}
        <div className="card-dark rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={12} className="text-gray-600" />
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Entrega 48h</p>
          </div>
          <p className={`text-xl font-bold ${
            onTimeRate === null ? 'text-white' :
            onTimeRate >= 90 ? 'text-green-400' :
            onTimeRate >= 70 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {onTimeRate !== null ? `${onTimeRate}%` : '—'}
          </p>
          <p className="text-xs text-gray-600">no prazo (14 dias)</p>
        </div>

        {/* Tempo médio */}
        <div className="card-dark rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Timer size={12} className="text-gray-600" />
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Tempo médio</p>
          </div>
          <div className="flex items-end gap-1.5">
            <p className={`text-xl font-bold ${
              avgCorrectionHours === null ? 'text-white' :
              avgCorrectionHours <= 24 ? 'text-green-400' :
              avgCorrectionHours <= 48 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {avgCorrectionHours !== null ? `${avgCorrectionHours}h` : '—'}
            </p>
          </div>
          <p className="text-xs text-gray-600">por correção · {avgPerDay}/dia</p>
        </div>

      </div>

      {/* ── Financial cockpit ─────────────────────────────────────── */}
      <div className="card-dark rounded-2xl p-5 border border-green-500/[0.10] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Banknote size={13} className="text-green-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Ganhos do mês</h2>
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              Em aberto
            </span>
          </div>
          <Link href="/professor/ganhos" className="text-xs text-green-400 hover:text-green-300 transition-colors flex items-center gap-1">
            Detalhes <ArrowRight size={11} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Ganho parcial</p>
            <p className="text-xl font-bold text-green-400">{formatBRL(ganhoDoMes)}</p>
            <p className="text-[11px] text-gray-700 mt-0.5">{correctedThisMonth} correções</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Projeção</p>
            <p className="text-xl font-bold text-white">
              {projecaoFechamento > 0 ? formatBRL(projecaoFechamento) : '—'}
            </p>
            <p className="text-[11px] text-gray-700 mt-0.5">
              {projectedEssays > 0 ? `~${projectedEssays} correções` : 'poucos dados'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Dias restantes</p>
            <p className="text-xl font-bold text-white">{diasRestantes}</p>
            <p className="text-[11px] text-gray-700 mt-0.5">de {daysInMonth} no ciclo</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Taxa/correção</p>
            <p className="text-xl font-bold text-amber-400">{formatBRL(RATE_ESSAY)}</p>
            <p className="text-[11px] text-gray-700 mt-0.5">vigente</p>
          </div>
        </div>

        {/* Month progress bar */}
        <div className="pt-4 border-t border-white/[0.04]">
          <div className="flex justify-between text-[10px] text-gray-700 mb-1.5">
            <span>Dia {dayOfMonth} de {daysInMonth}</span>
            <span>{progressMes}% do ciclo concluído</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-700 to-green-500 rounded-full transition-all duration-700"
              style={{ width: `${progressMes}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main grid: correction queue + right column ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Correction queue — 2 columns wide */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Fila de correção</h2>
              {queueTotal > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  criticalCount > 0
                    ? 'text-red-400 bg-red-500/10 border-red-500/20'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                }`}>
                  {queueTotal}
                </span>
              )}
            </div>
            <Link href="/professor/redacoes" className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
              Ver todas <ArrowRight size={11} />
            </Link>
          </div>

          {pendingEssays.length === 0 ? (
            <div className="card-dark rounded-2xl p-8 text-center">
              <CheckCircle2 size={22} className="text-green-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white mb-0.5">Fila limpa!</p>
              <p className="text-xs text-gray-500">Nenhuma redação pendente no momento.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingEssays.map(essay => {
                const h = Math.floor(msAgo(essay.submitted_at) / 3_600_000)
                const urgencyLabel = h >= 48
                  ? { badge: 'Crítico', color: 'text-red-400 bg-red-500/10 border-red-500/25' }
                  : h >= 24
                  ? { badge: `${h}h`, color: 'text-amber-400 bg-amber-500/10 border-amber-500/25' }
                  : { badge: h < 1 ? '<1h' : `${h}h`, color: 'text-gray-500 bg-white/[0.04] border-white/[0.06]' }
                const studentName = essay.student?.full_name ?? 'Aluno'
                return (
                  <Link key={essay.id} href={`/professor/redacoes/${essay.id}`}
                    className="card-dark rounded-2xl p-4 flex items-center gap-3 hover:border-amber-500/25 transition-all hover:-translate-y-0.5 group block">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-300 flex-shrink-0">
                      {studentName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{studentName}</p>
                      <p className="text-xs text-gray-600 line-clamp-1">{essay.theme_title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${urgencyLabel.color}`}>
                        {urgencyLabel.badge}
                      </span>
                      <span className="text-xs text-gray-600 hidden sm:block">{relativeDate(essay.submitted_at)}</span>
                      <span className="text-xs font-semibold text-amber-400 border border-amber-500/30 bg-amber-500/10 px-3 py-1 rounded-lg group-hover:bg-amber-500/20 transition-colors whitespace-nowrap">
                        Corrigir →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Right column: insight + month stats + reward system */}
        <div className="space-y-4">

          {/* Insight widget */}
          <div className={`rounded-2xl border p-4 ${insightBg}`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 flex-shrink-0 ${
                pending > 10 ? 'bg-red-500/10' : pending === 0 ? 'bg-green-500/10' : 'bg-amber-500/10'
              }`}>
                {pending === 0
                  ? <CheckCircle2 size={15} className="text-green-400" />
                  : <AlertCircle size={15} className={insightColor} />
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold leading-snug ${insightColor}`}>{insight}</p>
                {criticalCount > 0 && (
                  <p className="text-[11px] text-red-400/70 mt-1">
                    {criticalCount} redaç{criticalCount !== 1 ? 'ões' : 'ão'} aguardando +24h
                  </p>
                )}
                {pending === 0 && (
                  <p className="text-[11px] text-green-400/70 mt-1">Continue assim — excelente ritmo.</p>
                )}
              </div>
            </div>
          </div>

          {/* Month + students stats */}
          <div className="card-dark rounded-2xl p-4">
            <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-3">
              Visão geral
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Este mês</span>
                <span className="text-sm font-bold text-white">{correctedThisMonth} corrigidas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Alunos na plataforma</span>
                <span className="text-sm font-bold text-white">{students}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Média C5 (turma)</span>
                <span className={`text-sm font-bold ${avgC5 >= 120 ? 'text-green-400' : avgC5 >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                  {avgC5 || '—'}/200
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Média geral (turma)</span>
                <span className="text-sm font-bold text-white">{avgScore || '—'}/1000</span>
              </div>
            </div>
          </div>

          {/* Reward system — preview */}
          <div className="card-dark rounded-2xl p-4 relative overflow-hidden">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                  <Trophy size={13} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white leading-none">Recompensas</h3>
                  <p className="text-[10px] text-gray-700 leading-none mt-0.5">Prévia estimada</p>
                </div>
              </div>
              <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full">
                Em breve
              </span>
            </div>

            {/* Level + points */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Nível atual</p>
                <p className={`text-base font-bold leading-none ${currentLevel.color}`}>
                  {currentLevel.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Pontos est.</p>
                <p className="text-base font-bold text-white leading-none">
                  {estimatedPoints}
                  <span className="text-[10px] font-normal text-gray-600 ml-1">pts</span>
                </p>
              </div>
            </div>

            {/* Progress bar */}
            {nextLevel && (
              <>
                <div className="flex justify-between text-[10px] text-gray-600 mb-1.5">
                  <span>{currentLevel.name}</span>
                  <span>{levelPct}% → {nextLevel.name}</span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${currentLevel.bar}`}
                    style={{ width: `${levelPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-700">
                  {nextLevel.pts - estimatedPoints} pts para {nextLevel.name}
                </p>
              </>
            )}

            {/* Level milestones */}
            <div className="mt-3 pt-3 border-t border-white/[0.05] flex justify-between">
              {REWARD_LEVELS.slice(0, 5).map((level) => (
                <div key={level.name} className={`text-center transition-opacity ${estimatedPoints >= level.pts ? 'opacity-100' : 'opacity-25'}`}>
                  <div className={`w-5 h-5 rounded-full mx-auto mb-1 border flex items-center justify-center ${
                    estimatedPoints >= level.pts ? `${level.bar} ${level.ring}` : 'bg-white/[0.04] border-white/[0.08]'
                  }`}>
                    <Star size={8} className={estimatedPoints >= level.pts ? 'text-white' : 'text-gray-700'} />
                  </div>
                  <p className={`text-[8px] font-medium ${estimatedPoints >= level.pts ? level.color : 'text-gray-700'}`}>
                    {level.name.slice(0, 3)}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* ── C5 insight bar ───────────────────────────────────────── */}
      {corrections.length > 0 && (
        <div className="card-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-purple-400" />
            <h2 className="text-sm font-semibold text-white">Desempenho da turma</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Média geral</span>
                <span className="text-xs font-bold text-white">{avgScore}/1000</span>
              </div>
              <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                  style={{ width: `${(avgScore / 1000) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">C5 — Proposta de Intervenção</span>
                <span className="text-xs font-bold text-amber-400">{avgC5}/200</span>
              </div>
              <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(avgC5 / 200) * 100}%` }} />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-4 pt-3 border-t border-white/[0.04]">
            A proposta de intervenção (C5) é o ponto mais crítico — foque em agente, ação, modo e finalidade nos feedbacks.
          </p>
        </div>
      )}

    </div>
  )
}
