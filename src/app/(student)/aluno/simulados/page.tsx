import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const metadata = { title: 'Simulados Realistas | Método Revisão' }

type Essay = {
  id: string
  theme_title: string | null
  submitted_at: string
  status: string
  total_score: number | null
}

const STEPS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    title: 'Escolha um tema real',
    desc: 'Selecione um tema do banco de temas reais do ENEM ou proponha o seu próprio.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Escreva em condições reais',
    desc: 'Cronometre 60 minutos, escreva sem pausas e sem consulta — como no dia da prova.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'Receba devolutiva completa',
    desc: 'Corretora especialista avalia as 5 competências e entrega análise detalhada em até 24h.',
  },
]

function statusLabel(status: string): { text: string; className: string } {
  switch (status) {
    case 'corrected':
      return { text: 'Corrigida',          className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' }
    case 'pending':
      return { text: 'Aguardando correção', className: 'bg-amber-500/10 border-amber-500/20 text-amber-400' }
    case 'draft':
      return { text: 'Rascunho',            className: 'bg-white/[0.05] border-white/[0.08] text-gray-500' }
    default:
      return { text: status,                className: 'bg-white/[0.05] border-white/[0.08] text-gray-500' }
  }
}

function scoreColor(score: number, avg: number | null): string {
  if (avg === null) return 'text-white'
  if (score >= avg + 40) return 'text-emerald-400'
  if (score <= avg - 40) return 'text-amber-400'
  return 'text-white'
}

function momentumTip(count: number, lastScore: number | null, bestScore: number | null): { headline: string; body: string } {
  if (count === 0) return {
    headline: 'Comece hoje.',
    body: 'A primeira redação é a mais difícil — mas é ela que revela exatamente o que trabalhar. Sem ela, não há evolução.',
  }
  if (count === 1) return {
    headline: 'Primeiro simulado feito.',
    body: 'O padrão começa a aparecer na segunda e terceira redação. Continue enviando para sua corretora construir um diagnóstico preciso.',
  }
  if (count >= 2 && count < 5) return {
    headline: 'Você está construindo um histórico.',
    body: 'Alunos que fazem 5 ou mais simulados por ciclo evoluem em média 120 pts a mais. Você está no caminho certo.',
  }
  if (lastScore !== null && bestScore !== null && lastScore === bestScore) return {
    headline: 'Última nota é a sua melhor nota.',
    body: 'Isso é a curva certa: cada simulado melhor que o anterior. Mantenha a frequência e o foco nas correções da sua corretora.',
  }
  return {
    headline: `${count} simulados — consistência que gera resultado.`,
    body: 'A diferença entre quem aprova e quem não aprova não é talento — é frequência. Você está no grupo certo.',
  }
}

export default async function SimuladosPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: { user } } = await supabase.auth.getUser()

  let essays: Essay[] = []
  let totalCount = 0
  let lastScore: number | null = null
  let bestScore: number | null = null
  let avgScore: number | null = null

  if (user) {
    const [{ data: essaysData }, { count }] = await Promise.all([
      db
        .from('essays')
        .select('id, theme_title, submitted_at, status, corrections(total_score)')
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(8),
      db
        .from('essays')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', user.id),
    ])

    essays = ((essaysData ?? []) as any[]).map((e: any) => ({
      id: e.id,
      theme_title: e.theme_title,
      submitted_at: e.submitted_at,
      status: e.status,
      total_score: e.corrections?.[0]?.total_score ?? null,
    }))

    totalCount = count ?? 0

    const corrected = essays.filter((e) => e.total_score !== null)
    if (corrected.length > 0) {
      lastScore = corrected[0].total_score  // most recent first
      bestScore = Math.max(...corrected.map((e) => e.total_score ?? 0))
      avgScore = Math.round(corrected.reduce((acc, e) => acc + (e.total_score ?? 0), 0) / corrected.length)
    }
  }

  const hasEssays = essays.length > 0
  const tip = momentumTip(totalCount, lastScore, bestScore)

  return (
    <div className="max-w-4xl">
      {/* Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Simulados Realistas</h1>
          <p className="text-sm text-gray-500">
            Escreva como se fosse dia de prova. Receba correção humana e evolua de verdade.
          </p>
        </div>
        <Link
          href="/aluno/redacoes/nova"
          className="btn-primary shrink-0 self-start"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {hasEssays ? 'Novo simulado' : 'Começar agora'}
        </Link>
      </div>

      {/* Stats — only when data exists */}
      {lastScore !== null && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="card-dark rounded-2xl p-4">
            <p className="text-[11px] text-gray-600 mb-1">Simulados feitos</p>
            <p className="text-2xl font-black text-white">{totalCount}</p>
          </div>
          <div className="card-dark rounded-2xl p-4">
            <p className="text-[11px] text-gray-600 mb-1">Última nota</p>
            <p className={`text-2xl font-black ${scoreColor(lastScore, avgScore)}`}>{lastScore}</p>
          </div>
          <div className="card-dark rounded-2xl p-4">
            <p className="text-[11px] text-gray-600 mb-1">Melhor nota</p>
            <p className="text-2xl font-black text-emerald-400">{bestScore}</p>
          </div>
          <div className="card-dark rounded-2xl p-4">
            <p className="text-[11px] text-gray-600 mb-1">Média geral</p>
            <p className="text-2xl font-black text-white">{avgScore}</p>
            <p className="text-[10px] text-gray-700 mt-0.5">de 1000 pts</p>
          </div>
        </div>
      )}

      {/* Empty state — full hero */}
      {!hasEssays && (
        <div className="card-dark rounded-2xl p-8 mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <p className="text-base font-bold text-white mb-2">Sem simulados ainda</p>
          <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-sm mx-auto">
            Escreva sua primeira redação agora e receba uma devolutiva completa nas 5 competências do ENEM — em até 24h.
          </p>
          <Link href="/aluno/redacoes/nova" className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Escrever agora
          </Link>

          {/* How it works — only in empty state */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-500">
                  {step.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-white mb-0.5">{step.title}</p>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History — when user has essays */}
      {hasEssays && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Histórico</h2>
            <Link href="/aluno/redacoes" className="text-xs text-gray-500 hover:text-white transition-colors">
              Ver todas as redações →
            </Link>
          </div>

          <div className="space-y-2">
            {essays.map((essay) => {
              const badge = statusLabel(essay.status)
              const timeAgo = formatDistanceToNow(new Date(essay.submitted_at), { addSuffix: true, locale: ptBR })
              const isPersonalBest = essay.total_score !== null && essay.total_score === bestScore

              return (
                <Link
                  key={essay.id}
                  href={`/aluno/redacoes/${essay.id}`}
                  className="card-dark rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-white/[0.1] transition-all group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Score pill */}
                    {essay.total_score !== null ? (
                      <div className={`shrink-0 text-center ${isPersonalBest ? 'relative' : ''}`}>
                        <p className={`text-base font-black tabular-nums ${scoreColor(essay.total_score, avgScore)}`}>
                          {essay.total_score}
                        </p>
                        {isPersonalBest && (
                          <p className="text-[9px] font-bold text-emerald-500/60 leading-none -mt-0.5">melhor</p>
                        )}
                      </div>
                    ) : (
                      <div className="shrink-0 w-8 text-center">
                        <p className="text-base font-black text-gray-700">—</p>
                      </div>
                    )}

                    {/* Separator */}
                    <div className="w-px h-8 bg-white/[0.06] shrink-0" />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-purple-200 transition-colors">
                        {essay.theme_title ?? 'Tema livre'}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">{timeAgo}</p>
                    </div>
                  </div>

                  <span className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${badge.className}`}>
                    {badge.text}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Momentum tip — always visible, adapts to context */}
      <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.05] px-5 py-4 flex items-start gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0 mt-1.5" />
        <div>
          <p className="text-[12px] font-semibold text-purple-300 mb-1">{tip.headline}</p>
          <p className="text-[12px] text-gray-500 leading-relaxed">{tip.body}</p>
          {!hasEssays && (
            <Link
              href="/aluno/redacoes/nova"
              className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
            >
              Começar agora →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
