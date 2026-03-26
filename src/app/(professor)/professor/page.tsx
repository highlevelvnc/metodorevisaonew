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
  Lock,
  Zap,
  Star,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

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

export default async function ProfessorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
  ] = await Promise.all([
    db.from('essays').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('essays').select('*', { count: 'exact', head: true }).eq('status', 'in_review'),
    db.from('essays').select('*', { count: 'exact', head: true })
      .eq('status', 'corrected').gte('corrected_at', todayStart),
    db.from('essays').select('*', { count: 'exact', head: true })
      .eq('status', 'corrected').gte('corrected_at', sevenDaysAgo),
    db.from('essays').select('*', { count: 'exact', head: true })
      .eq('status', 'corrected').gte('corrected_at', fourteenDaysAgo).lt('corrected_at', sevenDaysAgo),
    db.from('essays').select('*', { count: 'exact', head: true })
      .eq('status', 'corrected').gte('corrected_at', firstOfMonth),
    db.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    db.from('essays')
      .select('id, theme_title, submitted_at, student:users!essays_student_id_fkey(full_name)')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true })
      .limit(5),
    db.from('corrections').select('total_score, c5_score'),
    db.from('users').select('full_name').eq('id', user.id).single(),
  ])

  const pendingEssays: PendingEssay[] = pendingEssaysRaw ?? []
  const corrections: CorrectionsRow[] = correctionsRaw ?? []
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

  // Dynamic insight
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
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">Olá, {professorName.split(' ')[0]}</h1>
            <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Professor
            </span>
          </div>
          <p className="text-gray-500 text-sm">Acompanhe a fila de correções e o desempenho da turma.</p>
        </div>
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
          <p className="text-xs text-gray-600 mt-0.5">devolutivas enviadas</p>
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

      {/* ── Second row stats (compact, 4 cols) ──────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-dark rounded-xl p-4">
          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Esta semana</p>
          <p className="text-xl font-bold text-white">{correctedThisWeek}</p>
          <p className="text-xs text-gray-600">corrigidas</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Este mês</p>
          <p className="text-xl font-bold text-white">{correctedThisMonth}</p>
          <p className="text-xs text-gray-600">corrigidas</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Média C5</p>
          <p className="text-xl font-bold text-white">{avgC5 || '—'}</p>
          <p className="text-xs text-gray-600">proposta /200</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Alunos ativos</p>
          <p className="text-xl font-bold text-white">{students}</p>
          <p className="text-xs text-gray-600">na plataforma</p>
        </div>
      </div>

      {/* ── Main grid: correction queue + right column ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Correction queue — 2 columns wide */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Fila de correção</h2>
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

        {/* Right column: insight + reward system */}
        <div className="space-y-4">

          {/* Insight widget */}
          <div>
            <h2 className="text-sm font-semibold text-white mb-3">Insight</h2>
            <div className={`rounded-2xl border p-4 ${insightBg}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  pending > 10 ? 'bg-red-500/10' : pending === 0 ? 'bg-green-500/10' : 'bg-amber-500/10'
                }`}>
                  {pending === 0
                    ? <CheckCircle2 size={15} className="text-green-400" />
                    : <AlertCircle size={15} className={insightColor} />
                  }
                </div>
                <p className={`text-sm font-semibold leading-snug ${insightColor}`}>{insight}</p>
              </div>
            </div>
          </div>

          {/* Weekly performance */}
          <div className="card-dark rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Produtividade semanal
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Esta semana</span>
                <span className="text-sm font-bold text-white">{correctedThisWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Semana passada</span>
                <span className="text-sm font-bold text-gray-400">{correctedLastWeek}</span>
              </div>
              {correctedLastWeek > 0 && (
                <div className="pt-1 border-t border-white/[0.04]">
                  <p className={`text-xs font-semibold ${
                    correctedThisWeek >= correctedLastWeek ? 'text-green-400' : 'text-amber-400'
                  }`}>
                    {correctedThisWeek >= correctedLastWeek
                      ? `+${correctedThisWeek - correctedLastWeek} em relação à semana passada`
                      : `${correctedLastWeek - correctedThisWeek} a menos que semana passada`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Reward system — locked / coming soon */}
          <div className="card-dark rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star size={14} className="text-amber-400" />
                <h3 className="text-xs font-semibold text-white">Sistema de Recompensas</h3>
              </div>
              <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full">
                Em breve
              </span>
            </div>

            <div className="space-y-2 opacity-50 select-none">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Pontos acumulados</span>
                <span className="text-gray-400">0 pts</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Ranking</span>
                <span className="text-gray-400">—</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Meta da semana</span>
                <span className="text-gray-400">— / —</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Nível atual</span>
                <span className="text-amber-400/60 font-semibold">Iniciante</span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-[10px] text-gray-700 mb-1">
                  <span>Progresso</span>
                  <span>0%</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-amber-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* Lock overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#070c14]/40 rounded-2xl">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
                  <Lock size={16} className="text-amber-400" />
                </div>
                <span className="text-[10px] text-amber-400/80 font-medium">Em desenvolvimento</span>
              </div>
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
