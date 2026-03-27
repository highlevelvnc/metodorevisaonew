import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  FileCheck2, Clock, CheckCircle2, AlertCircle, ChevronRight,
  FileText, Video, CreditCard, CalendarCheck, Hash,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  RATE_ESSAY,
  RATE_LESSON,
  formatBRL,
  buildMonthWindows,
  type ClosingStatus,
} from '@/lib/professor/rates'
import type { MonthlyPayoutRow, PixKeyType } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Professor — Fechamento Mensal',
  robots: { index: false, follow: false },
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface MonthSummary {
  year:             number
  month:            number
  label:            string
  essays:           number
  lessons:          number
  totalAmount:      number
  status:           ClosingStatus
  isCurrent:        boolean
  isConfirmed:      boolean
  // Payment details (from monthly_payouts row)
  paidAt:           string | null
  closedAt:         string | null
  paymentReference: string | null
  paymentMethod:    string | null
  pixKeySnapshot:   string | null
}

const PIX_TYPE_LABELS: Record<PixKeyType, string> = {
  cpf:    'CPF',
  cnpj:   'CNPJ',
  email:  'E-mail',
  phone:  'Celular',
  random: 'Chave aleatória',
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ClosingStatus }) {
  switch (status) {
    case 'open':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full whitespace-nowrap">
          <Clock size={9} /> Em Aberto
        </span>
      )
    case 'paid':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-400 bg-green-500/10 border border-green-500/30 px-2.5 py-1 rounded-full whitespace-nowrap">
          <CheckCircle2 size={9} /> Pago
        </span>
      )
    case 'closed':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-full whitespace-nowrap">
          <FileCheck2 size={9} /> Fechado
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-white/[0.05] border border-white/[0.10] px-2.5 py-1 rounded-full whitespace-nowrap">
          <AlertCircle size={9} /> Sem registro
        </span>
      )
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProfessorFechamentoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  const profile = profileRaw as { role: string } | null
  if (!profile || !['admin', 'reviewer'].includes(profile.role)) redirect('/aluno')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const now     = new Date()
  const windows = buildMonthWindows(6, now)

  const refMonths = windows.map(w => {
    const mm = String(w.month + 1).padStart(2, '0')
    return `${w.year}-${mm}-01`
  })

  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const lastDayStr     = `${lastDayOfMonth.getFullYear()}-${String(lastDayOfMonth.getMonth() + 1).padStart(2, '0')}-${String(lastDayOfMonth.getDate()).padStart(2, '0')}`

  const [
    { data: payoutRowsRaw },
    { count: currentLiveEssays },
    { count: currentLiveLessons },
    { data: payoutProfileRaw },
  ] = await Promise.all([
    db.from('monthly_payouts')
      .select('*')
      .eq('professor_id', user.id)
      .in('reference_month', refMonths),

    supabase.from('corrections')
      .select('*', { count: 'exact', head: true })
      .eq('reviewer_id', user.id)
      .gte('corrected_at', windows[0].first)
      .lte('corrected_at', windows[0].last),

    db.from('lesson_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('professor_id', user.id)
      .eq('status', 'completed')
      .gte('session_date', refMonths[0])
      .lte('session_date', lastDayStr),

    db.from('professor_payout_profiles')
      .select('pix_key, pix_key_type')
      .eq('professor_id', user.id)
      .maybeSingle(),
  ])

  const payoutRows: MonthlyPayoutRow[] = payoutRowsRaw ?? []
  const payoutProfile = payoutProfileRaw as { pix_key: string | null; pix_key_type: PixKeyType | null } | null

  const payoutByMonth = new Map<string, MonthlyPayoutRow>(
    payoutRows.map(r => [r.reference_month.slice(0, 10), r])
  )

  // ── Build summaries ────────────────────────────────────────────────────────

  const summaries: MonthSummary[] = windows.map((w, i) => {
    const refKey = refMonths[i]

    if (i === 0) {
      const essays  = currentLiveEssays  ?? 0
      const lessons = currentLiveLessons ?? 0
      return {
        year:             w.year,
        month:            w.month,
        label:            w.label,
        essays,
        lessons,
        totalAmount:      essays * RATE_ESSAY + lessons * RATE_LESSON,
        status:           'open',
        isCurrent:        true,
        isConfirmed:      false,
        paidAt:           null,
        closedAt:         null,
        paymentReference: null,
        paymentMethod:    null,
        pixKeySnapshot:   null,
      }
    }

    const payout = payoutByMonth.get(refKey)
    if (payout) {
      return {
        year:             w.year,
        month:            w.month,
        label:            w.label,
        essays:           payout.essays_count,
        lessons:          payout.lessons_count,
        totalAmount:      payout.total_amount,
        status:           payout.status as ClosingStatus,
        isCurrent:        false,
        isConfirmed:      true,
        paidAt:           payout.paid_at,
        closedAt:         payout.closed_at,
        paymentReference: payout.payment_reference,
        paymentMethod:    (payout as unknown as Record<string, string | null>).payment_method ?? null,
        pixKeySnapshot:   (payout as unknown as Record<string, string | null>).pix_key_snapshot ?? null,
      }
    }

    return {
      year:             w.year,
      month:            w.month,
      label:            w.label,
      essays:           0,
      lessons:          0,
      totalAmount:      0,
      status:           'no_record',
      isCurrent:        false,
      isConfirmed:      false,
      paidAt:           null,
      closedAt:         null,
      paymentReference: null,
      paymentMethod:    null,
      pixKeySnapshot:   null,
    }
  })

  const current    = summaries[0]
  const historical = summaries.slice(1)

  const dayOfMonth    = now.getDate()
  const daysInMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const diasRestantes = daysInMonth - dayOfMonth

  return (
    <div className="max-w-4xl space-y-6">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Fechamento Mensal</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Histórico de ciclos · O mês fecha no último dia de cada mês
        </p>
      </div>

      {/* ── Current month ─────────────────────────────────────────── */}
      <div className="card-dark rounded-2xl p-6 border border-amber-500/15 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[9px] font-bold text-amber-400/50 uppercase tracking-widest mb-1">Ciclo atual</p>
            <h2 className="text-xl font-bold text-white">{current.label}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {diasRestantes > 0
                ? `Fecha em ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} (último dia do mês)`
                : 'Aguardando processamento de fechamento'}
            </p>
          </div>
          <StatusBadge status={current.status} />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <div>
            <p className="text-[9px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Correções</p>
            <p className="text-2xl font-bold text-white tabular-nums">{current.essays}</p>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Aulas</p>
            <p className="text-2xl font-bold text-gray-700 tabular-nums">{current.lessons}</p>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Total parcial</p>
            <p className="text-2xl font-bold text-green-400 tabular-nums">{formatBRL(current.totalAmount)}</p>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Pagamento</p>
            <p className="text-sm font-semibold text-gray-600 mt-1.5">Após fechamento</p>
          </div>
        </div>

        {/* Composition */}
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 mb-4">
          <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-3">Composição</p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1.5">
                <FileText size={11} className="text-amber-400/60" />
                {current.essays} correções × {formatBRL(RATE_ESSAY)}
              </span>
              <span className="font-bold text-amber-400 tabular-nums">
                {formatBRL(current.essays * RATE_ESSAY)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-700 flex items-center gap-1.5">
                <Video size={11} className="text-purple-400/30" />
                {current.lessons} aulas × {formatBRL(RATE_LESSON)}
              </span>
              <span className="font-semibold text-gray-700 tabular-nums">
                {formatBRL(current.lessons * RATE_LESSON)}
              </span>
            </div>
            <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-300">Total</span>
              <span className="font-bold text-green-400 tabular-nums">{formatBRL(current.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* PIX key for this professor */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 mb-4 flex items-center gap-3">
          <CreditCard size={14} className={payoutProfile?.pix_key ? 'text-green-400' : 'text-gray-600'} />
          {payoutProfile?.pix_key ? (
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Chave PIX cadastrada
                {payoutProfile.pix_key_type && ` · ${PIX_TYPE_LABELS[payoutProfile.pix_key_type]}`}
              </p>
              <p className="text-xs font-mono text-gray-300 mt-0.5">{payoutProfile.pix_key}</p>
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Chave PIX não cadastrada</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Configure em{' '}
                <Link href="/professor/perfil" className="text-amber-400 hover:underline">Perfil</Link>
                {' '}para garantir o pagamento do fechamento.
              </p>
            </div>
          )}
        </div>

        <Link
          href="/professor/ganhos"
          className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium group"
        >
          Ver detalhes diários em Ganhos
          <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* ── Historical months ──────────────────────────────────────── */}
      <div className="card-dark rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Ciclos anteriores</h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Histórico de fechamentos · Valores e dados de pagamento confirmados
          </p>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {historical.map(m => (
            <div key={`${m.year}-${m.month}`} className="hover:bg-white/[0.02] transition-colors">
              {/* Main row */}
              <div className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-200">{m.label}</p>
                  <p className="text-[11px] text-gray-700 mt-0.5">
                    {m.status === 'paid'   ? `Pago em ${formatDate(m.paidAt)}` :
                     m.status === 'closed' ? `Fechado em ${formatDate(m.closedAt)}` :
                     m.isConfirmed         ? 'Registro confirmado' :
                                             'Aguardando sistema de pagamento'}
                  </p>
                </div>
                <div className="text-center w-20 shrink-0">
                  <p className="text-sm font-semibold text-gray-300 tabular-nums">
                    {m.isConfirmed || m.essays > 0 ? m.essays : '—'}
                  </p>
                  <p className="text-[9px] text-gray-700 mt-0.5">correções</p>
                </div>
                <div className="text-right w-28 shrink-0">
                  <p className={`text-sm font-bold tabular-nums ${m.totalAmount > 0 ? 'text-white' : 'text-gray-700'}`}>
                    {m.isConfirmed || m.totalAmount > 0 ? formatBRL(m.totalAmount) : '—'}
                  </p>
                  <p className="text-[9px] text-gray-700 mt-0.5">total</p>
                </div>
                <div className="shrink-0 w-32 text-right">
                  <StatusBadge status={m.status} />
                </div>
              </div>

              {/* Payment detail panel — only for paid or closed months with confirmed data */}
              {m.isConfirmed && (m.status === 'paid' || m.status === 'closed') && (
                <div className="px-5 pb-4">
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-3">
                      Detalhes do pagamento
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Method */}
                      <div>
                        <p className="text-[9px] font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <CreditCard size={8} /> Método
                        </p>
                        <p className="text-xs font-semibold text-gray-300">
                          {m.paymentMethod ? m.paymentMethod.toUpperCase() : 'PIX'}
                        </p>
                      </div>

                      {/* PIX key used */}
                      <div>
                        <p className="text-[9px] font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <CreditCard size={8} /> Chave PIX
                        </p>
                        <p className="text-xs font-mono text-gray-400 truncate">
                          {m.pixKeySnapshot ?? '—'}
                        </p>
                      </div>

                      {/* Payment date */}
                      <div>
                        <p className="text-[9px] font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <CalendarCheck size={8} /> Data de pagamento
                        </p>
                        <p className="text-xs text-gray-400">
                          {m.status === 'paid' ? formatDate(m.paidAt) : 'Aguardando'}
                        </p>
                      </div>

                      {/* Transfer reference */}
                      <div>
                        <p className="text-[9px] font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Hash size={8} /> Referência
                        </p>
                        <p className="text-xs font-mono text-gray-500 truncate">
                          {m.paymentReference ?? '—'}
                        </p>
                      </div>
                    </div>

                    {/* Amount breakdown */}
                    {m.lessons > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-6 text-[11px] text-gray-600">
                        <span>
                          <span className="text-gray-500">{m.essays} correções</span>
                          {' · '}
                          <span className="text-amber-500/80 font-semibold tabular-nums">
                            {formatBRL(m.essays * RATE_ESSAY)}
                          </span>
                        </span>
                        <span>
                          <span className="text-gray-500">{m.lessons} aulas</span>
                          {' · '}
                          <span className="text-purple-400/70 font-semibold tabular-nums">
                            {formatBRL(m.lessons * RATE_LESSON)}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Como funciona o fechamento</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: '📅', title: 'Ciclo mensal',            desc: 'Corre do 1º ao último dia de cada mês.' },
            { icon: '🔒', title: 'Encerramento automático', desc: 'No último dia o ciclo é fechado e o total calculado.' },
            { icon: '💳', title: 'Prazo de pagamento',      desc: 'Processado em até 5 dias úteis via PIX após o fechamento.' },
            { icon: '📊', title: 'Tabela de taxas',         desc: `Correção ${formatBRL(RATE_ESSAY)} · Aula 30 min ${formatBRL(RATE_LESSON)}` },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 rounded-xl bg-white/[0.025] border border-white/[0.05] p-3.5">
              <span className="text-base leading-none mt-0.5 shrink-0">{icon}</span>
              <div>
                <p className="text-xs font-semibold text-white">{title}</p>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
