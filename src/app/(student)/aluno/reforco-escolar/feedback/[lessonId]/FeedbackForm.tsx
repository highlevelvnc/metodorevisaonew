'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function FeedbackForm({
  lessonId,
  professorId,
  subject,
}: {
  lessonId: string
  professorId: string | null
  subject: string | null
}) {
  const router = useRouter()
  const [rating, setRating]   = useState(0)
  const [hover, setHover]     = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving]   = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit() {
    if (rating === 0) { setError('Selecione uma nota'); return }
    setSaving(true)
    setError(null)

    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertErr } = await (supabase as any)
      .from('lesson_feedback')
      .insert({
        lesson_id: lessonId,
        student_id: (await supabase.auth.getUser()).data.user?.id,
        professor_id: professorId,
        subject,
        rating,
        comment: comment.trim() || null,
      })

    setSaving(false)
    if (insertErr) {
      if (insertErr.message?.includes('lesson_feedback_unique')) {
        setError('Você já avaliou esta aula.')
      } else {
        setError('Erro ao enviar. Tente novamente.')
      }
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <p className="text-2xl mb-2">🎉</p>
        <p className="text-sm font-bold text-white mb-1">Obrigado pelo feedback!</p>
        <p className="text-xs text-gray-500 mb-4">Sua avaliação ajuda a melhorar as aulas para todos.</p>
        <button
          onClick={() => router.push('/aluno/reforco-escolar')}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
        >
          Voltar para minhas aulas →
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Star rating */}
      <div className="flex justify-center gap-1 mb-6">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <svg
              width="32" height="32" viewBox="0 0 24 24"
              fill={star <= (hover || rating) ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="1.5"
              className={star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-600'}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>

      {/* Rating label */}
      {rating > 0 && (
        <p className="text-center text-xs text-gray-500 mb-4">
          {['', 'Ruim', 'Regular', 'Boa', 'Muito boa', 'Excelente'][rating]}
        </p>
      )}

      {/* Comment */}
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Quer deixar um comentário? (opcional)"
        rows={3}
        maxLength={500}
        className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/50 resize-none mb-4"
      />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={saving || rating === 0}
        className="btn-primary w-full justify-center disabled:opacity-50"
      >
        {saving ? 'Enviando...' : 'Enviar avaliação'}
      </button>

      {error && <p className="text-xs text-red-400 text-center mt-2">{error}</p>}
    </div>
  )
}
