'use server'

import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'
import { trackProductEvent } from '@/lib/analytics'

/**
 * Generate a share token for an essay.
 * Only the essay owner can generate a share link.
 * Returns the token (or existing token if already shared).
 */
export async function generateShareToken(essayId: string): Promise<string | null> {
  if (!essayId) return null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Verify ownership and corrected status
  const { data: essay } = await db
    .from('essays')
    .select('id, student_id, status, share_token')
    .eq('id', essayId)
    .single()

  if (!essay || essay.student_id !== user.id || essay.status !== 'corrected') return null

  // Return existing token if already shared
  if (essay.share_token) return essay.share_token as string

  // Generate a URL-safe token
  const token = randomBytes(16).toString('base64url')

  const { error } = await db
    .from('essays')
    .update({ share_token: token })
    .eq('id', essayId)
    .eq('student_id', user.id)

  if (error) {
    console.error('[share] Failed to generate token:', error.message)
    return null
  }

  trackProductEvent('share_link_generated', user.id, { essay_id: essayId })

  return token
}

/**
 * Revoke a share token (make the essay private again).
 */
export async function revokeShareToken(essayId: string): Promise<boolean> {
  if (!essayId) return false

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { error } = await db
    .from('essays')
    .update({ share_token: null })
    .eq('id', essayId)
    .eq('student_id', user.id)

  if (error) {
    console.error('[share] Failed to revoke token:', error.message)
    return false
  }

  return true
}
