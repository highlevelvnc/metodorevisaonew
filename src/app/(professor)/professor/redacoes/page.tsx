import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertCircle, Clock, CheckCircle2, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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
  if (h >= 48) return { label: `${h}h aguardando`, color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/25',     icon: '🔴' }
  if (h >= 24) return { label: `${h}h aguardando`, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25', icon: '⚠️' }
  return             { label: h < 1 ? 'há menos de 1h' : `${h}h aguardando`, color: 'text-gray-500', bg: 'bg-white/[0.04] border-white/[0.06]', icon: '⏳' }
}

const PLAN_COLOR: Record<string, string> = {
  'Evolução':   'text-gray-400 bg-white/[0.04] border-white/[0.08]',
  'Estratégia': 'text-purple-400 bg-purple-600/10 border-purple-500/25',
  'Intensivo':  'text-amber-400 bg-amber-500/10 border-amber-500/25',
}

const TAB_OPTIONS = ['all', 'pending', 'review', 'corrected'] as const
type TabOption = typeof TAB_OPTIONS[number]

function tabLabel(tab: TabOption): string {
  if (tab === 'all') return 'Todas'
  if (tab === 'pending') return 'Pendentes'
  if (tab === 'review') return 'Em Revisão'
  return 'Corrigidas'
}

export default async function ProfessorRedacoesPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
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

  const activeTab: TabOption = TAB_OPTIONS.includes(searchParams.tab as TabOption)
    ? (searchParams.tab as TabOption)
    : 'all'

  // Sort: pending/review oldest first, corrected newest first
  const allPending   = essays.filter(e => e.status === 'pending').sort(
    (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
  )
  const allReview    = essays.filter(e => e.status === 'in_review').sort(
    (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
  )
  const allCorrected = essays.filter(e => e.status === 'corrected')

  const showPending   = activeTab === 'all' || activeTab === 'pending'
  const showReview    = activeTab === 'all' || activeTab === 'review'
  const showCorrected = activeTab === 'all' || activeTab === 'corrected'

  const pending   = showPending   ? allPending   : []
  const review    = showReview    ? allReview    : []
  const corrected = showCorrected ? allCorrected : []

  const oldestPendingId = allPending[0]?.id ?? allReview[0]?.id

  function EssayRow({ essay, variant }: { essay: ProfessorEssay; variant: 'pending' | 'review' | 'corrected' }) {
    const studentName = essay.student?.full_name ?? 'Aluno'
    const planName    = essay.student?.subscriptions?.[0]?.plans?.name ?? 'Trial'
    const urgency     = urgencyConfig(essay.submitted_at, essay.status)

    return (
      <div className={`card-dark rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${variant === 'corrected' ? 'opacity-75' : ''}`}>
        {/* Avatar + aluno */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 ${
            variant === 'corrected' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
            variant === 'review'    ? 'bg-blue-500/15 border border-blue-500/20 text-blue-300'   :
                                      'bg-amber-500/10 border border-amber-500/20 text-amber-300'
          }`}>
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-sm font-semibold ${variant === 'corrected' ? 'text-gray-300' : 'text-white'}`}>
                {studentName}
              </p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PLAN_COLOR[planName] ?? PLAN_COLOR['Evolução']}`}>
                {planName}
              </span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{essay.theme_title}</p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap">
          {urgency && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${urgency.bg} ${urgency.color}`}>
              {urgency.icon} {urgency.label}
            </span>
          )}
          {variant === 'corrected' && essay.corrections[0] && (
            <span className="text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
              {essay.corrections[0].total_score}/1000
            </span>
          )}
          <span className="text-xs text-gray-600">{relativeDate(essay.submitted_at)}</span>
        </div>

        {/* CTA */}
        {variant === 'pending' && (
          <Link href={`/professor/redacoes/${essay.id}`}
            className="btn-primary text-xs py-2 px-4 flex-shrink-0 self-start sm:self-auto whitespace-nowrap">
            Corrigir →
          </Link>
        )}
        {variant === 'review' && (
          <Link href={`/professor/redacoes/${essay.id}`}
            className="text-xs text-blue-400 hover:text-blue-300 border border-blue-500/25 bg-blue-500/10 px-4 py-2 rounded-xl font-medium transition-colors flex-shrink-0 self-start sm:self-auto whitespace-nowrap">
            Continuar →
          </Link>
        )}
        {variant === 'corrected' && (
          <Link href={`/professor/redacoes/${essay.id}`}
            className="text-xs text-gray-500 hover:text-gray-300 border border-white/[0.06] bg-white/[0.03] px-4 py-2 rounded-xl font-medium transition-colors flex-shrink-0 self-start sm:self-auto whitespace-nowrap">
            Ver →
          </Link>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-0.5">Redações</h1>
          <p className="text-gray-500 text-sm">
            {essays.length} total · {allPending.length + allReview.length} aguardando
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {allPending.length > 0 && (
            <div className="flex items-center gap-2 text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-2">
              <AlertCircle size={15} />
              {allPending.length} pendente{allPending.length !== 1 ? 's' : ''}
            </div>
          )}
          {oldestPendingId && (
            <Link
              href={`/professor/redacoes/${oldestPendingId}`}
              className="btn-primary text-sm py-2 px-4 whitespace-nowrap"
            >
              Corrigir próxima →
            </Link>
          )}
        </div>
      </div>

      {/* ── Stats summary pills ─────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
          <Clock size={12} />
          {allPending.length} pendente{allPending.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          {allReview.length} em revisão
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
          <CheckCircle2 size={12} />
          {allCorrected.length} corrigida{allCorrected.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── Filter tabs ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-6 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit flex-wrap">
        {TAB_OPTIONS.map(tab => (
          <Link
            key={tab}
            href={tab === 'all' ? '/professor/redacoes' : `/professor/redacoes?tab=${tab}`}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            {tabLabel(tab)}
            {tab === 'pending' && allPending.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-amber-500/20 text-amber-400 rounded-full px-1.5 py-0.5">
                {allPending.length}
              </span>
            )}
            {tab === 'review' && allReview.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-blue-500/20 text-blue-400 rounded-full px-1.5 py-0.5">
                {allReview.length}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* ── Aguardando correção ─────────────────────────────────── */}
      {showPending && pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock size={13} className="text-amber-400" /> Aguardando correção ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map(essay => <EssayRow key={essay.id} essay={essay} variant="pending" />)}
          </div>
        </section>
      )}

      {/* ── Em revisão ─────────────────────────────────────────── */}
      {showReview && review.length > 0 && (
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
      {showCorrected && corrected.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 size={13} className="text-green-400" /> Corrigidas ({corrected.length})
          </h2>
          <div className="space-y-2">
            {corrected.map(essay => <EssayRow key={essay.id} essay={essay} variant="corrected" />)}
          </div>
        </section>
      )}

      {/* ── Empty states per filter ─────────────────────────────── */}
      {activeTab === 'pending' && allPending.length === 0 && (
        <div className="card-dark rounded-2xl p-12 text-center">
          <CheckCircle2 size={28} className="text-green-400 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Nenhuma pendente!</p>
          <p className="text-gray-600 text-sm">Todas as redações foram atendidas.</p>
        </div>
      )}
      {activeTab === 'review' && allReview.length === 0 && (
        <div className="card-dark rounded-2xl p-12 text-center">
          <FileText size={28} className="text-gray-600 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Nenhuma em revisão</p>
          <p className="text-gray-600 text-sm">Não há rascunhos em andamento.</p>
        </div>
      )}
      {activeTab === 'corrected' && allCorrected.length === 0 && (
        <div className="card-dark rounded-2xl p-12 text-center">
          <FileText size={28} className="text-gray-600 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Nenhuma corrigida</p>
          <p className="text-gray-600 text-sm">As devolutivas enviadas aparecerão aqui.</p>
        </div>
      )}

      {/* ── Global empty state ─────────────────────────────────── */}
      {essays.length === 0 && (
        <div className="card-dark rounded-2xl p-12 text-center">
          <CheckCircle2 size={28} className="text-green-400 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Tudo em dia!</p>
          <p className="text-gray-600 text-sm">Nenhuma redação na plataforma ainda.</p>
        </div>
      )}
    </div>
  )
}
