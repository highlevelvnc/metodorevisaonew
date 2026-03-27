import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CorrectionForm, { type EssayForCorrection } from './CorrectionForm'

export default async function ProfessorCorrigirPage({ params }: { params: { id: string } }) {
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
      student:users!essays_student_id_fkey(id, full_name),
      corrections(c1_score, c2_score, c3_score, c4_score, c5_score, general_feedback)
    `)
    .eq('id', params.id)
    .single()

  if (!essayRaw) notFound()

  type EssayRaw = {
    id: string; theme_title: string; content_text: string | null
    notes: string | null; status: string; student_id: string
    student: { id: string; full_name: string } | null
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
      .select('id, student:users!essays_student_id_fkey(full_name)')
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

  const planName        = (subRaw as { plans: { name: string } | null } | null)?.plans?.name ?? 'Trial'
  const nextRawTyped    = nextRaw as { id: string; student: { full_name: string } | null } | null
  const nextEssayId     = nextRawTyped?.id ?? undefined
  const nextStudentName = nextRawTyped?.student?.full_name ?? undefined
  const queueCount      = pendingCount ?? 0

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

  const studentName = raw.student?.full_name ?? 'Aluno'

  return (
    <div>
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-5 flex-wrap">
        <Link href="/professor" className="hover:text-gray-400 transition-colors">Professor</Link>
        <span>/</span>
        <Link href="/professor/redacoes" className="hover:text-gray-400 transition-colors">Redações</Link>
        <span>/</span>
        <span className="text-gray-400 font-medium">{studentName}</span>
        {queueCount > 0 && (
          <>
            <span className="ml-2 text-gray-700">·</span>
            <span className="text-gray-600">
              {queueCount} na fila
              {nextStudentName ? ` · próxima: ${nextStudentName}` : ''}
            </span>
          </>
        )}
      </div>

      <CorrectionForm
        essay={essay}
        nextEssayId={nextEssayId}
        queueCount={queueCount}
        nextStudentName={nextStudentName}
      />
    </div>
  )
}
