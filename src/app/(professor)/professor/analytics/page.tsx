import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata = { title: 'Analytics | Método Revisão' }
export const dynamic = 'force-dynamic'

// ── Types ────────────────────────────────────────────────────────────────────

type EventRow = { event_name: string; created_at: string }
type SubRow = { essays_used: number; essays_limit: number; user_id: string }

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { days?: string }
}) {
  // Auth + admin check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as { role: string }).role !== 'admin') {
    redirect('/professor')
  }

  const days = Math.min(90, Math.max(1, parseInt(searchParams.days ?? '30') || 30))
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  // ── Data fetching ─────────────────────────────────────────────────────────
  const [
    eventsRes,
    usersRes,
    essaysRes,
    correctionsRes,
    subsRes,
    feedbackRes,
    unviewedRes,
  ] = await Promise.all([
    db.from('product_events').select('event_name, created_at').gte('created_at', since),
    db.from('users').select('id', { count: 'exact', head: true }).gte('created_at', since),
    db.from('essays').select('id', { count: 'exact', head: true }).gte('submitted_at', since),
    db.from('corrections').select('id', { count: 'exact', head: true }).gte('corrected_at', since),
    db.from('subscriptions').select('essays_used, essays_limit, user_id').eq('status', 'active'),
    db.from('correction_feedback').select('id', { count: 'exact', head: true }).gte('created_at', since),
    db.from('corrections').select('id', { count: 'exact', head: true }).is('viewed_at', null),
  ])

  // Aggregate events
  const events = (eventsRes.data ?? []) as EventRow[]
  const ec: Record<string, number> = {}
  for (const e of events) ec[e.event_name] = (ec[e.event_name] ?? 0) + 1

  // Subscription analysis
  const subs = (subsRes.data ?? []) as SubRow[]
  const activePaying = subs.length
  const withCredits = subs.filter(s => s.essays_used < s.essays_limit).length
  const exhausted = subs.filter(s => s.essays_used >= s.essays_limit).length

  const newUsers = usersRes.count ?? 0
  const essaysSubmitted = essaysRes.count ?? 0
  const correctionsCompleted = correctionsRes.count ?? 0
  const feedbackCount = feedbackRes.count ?? 0
  const unviewedCorrections = unviewedRes.count ?? 0

  // Funnel rates
  const pct = (n: number | undefined, d: number | undefined) => {
    if (!n || !d || d === 0) return '—'
    return `${Math.round((n / d) * 100)}%`
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-purple-400/70 mb-1.5">
          Analytics
        </p>
        <h1 className="text-2xl font-bold text-white mb-1.5">
          Painel Operacional
        </h1>
        <p className="text-sm text-gray-500">
          Métricas reais dos últimos {days} dias. Dados da tabela product_events + estado do banco.
        </p>
      </div>

      {/* Period selector */}
      <div className="flex gap-2 mb-6">
        {[7, 14, 30, 60, 90].map(d => (
          <a
            key={d}
            href={`/professor/analytics?days=${d}`}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              d === days
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
            }`}
          >
            {d}d
          </a>
        ))}
      </div>

      {/* ── Overview Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Novos usuários" value={newUsers} />
        <MetricCard label="Redações enviadas" value={essaysSubmitted} />
        <MetricCard label="Correções prontas" value={correctionsCompleted} />
        <MetricCard label="Feedbacks" value={feedbackCount} />
      </div>

      {/* ── Subscription Health ─────────────────────────────────────────────── */}
      <SectionTitle>Assinaturas Ativas</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Pagantes ativos" value={activePaying} />
        <MetricCard label="Com correções" value={withCredits} color="text-emerald-400" />
        <MetricCard label="Esgotados" value={exhausted} color="text-amber-400" />
        <MetricCard label="Correções não vistas" value={unviewedCorrections} color="text-red-400" />
      </div>

      {/* ── Funnel Events ──────────────────────────────────────────────────── */}
      <SectionTitle>Eventos de Funil</SectionTitle>
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <EventStat label="account_created" value={ec['account_created']} />
          <EventStat label="first_dashboard_view" value={ec['first_dashboard_view']} />
          <EventStat label="first_essay_submitted" value={ec['first_essay_submitted']} />
          <EventStat label="essay_submitted" value={ec['essay_submitted']} />
          <EventStat label="correction_ready" value={ec['correction_ready']} />
          <EventStat label="correction_viewed" value={ec['correction_viewed']} />
          <EventStat label="first_correction_viewed" value={ec['first_correction_viewed']} />
          <EventStat label="biia_used" value={ec['biia_used']} />
          <EventStat label="upgrade_page_viewed" value={ec['upgrade_page_viewed']} />
          <EventStat label="checkout_started" value={ec['checkout_started']} />
          <EventStat label="purchase_completed" value={ec['purchase_completed']} />
          <EventStat label="credits_exhausted" value={ec['credits_exhausted']} />
          <EventStat label="share_link_generated" value={ec['share_link_generated']} />
          <EventStat label="feedback_submitted" value={ec['feedback_submitted']} />
        </div>
      </div>

      {/* ── Conversion Rates ───────────────────────────────────────────────── */}
      <SectionTitle>Taxas de Conversão</SectionTitle>
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="space-y-3">
          <FunnelRow
            label="Upgrade view → Checkout"
            from={ec['upgrade_page_viewed']}
            to={ec['checkout_started']}
            rate={pct(ec['checkout_started'], ec['upgrade_page_viewed'])}
          />
          <FunnelRow
            label="Checkout → Compra"
            from={ec['checkout_started']}
            to={ec['purchase_completed']}
            rate={pct(ec['purchase_completed'], ec['checkout_started'])}
          />
          <FunnelRow
            label="1ª redação → 1ª correção vista"
            from={ec['first_essay_submitted']}
            to={ec['first_correction_viewed']}
            rate={pct(ec['first_correction_viewed'], ec['first_essay_submitted'])}
          />
          <FunnelRow
            label="Conta criada → 1ª redação"
            from={ec['account_created']}
            to={ec['first_essay_submitted']}
            rate={pct(ec['first_essay_submitted'], ec['account_created'])}
          />
        </div>
      </div>

      {/* ── First Essay Funnel (A5) ────────────────────────────────────────── */}
      <SectionTitle>Funil da Primeira Redação</SectionTitle>
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="flex flex-col gap-0.5">
          <FunnelStep label="Conta criada" count={ec['account_created']} />
          <FunnelArrow />
          <FunnelStep label="Primeiro acesso ao painel" count={ec['first_dashboard_view']} />
          <FunnelArrow />
          <FunnelStep label="Primeira redação enviada" count={ec['first_essay_submitted']} />
          <FunnelArrow />
          <FunnelStep label="Primeira correção vista" count={ec['first_correction_viewed']} />
          <FunnelArrow />
          <FunnelStep
            label="Próxima ação (2ª redação ou upgrade)"
            count={
              ((ec['essay_submitted'] ?? 0) > (ec['first_essay_submitted'] ?? 0))
                ? (ec['essay_submitted'] ?? 0) - (ec['first_essay_submitted'] ?? 0)
                : undefined
            }
            note="redações subsequentes"
          />
        </div>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-gray-700 mt-4">
        Dados baseados em product_events (instrumentação iniciada recentemente) + tabelas do banco.
        Métricas de eventos anteriores à instrumentação não aparecerão aqui.
      </p>
    </div>
  )
}

// ── UI Components ─────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3 px-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 whitespace-nowrap">
        {children}
      </p>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  )
}

function MetricCard({
  label,
  value,
  color = 'text-white',
}: {
  label: string
  value: number
  color?: string
}) {
  return (
    <div className="card-dark rounded-xl p-4">
      <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-extrabold tabular-nums ${color}`}>{value}</p>
    </div>
  )
}

function EventStat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-gray-400 font-mono">{label}</span>
      <span className="text-sm font-bold text-white tabular-nums">{value ?? 0}</span>
    </div>
  )
}

function FunnelRow({
  label,
  from,
  to,
  rate,
}: {
  label: string
  from: number | undefined
  to: number | undefined
  rate: string
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-600 tabular-nums">{from ?? 0} → {to ?? 0}</span>
        <span className={`text-sm font-bold tabular-nums ${rate === '—' ? 'text-gray-600' : 'text-purple-400'}`}>
          {rate}
        </span>
      </div>
    </div>
  )
}

function FunnelStep({
  label,
  count,
  note,
}: {
  label: string
  count: number | undefined
  note?: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.05] px-4 py-2.5">
      <span className="text-xs text-gray-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-white tabular-nums">{count ?? 0}</span>
        {note && <span className="text-[10px] text-gray-600">{note}</span>}
      </div>
    </div>
  )
}

function FunnelArrow() {
  return (
    <div className="flex justify-center py-0.5">
      <svg width="10" height="12" viewBox="0 0 10 12" fill="none" className="text-gray-700">
        <path d="M5 0v8M1 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  )
}
