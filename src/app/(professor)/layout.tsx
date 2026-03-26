'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Inbox,
  Video,
  CalendarDays,
  Users,
  BarChart3,
  Banknote,
  FileCheck2,
  BookOpen,
  HelpCircle,
  UserCircle2,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ── Nav structure ──────────────────────────────────────────────────────────────
type NavItem    = { label: string; href: string; icon: React.ElementType }
type NavSection = { label: string; items: NavItem[] }

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'OPERAÇÃO',
    items: [
      { label: 'Dashboard',         href: '/professor',           icon: LayoutDashboard },
      { label: 'Fila de Correções', href: '/professor/redacoes',  icon: Inbox           },
      { label: 'Aulas',             href: '/professor/aulas',     icon: Video           },
      { label: 'Agenda',            href: '/professor/agenda',    icon: CalendarDays    },
    ],
  },
  {
    label: 'GESTÃO',
    items: [
      { label: 'Alunos',            href: '/professor/alunos',     icon: Users      },
      { label: 'Desempenho',        href: '/professor/desempenho', icon: BarChart3  },
      { label: 'Ganhos',            href: '/professor/ganhos',     icon: Banknote   },
      { label: 'Fechamento Mensal', href: '/professor/fechamento', icon: FileCheck2 },
    ],
  },
  {
    label: 'CONTA',
    items: [
      { label: 'Materiais de Apoio', href: '/professor/materiais', icon: BookOpen    },
      { label: 'Suporte',            href: '/professor/suporte',   icon: HelpCircle  },
      { label: 'Perfil',             href: '/professor/perfil',    icon: UserCircle2 },
    ],
  },
]

// ── Professor identity strip ───────────────────────────────────────────────────
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

// ── Layout ─────────────────────────────────────────────────────────────────────
export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const pathname    = usePathname()
  const [open, setOpen] = useState(false)

  // Exact match for /professor (dashboard), prefix match for everything else
  const isActive = (href: string) => {
    if (href === '/professor') return pathname === '/professor'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="min-h-screen bg-[#070c14] flex">

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className={`
        fixed top-0 left-0 h-full w-[232px] bg-slate-950 border-r border-white/[0.06] z-40
        flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>

        {/* Logo row */}
        <div className="h-14 flex items-center px-4 border-b border-white/[0.06] gap-2 flex-shrink-0">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <div style={{ position: 'relative', width: '106px', height: '34px', overflow: 'hidden' }}>
              <Image
                src="/logo.png"
                alt="Método Revisão"
                fill
                sizes="106px"
                style={{ objectFit: 'cover', objectPosition: '50% 52%' }}
                priority
              />
            </div>
          </Link>
          <span className="ml-auto flex-shrink-0 flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            <ShieldCheck size={9} />
            PROF
          </span>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-gray-500 hover:text-white ml-0.5 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto py-4 px-2.5 scrollbar-thin scrollbar-thumb-white/10">
          {NAV_SECTIONS.map(({ label, items }, idx) => (
            <div key={label} className={idx > 0 ? 'mt-1 pt-4 border-t border-white/[0.05]' : ''}>
              {/* Section label */}
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest px-2.5 mb-1.5">
                {label}
              </p>
              {/* Items */}
              <div className="space-y-0.5">
                {items.map(({ label: itemLabel, href, icon: Icon }) => {
                  const active = isActive(href)
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`
                        flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all duration-150
                        ${active
                          ? 'bg-amber-500/[0.12] text-amber-300 border border-amber-500/20 shadow-[inset_3px_0_0_0_rgba(245,158,11,0.55)]'
                          : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent'}
                      `}
                    >
                      <Icon
                        size={13}
                        className={`flex-shrink-0 ${active ? 'text-amber-400' : 'text-gray-600'}`}
                      />
                      <span className="truncate">{itemLabel}</span>
                      {active && (
                        <ChevronRight size={11} className="ml-auto opacity-40 flex-shrink-0" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: identity + sign-out */}
        <div className="p-2.5 border-t border-white/[0.06] space-y-px flex-shrink-0">
          <ProfessorIdentityStrip />
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all border border-transparent"
            >
              <LogOut size={13} />
              Sair da conta
            </button>
          </form>
        </div>

      </aside>

      {/* ── Main area ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile topbar */}
        <header className="lg:hidden h-14 bg-slate-950 border-b border-white/[0.06] flex items-center px-4 gap-3 flex-shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="text-gray-400 hover:text-white"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          <Link href="/" className="transition-opacity hover:opacity-75">
            <div style={{ position: 'relative', width: '106px', height: '34px', overflow: 'hidden' }}>
              <Image
                src="/logo.png"
                alt="Método Revisão"
                fill
                sizes="106px"
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
