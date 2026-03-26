import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Professor — Temas',
  robots: { index: false, follow: false },
}

export default async function ProfessorTemasPage() {
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
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Temas</h1>
          <p className="text-gray-500 text-sm">Gerencie os temas disponíveis para redação</p>
        </div>
        <button className="btn-primary text-sm py-2.5 px-5">
          + Novo tema
        </button>
      </div>
      <div className="card-dark p-6 rounded-2xl">
        <p className="text-gray-600 text-sm text-center py-8">
          Gerenciamento de temas em construção
        </p>
      </div>
    </div>
  )
}
