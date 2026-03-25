'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { trackEvent } from './Analytics'

const WA_LINK =
  'https://wa.me/5522992682207?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20M%C3%A9todo%20Revis%C3%A3o%20e%20quero%20come%C3%A7ar%20minha%20evolu%C3%A7%C3%A3o%20na%20reda%C3%A7%C3%A3o.'

const navLinks = [
  { label: 'Método', href: '/#como-funciona' },
  { label: 'Como funciona', href: '/#como-funciona' },
  { label: 'Planos', href: '/#planos' },
  { label: 'Resultados', href: '/#depoimentos' },
  { label: 'Blog', href: '/blog' },
]

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
          ? 'bg-slate-950/90 backdrop-blur-xl border-b border-gray-800/50'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between" aria-label="Navegação principal">
        <Link
          href="/"
          aria-label="Método Revisão — Página inicial"
          className="flex-shrink-0 transition-opacity duration-200 hover:opacity-80"
        >
          {/* Container crops the whitespace of the PNG, showing only the logo content */}
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

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-7">
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
        </ul>

        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:inline-flex btn-primary text-sm py-2.5 px-5"
          onClick={() => trackEvent('cta_click', { source: 'navbar' })}
        >
          Começar agora
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>

        {/* Mobile hamburger */}
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

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-slate-950/95 backdrop-blur-xl border-t border-gray-800/50 px-5 py-5 space-y-1">
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
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full mt-4 text-sm"
            onClick={() => trackEvent('cta_click', { source: 'navbar_mobile' })}
          >
            Começar agora
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </header>
  )
}
