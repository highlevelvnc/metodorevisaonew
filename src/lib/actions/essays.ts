'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { touchActivity } from '@/lib/actions/activity'
import { trackProductEvent } from '@/lib/analytics'

export type EssayState = { error: string; code?: string } | null

const MIN_CHARS = 300  // ~7 linhas
const MAX_CHARS = 4200 // ~30 linhas + margem

// Bucket name in Supabase Storage (must be created via Dashboard → Storage → New bucket)
const STORAGE_BUCKET = 'essay-images'

export async function submitEssay(
  _prev: EssayState,
  formData: FormData,
): Promise<EssayState> {
  const themeTitle = (formData.get('theme_title') as string)?.trim()
  const notes      = (formData.get('notes') as string)?.trim() || null
  const themeId    = (formData.get('theme_id') as string) || null
  const inputMode  = (formData.get('input_mode') as string) || 'text'

  if (!themeTitle || themeTitle.length < 3)
    return { error: 'Informe o tema da redação.' }

  // ── Auth (single client para toda a action) ──────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Use untyped client to avoid Supabase overload resolution errors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // ── Upload tracking (hoisted so error handlers can access) ───────────────
  let uploadedPath:   string | null = null
  let uploadType:     'text' | 'image' | 'pdf' = 'text'
  let originalFileUrl: string | null = null

  // ── Validação e preparação do conteúdo ───────────────────────────────────
  let contentText: string

  if (inputMode === 'image') {
    const imageFile = formData.get('essay_image') as File | null
    if (!imageFile || imageFile.size === 0)
      return { error: 'Selecione um arquivo para envio.' }

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!ALLOWED_TYPES.includes(imageFile.type))
      return { error: 'Formato não suportado. Use JPG, PNG, WebP ou PDF.' }

    if (imageFile.size > 8 * 1024 * 1024)
      return { error: 'Arquivo muito grande. Máximo de 8 MB.' }

    // Path: essays/{userId}/{timestamp}-{random}.{ext}
    // Derive extension from validated MIME type — never from user-controlled filename
    const MIME_TO_EXT: Record<string, string> = {
      'image/jpeg': 'jpg', 'image/png': 'png',
      'image/webp': 'webp', 'application/pdf': 'pdf',
    }
    const ext  = MIME_TO_EXT[imageFile.type] ?? 'jpg'
    const rand = Math.random().toString(36).slice(2, 8)
    const path = `essays/${user.id}/${Date.now()}-${rand}.${ext}`

    // Track upload metadata before attempting — used for cleanup on RPC failure
    uploadedPath    = path
    uploadType      = imageFile.type === 'application/pdf' ? 'pdf' : 'image'

    console.info('[submitEssay] Uploading file:', path, '| size:', imageFile.size, '| type:', imageFile.type)

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, imageFile, { contentType: imageFile.type, upsert: false })

    if (uploadError) {
      console.error('[submitEssay] Storage upload error:', uploadError.message)
      // Reset tracking — nothing was uploaded
      uploadedPath = null
      return { error: 'Erro ao enviar o arquivo. Tente novamente ou use a opção "Digitar".' }
    }

    // Get public URL (bucket must be public; see schema.sql for setup instructions)
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path)

    originalFileUrl = urlData.publicUrl
    contentText = `[IMAGEM] ${urlData.publicUrl}`

    console.info('[submitEssay] File uploaded successfully:', path)

  } else {
    const rawContent = (formData.get('content') as string)?.trim()
    if (!rawContent || rawContent.length < MIN_CHARS)
      return { error: 'Redação muito curta. Mínimo de 7 linhas.' }
    if (rawContent.length > MAX_CHARS)
      return { error: 'Redação muito longa. Máximo de 30 linhas.' }
    contentText = rawContent
  }

  // ── Débito atômico + inserção (uma única transação no Postgres) ──────────
  //
  // A função submit_essay_atomic faz tudo dentro de uma transação com
  // SELECT … FOR UPDATE, garantindo que:
  //   1. O crédito disponível é verificado com row-level lock
  //   2. Nenhuma transação concorrente consegue passar pelo check ao mesmo tempo
  //   3. O débito e a inserção da redação são atômicos — ou ambos persistem,
  //      ou nenhum (ex: CHECK constraint violado = rollback automático)
  //
  console.info('[submitEssay] Calling submit_essay_atomic for user:', user.id)

  const { data: essayId, error: rpcErr } = await db.rpc('submit_essay_atomic', {
    p_user_id:      user.id,
    p_theme_title:  themeTitle,
    p_content_text: contentText,
    p_theme_id:     themeId,
    p_notes:        notes,
  })

  if (rpcErr) {
    console.error('[submitEssay] RPC error:', rpcErr.message)

    // Clean up orphaned file: file was uploaded but essay row was NOT created.
    // Best-effort — if this fails the file stays orphaned but no credit was charged.
    if (uploadedPath) {
      supabase.storage.from(STORAGE_BUCKET).remove([uploadedPath]).then(({ error: rmErr }) => {
        if (rmErr) console.error('[submitEssay] Orphan cleanup failed:', uploadedPath, rmErr.message)
        else       console.info('[submitEssay] Cleaned up orphaned file:', uploadedPath)
      })
    }

    if (rpcErr.message?.includes('NO_ACTIVE_PLAN'))
      return { error: 'Nenhum plano ativo. Adquira um plano para enviar redações.' }
    if (rpcErr.message?.includes('CREDIT_LIMIT_REACHED')) {
      trackProductEvent('credits_exhausted', user.id)
      return { error: 'Créditos esgotados. Faça upgrade do seu plano para continuar.', code: 'CREDIT_LIMIT_REACHED' }
    }
    return { error: 'Erro ao salvar redação. Tente novamente.' }
  }

  // Validate that essayId is a non-empty string UUID before redirecting
  const essayIdStr = typeof essayId === 'string' && essayId.length > 0 ? essayId : null
  if (!essayIdStr) {
    console.error('[submitEssay] RPC returned unexpected essayId:', essayId)
    return { error: 'Erro ao salvar redação. Tente novamente.' }
  }

  console.info('[submitEssay] Essay created:', essayIdStr)

  // ── Track product event ────────────────────────────────────────────────────
  trackProductEvent('essay_submitted', user.id, {
    essay_id: essayIdStr,
    input_mode: uploadType,
    theme_title: themeTitle,
  })

  // Check if this is the user's first essay (for first_essay_submitted event)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countDb = supabase as any
    const { count } = await countDb
      .from('essays')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', user.id)
    if (count === 1) {
      trackProductEvent('first_essay_submitted', user.id, { essay_id: essayIdStr })
    }
  } catch { /* non-fatal */ }

  // ── Write upload metadata to essay row (non-fatal if it fails) ───────────
  // Uses the admin client (service-role key) because:
  //   1. The student's anon-key client has no essays UPDATE RLS policy.
  //   2. Even if it did, the regular client would silently write 0 rows.
  // 'done' is the correct processing_status value per the CHECK constraint in
  // migration 004 ('pending','processing','done','failed'). Using 'uploaded'
  // would violate the constraint and cause the entire UPDATE to fail.
  if (uploadType !== 'text' && originalFileUrl) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const adminDb = createAdminClient() as any
      const { error: metaErr } = await adminDb
        .from('essays')
        .update({ upload_type: uploadType, original_file_url: originalFileUrl, processing_status: 'done' })
        .eq('id', essayIdStr)

      if (metaErr) {
        // Non-fatal: essay row was created, redirect proceeds.
        // Likely cause: migration 004 not applied yet (columns don't exist).
        console.error('[submitEssay] Failed to write upload metadata (non-fatal):', metaErr.message)
      } else {
        console.info('[submitEssay] Upload metadata written:', { upload_type: uploadType, essayId: essayIdStr })
      }
    } catch (adminErr) {
      // Admin client not configured (SUPABASE_SERVICE_ROLE_KEY missing) — non-fatal.
      console.error('[submitEssay] Admin client unavailable for metadata write (non-fatal):',
        adminErr instanceof Error ? adminErr.message : String(adminErr))
    }
  }

  revalidatePath('/aluno')
  revalidatePath('/aluno/redacoes')
  // Notify admin queue so the new essay appears immediately
  revalidatePath('/professor')
  revalidatePath('/professor/redacoes')

  // Update last_activity_at + clear nudge events (R3 — non-blocking)
  touchActivity().catch(() => {})

  redirect(`/aluno/redacoes/${essayIdStr}`)
}
