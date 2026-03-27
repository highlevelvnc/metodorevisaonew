'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, imageFile, { contentType: imageFile.type, upsert: false })

    if (uploadError) {
      console.error('[submitEssay] Storage upload error:', uploadError.message)
      return { error: 'Erro ao enviar o arquivo. Tente novamente ou use a opção "Digitar".' }
    }

    // Get public URL (bucket must be public; see schema.sql for setup instructions)
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path)

    contentText = `[IMAGEM] ${urlData.publicUrl}`

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
  // Nota sobre o upload de imagem: se o RPC falhar após o upload bem-sucedido,
  // o arquivo ficará órfão no Storage (sem essay_id associado). Isso é aceitável —
  // nenhum crédito é cobrado e o aluno pode tentar novamente.
  const { data: essayId, error: rpcErr } = await db.rpc('submit_essay_atomic', {
    p_user_id:      user.id,
    p_theme_title:  themeTitle,
    p_content_text: contentText,
    p_theme_id:     themeId,
    p_notes:        notes,
  })

  if (rpcErr) {
    console.error('[submitEssay] RPC error:', rpcErr.message)
    if (rpcErr.message?.includes('NO_ACTIVE_PLAN'))
      return { error: 'Nenhum plano ativo. Adquira um plano para enviar redações.' }
    if (rpcErr.message?.includes('CREDIT_LIMIT_REACHED'))
      return { error: 'Créditos esgotados. Faça upgrade do seu plano para continuar.', code: 'CREDIT_LIMIT_REACHED' }
    return { error: 'Erro ao salvar redação. Tente novamente.' }
  }

  // Validate that essayId is a non-empty string UUID before redirecting
  const essayIdStr = typeof essayId === 'string' ? essayId : null
  if (!essayIdStr)
    return { error: 'Erro ao salvar redação. Tente novamente.' }

  revalidatePath('/aluno')
  revalidatePath('/aluno/redacoes')
  // Notify admin queue so the new essay appears immediately
  revalidatePath('/professor')
  revalidatePath('/professor/redacoes')

  redirect(`/aluno/redacoes/${essayIdStr}`)
}
