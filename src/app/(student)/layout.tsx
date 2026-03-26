'use client'

import { useState } from 'react'
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

type NavItem = { label: string; href: string; icon: React.ElementType; badge?: string }
type NavSection = { label?: string; items: NavItem[] }

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
                          ? 'bg-purple-700/20 text-purple-300 border border-purple-600/25'
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

        {/* Sign out */}
        <div className="px-3 pb-5 shrink-0 border-t border-white/[0.05] pt-3">
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
