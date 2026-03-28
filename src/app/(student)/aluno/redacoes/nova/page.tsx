import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NovaRedacaoForm from './NovaRedacaoForm'

export const metadata: Metadata = {
  title: 'Enviar redação',
  robots: { index: false, follow: false },
}

export default async function NovaRedacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ tema_livre?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const prefilledTheme = params.tema_livre ?? null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [{ data: themesRaw }, { data: subRaw }] = await Promise.all([
    db.from('themes')
      .select('id, title')
      .eq('active', true)
      .order('title', { ascending: true }),
    db.from('subscriptions')
      .select('essays_used, essays_limit')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const themes = (themesRaw as { id: string; title: string }[]) ?? []
  const sub    = subRaw as { essays_used: number; essays_limit: number } | null
  // Clamp to 0 — essays_used can exceed essays_limit in edge cases (concurrent submits, admin overrides)
  const creditsLeft = sub ? Math.max(0, sub.essays_limit - sub.essays_used) : 0

  return <NovaRedacaoForm themes={themes} creditsLeft={creditsLeft} prefilledTheme={prefilledTheme} />
}
