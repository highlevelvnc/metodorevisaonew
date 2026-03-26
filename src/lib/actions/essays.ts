'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type EssayState = { error: string } | null

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

  // ── Validação por modo ───────────────────────────────────────────────────────
  let contentText: string

  if (inputMode === 'image') {
    // Validate and upload the actual image file to Supabase Storage
    const imageFile = formData.get('essay_image') as File | null
    if (!imageFile || imageFile.size === 0)
      return { error: 'Selecione um arquivo para envio.' }

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!ALLOWED_TYPES.includes(imageFile.type))
      return { error: 'Formato não suportado. Use JPG, PNG, WebP ou PDF.' }

    if (imageFile.size > 8 * 1024 * 1024)
      return { error: 'Arquivo muito grande. Máximo de 8 MB.' }

    // Auth required before storage upload
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Path: essays/{userId}/{timestamp}-{random}.{ext}
    const ext    = imageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const rand   = Math.random().toString(36).slice(2, 8)
    const path   = `essays/${user.id}/${Date.now()}-${rand}.${ext}`

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
    // Text mode: validate length
    const rawContent = (formData.get('content') as string)?.trim()
    if (!rawContent || rawContent.length < MIN_CHARS)
      return { error: 'Redação muito curta. Mínimo de 7 linhas.' }
    if (rawContent.length > MAX_CHARS)
      return { error: 'Redação muito longa. Máximo de 30 linhas.' }
    contentText = rawContent
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Use untyped client to avoid Supabase overload resolution errors with enum columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // ── Verificar créditos ──────────────────────────────────────────────────────
  const { data: sub } = await db
    .from('subscriptions')
    .select('id, essays_used, essays_limit')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle() as { data: { id: string; essays_used: number; essays_limit: number } | null }

  if (!sub)
    return { error: 'Nenhum plano ativo. Adquira um plano para enviar redações.' }
  if (sub.essays_used >= sub.essays_limit)
    return { error: 'Créditos esgotados. Faça upgrade do seu plano para continuar.' }

  // ── Inserir redação ─────────────────────────────────────────────────────────
  const { data: essay, error: essayErr } = await db
    .from('essays')
    .insert({
      student_id:   user.id,
      theme_title:  themeTitle,
      theme_id:     themeId || null,
      content_text: contentText,
      notes,
      status:       'pending',
    })
    .select('id')
    .single() as { data: { id: string } | null; error: { message: string } | null }

  if (essayErr || !essay)
    return { error: 'Erro ao salvar redação. Tente novamente.' }

  // ── Debitar crédito ─────────────────────────────────────────────────────────
  await db
    .from('subscriptions')
    .update({ essays_used: sub.essays_used + 1 })
    .eq('id', sub.id)

  revalidatePath('/aluno')
  revalidatePath('/aluno/redacoes')
  // Notify admin queue so the new essay appears immediately
  revalidatePath('/admin')
  revalidatePath('/admin/redacoes')

  redirect(`/aluno/redacoes/${essay.id}`)
}
