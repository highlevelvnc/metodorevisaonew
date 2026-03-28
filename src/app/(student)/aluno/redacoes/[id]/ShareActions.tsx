'use client'

import { useState, useCallback } from 'react'
import { Share2, Link2, Check, X, MessageCircle, Copy } from 'lucide-react'
import { generateShareToken, revokeShareToken } from '@/lib/actions/share'

interface ShareActionsProps {
  essayId: string
  themeTitle: string
  totalScore: number
  initialShareToken: string | null
}

function getShareUrl(token: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}/compartilhar/${token}`
}

function getWhatsAppText(themeTitle: string, totalScore: number, url: string): string {
  return `Minha devolutiva de redação ENEM 📝\n\nTema: ${themeTitle}\nNota: ${totalScore}/1000\n\nVeja o relatório completo:\n${url}`
}

function getSummaryText(themeTitle: string, totalScore: number): string {
  return `📝 Redação ENEM — ${themeTitle}\n🎯 Nota: ${totalScore}/1000\n📊 Corrigida pelo Método Revisão`
}

export function ShareActions({ essayId, themeTitle, totalScore, initialShareToken }: ShareActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [shareToken, setShareToken] = useState(initialShareToken)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<'link' | 'summary' | null>(null)

  const handleGenerateLink = useCallback(async () => {
    setLoading(true)
    try {
      const token = await generateShareToken(essayId)
      if (token) setShareToken(token)
    } finally {
      setLoading(false)
    }
  }, [essayId])

  const handleRevoke = useCallback(async () => {
    setLoading(true)
    try {
      const ok = await revokeShareToken(essayId)
      if (ok) setShareToken(null)
    } finally {
      setLoading(false)
    }
  }, [essayId])

  const copyToClipboard = useCallback(async (text: string, type: 'link' | 'summary') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    }
  }, [])

  const shareUrl = shareToken ? getShareUrl(shareToken) : null

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-white border border-white/[0.07] hover:border-white/[0.15] px-3.5 py-2 rounded-xl transition-all"
      >
        <Share2 size={13} />
        Compartilhar
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border border-white/[0.08] bg-[#0f1629] shadow-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-white">Compartilhar devolutiva</p>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* ── Quick actions (always available) ── */}
            <div className="space-y-2 mb-4">
              {/* Copy summary */}
              <button
                type="button"
                onClick={() => copyToClipboard(getSummaryText(themeTitle, totalScore), 'summary')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left"
              >
                {copied === 'summary' ? <Check size={14} className="text-green-400 flex-shrink-0" /> : <Copy size={14} className="text-gray-500 flex-shrink-0" />}
                <div>
                  <p className="text-xs font-semibold text-gray-300">Copiar resumo</p>
                  <p className="text-[10px] text-gray-600">Tema, nota e assinatura</p>
                </div>
              </button>

              {/* WhatsApp */}
              {shareUrl ? (
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(getWhatsAppText(themeTitle, totalScore, shareUrl))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-green-500/20 bg-green-500/[0.04] hover:bg-green-500/[0.08] transition-all"
                >
                  <MessageCircle size={14} className="text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-green-300">Enviar por WhatsApp</p>
                    <p className="text-[10px] text-green-400/60">Inclui link para a devolutiva</p>
                  </div>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateLink}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-green-500/15 bg-green-500/[0.03] hover:bg-green-500/[0.06] transition-all text-left opacity-70 hover:opacity-100"
                >
                  <MessageCircle size={14} className="text-green-400/60 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-green-300/60">Enviar por WhatsApp</p>
                    <p className="text-[10px] text-green-400/40">Gere o link público primeiro</p>
                  </div>
                </button>
              )}
            </div>

            {/* ── Share link section ── */}
            <div className="border-t border-white/[0.06] pt-3">
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Link público
              </p>

              {shareToken && shareUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2">
                      <p className="text-[11px] text-gray-400 truncate font-mono">{shareUrl}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(shareUrl, 'link')}
                      className="flex-shrink-0 w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.06] transition-colors"
                    >
                      {copied === 'link' ? <Check size={12} className="text-green-400" /> : <Link2 size={12} className="text-gray-500" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-600">
                      Qualquer pessoa com o link pode ver a devolutiva
                    </p>
                    <button
                      type="button"
                      onClick={handleRevoke}
                      disabled={loading}
                      className="text-[10px] font-medium text-red-400/70 hover:text-red-400 transition-colors"
                    >
                      Revogar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateLink}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-purple-500/20 bg-purple-500/[0.05] hover:bg-purple-500/[0.1] text-purple-400 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <Link2 size={13} />
                  {loading ? 'Gerando…' : 'Gerar link compartilhável'}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
