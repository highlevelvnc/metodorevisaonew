'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Submit feedback for a correction.
 * Upserts — one feedback per correction per user.
 */
export async function submitCorrectionFeedback(params: {
  correctionId: string
  rating: number
  testimonial?: string
  allowPublic?: boolean
}): Promise<boolean> {
  const { correctionId, rating, testimonial, allowPublic } = params
  if (!correctionId || rating < 1 || rating > 5) return false

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { error } = await db
    .from('correction_feedback')
    .upsert(
      {
        correction_id: correctionId,
        user_id: user.id,
        rating,
        testimonial: testimonial?.trim() || null,
        allow_public: allowPublic ?? false,
      },
      { onConflict: 'correction_id,user_id' }
    )

  if (error) {
    console.error('[feedback] Submit failed:', error.message)
    return false
  }

  return true
}
