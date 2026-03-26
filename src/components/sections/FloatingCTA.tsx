'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/components/Analytics'

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!dismissed) setVisible(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [dismissed])

  if (dismissed) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-label="Ação rápida"
    >
      <div
        className="mx-3 mb-3 rounded-2xl border border-purple-500/30 p-4 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.95) 0%, rgba(109,40,217,0.98) 100%)', backdropFilter: 'blur(12px)', boxShadow: '0 -4px 30px rgba(0,0,0,0.5), 0 0 40px rgba(124,58,237,0.25)' }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">Começar minha evolução</p>
          <p className="text-purple-200 text-xs mt-0.5">Devolutiva em até 48h · Sem fidelidade</p>
        </div>
        <a
          href="#planos"
          className="bg-white text-purple-700 font-bold text-sm px-5 py-2.5 rounded-xl flex-shrink-0 active:scale-95 transition-transform"
          onClick={() => trackEvent('cta_click', { source: 'floating_mobile' })}
        >
          Ver planos
        </a>
        <button
          onClick={() => { setDismissed(true); setVisible(false) }}
          className="text-purple-300/60 hover:text-purple-200 transition-colors flex-shrink-0 p-0.5"
          aria-label="Fechar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
