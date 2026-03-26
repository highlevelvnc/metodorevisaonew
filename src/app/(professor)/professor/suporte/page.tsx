import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { HelpCircle, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Professor — Suporte',
  robots: { index: false, follow: false },
}

export default async function ProfessorSuportePage() {
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
        <h1 className="text-2xl font-bold text-white mb-1">Suporte</h1>
        <p className="text-gray-500 text-sm">Central de ajuda e contato com a equipe</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="card-dark rounded-2xl p-6 flex flex-col gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <HelpCircle size={20} className="text-amber-400/70" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Central de ajuda</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Documentação sobre o sistema de correção, rubrica ENEM e fluxo de trabalho.
              Em construção — disponível em breve.
            </p>
          </div>
        </div>

        <div className="card-dark rounded-2xl p-6 flex flex-col gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Mail size={20} className="text-blue-400/70" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Fale com a equipe</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Para dúvidas urgentes sobre correções, acesso ou pagamentos,
              entre em contato direto com a equipe Método Revisão.
            </p>
          </div>
          <a
            href="mailto:suporte@metodorevisao.com.br"
            className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium mt-auto"
          >
            <Mail size={11} />
            suporte@metodorevisao.com.br
          </a>
        </div>

      </div>
    </div>
  )
}
