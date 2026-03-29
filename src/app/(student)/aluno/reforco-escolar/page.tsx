import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Video, CheckCircle2, Clock, XCircle, ExternalLink, BookOpen, Hourglass } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { LessonStatus } from '@/lib/supabase/types'
import BookLessonForm from './BookLessonForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Reforço Escolar | Método Revisão',
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
  status: LessonStatus
  notes: string | null
  professor_id: string
  users: { full_name: string } | null
}

// ── Subject config ────────────────────────────────────────────────────────────

const SUBJECT_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  'Português':  { color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  'Inglês':     { color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
  'Redação':    { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  'Literatura': { color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
}

function SubjectBadge({ subject }: { subject: string | null }) {
  if (!subject) return null
  const cfg = SUBJECT_CONFIG[subject] ?? { color: 'text-gray-400', bg: 'bg-white/[0.05]', border: 'border-white/[0.10]' }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
      <BookOpen size={9} />
      {subject}
    </span>
  )
}

function StatusBadge({ status }: { status: LessonStatus }) {
  if (status === 'completed') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/25 px-2 py-0.5 rounded-full whitespace-nowrap">
      <CheckCircle2 size={9} /> Atendido
    </span>
  )
  if (status === 'scheduled') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/25 px-2 py-0.5 rounded-full whitespace-nowrap">
      <Clock size={9} /> Confirmado
    </span>
  )
  if (status === 'requested') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full whitespace-nowrap">
      <Hourglass size={9} /> Aguardando confirmação
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-white/[0.05] border border-white/[0.10] px-2 py-0.5 rounded-full whitespace-nowrap">
      <XCircle size={9} /> Cancelada
    </span>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function formatBRL(val: number): string {
  return `R$ ${val.toFixed(2).replace('.', ',')}`
}

function isToday(iso: string): boolean {
  const now = new Date()
  const d = new Date(iso + 'T12:00:00')
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ReforcoEscolarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  // Fetch upcoming + recent lessons + active lesson subscription in parallel
  const [
    { data: upcomingRaw },
    { data: historyRaw },
    { data: lessonSubRaw },
  ] = await Promise.all([
    db.from('lesson_sessions')
      .select('id, session_date, session_time, duration_min, subject, topic, meet_link, price_brl, status, notes, professor_id, users!lesson_sessions_professor_id_fkey(full_name)')
      .eq('student_id', user.id)
      .in('status', ['scheduled', 'requested'])
      .gte('session_date', todayStr)
      .order('session_date', { ascending: true })
      .limit(20),
    db.from('lesson_sessions')
      .select('id, session_date, session_time, duration_min, subject, topic, meet_link, price_brl, status, notes, professor_id, users!lesson_sessions_professor_id_fkey(full_name)')
      .eq('student_id', user.id)
      .in('status', ['completed', 'cancelled'])
      .order('session_date', { ascending: false })
      .limit(30),
    db.from('subscriptions')
      .select('id, lessons_used, lessons_limit, plans!inner(name, slug, plan_type)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('plans.plan_type', 'lesson')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const upcoming: LessonRow[] = upcomingRaw ?? []
  const history: LessonRow[]  = historyRaw ?? []
  const nextLesson = upcoming[0] ?? null

  const lessonSub = lessonSubRaw as {
    lessons_used: number; lessons_limit: number
    plans: { name: string; slug: string } | null
  } | null
  const hasCredits    = lessonSub ? (lessonSub.lessons_used < lessonSub.lessons_limit) : false
  const creditsLeft   = lessonSub ? Math.max(0, lessonSub.lessons_limit - lessonSub.lessons_used) : 0
  const completedCount = history.filter(l => l.status === 'completed').length

  return (
    <div className="max-w-4xl space-y-6">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Reforço Escolar</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Aulas individuais de Português, Inglês, Redação e Literatura via Google Meet
          </p>
        </div>
        <BookLessonForm hasCredits={hasCredits} />
      </div>

      {/* ── Credits / Plan card ────────────────────────────────── */}
      {lessonSub ? (
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.04] px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-white">
              {lessonSub.plans?.name ?? 'Plano de aulas'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {creditsLeft} de {lessonSub.lessons_limit} aulas disponíveis neste ciclo
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-24 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-500 transition-all"
                style={{ width: `${Math.round((creditsLeft / Math.max(1, lessonSub.lessons_limit)) * 100)}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-purple-400 tabular-nums">{creditsLeft}/{lessonSub.lessons_limit}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Sem plano de aulas ativo</p>
            <p className="text-xs text-gray-500 mt-0.5">Adquira um plano para solicitar aulas de reforço escolar.</p>
          </div>
          <BookLessonForm hasCredits={false} />
        </div>
      )}

      {/* ── Next lesson hero card ─────────────────────────────── */}
      {nextLesson ? (
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-900/30 to-purple-950/10 px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Próxima aula
            </span>
            {isToday(nextLesson.session_date) && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 ml-2">
                — HOJE
              </span>
            )}
          </div>
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Date block */}
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-purple-700/20 border border-purple-600/30 flex flex-col items-center justify-center">
                <p className="text-lg font-black text-purple-300 leading-none">
                  {formatDate(nextLesson.session_date).split('/')[0]}
                </p>
                <p className="text-[9px] font-bold text-purple-400/70 leading-none mt-1">
                  {formatDate(nextLesson.session_date).split('/')[1]}/{formatDate(nextLesson.session_date).split('/')[2]}
                </p>
                {nextLesson.session_time && (
                  <p className="text-[10px] font-semibold text-purple-300 mt-1">{nextLesson.session_time}</p>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <SubjectBadge subject={nextLesson.subject} />
                  <StatusBadge status={nextLesson.status} />
                  {nextLesson.price_brl != null && (
                    <span className="text-[10px] font-semibold text-green-400">
                      + {formatBRL(nextLesson.price_brl)}
                    </span>
                  )}
                </div>
                <p className="text-base font-bold text-white mb-1 leading-snug">
                  {nextLesson.subject ?? 'Aula'}{nextLesson.topic ? ` — ${nextLesson.topic}` : ''}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-gray-600">
                  <span>com {nextLesson.users?.full_name ?? 'Professor(a)'}</span>
                  <span>·</span>
                  <span>{nextLesson.duration_min ?? 60} min</span>
                  {nextLesson.session_time && (
                    <>
                      <span>·</span>
                      <span>{nextLesson.session_time}</span>
                    </>
                  )}
                </div>
                {nextLesson.notes && (
                  <p className="text-xs text-gray-500 mt-2">{nextLesson.notes}</p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center gap-3 flex-wrap">
              {nextLesson.meet_link ? (
                <a
                  href={nextLesson.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white transition-colors"
                >
                  <Video size={16} />
                  Acessar Aula
                  <ExternalLink size={12} />
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-white/[0.08] text-gray-600 cursor-default">
                  <Clock size={11} />
                  Link será disponibilizado em breve
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card-dark rounded-2xl p-8 text-center">
          <Video size={24} className="text-gray-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400 mb-1">Nenhuma aula agendada</p>
          <p className="text-xs text-gray-600 mb-5 max-w-sm mx-auto leading-relaxed">
            {hasCredits
              ? 'Solicite uma aula agora — a professora confirma o horário e você recebe um e-mail de confirmação com o link do Google Meet.'
              : 'Adquira um plano de aulas para começar a agendar suas aulas de reforço escolar.'}
          </p>
          <BookLessonForm hasCredits={hasCredits} />
        </div>
      )}

      {/* ── Upcoming lessons list ─────────────────────────────── */}
      {upcoming.length > 1 && (
        <div>
          <h2 className="text-sm font-bold text-white mb-3">Agenda de aulas</h2>
          <div className="space-y-2">
            {upcoming.slice(1).map((lesson) => (
              <div key={lesson.id} className="card-dark rounded-2xl px-5 py-4 flex items-center gap-4">
                <div className="shrink-0 text-center w-16">
                  <p className="text-xs font-semibold text-gray-300">{formatDate(lesson.session_date)}</p>
                  {lesson.session_time && (
                    <p className="text-[10px] text-gray-600">{lesson.session_time}</p>
                  )}
                </div>
                <div className="w-px h-8 bg-white/[0.06] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-semibold text-white">{lesson.subject ?? 'Aula'}</p>
                    <SubjectBadge subject={lesson.subject} />
                  </div>
                  <p className="text-[11px] text-gray-600">
                    {lesson.users?.full_name ?? 'Professor(a)'} · {lesson.duration_min ?? 60} min
                    {lesson.price_brl != null && ` · + ${formatBRL(lesson.price_brl)}`}
                  </p>
                </div>
                <StatusBadge status={lesson.status} />
                {lesson.meet_link && (
                  <a
                    href={lesson.meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-green-400 hover:text-green-300 transition-colors"
                  >
                    <Video size={12} />
                    Acessar
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Stats row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-dark rounded-xl p-4">
          <Clock size={14} className="text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white tabular-nums">{upcoming.length}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">Agendadas</p>
        </div>
        <div className="card-dark rounded-xl p-4">
          <CheckCircle2 size={14} className="text-green-400 mb-2" />
          <p className="text-2xl font-bold text-white tabular-nums">{completedCount}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">Aulas atendidas</p>
        </div>
        {/* Subjects breakdown */}
        {Object.entries(
          history.filter(l => l.status === 'completed').reduce<Record<string, number>>((acc, l) => {
            const s = l.subject ?? 'Outro'
            acc[s] = (acc[s] ?? 0) + 1
            return acc
          }, {})
        ).slice(0, 2).map(([subj, count]) => (
          <div key={subj} className="card-dark rounded-xl p-4">
            <BookOpen size={14} className={SUBJECT_CONFIG[subj]?.color ?? 'text-gray-400'} style={{ marginBottom: 8 }} />
            <p className="text-2xl font-bold text-white tabular-nums">{count}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">{subj}</p>
          </div>
        ))}
      </div>

      {/* ── History ───────────────────────────────────────────── */}
      {history.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-white mb-3">Últimas aulas</h2>
          <div className="card-dark rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Data</th>
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Matéria</th>
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Professor(a)</th>
                  <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-20">Valor</th>
                  <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-28">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {history.map(l => (
                  <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-xs text-gray-300">{formatDate(l.session_date)}</p>
                      {l.session_time && <p className="text-[10px] text-gray-700">{l.session_time}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <SubjectBadge subject={l.subject} />
                      {l.topic && <p className="text-[10px] text-gray-600 mt-0.5">{l.topic}</p>}
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <p className="text-xs text-gray-400">{l.users?.full_name ?? '—'}</p>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <p className={`text-xs font-semibold tabular-nums ${l.status === 'completed' ? 'text-green-400' : 'text-gray-700'}`}>
                        {l.status === 'completed' && l.price_brl != null ? `+ ${formatBRL(l.price_brl)}` : '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Subjects we teach ────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { subject: 'Português', desc: 'Gramática, interpretação e produção textual' },
          { subject: 'Inglês', desc: 'Conversação, gramática e vocabulário' },
          { subject: 'Redação', desc: 'ENEM, vestibular e redação escolar' },
          { subject: 'Literatura', desc: 'Análise literária e obras obrigatórias' },
        ].map(item => {
          const cfg = SUBJECT_CONFIG[item.subject]!
          return (
            <div key={item.subject} className="card-dark rounded-2xl px-4 py-3">
              <div className={`w-7 h-7 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center mb-2`}>
                <BookOpen size={13} className={cfg.color} />
              </div>
              <p className="text-[12px] font-semibold text-gray-300 mb-0.5">{item.subject}</p>
              <p className="text-[11px] text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          )
        })}
      </div>

      {/* ── Book lesson CTA ──────────────────────────────────── */}
      <div className="card-dark rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-300 mb-1">
            {hasCredits ? 'Pronto para a próxima aula?' : 'Quer agendar uma aula?'}
          </p>
          <p className="text-xs text-gray-600">
            {hasCredits
              ? 'Solicite uma aula de reforço diretamente aqui. A professora confirmará o horário por e-mail.'
              : 'Adquira um plano de aulas para começar a agendar suas aulas de reforço escolar.'}
          </p>
        </div>
        <BookLessonForm hasCredits={hasCredits} />
      </div>
    </div>
  )
}
