'use client'

import { useState, useCallback } from 'react'
import { ThumbsUp, ThumbsDown, Send, Check } from 'lucide-react'
import { submitCorrectionFeedback } from '@/lib/actions/feedback'

interface FeedbackWidgetProps {
  correctionId: string
  /** If feedback was already given, skip the widget */
  alreadyGiven: boolean
}

type Step = 'ask' | 'testimonial' | 'done'

export function FeedbackWidget({ correctionId, alreadyGiven }: FeedbackWidgetProps) {
  const [step, setStep] = useState<Step>(alreadyGiven ? 'done' : 'ask')
  const [rating, setRating] = useState<number | null>(null)
  const [testimonial, setTestimonial] = useState('')
  const [allowPublic, setAllowPublic] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleRate = useCallback(async (value: number) => {
    setRating(value)
    setSubmitting(true)
    try {
      await submitCorrectionFeedback({ correctionId, rating: value })
      // If positive, offer testimonial. If negative, just thank.
      if (value >= 4) {
        setStep('testimonial')
      } else {
        setStep('done')
      }
    } finally {
      setSubmitting(false)
    }
  }, [correctionId])

  const handleTestimonial = useCallback(async () => {
    if (!testimonial.trim() || !rating) return
    setSubmitting(true)
    try {
      await submitCorrectionFeedback({
        correctionId,
        rating,
        testimonial: testimonial.trim(),
        allowPublic,
      })
      setStep('done')
    } finally {
      setSubmitting(false)
    }
  }, [correctionId, rating, testimonial, allowPublic])

  // Don't render if already given
  if (step === 'done' && alreadyGiven) return null

  return (
    <div className="card-dark rounded-2xl p-5 mb-6">
      {step === 'ask' && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-white mb-0.5">
              Essa devolutiva te ajudou?
            </p>
            <p className="text-xs text-gray-600">
              Seu feedback melhora as próximas correções
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleRate(5)}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-green-500/20 bg-green-500/[0.05] hover:bg-green-500/[0.1] text-green-400 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <ThumbsUp size={14} />
              Sim, ajudou
            </button>
            <button
              type="button"
              onClick={() => handleRate(2)}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-gray-400 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <ThumbsDown size={14} />
              Não muito
            </button>
          </div>
        </div>
      )}

      {step === 'testimonial' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Check size={14} className="text-green-400" />
            <p className="text-sm font-semibold text-white">Obrigado! Quer compartilhar um comentário?</p>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Opcional — se permitir, podemos usar anonimamente como depoimento.
          </p>
          <textarea
            value={testimonial}
            onChange={e => setTestimonial(e.target.value)}
            placeholder="Ex: A devolutiva me mostrou exatamente onde focar para subir a nota..."
            rows={3}
            maxLength={500}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-purple-500/40 resize-none mb-3"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowPublic}
                onChange={e => setAllowPublic(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-white/20 bg-white/[0.04] text-purple-600 focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-[11px] text-gray-500">
                Permitir uso anônimo como depoimento
              </span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('done')}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Pular
              </button>
              <button
                type="button"
                onClick={handleTestimonial}
                disabled={!testimonial.trim() || submitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Send size={11} />
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'done' && !alreadyGiven && (
        <div className="flex items-center gap-2">
          <Check size={14} className="text-green-400" />
          <p className="text-sm text-gray-400">Obrigado pelo seu feedback!</p>
        </div>
      )}
    </div>
  )
}
