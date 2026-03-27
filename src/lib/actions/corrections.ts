'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { Annotation } from '@/lib/annotations'

export type ScoreKey = 'c1' | 'c2' | 'c3' | 'c4' | 'c5'
export type Scores = Record<ScoreKey, number>

export type CorrectionState = { error?: string; success?: boolean } | null

/** Salva rascunho (status → in_review) ou envia devolutiva final (status → corrected) */
export async function saveCorrection(
  essayId: string,
  isDraft: boolean,
  scores: Scores,
  feedback: string,
  nextEssayId?: string,
  annotations?: Annotation[],
): Promise<CorrectionState> {
  if (!essayId) return { error: 'ID da redação inválido.' }

  const allScored = Object.values(scores).every(s => [0, 40, 80, 120, 160, 200].includes(s))
  if (!allScored) return { error: 'Pontuação inválida. Use 0, 40, 80, 120, 160 ou 200 em cada competência.' }

  if (!isDraft && feedback.trim().length < 50)
    return { error: 'Escreva pelo menos 50 caracteres de feedback antes de enviar.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar role
  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const profileData = profile as { role: string; full_name: string } | null
  if (!profileData || !['admin', 'reviewer'].includes(profileData.role))
    return { error: 'Sem permissão para corrigir redações.' }

  // Verificar se a redação existe e pertence à fila
  const { data: essay } = await supabase
    .from('essays')
    .select('id, status, student_id')
    .eq('id', essayId)
    .single()

  if (!essay) return { error: 'Redação não encontrada.' }

  const total = scores.c1 + scores.c2 + scores.c3 + scores.c4 + scores.c5
  const now   = new Date().toISOString()

  // ── Insert or update correction ─────────────────────────────────────────────
  const correctionData = {
    reviewer_id:      user.id,
    reviewer_name:    profileData.full_name,
    c1_score:         scores.c1,
    c2_score:         scores.c2,
    c3_score:         scores.c3,
    c4_score:         scores.c4,
    c5_score:         scores.c5,
    total_score:      total,
    general_feedback: feedback,
    corrected_at:     now,
    // annotations: JSONB column from migration 004.
    // Only update if the caller passed an array (preserves existing value during
    // legacy calls that don't yet pass annotations).
    ...(annotations !== undefined ? { annotations: annotations ?? [] } : {}),
  }

  const { data: existing } = await supabase
    .from('corrections')
    .select('id')
    .eq('essay_id', essayId)
    .maybeSingle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  let corrErr: { message: string } | null = null
  if (existing) {
    ;({ error: corrErr } = await db
      .from('corrections')
      .update(correctionData)
      .eq('essay_id', essayId))
  } else {
    ;({ error: corrErr } = await db
      .from('corrections')
      .insert({ essay_id: essayId, ...correctionData }))
  }

  if (corrErr) {
    console.error('[saveCorrection] DB error:', corrErr.message)
    return { error: 'Erro ao salvar. Tente novamente.' }
  }

  // ── Atualizar status da redação ─────────────────────────────────────────────
  const newStatus = isDraft ? 'in_review' : 'corrected'
  const { error: statusErr } = await db
    .from('essays').update({ status: newStatus }).eq('id', essayId)

  if (statusErr) {
    console.error('[saveCorrection] Failed to update essay status:', statusErr.message)
    // Correction was saved — only the status update failed. Return error so reviewer is aware.
    if (!isDraft) return { error: 'Correção salva, mas erro ao atualizar status. Recarregue e tente enviar novamente.' }
  }

  // Revalidar caches das páginas afetadas
  revalidatePath('/professor/redacoes')
  revalidatePath(`/professor/redacoes/${essayId}`)
  revalidatePath(`/aluno/redacoes/${essayId}`)
  revalidatePath('/aluno')
  revalidatePath('/aluno/redacoes')

  if (!isDraft) redirect(nextEssayId ? `/professor/redacoes/${nextEssayId}` : '/professor/redacoes')

  return { success: true }
}
