'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// ── Types ────────────────────────────────────────────────────────────────────

export type ZeroReason =
  | 'fuga_total_tema'
  | 'texto_insuficiente'
  | 'copia_motivadores'
  | 'improperio'
  | 'redacao_em_branco'
  | 'parte_desconectada'

export const ZERO_REASON_LABELS: Record<ZeroReason, string> = {
  fuga_total_tema:       'Fuga total ao tema',
  texto_insuficiente:    'Texto insuficiente (menos de 7 linhas)',
  copia_motivadores:     'Cópia dos textos motivadores',
  improperio:            'Impropério / desrespeito',
  redacao_em_branco:     'Redação em branco',
  parte_desconectada:    'Parte desconectada do tema proposto',
}

export type ZeroEssayState = { error?: string; success?: boolean } | null

export type StudentHistoryEssay = {
  id: string
  theme_title: string
  submitted_at: string
  status: string
  total_score: number | null
  c1_score: number | null
  c2_score: number | null
  c3_score: number | null
  c4_score: number | null
  c5_score: number | null
  reviewer_name: string | null
  is_zeroed: boolean
}

export type SimilarityResult = {
  essayId: string
  themeTitle: string
  submittedAt: string
  similarity: number          // 0–1
  level: 'low' | 'medium' | 'high'
  matchingPhrases: string[]   // up to 3 highlighted excerpts
}

export type StudentHistoryResult = {
  essays: StudentHistoryEssay[]
  avgScore: number | null
  bestScore: number | null
  latestScore: number | null
  weakestComp: string | null  // 'c1'–'c5'
  correctedCount: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getReviewerRole(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const p = profile as { role: string; full_name: string } | null
  if (!p || !['admin', 'reviewer'].includes(p.role))
    return { user: null, profile: null }

  return { user, profile: p }
}

/**
 * Normalized trigram similarity score between two strings.
 * Returns a value between 0.0 (no match) and 1.0 (identical).
 */
function trigramSimilarity(a: string, b: string): number {
  const ngrams = (str: string, n: number): Set<string> => {
    const s = str.toLowerCase().replace(/\s+/g, ' ').trim()
    const result = new Set<string>()
    for (let i = 0; i <= s.length - n; i++) result.add(s.slice(i, i + n))
    return result
  }
  const ta = ngrams(a, 3)
  const tb = ngrams(b, 3)
  if (ta.size === 0 || tb.size === 0) return 0
  let overlap = 0
  ta.forEach(g => { if (tb.has(g)) overlap++ })
  return (2 * overlap) / (ta.size + tb.size)
}

/** Extract up to 3 short phrases (≥ 40 chars) that appear in both texts. */
function findMatchingPhrases(source: string, target: string, max = 3): string[] {
  const phrases: string[] = []
  const sentences = source.split(/[.!?\n]/).map(s => s.trim()).filter(s => s.length >= 40)
  for (const sentence of sentences) {
    if (phrases.length >= max) break
    if (target.toLowerCase().includes(sentence.toLowerCase().slice(0, 40))) {
      phrases.push(sentence.length > 80 ? sentence.slice(0, 80) + '…' : sentence)
    }
  }
  return phrases
}

// ── Actions ──────────────────────────────────────────────────────────────────

/**
 * Zero an essay: sets all competency scores to 0, marks is_zeroed = true,
 * stores the reason + note, and sets essay status to 'corrected' so the
 * student can see the result and the explanation.
 *
 * This is intentionally destructive and hard to trigger — it requires
 * an explicit reason and passes through a confirmation modal in the UI.
 */
export async function zeroEssay(
  essayId: string,
  reason: ZeroReason,
  note: string | null,
  reviewerName?: string,
): Promise<ZeroEssayState> {
  if (!essayId) return { error: 'ID da redação inválido.' }
  if (!reason)  return { error: 'Selecione um motivo para o zeramento.' }

  const supabase = await createClient()
  const { user, profile } = await getReviewerRole(supabase)
  if (!user || !profile) return { error: 'Sem permissão para zerar redações.' }

  const name = reviewerName ?? profile.full_name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Verify essay exists
  const { data: essay } = await db.from('essays').select('id').eq('id', essayId).single()
  if (!essay) return { error: 'Redação não encontrada.' }

  // Build the zero correction payload
  const correctionPayload = {
    reviewer_id:      user.id,
    reviewer_name:    name,
    c1_score:         0,
    c2_score:         0,
    c3_score:         0,
    c4_score:         0,
    c5_score:         0,
    total_score:      0,
    general_feedback: `⚠️ **Redação zerada — ${ZERO_REASON_LABELS[reason]}**\n\n${note ?? 'Nenhuma observação adicional.'}`,
    corrected_at:     new Date().toISOString(),
    is_zeroed:        true,
    zero_reason:      reason,
    zero_note:        note,
  }

  // Upsert correction
  const { data: existing } = await db
    .from('corrections')
    .select('id')
    .eq('essay_id', essayId)
    .maybeSingle()

  let corrErr: { message: string } | null = null
  if (existing) {
    ;({ error: corrErr } = await db
      .from('corrections')
      .update(correctionPayload)
      .eq('essay_id', essayId))
  } else {
    ;({ error: corrErr } = await db
      .from('corrections')
      .insert({ essay_id: essayId, ...correctionPayload }))
  }

  if (corrErr) {
    console.error('[zeroEssay] DB error:', corrErr.message)
    return { error: 'Erro ao salvar. Tente novamente.' }
  }

  // Mark essay as corrected
  const { error: statusErr } = await db
    .from('essays')
    .update({ status: 'corrected' })
    .eq('id', essayId)

  if (statusErr) {
    console.error('[zeroEssay] Status update error:', statusErr.message)
    return { error: 'Zeramento salvo, mas erro ao atualizar status. Recarregue a página.' }
  }

  revalidatePath('/professor/redacoes')
  revalidatePath(`/professor/redacoes/${essayId}`)
  revalidatePath(`/aluno/redacoes/${essayId}`)
  revalidatePath('/aluno/redacoes')
  revalidatePath('/aluno')

  redirect('/professor/redacoes')
}

/**
 * Fetch the correction history for a student.
 * Used by the StudentHistoryPanel on the professor correction page.
 * Only reviewers and admins can call this.
 */
export async function fetchStudentHistory(studentId: string): Promise<StudentHistoryResult | null> {
  if (!studentId) return null

  const supabase = await createClient()
  const { user, profile } = await getReviewerRole(supabase)
  if (!user || !profile) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: essaysRaw } = await db
    .from('essays')
    .select('id, theme_title, submitted_at, status, corrections(total_score, c1_score, c2_score, c3_score, c4_score, c5_score, reviewer_name, is_zeroed)')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })
    .limit(50)

  if (!essaysRaw) return { essays: [], avgScore: null, bestScore: null, latestScore: null, weakestComp: null, correctedCount: 0 }

  type RawEssay = {
    id: string; theme_title: string; submitted_at: string; status: string
    corrections: Array<{
      total_score: number; c1_score: number; c2_score: number; c3_score: number
      c4_score: number; c5_score: number; reviewer_name: string; is_zeroed: boolean
    }>
  }

  const essays: StudentHistoryEssay[] = (essaysRaw as RawEssay[]).map(e => {
    const c = e.corrections?.[0] ?? null
    return {
      id:            e.id,
      theme_title:   e.theme_title,
      submitted_at:  e.submitted_at,
      status:        e.status,
      total_score:   c?.total_score ?? null,
      c1_score:      c?.c1_score ?? null,
      c2_score:      c?.c2_score ?? null,
      c3_score:      c?.c3_score ?? null,
      c4_score:      c?.c4_score ?? null,
      c5_score:      c?.c5_score ?? null,
      reviewer_name: c?.reviewer_name ?? null,
      is_zeroed:     c?.is_zeroed ?? false,
    }
  })

  const corrected = essays.filter(e => e.status === 'corrected' && e.total_score !== null && !e.is_zeroed)
  const scores    = corrected.map(e => e.total_score as number)
  const avgScore  = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
  const bestScore = scores.length > 0 ? Math.max(...scores) : null
  const latestScore = corrected[0]?.total_score ?? null

  // Find recurring weakest competency (lowest average across corrected essays)
  let weakestComp: string | null = null
  if (corrected.length >= 2) {
    const compKeys = ['c1_score', 'c2_score', 'c3_score', 'c4_score', 'c5_score'] as const
    const compAvgs = compKeys.map(k => {
      const vals = corrected.map(e => (e[k] as number | null) ?? 0)
      return { key: k.replace('_score', ''), avg: vals.reduce((a, b) => a + b, 0) / vals.length }
    })
    weakestComp = compAvgs.reduce((a, b) => a.avg <= b.avg ? a : b).key
  }

  return { essays, avgScore, bestScore, latestScore, weakestComp, correctedCount: corrected.length }
}

/**
 * Detect similarity between the current essay and previous essays.
 *
 * V1 — internal review only, not a plagiarism verdict:
 *   1. Compare against previous essays from the same student
 *   2. Compare against a sample of recent platform essays from other students
 *
 * Returns results sorted by similarity descending.
 */
export async function detectSimilarity(
  essayId: string,
  contentText: string,
  studentId: string,
): Promise<SimilarityResult[] | null> {
  if (!essayId || !contentText || contentText.startsWith('[IMAGEM]')) return null

  const supabase = await createClient()
  const { user, profile } = await getReviewerRole(supabase)
  if (!user || !profile) return null

  // Minimum meaningful text length for comparison
  if (contentText.trim().length < 150) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Fetch recent essays for comparison (same student + platform sample)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  let sameStudentRaw: unknown[] | null = null
  let platformRaw:    unknown[] | null = null

  try {
    const results = await Promise.all([
      // All other essays from this student
      db.from('essays')
        .select('id, theme_title, submitted_at, content_text')
        .eq('student_id', studentId)
        .neq('id', essayId)
        .not('content_text', 'is', null)
        .order('submitted_at', { ascending: false })
        .limit(20),

      // Sample of recent platform essays from other students (text only)
      db.from('essays')
        .select('id, theme_title, submitted_at, content_text')
        .neq('student_id', studentId)
        .neq('id', essayId)
        .not('content_text', 'is', null)
        .gte('submitted_at', thirtyDaysAgo)
        .order('submitted_at', { ascending: false })
        .limit(50),
    ])
    sameStudentRaw = results[0].data ?? []
    platformRaw    = results[1].data ?? []
  } catch (queryErr) {
    console.error('[detectSimilarity] Query failed:', queryErr)
    return null
  }

  type RawEssay = { id: string; theme_title: string; submitted_at: string; content_text: string }

  const candidates: RawEssay[] = [
    ...(sameStudentRaw as RawEssay[]),
    ...(platformRaw   as RawEssay[]),
  ].filter(e => e && e.content_text && !e.content_text.startsWith('[IMAGEM]'))

  const results: SimilarityResult[] = []
  const sourceText = contentText.trim()

  for (const essay of candidates) {
    const targetText = essay.content_text.trim()
    if (targetText.length < 100) continue

    const sim = trigramSimilarity(sourceText, targetText)
    if (sim < 0.12) continue // skip very low similarity (< 12%)

    const level: SimilarityResult['level'] =
      sim >= 0.55 ? 'high' :
      sim >= 0.30 ? 'medium' : 'low'

    const matchingPhrases = level !== 'low'
      ? findMatchingPhrases(sourceText, targetText)
      : []

    results.push({
      essayId:        essay.id,
      themeTitle:     essay.theme_title,
      submittedAt:    essay.submitted_at,
      similarity:     Math.round(sim * 100) / 100,
      level,
      matchingPhrases,
    })
  }

  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10)
}
