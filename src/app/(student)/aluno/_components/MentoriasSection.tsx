import Link from 'next/link'
import { ArrowRight, Users, Calendar, Clock, Video } from 'lucide-react'

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
    title: 'Proposta de Intervenção: acertando os 4 elementos',
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
    date: 'Gravação',
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
    <div className="card-dark rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Users size={14} className="text-purple-400" />
            Mentorias em Grupo
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">Sessões ao vivo com especialistas ENEM</p>
        </div>
        <Link href="/aluno/mentorias" className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
          Ver agenda <ArrowRight size={11} />
        </Link>
      </div>

      <div className="space-y-3">
        {SESSIONS.map(s => (
          <div
            key={s.id}
            className="group rounded-xl border border-white/[0.07] p-3.5 hover:border-white/[0.12] hover:bg-white/[0.02] transition-all"
          >
            <div className="flex items-start gap-3">
              {/* Type icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${
                s.type === 'live'
                  ? 'bg-red-500/10 border border-red-500/20'
                  : 'bg-gray-500/10 border border-gray-500/20'
              }`}>
                {s.type === 'live'
                  ? <Video size={13} className="text-red-400" />
                  : <Clock size={13} className="text-gray-400" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-200 leading-snug">{s.title}</p>
                  {s.enrolled && (
                    <span className="shrink-0 text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded">
                      Inscrito
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  {s.type === 'live' ? (
                    <>
                      <span className="flex items-center gap-1 text-[11px] text-gray-600">
                        <Calendar size={9} /> {s.date} às {s.time}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-600">
                        <Clock size={9} /> {s.duration}
                      </span>
                      {s.spots > 0 && (
                        <span className="text-[11px] text-amber-400/80">
                          {s.spots} vagas restantes
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[11px] text-gray-600">{s.duration} · Assista quando quiser</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-600 mt-1">{s.host}</p>
              </div>
            </div>

            <div className="mt-3">
              <Link
                href={`/aluno/mentorias/${s.id}`}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  s.enrolled
                    ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                    : s.type === 'recorded'
                      ? 'bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-gray-300'
                      : 'bg-purple-600/15 border-purple-500/25 text-purple-400 hover:bg-purple-600/25'
                }`}
              >
                {s.enrolled ? (
                  <><Video size={11} /> Entrar na sala</>
                ) : s.type === 'recorded' ? (
                  <><Clock size={11} /> Assistir gravação</>
                ) : (
                  <><Calendar size={11} /> Reservar vaga</>
                )}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
