import Link from 'next/link'
import { Play, Lock, ArrowRight, CheckCircle2 } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  duration: string
  category: string
  completed: boolean
  locked: boolean
  thumbnailGradient: string
}

const LESSONS: Lesson[] = [
  { id: '1', title: 'Como estruturar a introdução em 3 passos',      duration: '12 min', category: 'Estrutura',  completed: true,  locked: false, thumbnailGradient: 'from-purple-800/60 to-purple-600/20' },
  { id: '2', title: 'Repertório que convence: dados e autores certos', duration: '18 min', category: 'C3',        completed: false, locked: false, thumbnailGradient: 'from-blue-800/60 to-blue-600/20'   },
  { id: '3', title: 'A proposta de intervenção perfeita — 4 elementos', duration: '22 min', category: 'C5',       completed: false, locked: false, thumbnailGradient: 'from-emerald-800/60 to-emerald-600/20' },
  { id: '4', title: 'Conectivos avançados para coesão máxima',        duration: '15 min', category: 'C4',        completed: false, locked: true,  thumbnailGradient: 'from-amber-800/60 to-amber-600/20' },
  { id: '5', title: 'Leitura de textos motivadores no ENEM',          duration: '10 min', category: 'C2',        completed: false, locked: true,  thumbnailGradient: 'from-rose-800/60 to-rose-600/20'   },
  { id: '6', title: 'Norma culta: regras que mais caem no ENEM',      duration: '20 min', category: 'C1',        completed: false, locked: true,  thumbnailGradient: 'from-indigo-800/60 to-indigo-600/20' },
]

function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <Link
      href={lesson.locked ? '#' : `/aluno/aulas/${lesson.id}`}
      className={`group block rounded-xl overflow-hidden border border-white/[0.07] bg-white/[0.02] transition-all ${
        lesson.locked ? 'opacity-60 cursor-not-allowed' : 'hover:border-white/[0.14] hover:bg-white/[0.04]'
      }`}
      onClick={e => lesson.locked && e.preventDefault()}
    >
      {/* Thumbnail */}
      <div className={`relative h-28 bg-gradient-to-br ${lesson.thumbnailGradient} flex items-center justify-center`}>
        <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          {lesson.locked
            ? <Lock size={14} className="text-white/60" />
            : lesson.completed
              ? <CheckCircle2 size={16} className="text-green-400" />
              : <Play size={14} className="text-white ml-0.5" fill="white" />
          }
        </div>
        {lesson.completed && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
            <CheckCircle2 size={9} />
            Assistido
          </div>
        )}
        {lesson.locked && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/30 border border-white/10 text-gray-400 text-[10px] px-1.5 py-0.5 rounded-full">
            <Lock size={9} />
            Premium
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">
            {lesson.category}
          </span>
          <span className="text-[10px] text-gray-600">{lesson.duration}</span>
        </div>
        <p className="text-xs font-medium text-gray-300 leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {lesson.title}
        </p>
      </div>
    </Link>
  )
}

export function LessonsGrid() {
  return (
    <div className="card-dark rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Play size={14} className="text-purple-400" />
            Videoaulas
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">Aprenda as técnicas que elevam sua nota</p>
        </div>
        <Link href="/aluno/aulas" className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
          Ver todas <ArrowRight size={11} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {LESSONS.map(lesson => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </div>
  )
}
