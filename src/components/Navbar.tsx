'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { trackEvent } from './Analytics'

const navLinks: { label: string; href: string; highlight?: boolean }[] = [
  { label: 'Como funciona', href: '/#como-funciona' },
  { label: 'Planos',        href: '/#planos' },
  { label: 'Resultados',    href: '/#depoimentos' },
  { label: 'Blog',          href: '/blog' },
]

// Separate entry — different audience (B2B), deserves visual distinction
const schoolLink = { label: 'Para Escolas', href: '/para-escolas' }

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#070c14]/92 backdrop-blur-xl border-b border-white/[0.07] shadow-[0_1px_0_rgba(124,58,237,0.10),0_4px_24px_rgba(0,0,0,0.30)]'
          : 'bg-[#070c14]/20 backdrop-blur-sm'
      }`}
    >
      <nav
        className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between"
        aria-label="Navegação principal"
      >
        {/* ── Logo ──────────────────────────────────────────────── */}
        <Link
          href="/"
          aria-label="Método Revisão — Página inicial"
          className="flex-shrink-0 transition-opacity duration-200 hover:opacity-80"
        >
          <div style={{ position: 'relative', width: '148px', height: '46px', overflow: 'hidden' }}>
            <Image
              src="/logo.png"
              alt="Método Revisão"
              fill
              sizes="148px"
              style={{ objectFit: 'cover', objectPosition: '50% 52%' }}
              priority
            />
          </div>
        </Link>

        {/* ── Desktop nav links ──────────────────────────────────── */}
        <ul className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm text-gray-400 hover:text-white font-medium transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
          {/* Para Escolas — pill treatment, signals a different audience */}
          <li>
            <Link
              href={schoolLink.href}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 bg-purple-500/[0.08] hover:bg-purple-500/[0.14] border border-purple-500/[0.20] hover:border-purple-500/[0.35] px-3 py-1.5 rounded-full transition-all duration-200"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
              Para Escolas
            </Link>
          </li>
        </ul>

        {/* ── Desktop action group ───────────────────────────────── */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Divider */}
          <div className="w-px h-4 bg-white/[0.10] mr-1" aria-hidden="true" />

          {/* Login Aluno — text/ghost */}
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-white font-medium px-3.5 py-2 rounded-lg transition-all hover:bg-white/[0.05]"
          >
            Login Aluno
          </Link>

          {/* Login Professor — outlined ghost */}
          <Link
            href="/login?next=/professor"
            className="text-sm text-gray-500 hover:text-white font-medium px-3.5 py-2 rounded-lg border border-white/[0.08] hover:border-white/[0.20] hover:bg-white/[0.04] transition-all"
          >
            Login Professor
          </Link>

          {/* Começar agora — primary CTA */}
          <Link
            href="/cadastro"
            className="btn-primary text-sm py-2.5 px-5 ml-1"
            onClick={() => trackEvent('cta_click', { source: 'navbar' })}
          >
            Começar agora
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* ── Mobile hamburger ──────────────────────────────────── */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </nav>

      {/* ── Mobile menu ───────────────────────────────────────────── */}
      {open && (
        <div className="lg:hidden bg-[#070c14]/97 backdrop-blur-xl border-t border-white/[0.06] px-5 py-5 space-y-1">
          {/* Nav links */}
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 px-4 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* Para Escolas — visually distinct in mobile menu */}
          <Link
            href={schoolLink.href}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 py-2.5 px-4 text-purple-400 hover:text-purple-300 hover:bg-purple-500/[0.08] rounded-lg text-sm font-semibold transition-colors border border-purple-500/[0.15] hover:border-purple-500/[0.28]"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
            Para Escolas
          </Link>

          {/* Login + CTA section */}
          <div className="pt-4 mt-2 border-t border-white/[0.06] space-y-2.5">
            {/* Two login buttons side-by-side */}
            <div className="flex gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-2.5 text-sm font-semibold text-gray-300 border border-gray-700/60 rounded-xl hover:bg-white/[0.05] hover:text-white hover:border-gray-600 transition-all"
              >
                Login Aluno
              </Link>
              <Link
                href="/login?next=/professor"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-2.5 text-sm font-semibold text-gray-500 border border-gray-800/80 rounded-xl hover:bg-white/[0.04] hover:text-gray-300 hover:border-gray-700 transition-all"
              >
                Login Professor
              </Link>
            </div>

            {/* Primary CTA — full width */}
            <Link
              href="/cadastro"
              className="btn-primary w-full text-sm justify-center"
              onClick={() => {
                setOpen(false)
                trackEvent('cta_click', { source: 'navbar_mobile' })
              }}
            >
              Começar agora
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
