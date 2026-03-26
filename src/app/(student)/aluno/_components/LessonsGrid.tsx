import Link from 'next/link'
import { Play, Lock, ArrowRight, CheckCircle2 } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  duration: string
  category: string
  completed: boolean
  locked: boolean
  hue: string // tailwind gradient pair
}

const LESSONS: Lesson[] = [
  { id: '1', title: 'Como estruturar a introdução em 3 passos',          duration: '12 min', category: 'Estrutura',  completed: true,  locked: false, hue: 'from-violet-900/70 to-violet-700/30'  },
  { id: '2', title: 'Repertório que convence: dados e autores certos',   duration: '18 min', category: 'C3',        completed: false, locked: false, hue: 'from-blue-900/70 to-blue-700/30'      },
  { id: '3', title: 'A proposta de intervenção perfeita — 4 elementos',  duration: '22 min', category: 'C5',        completed: false, locked: false, hue: 'from-emerald-900/70 to-emerald-700/30' },
  { id: '4', title: 'Conectivos avançados para coesão máxima',           duration: '15 min', category: 'C4',        completed: false, locked: true,  hue: 'from-amber-900/70 to-amber-700/30'    },
  { id: '5', title: 'Leitura de textos motivadores no ENEM',             duration: '10 min', category: 'C2',        completed: false, locked: true,  hue: 'from-rose-900/70 to-rose-700/30'      },
  { id: '6', title: 'Norma culta: as regras que mais caem no ENEM',      duration: '20 min', category: 'C1',        completed: false, locked: true,  hue: 'from-indigo-900/70 to-indigo-700/30'  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Estrutura: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  C1: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  C2: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  C3: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  C4: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  C5: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
}

function LessonCard({ lesson }: { lesson: Lesson }) {
  const catColor = CATEGORY_COLORS[lesson.category] ?? 'text-gray-400 bg-white/[0.05] border-white/[0.08]'

  return (
    <Link
      href={lesson.locked ? '#' : `/aluno/aulas/${lesson.id}`}
      onClick={e => lesson.locked && e.preventDefault()}
      className={`group flex flex-col rounded-xl overflow-hidden border transition-all ${
        lesson.locked
          ? 'border-white/[0.05] opacity-55 cursor-not-allowed'
          : 'border-white/[0.08] hover:border-white/[0.15] hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
      }`}
    >
      {/* Thumbnail */}
      <div className={`relative h-24 bg-gradient-to-br ${lesson.hue} flex items-center justify-center`}>
        {/* Play button */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-transform ${
          lesson.locked
            ? 'bg-black/30 border-white/10'
            : 'bg-black/40 border-white/15 group-hover:scale-110 group-hover:bg-black/50'
        }`}>
          {lesson.locked
            ? <Lock size={12} className="text-white/50" />
            : lesson.completed
              ? <CheckCircle2 size={14} className="text-green-400" />
              : <Play size={12} className="text-white ml-0.5" fill="white" />
          }
        </div>

        {/* Badges */}
        {lesson.completed && (
          <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-semibold text-green-400 bg-green-500/20 border border-green-500/30 px-1.5 py-0.5 rounded-full">
            <CheckCircle2 size={8} />
            Assistido
          </div>
        )}
        {lesson.locked && (
          <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] text-gray-500 bg-black/30 border border-white/[0.07] px-1.5 py-0.5 rounded-full">
            <Lock size={8} />
            Premium
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-white/[0.02]">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${catColor}`}>
            {lesson.category}
          </span>
          <span className="text-[10px] text-gray-700 tabular-nums">{lesson.duration}</span>
        </div>
        <p className="text-[12px] font-medium text-gray-400 leading-snug line-clamp-2 group-hover:text-gray-200 transition-colors">
          {lesson.title}
        </p>
      </div>
    </Link>
  )
}

export function LessonsGrid() {
  const unlocked   = LESSONS.filter(l => !l.locked).length
  const completed  = LESSONS.filter(l => l.completed).length

  return (
    <div className="card-dark rounded-2xl p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Play size={14} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold text-white">Videoaulas</h2>
            <p className="text-[11px] text-gray-600 mt-0.5">
              {completed}/{unlocked} assistidas
            </p>
          </div>
        </div>
        <Link
          href="/aluno/aulas"
          className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-purple-400 transition-colors"
        >
          Ver todas <ArrowRight size={10} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {LESSONS.map(lesson => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </div>
  )
}
