'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, AlertTriangle, CheckCircle2, Minus } from 'lucide-react'
import { detectSimilarity, type SimilarityResult } from '@/lib/actions/correction-tools'

interface Props {
  essayId: string
  contentText: string | null
  studentId: string
  onClose: () => void
}

const LEVEL_CONFIG = {
  high:   { label: 'Alta similaridade',   color: 'text-red-400',    bg: 'bg-red-500/10',   border: 'border-red-500/25',   icon: AlertTriangle },
  medium: { label: 'Média similaridade',  color: 'text-amber-400',  bg: 'bg-amber-500/10', border: 'border-amber-500/25', icon: Minus },
  low:    { label: 'Baixa similaridade',  color: 'text-green-400',  bg: 'bg-green-500/10', border: 'border-green-500/25', icon: CheckCircle2 },
}

function relativeDate(iso: string) {
  const ms   = Date.now() - new Date(iso).getTime()
  const days = Math.floor(ms / 86_400_000)
  if (days < 1) return 'hoje'
  if (days === 1) return 'ontem'
  if (days < 30) return `há ${days} dias`
  return `há ${Math.floor(days / 30)} meses`
}

export function SimilarityPanel({ essayId, contentText, studentId, onClose }: Props) {
  const [loading,  setLoading]  = useState(true)
  const [results,  setResults]  = useState<SimilarityResult[] | null>(null)
  const [noText,   setNoText]   = useState(false)

  useEffect(() => {
    if (!contentText || contentText.startsWith('[IMAGEM]')) {
      setNoText(true)
      setLoading(false)
      return
    }
    detectSimilarity(essayId, contentText, studentId).then(res => {
      setResults(res)
      setLoading(false)
    })
  }, [essayId, contentText, studentId])

  const highCount   = results?.filter(r => r.level === 'high').length   ?? 0
  const mediumCount = results?.filter(r => r.level === 'medium').length ?? 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-over */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0f0f0f] border-l border-white/[0.08] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div>
            <h2 className="text-sm font-bold text-white">Verificar similaridade</h2>
            <p className="text-[11px] text-gray-600 mt-0.5">Revisão interna — não é um laudo de plágio</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/[0.07] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mx-4 mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2.5">
          <p className="text-[10px] text-amber-300/80 leading-relaxed">
            Esta ferramenta compara o texto com redações anteriores do mesmo aluno e uma amostra da plataforma.
            É um <strong>auxílio para revisão</strong>, não uma prova de plágio.
            A decisão final é sempre do professor.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col gap-3 mt-2">
              {[1,2,3].map(i => (
                <div key={i} className="h-24 rounded-xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
              ))}
              <p className="text-[11px] text-gray-700 text-center mt-2">Analisando similaridade...</p>
            </div>
          ) : noText ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
              <p className="text-sm text-gray-500">Análise indisponível</p>
              <p className="text-[11px] text-gray-700">
                A similaridade não pode ser verificada em redações enviadas como imagem ou PDF.
              </p>
            </div>
          ) : !results || results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center mt-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-green-400" />
              </div>
              <p className="text-sm font-semibold text-white">Sem correspondências significativas</p>
              <p className="text-[11px] text-gray-600 max-w-xs leading-relaxed">
                Nenhuma redação com similaridade relevante foi encontrada na amostra analisada.
              </p>
            </div>
          ) : (
            <>
              {/* Summary */}
              {(highCount > 0 || mediumCount > 0) && (
                <div className={`rounded-xl border px-4 py-3 mb-4 ${
                  highCount > 0
                    ? 'border-red-500/30 bg-red-500/[0.05]'
                    : 'border-amber-500/25 bg-amber-500/[0.04]'
                }`}>
                  <p className={`text-xs font-semibold ${highCount > 0 ? 'text-red-400' : 'text-amber-400'}`}>
                    {highCount > 0
                      ? `${highCount} redação${highCount > 1 ? 'ões' : ''} com alta similaridade detectada${highCount > 1 ? 's' : ''}`
                      : `${mediumCount} redação${mediumCount > 1 ? 'ões' : ''} com média similaridade`}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${highCount > 0 ? 'text-red-400/70' : 'text-amber-400/70'}`}>
                    Revise os trechos em destaque abaixo antes de decidir.
                  </p>
                </div>
              )}

              {/* Result cards */}
              <div className="space-y-3">
                {results.map(result => {
                  const cfg = LEVEL_CONFIG[result.level]
                  const Icon = cfg.icon
                  const pct  = Math.round(result.similarity * 100)
                  return (
                    <div key={result.essayId} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-3`}>
                      <div className="flex items-start gap-2.5 mb-2">
                        <Icon size={13} className={`${cfg.color} flex-shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-white line-clamp-1">{result.themeTitle}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold ${cfg.color}`}>{pct}% similar</span>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${cfg.border} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <span className="text-[10px] text-gray-700">{relativeDate(result.submittedAt)}</span>
                          </div>
                        </div>
                        <Link
                          href={`/professor/redacoes/${result.essayId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] font-semibold text-purple-400 hover:text-purple-300 transition-colors flex-shrink-0 border border-purple-500/20 rounded px-2 py-0.5"
                        >
                          Abrir
                        </Link>
                      </div>

                      {/* Matching phrases */}
                      {result.matchingPhrases.length > 0 && (
                        <div className="space-y-1 mt-2">
                          <p className="text-[9px] font-semibold text-gray-600 uppercase tracking-wider">Trechos em comum:</p>
                          {result.matchingPhrases.map((phrase, i) => (
                            <p key={i} className={`text-[10px] leading-relaxed italic px-2 py-1 rounded border ${cfg.border} bg-black/20 ${cfg.color}`}>
                              &ldquo;{phrase}&rdquo;
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
