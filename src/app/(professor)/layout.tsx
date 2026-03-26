'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  BookOpen,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'Dashboard',    href: '/professor',             icon: LayoutDashboard },
  { label: 'Redações',     href: '/professor/redacoes',   icon: FileText },
  { label: 'Alunos',       href: '/professor/alunos',     icon: Users },
  { label: 'Temas',        href: '/professor/temas',      icon: BookOpen },
]

// ── Professor identity strip (bottom of sidebar) ─────────────────────────────
function ProfessorIdentityStrip() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email)
    })
  }, [])

  const initial     = email ? email[0].toUpperCase() : '?'
  const displayName = email ? email.split('@')[0] : null

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-transparent">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold select-none border bg-amber-500/20 border-amber-500/30 text-amber-300">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-gray-400 truncate leading-none">
          {displayName ?? 'Professor'}
        </p>
        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-amber-500/10 border-amber-500/25 text-amber-400">
          <ShieldCheck size={8} />
          Professor
        </span>
      </div>
    </div>
  )
}

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
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
        {/* Logo + Professor badge */}
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
            PROF
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
            const active = pathname === href || (href !== '/professor' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/25 shadow-[inset_3px_0_0_0_rgba(245,158,11,0.7)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05] border border-transparent'}
                `}
              >
                <Icon size={16} className="flex-shrink-0" />
                {label}
                {active && <ChevronRight size={13} className="ml-auto opacity-60" />}
              </Link>
            )
          })}
        </nav>

        {/* Account footer */}
        <div className="p-3 border-t border-white/[0.06] space-y-0.5">
          <ProfessorIdentityStrip />
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all border border-transparent"
            >
              <LogOut size={16} />
              Sair da conta
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
          <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-amber-400/80">
            <ShieldCheck size={12} />
            Professor
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 sm:p-7 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
