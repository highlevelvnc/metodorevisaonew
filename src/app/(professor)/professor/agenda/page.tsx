import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CalendarDays, BookOpen, FileText, AlertTriangle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { LessonStatus } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Professor — Agenda',
  robots: { index: false, follow: false },
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface LessonRow {
  id: string
  session_date: string
  duration_min: number
  topic: string | null
  status: LessonStatus
  student_id: string | null
}

interface PendingEssayRow {
  id: string
  theme_title: string
  submitted_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function ptDayLabel(iso: string, today: string) {
  if (iso === today) return 'Hoje'
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function hoursAgo(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3_600_000
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProfessorAgendaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  const profile = profileRaw as { role: string } | null
  if (!profile || !['admin', 'reviewer'].includes(profile.role)) redirect('/aluno')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const now            = new Date()
  const todayStr       = toDateStr(now)
  const todayISO       = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const sevenDaysAgo   = new Date(now.getTime() - 7  * 86_400_000).toISOString()
  const thirtyDaysAgo  = new Date(now.getTime() - 30 * 86_400_000).toISOString()
  const fourteenAhead  = toDateStr(new Date(now.getTime() + 14 * 86_400_000))

  // Seven-day-ago date string for lesson_sessions (date field, not timestamptz)
  const sevenDaysAgoStr    = toDateStr(new Date(now.getTime() - 7  * 86_400_000))
  const twentyEightAgoStr  = toDateStr(new Date(now.getTime() - 28 * 86_400_000))

  const [
    { count: correctedTodayCount },
    { count: correctedWeekCount },
    { data: lessonsRaw },
    { data: correctionsRaw },
    { data: pendingEssaysRaw },
  ] = await Promise.all([
    supabase.from('corrections')
      .select('*', { count: 'exact', head: true })
      .eq('reviewer_id', user.id)
      .gte('corrected_at', todayISO),

    supabase.from('corrections')
      .select('*', { count: 'exact', head: true })
      .eq('reviewer_id', user.id)
      .gte('corrected_at', sevenDaysAgo),

    // lessons: past 28 days + next 14 days
    db.from('lesson_sessions')
      .select('id, session_date, duration_min, topic, status, student_id')
      .eq('professor_id', user.id)
      .gte('session_date', twentyEightAgoStr)
      .lte('session_date', fourteenAhead)
      .order('session_date', { ascending: true }),

    // corrections in past 30 days for activity grid
    supabase.from('corrections')
      .select('corrected_at')
      .eq('reviewer_id', user.id)
      .gte('corrected_at', thirtyDaysAgo)
      .order('corrected_at', { ascending: false }),

    // oldest pending essays (urgency list)
    db.from('essays')
      .select('id, theme_title, submitted_at')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true })
      .limit(10),
  ])

  const lessons:       LessonRow[]        = lessonsRaw ?? []
  const corrections:   { corrected_at: string }[] = correctionsRaw ?? []
  const pendingEssays: PendingEssayRow[]   = pendingEssaysRaw ?? []

  // ── Build activity map ────────────────────────────────────────────────────

  // Map: dateStr -> { corrections: number; lessons: number }
  const activityMap = new Map<string, { corrections: number; lessons: number }>()

  for (const c of corrections) {
    const d = c.corrected_at.slice(0, 10)
    const existing = activityMap.get(d) ?? { corrections: 0, lessons: 0 }
    activityMap.set(d, { ...existing, corrections: existing.corrections + 1 })
  }
  for (const l of lessons) {
    if (l.status === 'completed') {
      const existing = activityMap.get(l.session_date) ?? { corrections: 0, lessons: 0 }
      activityMap.set(l.session_date, { ...existing, lessons: existing.lessons + 1 })
    }
  }

  // ── Build 28-day grid (4 weeks) ───────────────────────────────────────────
  // Start from the most recent Monday, go back 28 days
  const gridDays: string[] = []
  for (let i = 27; i >= 0; i--) {
    gridDays.push(toDateStr(new Date(now.getTime() - i * 86_400_000)))
  }

  // ── Split lessons ─────────────────────────────────────────────────────────
  const upcomingLessons = lessons.filter(l =>
    l.session_date >= todayStr && l.status === 'scheduled'
  )
  const todayLessons = lessons.filter(l =>
    l.session_date === todayStr && l.status !== 'cancelled'
  )
  const weekLessons  = lessons.filter(l =>
    l.session_date >= toDateStr(new Date(now.getTime() - 7 * 86_400_000)) &&
    l.session_date <= todayStr &&
    l.status === 'completed'
  )

  // ── Urgency: essays submitted > 24h ago ───────────────────────────────────
  const urgentEssays = pendingEssays.filter(e => hoursAgo(e.submitted_at) > 24)

  const correctedToday = correctedTodayCount ?? 0
  const correctedWeek  = correctedWeekCount  ?? 0

  return (
    <div className="max-w-4xl space-y-6">

      {/* ── Header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Agenda</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Calendário de atividade · {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── Summary cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Aulas hoje',           value: todayLessons.length, icon: BookOpen,  color: 'text-purple-400' },
          { label: 'Aulas esta semana',     value: weekLessons.length,  icon: CalendarDays, color: 'text-blue-400'   },
          { label: 'Correções hoje',        value: correctedToday,      icon: FileText,  color: 'text-amber-400'  },
          { label: 'Correções esta semana', value: correctedWeek,       icon: FileText,  color: 'text-green-400'  },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card-dark rounded-xl p-4">
            <Icon size={14} className={`${color} mb-2`} />
            <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
            <p className="text-[10px] text-gray-600 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Activity grid (28 days) ────────────────────────────── */}
      <div className="card-dark rounded-2xl p-5">
        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-4">
          Atividade — últimos 28 dias
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="text-[9px] text-gray-700 font-semibold text-center pb-1">{d}</div>
          ))}
          {/* Offset: get day-of-week of first grid day */}
          {(() => {
            const firstDay = new Date(gridDays[0] + 'T12:00:00').getDay()
            // Sunday=0, Monday=1... convert to Mon-first: (day + 6) % 7
            const offset = (firstDay + 6) % 7
            return Array.from({ length: offset }, (_, i) => (
              <div key={`pad-${i}`} />
            ))
          })()}
          {gridDays.map(day => {
            const activity = activityMap.get(day)
            const corrections = activity?.corrections ?? 0
            const lessons    = activity?.lessons     ?? 0
            const isToday    = day === todayStr
            const total      = corrections + lessons * 2 // weight lessons higher for intensity
            const intensity  =
              total === 0 ? '' :
              total <= 2  ? 'bg-amber-500/20' :
              total <= 5  ? 'bg-amber-500/40' :
              total <= 10 ? 'bg-amber-500/60' :
                            'bg-amber-500/80'

            return (
              <div
                key={day}
                title={`${day}: ${corrections} correções, ${lessons} aulas`}
                className={`
                  aspect-square rounded-md flex flex-col items-center justify-center gap-0.5
                  border transition-colors text-center
                  ${isToday
                    ? 'border-amber-500/50 ring-1 ring-amber-500/30'
                    : 'border-white/[0.05] hover:border-white/[0.12]'}
                  ${intensity || 'bg-white/[0.02]'}
                `}
              >
                <span className={`text-[8px] font-bold tabular-nums ${corrections > 0 ? 'text-amber-300' : 'text-gray-700'}`}>
                  {corrections > 0 ? corrections : ''}
                </span>
                {lessons > 0 && (
                  <span className="text-[7px] text-purple-400 font-bold">{lessons}a</span>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500/50" />
            <span className="text-[10px] text-gray-600">Correções</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-purple-400 font-bold text-xs">Xa</span>
            <span className="text-[10px] text-gray-600">Aulas</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-3 h-3 rounded-sm border border-amber-500/50 ring-1 ring-amber-500/30" />
            <span className="text-[10px] text-gray-600">Hoje</span>
          </div>
        </div>
      </div>

      {/* ── Two-column lower section ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Upcoming lessons */}
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <CalendarDays size={14} className="text-blue-400" />
              Próximas aulas
            </h2>
          </div>
          {upcomingLessons.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-xs text-gray-600">Nenhuma aula agendada</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {upcomingLessons.slice(0, 8).map(l => (
                <li key={l.id} className="px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-200">
                        {ptDayLabel(l.session_date, todayStr)}
                      </p>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        {l.topic ?? 'Sem tópico'} · {l.duration_min} min
                      </p>
                    </div>
                    <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full shrink-0">
                      Agendada
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Urgent corrections */}
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" />
              Correções pendentes
              {urgentEssays.length > 0 && (
                <span className="ml-auto text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                  {urgentEssays.length} urgente{urgentEssays.length !== 1 ? 's' : ''}
                </span>
              )}
            </h2>
          </div>
          {pendingEssays.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-xs text-gray-600">Fila vazia — nenhuma redação pendente</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {pendingEssays.slice(0, 8).map(e => {
                const hours = Math.floor(hoursAgo(e.submitted_at))
                const isUrgent = hours > 24
                return (
                  <li key={e.id} className="px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-200 truncate">
                          {e.theme_title}
                        </p>
                        <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${isUrgent ? 'text-red-400' : 'text-gray-600'}`}>
                          <Clock size={9} />
                          {hours < 1 ? 'há menos de 1h' : `há ${hours}h`}
                        </p>
                      </div>
                      {isUrgent && (
                        <AlertTriangle size={12} className="text-red-400 shrink-0 mt-0.5" />
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
