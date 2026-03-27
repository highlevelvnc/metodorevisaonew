'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { PixKeyType } from '@/lib/supabase/types'

export async function upsertPayoutProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Role guard
  const { data: profileRaw } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  const profile = profileRaw as { role: string } | null
  if (!profile || !['admin', 'reviewer'].includes(profile.role)) redirect('/aluno')

  const pix_key      = (formData.get('pix_key')      as string | null)?.trim() || null
  const pix_key_type = (formData.get('pix_key_type') as PixKeyType | null) || null
  const cpf          = (formData.get('cpf')          as string | null)?.trim() || null
  const short_bio    = (formData.get('short_bio')    as string | null)?.trim() || null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  await db.from('professor_payout_profiles').upsert(
    {
      professor_id: user.id,
      pix_key,
      pix_key_type,
      cpf,
      short_bio,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'professor_id' }
  )

  revalidatePath('/professor/perfil')
}
