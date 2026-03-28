'use client'

import { useState, useCallback } from 'react'
import { Share2, Copy, Check, MessageCircle } from 'lucide-react'

interface InviteCardProps {
  firstName: string
  avgScore: number | null
}

function getInviteUrl(): string {
  return typeof window !== 'undefined'
    ? `${window.location.origin}/cadastro`
    : 'https://metodorevisao.com/cadastro'
}

function getShareText(firstName: string, avgScore: number | null): string {
  if (avgScore !== null) {
    return `Estou usando o Método Revisão para treinar redação ENEM — minha média atual é ${avgScore} pts. Cada devolutiva mostra exatamente onde melhorar. Experimenta:`
  }
  return `Estou usando o Método Revisão para treinar redação ENEM. A devolutiva é individual e chega em até 24h. Experimenta:`
}

export function InviteCard({ firstName, avgScore }: InviteCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const url = getInviteUrl()
    const text = `${getShareText(firstName, avgScore)}\n${url}`
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }, [firstName, avgScore])

  const waUrl = `https://wa.me/?text=${encodeURIComponent(
    `${getShareText(firstName, avgScore)}\n${getInviteUrl()}`
  )}`

  return (
    <div className="card-dark rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
          <Share2 size={16} className="text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white mb-0.5">
            Conhece alguém que precisa treinar redação?
          </p>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Compartilhe o Método Revisão com um amigo, colega ou professor.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-xs font-semibold text-gray-400 hover:text-white transition-all"
            >
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              {copied ? 'Copiado!' : 'Copiar convite'}
            </button>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-green-500/20 bg-green-500/[0.05] hover:bg-green-500/[0.1] text-xs font-semibold text-green-400 transition-all"
            >
              <MessageCircle size={12} />
              Enviar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
