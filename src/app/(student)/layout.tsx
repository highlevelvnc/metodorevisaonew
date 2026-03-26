'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { label: 'Sua evolução', href: '/aluno',           icon: LayoutDashboard },
  { label: 'Redações',     href: '/aluno/redacoes',  icon: FileText },
  { label: 'Evolução',     href: '/aluno/evolucao',  icon: TrendingUp },
  { label: 'Meu Perfil',   href: '/aluno/conta',     icon: User },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#070c14] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-950 border-r border-white/[0.06] z-40
          flex flex-col transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/[0.06]">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <div style={{ position: 'relative', width: '128px', height: '40px', overflow: 'hidden' }}>
              <Image
                src="/logo.png"
                alt="Método Revisão"
                fill
                sizes="128px"
                style={{ objectFit: 'cover', objectPosition: '50% 52%' }}
                priority
              />
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-gray-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 px-3 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== '/aluno' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? 'bg-purple-700/20 text-purple-300 border border-purple-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'}
                `}
              >
                <Icon size={18} className="flex-shrink-0" />
                {label}
                {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </Link>
            )
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-3 border-t border-white/[0.06] space-y-1">
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
            >
              <LogOut size={18} />
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden h-14 bg-slate-950 border-b border-white/[0.06] flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu size={22} />
          </button>
          <Link href="/" className="transition-opacity hover:opacity-80">
            <div style={{ position: 'relative', width: '110px', height: '35px', overflow: 'hidden' }}>
              <Image
                src="/logo.png"
                alt="Método Revisão"
                fill
                sizes="110px"
                style={{ objectFit: 'cover', objectPosition: '50% 52%' }}
              />
            </div>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 sm:p-7 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
