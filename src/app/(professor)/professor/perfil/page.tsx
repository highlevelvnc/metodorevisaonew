import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { UserCircle2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Professor — Perfil',
  robots: { index: false, follow: false },
}

export default async function ProfessorPerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single()
  const profile = profileRaw as { role: string; full_name: string | null } | null
  if (!profile || !['admin', 'reviewer'].includes(profile.role)) redirect('/aluno')

  const displayName = profile.full_name ?? user.email?.split('@')[0] ?? 'Professor'
  const initial     = displayName.charAt(0).toUpperCase()

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Perfil</h1>
        <p className="text-gray-500 text-sm">Dados da conta e configurações pessoais</p>
      </div>

      {/* Identity card */}
      <div className="card-dark rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-500/30 flex items-center justify-center text-xl font-bold text-amber-300 flex-shrink-0">
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-bold text-white">{displayName}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full">
                <ShieldCheck size={9} />
                {profile.role === 'admin' ? 'Administrador' : 'Professor'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Settings placeholder */}
      <div className="card-dark rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
          <UserCircle2 size={22} className="text-gray-600" />
        </div>
        <h2 className="text-sm font-semibold text-gray-300 mb-2">Configurações de perfil em construção</h2>
        <p className="text-xs text-gray-600 max-w-xs mx-auto leading-relaxed">
          Em breve você poderá editar nome, dados bancários para pagamento, preferências
          de notificação e alterar sua senha diretamente aqui.
        </p>
      </div>
    </div>
  )
}
