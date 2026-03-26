import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Professor — Redações',
  robots: { index: false, follow: false },
}

type EssayStatus = 'pending' | 'in_review' | 'corrected'

type ProfessorEssay = {
  id: string
  theme_title: string
  status: EssayStatus
  submitted_at: string
  student: {
    full_name: string
    email: string
    subscriptions: { plans: { name: string } | null }[]
  } | null
  corrections: { total_score: number }[]
}

function msAgo(iso: string) { return Date.now() - new Date(iso).getTime() }

function relativeDate(iso: string) {
  const h = Math.floor(msAgo(iso) / 3_600_000)
  if (h < 1) return 'há menos de 1h'
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  return `há ${d} dia${d !== 1 ? 's' : ''}`
}

function urgencyConfig(iso: string, status: EssayStatus) {
  if (status === 'corrected') return null
  const h = Math.floor(msAgo(iso) / 3_600_000)
  if (h >= 48) return { label: `${h}h aguardando`,         color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/25',     icon: '🔴' }
  if (h >= 24) return { label: `${h}h aguardando`,         color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25', icon: '⚠️' }
  return             { label: h < 1 ? 'há menos de 1h' : `${h}h aguardando`, color: 'text-gray-500', bg: 'bg-white/[0.04] border-white/[0.06]', icon: '⏳' }
}

const PLAN_COLOR: Record<string, string> = {
  'Evolução':   'text-gray-400 bg-white/[0.04] border-white/[0.08]',
  'Estratégia': 'text-purple-400 bg-purple-600/10 border-purple-500/25',
  'Intensivo':  'text-amber-400 bg-amber-500/10 border-amber-500/25',
}

export default async function ProfessorRedacoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Belt-and-suspenders role check (middleware is primary guard)
  const { data: profileRaw } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  const profile = profileRaw as { role: string } | null
  if (!profile || !['admin', 'reviewer'].includes(profile.role)) redirect('/aluno')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: essaysRaw } = await (supabase as any)
    .from('essays')
    .select(`
      id, theme_title, status, submitted_at,
      student:users!essays_student_id_fkey(full_name, email, subscriptions(plans(name))),
      corrections(total_score)
    `)
    .order('submitted_at', { ascending: false })
    .limit(300)

  const essays: ProfessorEssay[] = essaysRaw ?? []

  const pending   = essays.filter(e => e.status === 'pending')
  const review    = essays.filter(e => e.status === 'in_review')
  const corrected = essays.filter(e => e.status === 'corrected')

  function EssayRow({ essay, variant }: { essay: ProfessorEssay; variant: 'pending' | 'review' | 'corrected' }) {
    const studentName = essay.student?.full_name ?? 'Aluno'
    const planName    = essay.student?.subscriptions?.[0]?.plans?.name ?? 'Trial'
    const urgency     = urgencyConfig(essay.submitted_at, essay.status)

    return (
      <div className={`card-dark rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${variant === 'corrected' ? 'opacity-70' : ''}`}>
        {/* Aluno */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            variant === 'corrected' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
            variant === 'review'    ? 'bg-blue-500/15 border border-blue-500/20 text-blue-300'   :
                                      'bg-purple-600/15 border border-purple-500/20 text-purple-300'
          }`}>
            {studentName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-medium ${variant === 'corrected' ? 'text-gray-300' : 'text-white'}`}>
              {studentName}
            </p>
            <p className="text-xs text-gray-600 line-clamp-1">{essay.theme_title}</p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${PLAN_COLOR[planName] ?? PLAN_COLOR['Evolução']}`}>
            {planName}
          </span>
          {urgency && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${urgency.bg} ${urgency.color}`}>
              {urgency.icon} {urgency.label}
            </span>
          )}
          {variant === 'corrected' && essay.corrections[0] && (
            <span className="text-xs font-bold text-green-400">
              {essay.corrections[0].total_score}/1000
            </span>
          )}
          <span className="text-xs text-gray-600">{relativeDate(essay.submitted_at)}</span>
        </div>

        {/* CTA */}
        {variant === 'pending' && (
          <Link href={`/professor/redacoes/${essay.id}`}
            className="btn-primary text-xs py-2 px-4 flex-shrink-0 self-start sm:self-auto">
            Corrigir →
          </Link>
        )}
        {variant === 'review' && (
          <Link href={`/professor/redacoes/${essay.id}`}
            className="text-xs text-blue-400 hover:text-blue-300 border border-blue-500/25 bg-blue-500/10 px-4 py-2 rounded-xl font-medium transition-colors flex-shrink-0 self-start sm:self-auto">
            Continuar →
          </Link>
        )}
        {variant === 'corrected' && (
          <Link href={`/professor/redacoes/${essay.id}`}
            className="text-xs text-gray-600 hover:text-gray-400 border border-white/[0.06] bg-white/[0.03] px-4 py-2 rounded-xl font-medium transition-colors flex-shrink-0 self-start sm:self-auto">
            Ver
          </Link>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-0.5">Redações</h1>
          <p className="text-gray-500 text-sm">
            {essays.length} total · {pending.length + review.length} aguardando
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pending.length > 0 && (
            <div className="flex items-center gap-2 text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-2">
              <AlertCircle size={15} />
              {pending.length} pendente{pending.length !== 1 ? 's' : ''}
            </div>
          )}
          {(pending.length > 0 || review.length > 0) && (
            <Link
              href={`/professor/redacoes/${pending[0]?.id ?? review[0]?.id}`}
              className="btn-primary text-sm py-2 px-4"
            >
              Corrigir próxima →
            </Link>
          )}
        </div>
      </div>

      {/* ── Aguardando correção ─────────────────────────────────── */}
      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock size={13} /> Aguardando correção ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map(essay => <EssayRow key={essay.id} essay={essay} variant="pending" />)}
          </div>
        </section>
      )}

      {/* ── Em revisão ─────────────────────────────────────────── */}
      {review.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Em revisão ({review.length})
          </h2>
          <div className="space-y-2">
            {review.map(essay => <EssayRow key={essay.id} essay={essay} variant="review" />)}
          </div>
        </section>
      )}

      {/* ── Corrigidas ─────────────────────────────────────────── */}
      {corrected.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 size={13} className="text-green-400" /> Corrigidas ({corrected.length})
          </h2>
          <div className="space-y-2">
            {corrected.map(essay => <EssayRow key={essay.id} essay={essay} variant="corrected" />)}
          </div>
        </section>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {essays.length === 0 && (
        <div className="card-dark rounded-2xl p-12 text-center">
          <CheckCircle2 size={28} className="text-green-400 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Tudo em dia!</p>
          <p className="text-gray-600 text-sm">Nenhuma redação aguardando correção.</p>
        </div>
      )}
    </div>
  )
}
