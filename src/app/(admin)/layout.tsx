'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',    href: '/admin',              icon: LayoutDashboard },
  { label: 'Redações',     href: '/admin/redacoes',    icon: FileText },
  { label: 'Alunos',       href: '/admin/alunos',      icon: Users },
  { label: 'Temas',        href: '/admin/temas',       icon: BookOpen },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
        {/* Logo + Admin badge */}
        <div className="h-16 flex items-center px-5 border-b border-white/[0.06] gap-3">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <div style={{ position: 'relative', width: '110px', height: '35px', overflow: 'hidden' }}>
              <Image
                src="/logo.png"
                alt="Método Revisão"
                fill
                sizes="110px"
                style={{ objectFit: 'cover', objectPosition: '50% 52%' }}
                priority
              />
            </div>
          </Link>
          <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
            <ShieldCheck size={10} />
            ADMIN
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 px-3 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/25'
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

        {/* Logout */}
        <div className="p-3 border-t border-white/[0.06]">
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
          <span className="text-sm font-semibold text-white">Painel Admin</span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 sm:p-7 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
