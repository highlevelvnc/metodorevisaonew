import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Mentorias em Grupo | Método Revisão' }

type UpcomingSession = {
  id: string
  date: string
  time: string
  title: string
  host: string
  description: string
  spots: number
  registrationUrl: string | null
  compTag: string | null
}

type Recording = {
  id: string
  date: string
  title: string
  host: string
  description: string
  duration: string
  recordingUrl: string | null
  compTags: string[]
}

const UPCOMING: UpcomingSession[] = [
  {
    id: 'u1',
    date: '2025-02-08',
    time: '15h00',
    title: 'Correção coletiva ao vivo — Temas de Direitos Humanos',
    host: 'Mariana Souza',
    description:
      'A corretora corrige 3 redações enviadas pelos alunos e explica cada decisão ponto a ponto — C1 a C5, com espaço para perguntas no final.',
    spots: 40,
    registrationUrl: null,
    compTag: null,
  },
  {
    id: 'u2',
    date: '2025-02-15',
    time: '15h00',
    title: 'Workshop: Proposta de intervenção nota 200',
    host: 'Mariana Souza',
    description:
      'Construção ao vivo de conclusões com os 5 elementos exigidos. Você sai da sessão com um template próprio.',
    spots: 40,
    registrationUrl: null,
    compTag: 'C5',
  },
  {
    id: 'u3',
    date: '2025-02-22',
    time: '15h00',
    title: 'Workshop: Repertório sociocultural sem decoreba',
    host: 'Mariana Souza',
    description:
      'Como construir seu próprio banco de argumentos que funciona para qualquer tema — sem decorar, sem travar.',
    spots: 40,
    registrationUrl: null,
    compTag: 'C3',
  },
]

const RECORDINGS: Recording[] = [
  {
    id: 'r1',
    date: '2025-01-18',
    title: 'Correção coletiva — Tecnologia e Sociedade',
    host: 'Mariana Souza',
    description: '3 redações corrigidas ao vivo com análise completa das 5 competências.',
    duration: '1h 12min',
    recordingUrl: null,
    compTags: ['C1', 'C3', 'C5'],
  },
  {
    id: 'r2',
    date: '2025-01-11',
    title: 'Como construir argumentos sólidos para qualquer tema',
    host: 'Mariana Souza',
    description: 'Técnicas de argumentação que funcionam independente do tema sorteado.',
    duration: '54min',
    recordingUrl: null,
    compTags: ['C3'],
  },
  {
    id: 'r3',
    date: '2024-12-14',
    title: 'Análise da redação nota 1000 — ENEM 2024',
    host: 'Mariana Souza',
    description: 'Leitura comentada da redação nota 1000 e o que ela revela sobre cada critério de correção.',
    duration: '48min',
    recordingUrl: null,
    compTags: ['Geral'],
  },
]

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatDateShort(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default async function MentoriaPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: { user } } = await supabase.auth.getUser()

  /* ── Most recent corrected essay for personalized CTA ────────────────────── */
  let recentEssay: { id: string; theme_title: string | null } | null = null
  if (user) {
    const { data } = await db
      .from('essays')
      .select('id, theme_title')
      .eq('student_id', user.id)
      .eq('status', 'corrected')
      .order('submitted_at', { ascending: false })
      .limit(1)

    recentEssay = (data as any[])?.[0] ?? null
  }

  const nextSession = UPCOMING[0]

  return (
    <div className="max-w-4xl">
      {/* Masthead */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Mentorias em Grupo</h1>
        <p className="text-sm text-gray-500">
          Sessões ao vivo: correções comentadas, workshops práticos e espaço para tirar dúvidas com a corretora.
        </p>
      </div>

      {/* Hero — next session */}
      <div className="card-dark rounded-2xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-purple-900/30 to-purple-950/10 px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
            Próxima sessão
          </span>
        </div>
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Date block */}
            <div className="shrink-0 w-14 h-14 rounded-2xl bg-purple-700/20 border border-purple-600/30 flex flex-col items-center justify-center">
              <p className="text-lg font-black text-purple-300 leading-none">
                {new Date(nextSession.date + 'T12:00:00').getDate().toString().padStart(2, '0')}
              </p>
              <p className="text-[9px] font-bold uppercase text-purple-400/70 leading-none mt-0.5">
                {new Date(nextSession.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
              </p>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-semibold text-gray-600">{nextSession.time}</span>
                {nextSession.compTag && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    {nextSession.compTag}
                  </span>
                )}
              </div>
              <p className="text-base font-bold text-white mb-2 leading-snug">{nextSession.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{nextSession.description}</p>
              <div className="flex items-center gap-3 text-[11px] text-gray-600">
                <span>com {nextSession.host}</span>
                <span>·</span>
                <span>{nextSession.spots} vagas</span>
                <span>·</span>
                <span>ao vivo via Zoom</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center gap-3 flex-wrap">
            {nextSession.registrationUrl ? (
              <a
                href={nextSession.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white transition-colors"
              >
                Reservar minha vaga
              </a>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-white/[0.08] text-gray-600 cursor-default">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Inscrições em breve
                </span>
                <span className="text-[11px] text-gray-700">Link disponível 1 semana antes</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Personalized CTA — if user has corrected essays */}
      {recentEssay ? (
        <div className="rounded-2xl border border-amber-500/[0.18] bg-amber-500/[0.03] px-5 py-4 mb-6 flex items-start gap-3">
          <div className="shrink-0 w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mt-0.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-400 mb-1">
              Você tem uma redação corrigida — envie para a mentoria ao vivo
            </p>
            <p className="text-xs text-gray-500 leading-relaxed mb-2.5">
              &ldquo;{recentEssay.theme_title ?? 'Tema livre'}&rdquo; pode ser analisada ao vivo na próxima sessão. Envie para a sua corretora com o assunto <span className="font-semibold text-gray-400">"Mentoria ao vivo"</span> até quinta-feira.
            </p>
            <Link
              href={`/aluno/redacoes/${recentEssay.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400/80 hover:text-amber-400 transition-colors"
            >
              Ver redação →
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 mb-6">
          <p className="text-xs font-bold text-gray-400 mb-1">Quer enviar uma redação para correção ao vivo?</p>
          <p className="text-xs text-gray-600 leading-relaxed mb-2.5">
            Envie qualquer redação corrigida para o e-mail da sua corretora com o assunto &ldquo;Mentoria ao vivo&rdquo; até quinta-feira. Selecionamos até 3 por sessão.
          </p>
          <Link
            href="/aluno/redacoes/nova"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            Enviar uma redação agora →
          </Link>
        </div>
      )}

      {/* Upcoming sessions — remaining */}
      {UPCOMING.length > 1 && (
        <div className="mb-7">
          <h2 className="text-sm font-bold text-white mb-3">Outras sessões agendadas</h2>
          <div className="space-y-2">
            {UPCOMING.slice(1).map((session) => (
              <div key={session.id} className="card-dark rounded-2xl px-5 py-4 flex items-center gap-4">
                {/* Date */}
                <div className="shrink-0 text-center w-10">
                  <p className="text-sm font-black text-gray-300">{formatDateShort(session.date).split(' ')[0]}</p>
                  <p className="text-[10px] font-semibold text-gray-600 uppercase">{formatDateShort(session.date).split(' ').slice(1).join(' ')}</p>
                </div>
                <div className="w-px h-8 bg-white/[0.06] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-semibold text-white leading-snug">{session.title}</p>
                    {session.compTag && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        {session.compTag}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-600">{session.time} · com {session.host}</p>
                </div>
                <span className="shrink-0 text-[10px] font-semibold text-gray-600 border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 rounded-full">
                  Em breve
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recordings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white">Gravações anteriores</h2>
          <span className="text-[11px] text-gray-600">{RECORDINGS.length} disponíveis</span>
        </div>
        <div className="space-y-2">
          {RECORDINGS.map((rec) => (
            <div key={rec.id} className={`card-dark rounded-2xl p-4 flex items-start gap-4 transition-all ${rec.recordingUrl ? 'hover:border-white/[0.10]' : 'opacity-75'}`}>
              {/* Play icon */}
              <div className={`shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center mt-0.5 ${rec.recordingUrl ? 'bg-purple-700/15 border-purple-600/25' : 'bg-white/[0.04] border-white/[0.06]'}`}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className={`ml-0.5 ${rec.recordingUrl ? 'text-purple-400' : 'text-gray-600'}`}>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-semibold text-white leading-snug">{rec.title}</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-2">{rec.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {rec.compTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-gray-500"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="text-[11px] text-gray-700">{rec.duration}</span>
                  <span className="text-gray-800">·</span>
                  <span className="text-[11px] text-gray-700">{formatDate(rec.date)}</span>
                </div>
              </div>

              {rec.recordingUrl ? (
                <a
                  href={rec.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Assistir
                </a>
              ) : (
                <span className="shrink-0 text-[10px] font-semibold text-gray-600 border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 rounded-full">
                  Em breve
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer — why it matters */}
      <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Grupos pequenos', desc: 'Até 40 alunos por sessão — qualidade e espaço para perguntas.' },
          { label: 'Gravação disponível', desc: 'Não pôde ao vivo? Acesse a gravação logo após cada sessão.' },
          { label: 'Toda semana', desc: 'Sessões fixas para manter o ritmo durante todo o ciclo.' },
        ].map((item, i) => (
          <div key={i} className="card-dark rounded-2xl px-4 py-3">
            <p className="text-[12px] font-semibold text-gray-300 mb-0.5">{item.label}</p>
            <p className="text-[11px] text-gray-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
