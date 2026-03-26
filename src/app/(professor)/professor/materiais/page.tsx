import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { BookOpen, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Professor — Materiais de Apoio',
  robots: { index: false, follow: false },
}

export default async function ProfessorMateriaisPage() {
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
        <h1 className="text-2xl font-bold text-white mb-1">Materiais de Apoio</h1>
        <p className="text-gray-500 text-sm">Guias de correção, rubricas e referências pedagógicas</p>
      </div>

      <div className="card-dark rounded-2xl p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <BookOpen size={24} className="text-amber-400/70" />
        </div>
        <h2 className="text-base font-semibold text-white mb-2">Biblioteca em construção</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
          Em breve você encontrará aqui os guias de correção por competência, gabaritos de referência,
          exemplos de redações nota 1000 e materiais de formação continuada.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-xs text-gray-600 bg-white/[0.03] border border-white/[0.07] px-4 py-2 rounded-full">
          <Clock size={11} />
          Em preparação
        </div>
      </div>
    </div>
  )
}
