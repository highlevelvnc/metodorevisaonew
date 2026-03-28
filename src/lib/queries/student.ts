/**
 * student.ts — Typed query helpers for student data.
 *
 * Centralizes the most common student queries to:
 * 1. Eliminate `supabase as any` in page components
 * 2. Provide consistent types for corrections joins
 * 3. Make queries reusable across pages
 *
 * All functions accept a Supabase client (server-side) and a user ID.
 * They return typed results, never throw — callers check for null/errors.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

// ─── Return types ────────────────────────────────────────────────────────────

export interface CorrectionData {
  c1_score: number | null
  c2_score: number | null
  c3_score: number | null
  c4_score: number | null
  c5_score: number | null
  total_score: number | null
  reviewer_name: string | null
  corrected_at: string | null
  is_zeroed?: boolean
}

export interface EssayWithCorrection {
  id: string
  theme_title: string
  status: string
  submitted_at: string
  corrections: CorrectionData[]
}

export interface StudentProfile {
  full_name: string
}

export interface ActiveSubscription {
  essays_used: number
  essays_limit: number
  plans: { name: string } | null
}

// ─── Query helpers ───────────────────────────────────────────────────────────

type Client = SupabaseClient<Database>

/** Fetch student profile (name) */
export async function getStudentProfile(
  supabase: Client,
  userId: string
): Promise<StudentProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[queries/student] getStudentProfile error:', error.message)
    return null
  }
  return data as StudentProfile
}

/** Fetch the active subscription with plan name */
export async function getActiveSubscription(
  supabase: Client,
  userId: string
): Promise<ActiveSubscription | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('subscriptions')
    .select('essays_used, essays_limit, plans(name)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[queries/student] getActiveSubscription error:', error.message)
    return null
  }
  return data as ActiveSubscription | null
}

/** Fetch student essays with corrections (newest first) */
export async function getStudentEssays(
  supabase: Client,
  userId: string,
  limit: number = 50
): Promise<EssayWithCorrection[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('essays')
    .select('id, theme_title, status, submitted_at, corrections(c1_score, c2_score, c3_score, c4_score, c5_score, total_score, reviewer_name, corrected_at)')
    .eq('student_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[queries/student] getStudentEssays error:', error.message)
    return []
  }

  // Normalize: PostgREST returns null for empty relations
  return ((data ?? []) as Array<Record<string, unknown>>).map(raw => ({
    id: raw.id as string,
    theme_title: (raw.theme_title as string) ?? '—',
    status: raw.status as string,
    submitted_at: (raw.submitted_at as string) ?? new Date(0).toISOString(),
    corrections: Array.isArray(raw.corrections) ? (raw.corrections as CorrectionData[]) : [],
  }))
}

/** Fetch only corrected essays with full correction data (for evolution/report pages) */
export async function getCorrectedEssays(
  supabase: Client,
  userId: string,
  limit: number = 50
): Promise<EssayWithCorrection[]> {
  const essays = await getStudentEssays(supabase, userId, limit)
  return essays.filter(e => e.status === 'corrected' && e.corrections.length > 0)
}

// ─── Competency helpers ──────────────────────────────────────────────────────

export type CompKey = 'c1_score' | 'c2_score' | 'c3_score' | 'c4_score' | 'c5_score'

export const COMP_KEYS: CompKey[] = ['c1_score', 'c2_score', 'c3_score', 'c4_score', 'c5_score']

export const COMP_LABELS: Record<CompKey, string> = {
  c1_score: 'C1',
  c2_score: 'C2',
  c3_score: 'C3',
  c4_score: 'C4',
  c5_score: 'C5',
}

export const COMP_NAMES: Record<CompKey, string> = {
  c1_score: 'Norma Culta (C1)',
  c2_score: 'Compreensão do Tema (C2)',
  c3_score: 'Seleção de Argumentos (C3)',
  c4_score: 'Mecanismos de Coesão (C4)',
  c5_score: 'Proposta de Intervenção (C5)',
}

/** Get the weakest competency key from a correction */
export function getWeakestComp(correction: CorrectionData): CompKey {
  return COMP_KEYS.reduce((a, b) =>
    ((correction[a] ?? 0) <= (correction[b] ?? 0)) ? a : b
  )
}

/** Compute average score from corrected essays */
export function computeAvgScore(corrected: EssayWithCorrection[]): number | null {
  if (corrected.length === 0) return null
  return Math.round(
    corrected.reduce((sum, e) => sum + (e.corrections[0]?.total_score ?? 0), 0) / corrected.length
  )
}

/** Compute per-competency averages */
export function computeCompAverages(corrected: EssayWithCorrection[]): { key: CompKey; avg: number }[] {
  if (corrected.length === 0) return []
  return COMP_KEYS.map(key => ({
    key,
    avg: Math.round(
      corrected.reduce((sum, e) => sum + (e.corrections[0]?.[key] ?? 0), 0) / corrected.length
    ),
  }))
}
