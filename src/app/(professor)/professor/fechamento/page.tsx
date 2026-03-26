import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FileCheck2, Clock, CheckCircle2, AlertCircle, ChevronRight, FileText, Video } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  RATE_ESSAY,
  RATE_LESSON,
  formatBRL,
  buildMonthWindows,
  type ClosingStatus,
} from '@/lib/professor/rates'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Professor — Fechamento Mensal',
  robots: { index: false, follow: false },
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface MonthSummary {
  year: number
  month: number
  label: string
  essays: number
  lessons: number
  totalAmount: number
  status: ClosingStatus
  isCurrent: boolean
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ClosingStatus }) {
  switch (status) {
    case 'open':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full whitespace-nowrap">
          <Clock size={9} />
          Em Aberto
        </span>
      )
    case 'paid':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-400 bg-green-500/10 border border-green-500/30 px-2.5 py-1 rounded-full whitespace-nowrap">
          <CheckCircle2 size={9} />
          Pago
        </span>
      )
    case 'closed':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-full whitespace-nowrap">
          <FileCheck2 size={9} />
          Fechado
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-white/[0.05] border border-white/[0.10] px-2.5 py-1 rounded-full whitespace-nowrap">
          <AlertCircle size={9} />
          Sem registro
        </span>
      )
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProfessorFechamentoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  const profile = profileRaw as { role: string } | null
  if (!profile || !['admin', 'reviewer'].includes(profile.role)) redirect('/aluno')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const now     = new Date()
  const windows = buildMonthWindows(6, now)

  // Query essay counts for all windows in parallel
  const counts = await Promise.all(
    windows.map(w =>
      db
        .from('essays')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'corrected')
        .gte('corrected_at', w.first)
        .lte('corrected_at', w.last)
    )
  )

  const summaries: MonthSummary[] = windows.map((w, i) => {
    const essays      = counts[i].count ?? 0
    const lessons     = 0  // future: from lesson_sessions table
    const totalAmount = essays * RATE_ESSAY + lessons * RATE_LESSON
    return {
      year:        w.year,
      month:       w.month,
      label:       w.label,
      essays,
      lessons,
      totalAmount,
      status:      w.isCurrent ? 'open' : 'no_record',
      isCurrent:   w.isCurrent,
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
            Histórico de fechamentos · Sistema de pagamento em implementação
          </p>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                Referência
              </th>
              <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-24">
                Correções
              </th>
              <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-32">
                Valor
              </th>
              <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-36">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {historical.map(m => (
              <tr key={`${m.year}-${m.month}`} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-gray-200">{m.label}</p>
                  <p className="text-[11px] text-gray-700 mt-0.5">
                    {m.status === 'paid'
                      ? 'Pagamento concluído'
                      : m.status === 'closed'
                      ? 'Fechamento processado'
                      : 'Aguardando sistema de pagamento'}
                  </p>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-gray-300 text-center tabular-nums">
                  {m.essays}
                </td>
                <td className={`px-5 py-4 text-sm font-bold text-right tabular-nums ${m.totalAmount > 0 ? 'text-white' : 'text-gray-700'}`}>
                  {formatBRL(m.totalAmount)}
                </td>
                <td className="px-5 py-4 text-right">
                  <StatusBadge status={m.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── How it works ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Como funciona o fechamento</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: '📅', title: 'Ciclo mensal',            desc: 'Corre do 1º ao último dia de cada mês.' },
            { icon: '🔒', title: 'Encerramento automático', desc: 'No último dia o ciclo é fechado e o total calculado.' },
            { icon: '💳', title: 'Prazo de pagamento',      desc: 'Processado em até 5 dias úteis após o fechamento.' },
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
