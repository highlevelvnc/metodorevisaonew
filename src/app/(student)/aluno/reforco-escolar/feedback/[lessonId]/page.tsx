import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FeedbackForm from './FeedbackForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Avaliar aula | Método Revisão', robots: { index: false } }

export default async function LessonFeedbackPage({
  params,
}: {
  params: Promise<{ lessonId: string }>
}) {
  const { lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Fetch lesson details
  const { data: lesson } = await db
    .from('lesson_sessions')
    .select('id, session_date, subject, status, professor_id, users!lesson_sessions_professor_id_fkey(full_name)')
    .eq('id', lessonId)
    .eq('student_id', user.id)
    .eq('status', 'completed')
    .single()

  if (!lesson) redirect('/aluno/reforco-escolar')

  // Check if already submitted
  const { data: existing } = await db
    .from('lesson_feedback')
    .select('id, rating')
    .eq('lesson_id', lessonId)
    .eq('student_id', user.id)
    .maybeSingle()

  const dateLabel = (() => {
    const d = new Date(lesson.session_date + 'T12:00:00')
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
  })()

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="card-dark rounded-2xl p-6">
        {existing ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">✓</p>
            <p className="text-sm font-bold text-white mb-1">Avaliação enviada!</p>
            <p className="text-xs text-gray-500">
              Você avaliou esta aula com {existing.rating} estrela{existing.rating !== 1 ? 's' : ''}. Obrigado pelo feedback!
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <p className="text-sm font-bold text-white mb-1">Como foi sua aula?</p>
              <p className="text-xs text-gray-500">
                {lesson.subject ? `${lesson.subject} — ` : ''}{dateLabel}
                {lesson.users?.full_name ? ` com ${lesson.users.full_name}` : ''}
              </p>
            </div>
            <FeedbackForm
              lessonId={lessonId}
              professorId={lesson.professor_id}
              subject={lesson.subject}
            />
          </>
        )}
      </div>
    </div>
  )
}
