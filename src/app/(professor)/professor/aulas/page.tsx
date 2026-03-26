import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Video, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Professor — Aulas',
  robots: { index: false, follow: false },
}

export default async function ProfessorAulasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  const profile = profileRaw as { role: string } | null
  if (!profile || !['admin', 'reviewer'].includes(profile.role)) redirect('/aluno')

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Aulas</h1>
        <p className="text-gray-500 text-sm">Gestão de sessões de aula e tutorias</p>
      </div>

      <div className="card-dark rounded-2xl p-12 text-center border border-purple-500/10">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
          <Video size={24} className="text-purple-400/70" />
        </div>
        <h2 className="text-base font-semibold text-white mb-2">Módulo de aulas em construção</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
          Em breve você poderá registrar e gerenciar sessões de aula, tutorias individuais
          e aulas em grupo. Cada aula de 30 minutos contabilizará{' '}
          <span className="text-purple-400 font-semibold">R$ 16,50</span> nos seus ganhos.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-xs text-gray-600 bg-white/[0.03] border border-white/[0.07] px-4 py-2 rounded-full">
          <Clock size={11} />
          Previsão: próximo ciclo
        </div>
      </div>
    </div>
  )
}
