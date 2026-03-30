import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Video, CheckCircle2, Clock, XCircle, CalendarDays, ExternalLink, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RATE_LESSON, formatBRL } from '@/lib/professor/rates'
import type { LessonStatus } from '@/lib/supabase/types'
import NewLessonForm from './NewLessonForm'
import LessonActions from './LessonActions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Professor — Aulas',
  robots: { index: false, follow: false },
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface LessonRow {
  id: string
  session_date: string
  session_time: string | null
  duration_min: number
  subject: string | null
  topic: string | null
  meet_link: string | null
  price_brl: number | null
  student_name: string | null
  status: LessonStatus
  notes: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatSessionDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function LessonStatusBadge({ status }: { status: LessonStatus }) {
  if (status === 'completed') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/25 px-2 py-0.5 rounded-full whitespace-nowrap">
      <CheckCircle2 size={9} /> Concluída
    </span>
  )
  if (status === 'scheduled') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/25 px-2 py-0.5 rounded-full whitespace-nowrap">
      <Clock size={9} /> Agendada
    </span>
  )
  if (status === 'requested') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full whitespace-nowrap">
      <Clock size={9} /> Solicitada
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-white/[0.05] border border-white/[0.10] px-2 py-0.5 rounded-full whitespace-nowrap">
      <XCircle size={9} /> Cancelada
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProfessorAulasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  const profile = profileRaw as { role: string } | null
  if (!profile || !['admin', 'reviewer'].includes(profile.role)) redirect('/aluno')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const now           = new Date()
  const todayStr      = toDateStr(now)
  const firstOfMonth  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const sixMonthsAgo  = toDateStr(new Date(now.getFullYear(), now.getMonth() - 5, 1))

  // Upcoming scheduled (next 30 days)
  const thirtyAhead = toDateStr(new Date(now.getTime() + 30 * 86_400_000))

  const selectFields = 'id, session_date, session_time, duration_min, subject, topic, meet_link, price_brl, student_name, status, notes'

  const [
    { data: upcomingRaw },
    { data: queueRaw },
    { data: recentRaw },
    { count: completedMonthCount },
    { count: cancelledMonthCount },
    { count: scheduledCount },
    { data: feedbackRaw },
  ] = await Promise.all([
    db.from('lesson_sessions')
      .select(selectFields)
      .eq('professor_id', user.id)
      .in('status', ['scheduled', 'requested'])
      .gte('session_date', todayStr)
      .lte('session_date', thirtyAhead)
      .order('session_date', { ascending: true })
      .limit(20),

    // Unassigned lesson requests from students (visible to all professors)
    db.from('lesson_sessions')
      .select('id, session_date, session_time, duration_min, subject, topic, student_name, status, notes')
      .is('professor_id', null)
      .eq('status', 'requested')
      .gte('session_date', todayStr)
      .order('session_date', { ascending: true })
      .limit(20),

    db.from('lesson_sessions')
      .select(selectFields)
      .eq('professor_id', user.id)
      .gte('session_date', sixMonthsAgo)
      .order('session_date', { ascending: false })
      .limit(60),

    db.from('lesson_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('professor_id', user.id)
      .eq('status', 'completed')
      .gte('session_date', firstOfMonth),

    db.from('lesson_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('professor_id', user.id)
      .eq('status', 'cancelled')
      .gte('session_date', firstOfMonth),

    db.from('lesson_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('professor_id', user.id)
      .in('status', ['scheduled', 'requested'])
      .gte('session_date', todayStr),

    // Feedback from students
    db.from('lesson_feedback')
      .select('id, rating, comment, subject, created_at, student:users!lesson_feedback_student_id_fkey(full_name)')
      .eq('professor_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const upcomingLessons: LessonRow[] = upcomingRaw ?? []
  const queueLessons:    LessonRow[] = queueRaw    ?? []
  const recentLessons:   LessonRow[] = recentRaw   ?? []

  type FeedbackRow = { id: string; rating: number; comment: string | null; subject: string | null; created_at: string; student: { full_name: string } | null }
  const feedback: FeedbackRow[] = (feedbackRaw ?? []) as FeedbackRow[]
  const avgRating = feedback.length > 0 ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : null

  const completedMonth = completedMonthCount ?? 0
  const cancelledMonth = cancelledMonthCount ?? 0
  const scheduled      = scheduledCount ?? 0
  const earningsMonth  = completedMonth * RATE_LESSON

  // Group recent lessons by month for the history section
  const historyByMonth = new Map<string, LessonRow[]>()
  for (const l of recentLessons) {
    const key = l.session_date.slice(0, 7) // "YYYY-MM"
    const arr = historyByMonth.get(key) ?? []
    arr.push(l)
    historyByMonth.set(key, arr)
  }
  const historyMonths = Array.from(historyByMonth.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))

  function monthLabel(key: string) {
    const [y, m] = key.split('-')
    const d = new Date(parseInt(y), parseInt(m) - 1, 1)
    const raw = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  }

  return (
    <div className="max-w-4xl space-y-6">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Aulas</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestão de sessões · {formatBRL(RATE_LESSON)} por sessão de 30 min</p>
        </div>
      </div>

      {/* ── New lesson form ───────────────────────────────────── */}
      <NewLessonForm professorId={user.id} />

      {/* ── Summary cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-dark rounded-xl p-4">
          <CalendarDays size={14} className="text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white tabular-nums">{scheduled}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">Agendadas</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <CheckCircle2 size={14} className="text-green-400 mb-2" />
          <p className="text-2xl font-bold text-white tabular-nums">{completedMonth}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">Concluídas este mês</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <XCircle size={14} className="text-gray-600 mb-2" />
          <p className="text-2xl font-bold text-gray-700 tabular-nums">{cancelledMonth}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">Canceladas este mês</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <Video size={14} className="text-amber-400 mb-2" />
          <p className="text-xl font-bold text-amber-400 tabular-nums">{formatBRL(earningsMonth)}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">Ganhos de aulas (mês)</p>
        </div>
      </div>

      {/* ── Queue: unassigned student requests ─────────────────── */}
      {queueLessons.length > 0 && (
        <div className="card-dark rounded-2xl overflow-hidden border border-amber-500/20">
          <div className="px-5 py-4 border-b border-amber-500/10 bg-amber-500/[0.04]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-sm font-semibold text-white">Fila de Solicitações</h2>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">{queueLessons.length}</span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">Aulas solicitadas por alunos aguardando confirmação</p>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {queueLessons.map(l => (
              <div key={l.id} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="shrink-0 text-center w-16">
                  <p className="text-xs font-semibold text-gray-300">{formatSessionDate(l.session_date)}</p>
                  {l.session_time && <p className="text-[10px] text-gray-600">{l.session_time}</p>}
                </div>
                <div className="w-px h-8 bg-white/[0.06] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-semibold text-white">{l.student_name ?? 'Aluno'}</p>
                    {l.subject && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">{l.subject}</span>
                    )}
                  </div>
                  {l.notes && <p className="text-[11px] text-gray-600 truncate max-w-[300px]">{l.notes}</p>}
                </div>
                <LessonActions lessonId={l.id} status={l.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Upcoming sessions ─────────────────────────────────── */}
      {upcomingLessons.length > 0 && (
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Próximas aulas</h2>
            <p className="text-xs text-gray-600 mt-0.5">Sessões agendadas para os próximos 30 dias</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Data</th>
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Matéria / Aluno</th>
                <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-20">Duração</th>
                <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-16">Meet</th>
                <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-28">Status</th>
                <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-36">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {upcomingLessons.map(l => (
                <tr key={l.id} className={`hover:bg-white/[0.02] transition-colors ${l.status === 'requested' ? 'bg-amber-500/[0.03]' : ''}`}>
                  <td className="px-5 py-3.5">
                    <p className="text-xs font-semibold text-gray-200">{formatSessionDate(l.session_date)}</p>
                    {l.session_time && <p className="text-[10px] text-gray-600">{l.session_time}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {l.subject && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">{l.subject}</span>
                      )}
                      <p className="text-xs text-gray-400">{l.student_name ?? l.topic ?? '—'}</p>
                    </div>
                    {l.notes && <p className="text-[10px] text-gray-700 mt-0.5 truncate max-w-[240px]">{l.notes}</p>}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 text-center tabular-nums">{l.duration_min} min</td>
                  <td className="px-4 py-3.5 text-center">
                    {l.meet_link ? (
                      <a href={l.meet_link} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="text-gray-700">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <LessonStatusBadge status={l.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <LessonActions lessonId={l.id} status={l.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── History by month ──────────────────────────────────── */}
      <div className="space-y-4">
        {historyMonths.map(([monthKey, monthLessons]) => {
          const completed  = monthLessons.filter(l => l.status === 'completed')
          const cancelled  = monthLessons.filter(l => l.status === 'cancelled')
          const earnings   = completed.length * RATE_LESSON

          return (
            <div key={monthKey} className="card-dark rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">{monthLabel(monthKey)}</h2>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    {completed.length} concluída{completed.length !== 1 ? 's' : ''}
                    {cancelled.length > 0 && ` · ${cancelled.length} cancelada${cancelled.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <p className="text-sm font-bold text-amber-400 tabular-nums">{formatBRL(earnings)}</p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="text-left px-5 py-2 text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Data</th>
                    <th className="text-left px-5 py-2 text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Tópico</th>
                    <th className="text-center px-4 py-2 text-[10px] font-semibold text-gray-700 uppercase tracking-wider w-20">Duração</th>
                    <th className="text-right px-5 py-2 text-[10px] font-semibold text-gray-700 uppercase tracking-wider w-24">Valor</th>
                    <th className="text-right px-5 py-2 text-[10px] font-semibold text-gray-700 uppercase tracking-wider w-28">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {monthLessons.map(l => (
                    <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-xs text-gray-400">{formatSessionDate(l.session_date)}</td>
                      <td className="px-5 py-3 text-xs text-gray-400">{l.topic ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 text-center tabular-nums">{l.duration_min} min</td>
                      <td className={`px-5 py-3 text-xs font-semibold text-right tabular-nums ${l.status === 'completed' ? 'text-amber-400' : 'text-gray-700'}`}>
                        {l.status === 'completed' ? formatBRL(RATE_LESSON) : '—'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <LessonStatusBadge status={l.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}

        {historyMonths.length === 0 && (
          <div className="card-dark rounded-2xl p-10 text-center">
            <Video size={20} className="text-gray-700 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">Nenhuma aula registrada ainda</p>
            <p className="text-xs text-gray-700 mt-1 max-w-xs mx-auto leading-relaxed">
              As sessões aparecerão aqui assim que forem registradas no sistema.
            </p>
          </div>
        )}
      </div>

      {/* ── Feedback / Avaliações ─────────────────────────────── */}
      {feedback.length > 0 && (
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Avaliações dos alunos</h2>
              <p className="text-xs text-gray-600 mt-0.5">Últimas {feedback.length} avaliações recebidas</p>
            </div>
            {avgRating && (
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-400">★</span>
                <span className="text-sm font-bold text-white tabular-nums">{avgRating}</span>
                <span className="text-[10px] text-gray-600">média</span>
              </div>
            )}
          </div>
          <div className="divide-y divide-white/[0.04]">
            {feedback.map(f => (
              <div key={f.id} className="px-5 py-3.5 flex items-start gap-3">
                <div className="flex gap-0.5 mt-0.5 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map(s => (
                    <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= f.rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className={s <= f.rating ? 'text-yellow-400' : 'text-gray-700'}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-gray-300">{f.student?.full_name ?? 'Aluno'}</span>
                    {f.subject && (
                      <span className="text-[10px] text-gray-600">{f.subject}</span>
                    )}
                  </div>
                  {f.comment && (
                    <p className="text-xs text-gray-500 leading-relaxed">{f.comment}</p>
                  )}
                </div>
                <span className="text-[10px] text-gray-700 flex-shrink-0">
                  {new Date(f.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
