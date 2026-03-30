import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata = { title: 'Analytics | Método Revisão' }
export const dynamic = 'force-dynamic'

// ── Types ────────────────────────────────────────────────────────────────────

type EventRow = { event_name: string; user_id: string | null; metadata: Record<string, unknown> | null }
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
    db.from('product_events').select('event_name, user_id, metadata').gte('created_at', since),
    db.from('users').select('id', { count: 'exact', head: true }).gte('created_at', since),
    db.from('essays').select('id', { count: 'exact', head: true }).gte('submitted_at', since),
    db.from('corrections').select('id', { count: 'exact', head: true }).gte('corrected_at', since),
    db.from('subscriptions').select('essays_used, essays_limit, user_id').eq('status', 'active'),
    db.from('correction_feedback').select('id', { count: 'exact', head: true }).gte('created_at', since),
    db.from('corrections').select('id', { count: 'exact', head: true }).is('viewed_at', null),
  ])

  // Aggregate events: total count + unique users
  const events = (eventsRes.data ?? []) as EventRow[]
  const ec: Record<string, number> = {}
  const eu: Record<string, Set<string>> = {} // unique users per event
  for (const e of events) {
    ec[e.event_name] = (ec[e.event_name] ?? 0) + 1
    if (e.user_id) {
      if (!eu[e.event_name]) eu[e.event_name] = new Set()
      eu[e.event_name].add(e.user_id)
    }
  }
  const uniqueCount = (name: string) => eu[name]?.size ?? 0

  // Reforço plan breakdown: count purchases per plan_slug
  const reforcoPlanCounts: Record<string, number> = {}
  const reforcoPurchaseUsers = new Set<string>()
  const reforcoRequestUsers = new Set<string>()
  for (const e of events) {
    if (e.event_name === 'reforco_purchase_completed' && e.metadata) {
      const slug = (e.metadata as Record<string, string>).plan_slug ?? 'unknown'
      reforcoPlanCounts[slug] = (reforcoPlanCounts[slug] ?? 0) + 1
      if (e.user_id) reforcoPurchaseUsers.add(e.user_id)
    }
    if (e.event_name === 'lesson_requested' && e.user_id) {
      reforcoRequestUsers.add(e.user_id)
    }
  }
  const reforcoActivationRate = reforcoPurchaseUsers.size > 0
    ? Math.round((reforcoRequestUsers.size / reforcoPurchaseUsers.size) * 100)
    : 0

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

  const pct = (n: number | undefined, d: number | undefined) => {
    if (!n || !d || d === 0) return '—'
    return `${Math.round((n / d) * 100)}%`
  }

  const dropOff = (from: number | undefined, to: number | undefined): string => {
    if (!from || from === 0) return '—'
    const dropped = from - (to ?? 0)
    if (dropped <= 0) return '0'
    return `−${dropped} (${Math.round((dropped / from) * 100)}%)`
  }

  // First-time events are deduped (via trackOncePerUser) — unique user counts are the true count
  const dedupedFirstDashboard = uniqueCount('first_dashboard_view')
  const dedupedFirstEssay = uniqueCount('first_essay_submitted')
  const dedupedFirstCorrection = uniqueCount('first_correction_viewed')
  const dedupedAccountCreated = uniqueCount('account_created')

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
          Métricas reais dos últimos {days} dias · product_events + estado do banco
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
        <MetricCard label="Novos usuários" value={newUsers} sub="do banco" />
        <MetricCard label="Redações enviadas" value={essaysSubmitted} sub="do banco" />
        <MetricCard label="Correções prontas" value={correctionsCompleted} sub="do banco" />
        <MetricCard label="Feedbacks" value={feedbackCount} sub="do banco" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PUBLIC FUNNEL
      ══════════════════════════════════════════════════════════════════════ */}
      <SectionTitle>Funil Público (Landing → Checkout)</SectionTitle>
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="flex flex-col gap-0.5">
          <FunnelStep label="CTA clicado na landing" count={ec['landing_cta_clicked']} badge="evento" />
          <FunnelArrow dropOff={dropOff(ec['landing_cta_clicked'], ec['plans_cta_clicked'])} />
          <FunnelStep label="CTA de plano clicado" count={ec['plans_cta_clicked']} badge="evento" />
          <FunnelArrow dropOff={dropOff(ec['plans_cta_clicked'], ec['checkout_started'])} />
          <FunnelStep label="Checkout iniciado" count={ec['checkout_started']} badge="evento" />
          <FunnelArrow dropOff={dropOff(ec['checkout_started'], ec['purchase_completed'])} />
          <FunnelStep label="Compra concluída" count={ec['purchase_completed']} badge="evento" color="text-emerald-400" />
        </div>
        <div className="mt-3 pt-3 border-t border-white/[0.04] flex gap-6">
          <MiniRate label="Plano → checkout" rate={pct(ec['checkout_started'], ec['plans_cta_clicked'])} />
          <MiniRate label="Checkout → compra" rate={pct(ec['purchase_completed'], ec['checkout_started'])} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          STUDENT FUNNEL (First Essay)
      ══════════════════════════════════════════════════════════════════════ */}
      <SectionTitle>Funil do Aluno (Conta → Primeira Correção)</SectionTitle>
      <div className="card-dark rounded-2xl p-5 mb-6">
        <p className="text-[10px] text-gray-600 mb-3">Contagem de usuários únicos (deduplicada)</p>
        <div className="flex flex-col gap-0.5">
          <FunnelStep label="Conta criada" count={dedupedAccountCreated} badge="dedup" />
          <FunnelArrow dropOff={dropOff(dedupedAccountCreated, dedupedFirstDashboard)} />
          <FunnelStep label="Primeiro acesso ao painel" count={dedupedFirstDashboard} badge="dedup" />
          <FunnelArrow dropOff={dropOff(dedupedFirstDashboard, dedupedFirstEssay)} />
          <FunnelStep label="Primeira redação enviada" count={dedupedFirstEssay} badge="dedup" />
          <FunnelArrow dropOff={dropOff(dedupedFirstEssay, dedupedFirstCorrection)} />
          <FunnelStep label="Primeira correção vista" count={dedupedFirstCorrection} badge="dedup" color="text-emerald-400" />
        </div>
        <div className="mt-3 pt-3 border-t border-white/[0.04] flex flex-wrap gap-4">
          <MiniRate label="Conta → painel" rate={pct(dedupedFirstDashboard, dedupedAccountCreated)} />
          <MiniRate label="Painel → 1ª redação" rate={pct(dedupedFirstEssay, dedupedFirstDashboard)} />
          <MiniRate label="1ª redação → 1ª correção" rate={pct(dedupedFirstCorrection, dedupedFirstEssay)} />
          <MiniRate label="Conta → 1ª correção (total)" rate={pct(dedupedFirstCorrection, dedupedAccountCreated)} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          REVENUE FUNNEL
      ══════════════════════════════════════════════════════════════════════ */}
      <SectionTitle>Funil de Receita</SectionTitle>
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="flex flex-col gap-0.5">
          <FunnelStep label="Upgrade page visto" count={ec['upgrade_page_viewed']} badge="evento" />
          <FunnelArrow dropOff={dropOff(ec['upgrade_page_viewed'], ec['checkout_started'])} />
          <FunnelStep label="Checkout iniciado" count={ec['checkout_started']} badge="evento" />
          <FunnelArrow dropOff={dropOff(ec['checkout_started'], ec['purchase_completed'])} />
          <FunnelStep label="Compra concluída" count={ec['purchase_completed']} badge="evento" color="text-emerald-400" />
        </div>
        <div className="mt-3 pt-3 border-t border-white/[0.04] flex gap-6">
          <MiniRate label="Upgrade → checkout" rate={pct(ec['checkout_started'], ec['upgrade_page_viewed'])} />
          <MiniRate label="Checkout → compra" rate={pct(ec['purchase_completed'], ec['checkout_started'])} />
        </div>
      </div>

      {/* ── Trial Funnel (T5) ───────────────────────────────────────────────── */}
      <SectionTitle>Funil Trial (Gratuito → Pago)</SectionTitle>
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="flex flex-col gap-0.5">
          <FunnelStep label="Trial iniciado" count={ec['trial_started']} badge="único" />
          <FunnelArrow dropOff={dropOff(ec['trial_started'], ec['trial_correction_used'])} />
          <FunnelStep label="Correção gratuita usada" count={ec['trial_correction_used']} badge="único" />
          <FunnelArrow dropOff={dropOff(ec['trial_correction_used'], ec['trial_to_paid_conversion'])} />
          <FunnelStep label="Converteu para pago" count={ec['trial_to_paid_conversion']} badge="evento" color="text-emerald-400" />
        </div>
        <div className="mt-3 pt-3 border-t border-white/[0.04] flex gap-6">
          <MiniRate label="Trial → usou" rate={pct(ec['trial_correction_used'], ec['trial_started'])} />
          <MiniRate label="Usou → pagou" rate={pct(ec['trial_to_paid_conversion'], ec['trial_correction_used'])} />
          <MiniRate label="Trial → pago (total)" rate={pct(ec['trial_to_paid_conversion'], ec['trial_started'])} />
        </div>
      </div>

      {/* ── Reforço Escolar: Conversion Funnel ──────────────────────────────── */}
      <SectionTitle>Funil Reforço Escolar — Conversão</SectionTitle>
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="flex flex-col gap-0.5">
          <FunnelStep label="Landing de reforço visualizada" count={ec['reforco_landing_viewed']} badge="página" />
          <FunnelArrow dropOff={dropOff(ec['reforco_landing_viewed'], ec['reforco_cta_clicked'])} />
          <FunnelStep label="CTA de reforço clicado" count={ec['reforco_cta_clicked']} badge="clique" />
          <FunnelArrow dropOff={dropOff(ec['reforco_cta_clicked'], ec['reforco_plans_viewed'])} />
          <FunnelStep label="Página de planos visualizada" count={ec['reforco_plans_viewed']} badge="página" />
          <FunnelArrow dropOff={dropOff(ec['reforco_plans_viewed'], ec['reforco_checkout_started'])} />
          <FunnelStep label="Checkout iniciado" count={ec['reforco_checkout_started']} badge="evento" />
          <FunnelArrow dropOff={dropOff(ec['reforco_checkout_started'], ec['reforco_purchase_completed'])} />
          <FunnelStep label="Compra concluída" count={ec['reforco_purchase_completed']} badge="evento" color="text-emerald-400" />
        </div>
        <div className="mt-3 pt-3 border-t border-white/[0.04] flex flex-wrap gap-6">
          <MiniRate label="Landing → CTA" rate={pct(ec['reforco_cta_clicked'], ec['reforco_landing_viewed'])} />
          <MiniRate label="Planos → Checkout" rate={pct(ec['reforco_checkout_started'], ec['reforco_plans_viewed'])} />
          <MiniRate label="Checkout → Compra" rate={pct(ec['reforco_purchase_completed'], ec['reforco_checkout_started'])} />
          <MiniRate label="Landing → Compra (total)" rate={pct(ec['reforco_purchase_completed'], ec['reforco_landing_viewed'])} />
        </div>
      </div>

      {/* ── Reforço Escolar: Activation Funnel ─────────────────────────────── */}
      <SectionTitle>Funil Reforço Escolar — Ativação</SectionTitle>
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="flex flex-col gap-0.5">
          <FunnelStep label="Compra concluída" count={ec['reforco_purchase_completed']} badge="evento" />
          <FunnelArrow dropOff={dropOff(ec['reforco_purchase_completed'], ec['reforco_success_viewed'])} />
          <FunnelStep label="Página de sucesso vista" count={ec['reforco_success_viewed']} badge="página" />
          <FunnelArrow dropOff={dropOff(ec['reforco_success_viewed'], ec['lesson_requested'])} />
          <FunnelStep label="Aula solicitada" count={ec['lesson_requested']} badge="evento" />
          <FunnelArrow dropOff={dropOff(ec['lesson_requested'], ec['lesson_confirmed'])} />
          <FunnelStep label="Aula confirmada pelo professor" count={ec['lesson_confirmed']} badge="evento" color="text-emerald-400" />
        </div>
        <div className="mt-3 pt-3 border-t border-white/[0.04] flex flex-wrap gap-6">
          <MiniRate label="Compra → Solicitou" rate={pct(ec['lesson_requested'], ec['reforco_purchase_completed'])} />
          <MiniRate label="Solicitou → Confirmada" rate={pct(ec['lesson_confirmed'], ec['lesson_requested'])} />
          <MiniRate label="Taxa de ativação (compradores que solicitaram)" rate={`${reforcoActivationRate}%`} />
        </div>
      </div>

      {/* ── Reforço Escolar: Plan Breakdown ────────────────────────────────── */}
      {Object.keys(reforcoPlanCounts).length > 0 && (
        <>
          <SectionTitle>Reforço — Plano Mais Comprado</SectionTitle>
          <div className="card-dark rounded-2xl p-5 mb-6">
            <div className="space-y-2">
              {Object.entries(reforcoPlanCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([slug, count]) => {
                  const total = Object.values(reforcoPlanCounts).reduce((s, c) => s + c, 0)
                  const pctShare = total > 0 ? Math.round((count / total) * 100) : 0
                  return (
                    <div key={slug} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-300 font-mono">{slug}</span>
                        <div className="w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-purple-500" style={{ width: `${pctShare}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tabular-nums">{count}</span>
                        <span className="text-[10px] text-gray-600 tabular-nums w-8 text-right">{pctShare}%</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </>
      )}

      {/* ── Subscription Health ─────────────────────────────────────────────── */}
      <SectionTitle>Saúde das Assinaturas</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Pagantes ativos" value={activePaying} />
        <MetricCard label="Com correções" value={withCredits} color="text-emerald-400" />
        <MetricCard label="Esgotados" value={exhausted} color="text-amber-400" />
        <MetricCard label="Correções não vistas" value={unviewedCorrections} color="text-red-400" />
      </div>

      {/* ── Top Drop-off Points ────────────────────────────────────────────── */}
      <SectionTitle>Maiores Pontos de Perda</SectionTitle>
      <div className="card-dark rounded-2xl p-5 mb-6">
        <DropOffTable rows={[
          { label: 'Conta criada → Painel', from: dedupedAccountCreated, to: dedupedFirstDashboard },
          { label: 'Painel → 1ª redação', from: dedupedFirstDashboard, to: dedupedFirstEssay },
          { label: '1ª redação → 1ª correção vista', from: dedupedFirstEssay, to: dedupedFirstCorrection },
          { label: 'Upgrade page → Checkout', from: ec['upgrade_page_viewed'] ?? 0, to: ec['checkout_started'] ?? 0 },
          { label: 'Checkout → Compra', from: ec['checkout_started'] ?? 0, to: ec['purchase_completed'] ?? 0 },
          { label: 'Trial → Usou correção', from: ec['trial_started'] ?? 0, to: ec['trial_correction_used'] ?? 0 },
          { label: 'Trial usou → Pagou', from: ec['trial_correction_used'] ?? 0, to: ec['trial_to_paid_conversion'] ?? 0 },
          { label: 'Reforço: Planos → Checkout', from: ec['reforco_plans_viewed'] ?? 0, to: ec['reforco_checkout_started'] ?? 0 },
          { label: 'Reforço: Checkout → Compra', from: ec['reforco_checkout_started'] ?? 0, to: ec['reforco_purchase_completed'] ?? 0 },
          { label: 'Reforço: Compra → Solicitou aula', from: ec['reforco_purchase_completed'] ?? 0, to: ec['lesson_requested'] ?? 0 },
          { label: 'Reforço: Solicitou → Confirmada', from: ec['lesson_requested'] ?? 0, to: ec['lesson_confirmed'] ?? 0 },
        ]} />
      </div>

      {/* ── Engagement Events ──────────────────────────────────────────────── */}
      <SectionTitle>Engajamento</SectionTitle>
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <EventStat label="essay_submitted" value={ec['essay_submitted']} unique={uniqueCount('essay_submitted')} />
          <EventStat label="correction_viewed" value={ec['correction_viewed']} unique={uniqueCount('correction_viewed')} />
          <EventStat label="biia_used" value={ec['biia_used']} unique={uniqueCount('biia_used')} />
          <EventStat label="share_link_generated" value={ec['share_link_generated']} unique={uniqueCount('share_link_generated')} />
          <EventStat label="feedback_submitted" value={ec['feedback_submitted']} unique={uniqueCount('feedback_submitted')} />
          <EventStat label="credits_exhausted" value={ec['credits_exhausted']} unique={uniqueCount('credits_exhausted')} />
        </div>
      </div>

      {/* ── H6: Metric Accuracy Notes ─────────────────────────────────────── */}
      <SectionTitle>Precisão das Métricas</SectionTitle>
      <div className="card-dark rounded-2xl p-5 mb-6 text-[11px] text-gray-500 leading-relaxed space-y-2">
        <p><span className="text-emerald-400 font-bold">● Exato</span> — Novos usuários, redações enviadas, correções prontas, feedbacks, pagantes ativos, esgotados, correções não vistas. Estes vêm diretamente das tabelas do banco (users, essays, corrections, subscriptions, correction_feedback) e refletem o estado real.</p>
        <p><span className="text-purple-400 font-bold">● Deduplicado</span> — account_created, first_dashboard_view, first_essay_submitted, first_correction_viewed, trial_started, trial_correction_used. Estes usam <code className="text-gray-400">trackOncePerUser</code> que verifica existência antes de inserir. Confiáveis a partir da data de deploy da instrumentação.</p>
        <p><span className="text-amber-400 font-bold">● Direcional</span> — landing_cta_clicked, plans_cta_clicked, checkout_started. Eventos de funil público dependem de JavaScript do cliente. Usuários com bloqueadores de anúncio ou JS desabilitado não serão contados. checkout_started pode incluir tanto fluxos públicos quanto de upgrade.</p>
        <p><span className="text-gray-600 font-bold">● Sem histórico</span> — Todos os eventos de product_events só existem a partir do deploy da instrumentação. Eventos anteriores a essa data não aparecem. As métricas &quot;do banco&quot; (users, essays, etc.) incluem dados históricos completos.</p>
      </div>
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
  sub,
}: {
  label: string
  value: number
  color?: string
  sub?: string
}) {
  return (
    <div className="card-dark rounded-xl p-4">
      <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-extrabold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-[9px] text-gray-700 mt-0.5">{sub}</p>}
    </div>
  )
}

function EventStat({ label, value, unique }: { label: string; value: number | undefined; unique?: number }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-gray-400 font-mono">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-white tabular-nums">{value ?? 0}</span>
        {unique !== undefined && unique > 0 && (
          <span className="text-[10px] text-gray-600 tabular-nums">({unique} users)</span>
        )}
      </div>
    </div>
  )
}

function FunnelStep({
  label,
  count,
  badge,
  color = 'text-white',
}: {
  label: string
  count: number | undefined
  badge?: string
  color?: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.05] px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-300">{label}</span>
        {badge && (
          <span className="text-[8px] font-bold text-gray-600 bg-white/[0.04] px-1.5 py-0.5 rounded uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>
      <span className={`text-sm font-bold tabular-nums ${color}`}>{count ?? 0}</span>
    </div>
  )
}

function FunnelArrow({ dropOff }: { dropOff?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-0.5">
      <svg width="10" height="12" viewBox="0 0 10 12" fill="none" className="text-gray-700">
        <path d="M5 0v8M1 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {dropOff && dropOff !== '—' && dropOff !== '0' && (
        <span className="text-[9px] text-red-400/60 font-mono">{dropOff}</span>
      )}
    </div>
  )
}

function MiniRate({ label, rate }: { label: string; rate: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-gray-600">{label}</span>
      <span className={`text-xs font-bold tabular-nums ${rate === '—' ? 'text-gray-700' : 'text-purple-400'}`}>{rate}</span>
    </div>
  )
}

function DropOffTable({ rows }: { rows: { label: string; from: number; to: number }[] }) {
  // Sort by drop count (highest first)
  const sorted = [...rows]
    .map(r => ({
      ...r,
      dropped: Math.max(0, r.from - r.to),
      dropPct: r.from > 0 ? Math.round(((r.from - r.to) / r.from) * 100) : 0,
    }))
    .filter(r => r.from > 0) // exclude rows with no data
    .sort((a, b) => b.dropPct - a.dropPct)

  if (sorted.length === 0) {
    return <p className="text-xs text-gray-600">Dados insuficientes para calcular perda.</p>
  }

  return (
    <div className="space-y-2">
      {sorted.map((r, i) => (
        <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
          <span className="text-xs text-gray-400">{r.label}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 tabular-nums">{r.from} → {r.to}</span>
            <span className={`text-xs font-bold tabular-nums ${
              r.dropPct >= 50 ? 'text-red-400' : r.dropPct >= 25 ? 'text-amber-400' : 'text-gray-500'
            }`}>
              −{r.dropped} ({r.dropPct}%)
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
