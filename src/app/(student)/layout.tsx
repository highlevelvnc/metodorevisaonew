'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  BarChart2,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  PlayCircle,
  ClipboardList,
  Users,
  Sparkles,
  Library,
  Award,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type NavItem = { label: string; href: string; icon: React.ElementType; badge?: string }
type NavSection = { label?: string; items: NavItem[] }

// ── Plan badge colours (mirrors DashboardHero PLAN_CONFIG) ───────────────────
const PLAN_PILL: Record<string, string> = {
  Trial:      'text-gray-400 bg-white/[0.05] border-white/[0.10]',
  Evolução:   'text-blue-400 bg-blue-500/10 border-blue-500/25',
  Estratégia: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
  Intensivo:  'text-amber-400 bg-amber-500/10 border-amber-500/25',
}

// ── User identity strip (bottom of sidebar) ──────────────────────────────────
function UserInfoStrip() {
  const [email,    setEmail]    = useState<string | null>(null)
  const [planName, setPlanName] = useState<string | null>(null)
  const pathname = usePathname()
  const isActive = pathname === '/aluno/conta' || pathname.startsWith('/aluno/conta/')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      if (!u?.email) return
      setEmail(u.email)
      // Lazily fetch active plan name
      ;(supabase as any)
        .from('subscriptions')
        .select('plans(name)')
        .eq('user_id', u.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data: sub }: any) => {
          if (sub?.plans?.name) setPlanName(sub.plans.name)
        })
    })
  }, [])

  const initial     = email ? email[0].toUpperCase() : '?'
  const displayName = email ? email.split('@')[0] : null
  const pillClass   = planName ? (PLAN_PILL[planName] ?? PLAN_PILL['Evolução']) : null

  return (
    <Link
      href="/aluno/conta"
      className={`
        flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group
        ${isActive
          ? 'bg-purple-700/20 text-purple-300 border border-purple-600/25 shadow-[inset_3px_0_0_0_rgba(168,85,247,0.7)]'
          : 'hover:bg-white/[0.04] border border-transparent'}
      `}
    >
      <div className={`
        w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center
        text-[11px] font-bold select-none border transition-colors
        ${isActive
          ? 'bg-purple-600/30 border-purple-500/40 text-purple-200'
          : 'bg-purple-600/20 border-purple-500/30 text-purple-300'}
      `}>
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-[12px] font-medium transition-colors truncate leading-none ${
          isActive ? 'text-purple-200' : 'text-gray-400 group-hover:text-gray-200'
        }`}>
          {displayName ?? 'Minha conta'}
        </p>
        {pillClass && planName ? (
          <span className={`inline-flex items-center mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${pillClass}`}>
            {planName}
          </span>
        ) : (
          <p className="text-[10px] text-gray-700 truncate mt-0.5 leading-none">
            {email ?? 'carregando…'}
          </p>
        )}
      </div>
    </Link>
  )
}

const navSections: NavSection[] = [
  {
    items: [
      { label: 'Painel',       href: '/aluno',           icon: LayoutDashboard },
      { label: 'Biia AI',      href: '/aluno/biia',      icon: Sparkles,  badge: 'IA' },
      { label: 'Redações',     href: '/aluno/redacoes',  icon: FileText },
    ],
  },
  {
    label: 'Progresso',
    items: [
      { label: 'Evolução',     href: '/aluno/evolucao',  icon: TrendingUp },
      { label: 'Relatório',    href: '/aluno/relatorio', icon: BarChart2 },
    ],
  },
  {
    label: 'Estudo',
    items: [
      { label: 'Temas',        href: '/aluno/temas',     icon: BookOpen },
      { label: 'Videoaulas',   href: '/aluno/aulas',     icon: PlayCircle },
      { label: 'Simulados',    href: '/aluno/simulados', icon: ClipboardList },
      { label: 'Mentorias',    href: '/aluno/mentoria',  icon: Users },
    ],
  },
  {
    label: 'Comunidade',
    items: [
      { label: 'Clube do Livro', href: '/aluno/clube-do-livro', icon: Library },
      { label: 'Corretores',     href: '/aluno/corretores',     icon: Award },
    ],
  },
  {
    items: [
      { label: 'Meu Perfil',   href: '/aluno/conta',     icon: User },
    ],
  },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#070c14] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#080d18] border-r border-white/[0.06] z-40
          flex flex-col transition-transform duration-300 print:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/[0.05] shrink-0 gap-3">
          <Link href="/" className="transition-opacity hover:opacity-75">
            <div style={{ position: 'relative', width: '126px', height: '40px', overflow: 'hidden' }}>
              <Image
                src="/logo.png"
                alt="Método Revisão"
                fill
                sizes="126px"
                style={{ objectFit: 'cover', objectPosition: '50% 52%' }}
                priority
              />
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-gray-600 hover:text-white transition-colors"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-5">
          {navSections.map((section, si) => (
            <div key={si}>
              {section.label && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 select-none">
                  {section.label}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map(({ label, href, icon: Icon, badge }) => {
                  const active =
                    href === '/aluno'
                      ? pathname === '/aluno'
                      : pathname === href || pathname.startsWith(href + '/')

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${active
                          ? 'bg-purple-700/20 text-purple-300 border border-purple-600/25 shadow-[inset_3px_0_0_0_rgba(168,85,247,0.7)]'
                          : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent'}
                      `}
                    >
                      <Icon
                        size={16}
                        className={`flex-shrink-0 ${active ? 'text-purple-400' : 'text-gray-600'}`}
                      />
                      <span className="flex-1 leading-none">{label}</span>
                      {badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/25 leading-none">
                          {badge}
                        </span>
                      )}
                      {active && !badge && (
                        <ChevronRight size={13} className="opacity-40" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Account footer */}
        <div className="px-3 pb-5 shrink-0 border-t border-white/[0.05] pt-3 space-y-0.5">
          <UserInfoStrip />
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-red-400 hover:bg-red-500/[0.06] transition-all border border-transparent"
            >
              <LogOut size={16} className="flex-shrink-0" />
              Sair da conta
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden h-14 bg-[#080d18] border-b border-white/[0.05] flex items-center px-4 gap-3 print:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-white transition-colors"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          <Link href="/" className="transition-opacity hover:opacity-75">
            <div style={{ position: 'relative', width: '108px', height: '34px', overflow: 'hidden' }}>
              <Image
                src="/logo.png"
                alt="Método Revisão"
                fill
                sizes="108px"
                style={{ objectFit: 'cover', objectPosition: '50% 52%' }}
              />
            </div>
          </Link>
        </header>

        {/* Page */}
        <main className="flex-1 p-5 sm:p-7 lg:p-8 overflow-auto print:p-0">
          {children}
        </main>
      </div>
    </div>
  )
}
