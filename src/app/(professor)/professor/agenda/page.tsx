import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CalendarDays, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Professor — Agenda',
  robots: { index: false, follow: false },
}

export default async function ProfessorAgendaPage() {
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
        <h1 className="text-2xl font-bold text-white mb-1">Agenda</h1>
        <p className="text-gray-500 text-sm">Calendário de compromissos e prazos de correção</p>
      </div>

      <div className="card-dark rounded-2xl p-12 text-center border border-blue-500/10">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
          <CalendarDays size={24} className="text-blue-400/70" />
        </div>
        <h2 className="text-base font-semibold text-white mb-2">Agenda em construção</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
          Em breve você poderá visualizar redações com prazo crítico, agendar sessões
          de aula e acompanhar o calendário de fechamentos mensais — tudo em um só lugar.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-xs text-gray-600 bg-white/[0.03] border border-white/[0.07] px-4 py-2 rounded-full">
          <Clock size={11} />
          Previsão: próximo ciclo
        </div>
      </div>
    </div>
  )
}
