import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CorrectionForm, { type EssayForCorrection } from './CorrectionForm'

export default async function AdminCorrigirPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify role
  const { data: profileRaw } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as { role: string } | null
  if (!profile || !['admin', 'reviewer'].includes(profile.role)) redirect('/aluno')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Fetch essay (notes field included for reviewer context)
  const { data: essayRaw } = await db.from('essays')
    .select(`
      id, theme_title, content_text, notes, status, student_id,
      student:users!essays_student_id_fkey(full_name),
      corrections(c1_score, c2_score, c3_score, c4_score, c5_score, general_feedback)
    `)
    .eq('id', params.id)
    .single()

  if (!essayRaw) notFound()

  type EssayRaw = {
    id: string; theme_title: string; content_text: string | null
    notes: string | null; status: string; student_id: string
    student: { full_name: string } | null
    corrections: {
      c1_score: number; c2_score: number; c3_score: number
      c4_score: number; c5_score: number; general_feedback: string
    }[]
  }

  const raw = essayRaw as EssayRaw

  // Parallelize remaining queries for lower latency
  const [{ data: subRaw }, { data: nextRaw }, { count: pendingCount }] = await Promise.all([
    // Student's active plan
    db.from('subscriptions')
      .select('plans(name)')
      .eq('user_id', raw.student_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Next oldest pending/in_review essay (for "próxima" navigation)
    db.from('essays')
      .select('id')
      .in('status', ['pending', 'in_review'])
      .neq('id', params.id)
      .order('submitted_at', { ascending: true })
      .limit(1)
      .maybeSingle(),

    // Total pending queue depth (excluding current essay)
    db.from('essays')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'in_review'])
      .neq('id', params.id),
  ])

  const planName    = (subRaw as { plans: { name: string } | null } | null)?.plans?.name ?? 'Trial'
  const nextEssayId = (nextRaw as { id: string } | null)?.id ?? undefined
  const queueCount  = pendingCount ?? 0

  const existingCorrection = raw.corrections?.[0] ?? null

  const essay: EssayForCorrection = {
    id:                 raw.id,
    theme_title:        raw.theme_title,
    content_text:       raw.content_text,
    notes:              raw.notes,
    status:             raw.status,
    student:            raw.student,
    plan:               planName,
    existingCorrection: existingCorrection
      ? {
          c1_score: existingCorrection.c1_score,
          c2_score: existingCorrection.c2_score,
          c3_score: existingCorrection.c3_score,
          c4_score: existingCorrection.c4_score,
          c5_score: existingCorrection.c5_score,
          general_feedback: existingCorrection.general_feedback,
        }
      : null,
  }

  return <CorrectionForm essay={essay} nextEssayId={nextEssayId} queueCount={queueCount} />
}
