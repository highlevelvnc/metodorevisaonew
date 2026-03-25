'use client'
import { useState, useEffect } from 'react'

const notificacoes = [
  { nome: 'Mariana S.', local: 'São Paulo, SP',       acao: 'assinou o plano Estratégia',       tempo: 'há 2h'  },
  { nome: 'Lucas A.',   local: 'Belo Horizonte, MG',  acao: 'evoluiu +160 pts na redação',      tempo: 'há 3h'  },
  { nome: 'Letícia F.', local: 'Fortaleza, CE',        acao: 'recebeu sua devolutiva hoje',      tempo: 'há 5h'  },
  { nome: 'Pedro M.',   local: 'Recife, PE',           acao: 'assinou o plano Evolução',         tempo: 'há 7h'  },
  { nome: 'Ana C.',     local: 'Campinas, SP',         acao: 'assinou o plano Intensivo',        tempo: 'há 9h'  },
  { nome: 'Rafaela T.', local: 'Curitiba, PR',         acao: 'subiu de 600 para 800 na redação', tempo: 'há 11h' },
  { nome: 'Gabriel M.', local: 'Salvador, BA',         acao: 'assinou o plano Estratégia',       tempo: 'há 14h' },
]

export default function SocialProofToast() {
  const [current, setCurrent]   = useState(0)
  const [visible, setVisible]   = useState(false)
  const [mounted, setMounted]   = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Start after 5s
    const startTimer = setTimeout(() => {
      if (!dismissed) setVisible(true)
    }, 5000)
    return () => clearTimeout(startTimer)
  }, [])

  useEffect(() => {
    if (!visible || dismissed) return
    // Cycle every 6s: hide → change → show
    const cycleTimer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent(c => (c + 1) % notificacoes.length)
        setVisible(true)
      }, 600)
    }, 6000)
    return () => clearInterval(cycleTimer)
  }, [visible, dismissed])

  if (!mounted || dismissed) return null

  const n = notificacoes[current]
  const initials = n.nome.split(' ').map(w => w[0]).join('').slice(0,2)

  return (
    <div
      className={`fixed bottom-6 left-4 z-40 hidden sm:block transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
      role="status"
      aria-live="polite"
    >
      <div
        className="flex items-center gap-3 rounded-xl border border-white/[0.08] px-4 py-3 max-w-[280px] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        style={{ background: 'rgba(15,20,32,0.95)', backdropFilter: 'blur(12px)' }}
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs flex-shrink-0">
          {initials}
        </div>
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold leading-tight truncate">{n.nome}</p>
          <p className="text-gray-400 text-[11px] leading-tight mt-0.5">{n.acao}</p>
          <p className="text-gray-600 text-[10px] mt-0.5">{n.local} · {n.tempo}</p>
        </div>
        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-700 hover:text-gray-500 transition-colors flex-shrink-0"
          aria-label="Fechar notificação"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
