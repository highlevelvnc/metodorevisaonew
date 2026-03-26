import Link from 'next/link'
import { ArrowRight, Users, Calendar, Clock, Video, Radio } from 'lucide-react'

interface Session {
  id: string
  title: string
  date: string
  time: string
  duration: string
  host: string
  spots: number
  enrolled: boolean
  type: 'live' | 'recorded'
}

const SESSIONS: Session[] = [
  {
    id: '1',
    title: 'Proposta de Intervenção: os 4 elementos na prática',
    date: 'Qui, 27 Mar',
    time: '20h00',
    duration: '60 min',
    host: 'Prof. Camila Torres',
    spots: 12,
    enrolled: true,
    type: 'live',
  },
  {
    id: '2',
    title: 'Repertório Sociológico para Ciências Humanas',
    date: 'Sáb, 29 Mar',
    time: '10h00',
    duration: '90 min',
    host: 'Prof. Rafael Nogueira',
    spots: 8,
    enrolled: false,
    type: 'live',
  },
  {
    id: '3',
    title: 'Estratégia C3: como usar dados sem memorizar',
    date: 'Gravação disponível',
    time: '—',
    duration: '45 min',
    host: 'Prof. Ana Lima',
    spots: 0,
    enrolled: false,
    type: 'recorded',
  },
]

export function MentoriasSection() {
  return (
    <div className="card-dark rounded-2xl p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Users size={14} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold text-white">Mentorias em Grupo</h2>
            <p className="text-[11px] text-gray-600 mt-0.5">Sessões ao vivo com especialistas</p>
          </div>
        </div>
        <Link
          href="/aluno/mentorias"
          className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-purple-400 transition-colors"
        >
          Agenda <ArrowRight size={10} />
        </Link>
      </div>

      <div className="flex-1 space-y-3">
        {SESSIONS.map(s => (
          <div
            key={s.id}
            className="rounded-xl border border-white/[0.07] p-4 hover:border-white/[0.12] hover:bg-white/[0.02] transition-all"
          >
            <div className="flex items-start gap-3">
              {/* Type icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${
                s.type === 'live'
                  ? 'bg-red-500/10 border-red-500/20'
                  : 'bg-white/[0.04] border-white/[0.07]'
              }`}>
                {s.type === 'live'
                  ? <Radio size={13} className="text-red-400" />
                  : <Clock size={13} className="text-gray-500" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1.5">
                  <p className="flex-1 text-[13px] font-medium text-gray-200 leading-snug">
                    {s.title}
                  </p>
                  {s.enrolled && (
                    <span className="shrink-0 text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded">
                      Inscrito
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                  {s.type === 'live' ? (
                    <>
                      <span className="flex items-center gap-1 text-[11px] text-gray-600">
                        <Calendar size={9} className="text-gray-700" />
                        {s.date} às {s.time}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-600">
                        <Clock size={9} className="text-gray-700" />
                        {s.duration}
                      </span>
                    </>
                  ) : (
                    <span className="text-[11px] text-gray-600">{s.date} · {s.duration}</span>
                  )}
                </div>

                <p className="text-[10px] text-gray-700 mb-3">{s.host}</p>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/aluno/mentorias/${s.id}`}
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                      s.enrolled
                        ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                        : s.type === 'recorded'
                          ? 'bg-white/[0.04] border-white/[0.07] text-gray-500 hover:text-gray-300 hover:border-white/[0.12]'
                          : 'bg-purple-600/15 border-purple-500/25 text-purple-400 hover:bg-purple-600/25 hover:text-purple-300'
                    }`}
                  >
                    {s.enrolled
                      ? <><Video size={11} /> Entrar na sala</>
                      : s.type === 'recorded'
                        ? <><Clock size={11} /> Assistir gravação</>
                        : <><Calendar size={11} /> Reservar vaga</>
                    }
                  </Link>

                  {s.type === 'live' && s.spots > 0 && !s.enrolled && (
                    <span className="text-[10px] text-amber-400/80 font-medium">
                      {s.spots} vagas
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
