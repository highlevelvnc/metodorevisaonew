import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertCircle, Users, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Admin — Dashboard',
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

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: pendingCount },
    { count: studentCount },
    { count: correctedThisMonth },
    { data: pendingEssaysRaw },
    { data: correctionsRaw },
    { count: inReviewCount },
  ] = await Promise.all([
    db.from('essays').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    db.from('essays').select('*', { count: 'exact', head: true })
      .eq('status', 'corrected').gte('submitted_at', firstOfMonth),
    db.from('essays')
      .select('id, theme_title, submitted_at, student:users!essays_student_id_fkey(full_name)')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true })
      .limit(3),
    db.from('corrections').select('total_score, c5_score'),
    db.from('essays').select('*', { count: 'exact', head: true }).eq('status', 'in_review'),
  ])

  const pendingEssays: PendingEssay[] = pendingEssaysRaw ?? []
  const corrections: CorrectionsRow[] = correctionsRaw ?? []

  const avgScore = corrections.length
    ? Math.round(corrections.reduce((s, c) => s + c.total_score, 0) / corrections.length)
    : 0
  const avgC5 = corrections.length
    ? Math.round(corrections.reduce((s, c) => s + c.c5_score, 0) / corrections.length)
    : 0

  return (
    <div className="max-w-5xl">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-0.5">Painel Administrativo</h1>
        <p className="text-gray-500 text-sm">Visão geral da plataforma · Método Revisão</p>
      </div>

      {/* ── Alerta de pendências ────────────────────────────────── */}
      {((pendingCount ?? 0) > 0 || (inReviewCount ?? 0) > 0) && (
        <Link
          href={pendingEssays[0] ? `/admin/redacoes/${pendingEssays[0].id}` : '/admin/redacoes'}
          className="block mb-6"
        >
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4 flex items-center gap-4 hover:border-amber-500/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={18} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-300">
                {pendingCount ?? 0} pendente{(pendingCount ?? 0) !== 1 ? 's' : ''}
                {(inReviewCount ?? 0) > 0 && ` · ${inReviewCount} em revisão`}
              </p>
              <p className="text-xs text-amber-400/60 mt-0.5">
                {pendingEssays[0]
                  ? `mais antiga: ${Math.floor(msAgo(pendingEssays[0].submitted_at) / 3_600_000)}h aguardando — clique para corrigir`
                  : 'Clique para ver a fila de correções'}
              </p>
            </div>
            <ArrowRight size={16} className="text-amber-400 flex-shrink-0" />
          </div>
        </Link>
      )}

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/redacoes" className="card-dark p-5 rounded-2xl hover:border-amber-500/25 transition-colors group">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
              <AlertCircle size={15} className="text-amber-400" />
            </div>
            <span className="text-xs text-gray-500">Pendentes</span>
          </div>
          <p className={`text-3xl font-bold ${(pendingCount ?? 0) > 0 ? 'text-amber-400' : 'text-white'}`}>
            {pendingCount ?? 0}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">aguardando correção</p>
        </Link>

        <Link href="/admin/alunos" className="card-dark p-5 rounded-2xl hover:border-purple-600/25 transition-colors group">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/15 flex items-center justify-center">
              <Users size={15} className="text-purple-400" />
            </div>
            <span className="text-xs text-gray-500">Alunos</span>
          </div>
          <p className="text-3xl font-bold text-white">{studentCount ?? 0}</p>
          <p className="text-xs text-gray-600 mt-0.5">ativos na plataforma</p>
        </Link>

        <div className="card-dark p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/15 flex items-center justify-center">
              <CheckCircle2 size={15} className="text-green-400" />
            </div>
            <span className="text-xs text-gray-500">Este mês</span>
          </div>
          <p className="text-3xl font-bold text-white">{correctedThisMonth ?? 0}</p>
          <p className="text-xs text-gray-600 mt-0.5">redações corrigidas</p>
        </div>

        <div className="card-dark p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
              <TrendingUp size={15} className="text-blue-400" />
            </div>
            <span className="text-xs text-gray-500">Média geral</span>
          </div>
          <p className="text-3xl font-bold text-white">{avgScore || '—'}</p>
          <p className="text-xs text-gray-600 mt-0.5">pontos dos alunos</p>
        </div>
      </div>

      {/* ── Grid inferior ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Próximas para corrigir */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Próximas para corrigir</h2>
            <Link href="/admin/redacoes" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              Ver todas →
            </Link>
          </div>

          {pendingEssays.length === 0 ? (
            <div className="card-dark rounded-2xl p-8 text-center">
              <CheckCircle2 size={22} className="text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Fila limpa! Nenhuma redação pendente.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingEssays.map(essay => {
                const h = Math.floor(msAgo(essay.submitted_at) / 3_600_000)
                const urgentColor = h >= 48 ? 'text-red-400' : h >= 24 ? 'text-amber-400' : 'text-gray-500'
                const studentName = essay.student?.full_name ?? 'Aluno'
                return (
                  <Link key={essay.id} href={`/admin/redacoes/${essay.id}`}
                    className="card-dark rounded-2xl p-4 flex items-center gap-3 hover:border-purple-600/30 transition-all hover:-translate-y-0.5 group block">
                    <div className="w-9 h-9 rounded-full bg-purple-600/15 border border-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-300 flex-shrink-0">
                      {studentName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{studentName}</p>
                      <p className="text-xs text-gray-600 line-clamp-1">{essay.theme_title}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xs font-semibold ${urgentColor}`}>{h}h</p>
                      <p className="text-[10px] text-gray-700">{relativeDate(essay.submitted_at)}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-700 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Insight da turma */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Insight da turma</h2>
          <div className="card-dark rounded-2xl p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Média geral</span>
                <span className="text-xs font-bold text-white">{avgScore || '—'}/1000</span>
              </div>
              <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                  style={{ width: `${(avgScore / 1000) * 100}%` }} />
              </div>
            </div>
            {corrections.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">C5 média (proposta de intervenção)</span>
                  <span className="text-xs font-bold text-amber-400">{avgC5}/200</span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(avgC5 / 200) * 100}%` }} />
                </div>
              </div>
            )}
            <p className="text-xs text-gray-600 pt-1 border-t border-white/[0.04]">
              {corrections.length === 0
                ? '💡 Nenhuma correção realizada ainda. Os insights aparecerão aqui após as primeiras devolutivas.'
                : '💡 A proposta de intervenção (C5) é o ponto mais crítico — foco em agente, ação, modo e finalidade nos feedbacks.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
