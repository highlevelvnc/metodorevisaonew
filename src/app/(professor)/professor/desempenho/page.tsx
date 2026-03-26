import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BarChart3, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Professor — Desempenho',
  robots: { index: false, follow: false },
}

export default async function ProfessorDesempenhoPage() {
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
        <h1 className="text-2xl font-bold text-white mb-1">Desempenho</h1>
        <p className="text-gray-500 text-sm">Análises de produtividade, tempo médio e qualidade de correção</p>
      </div>

      <div className="card-dark rounded-2xl p-12 text-center border border-indigo-500/10">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
          <BarChart3 size={24} className="text-indigo-400/70" />
        </div>
        <h2 className="text-base font-semibold text-white mb-2">Relatórios de desempenho em construção</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
          Em breve você terá acesso a gráficos de evolução, comparativo semanal/mensal,
          taxa de entrega no prazo, nota média por competência e histórico completo.
        </p>
        <div className="mt-6">
          <Link
            href="/professor"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Ver métricas no Dashboard
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}
