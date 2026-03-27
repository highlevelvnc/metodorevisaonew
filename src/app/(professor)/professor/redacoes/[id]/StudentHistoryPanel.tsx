'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'
import { fetchStudentHistory, type StudentHistoryResult } from '@/lib/actions/correction-tools'
import { COMP_COLORS } from '@/lib/competency-colors'

interface Props {
  studentId: string
  studentName: string
  currentEssayId: string
  onClose: () => void
}

const COMP_LABELS = ['C1','C2','C3','C4','C5'] as const
const COMP_KEYS   = ['c1_score','c2_score','c3_score','c4_score','c5_score'] as const
const COMP_CC     = (['c1','c2','c3','c4','c5'] as const)

function relativeDate(iso: string) {
  const ms   = Date.now() - new Date(iso).getTime()
  const days = Math.floor(ms / 86_400_000)
  if (days < 1) return 'hoje'
  if (days === 1) return 'ontem'
  if (days < 30) return `há ${days} dias`
  return `há ${Math.floor(days / 30)} meses`
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-gray-600">—</span>
  const color =
    score >= 800 ? 'text-green-400' :
    score >= 600 ? 'text-purple-400' :
    score >= 400 ? 'text-amber-400' : 'text-red-400'
  return <span className={`text-sm font-bold tabular-nums ${color}`}>{score}</span>
}

export function StudentHistoryPanel({ studentId, studentName, currentEssayId, onClose }: Props) {
  const [loading, setLoading] = useState(true)
  const [data, setData]       = useState<StudentHistoryResult | null>(null)

  useEffect(() => {
    fetchStudentHistory(studentId).then(result => {
      setData(result)
      setLoading(false)
    })
  }, [studentId])

  const firstName = studentName.split(' ')[0]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0f0f0f] border-l border-white/[0.08] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div>
            <h2 className="text-sm font-bold text-white">Histórico de {firstName}</h2>
            <p className="text-[11px] text-gray-600 mt-0.5">Redações anteriores desta aluna/aluno</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/[0.07] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-3 p-5">
              {[1,2,3].map(i => (
                <div key={i} className="h-20 rounded-xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
              ))}
            </div>
          ) : !data || data.essays.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 px-5 text-center">
              <p className="text-sm text-gray-500">Nenhuma redação anterior encontrada.</p>
              <p className="text-[11px] text-gray-700">Esta pode ser a primeira redação do aluno.</p>
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3 p-4 border-b border-white/[0.05]">
                <div className="text-center">
                  <p className="text-lg font-bold text-white tabular-nums">{data.avgScore ?? '—'}</p>
                  <p className="text-[10px] text-gray-600">Média</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white tabular-nums">{data.bestScore ?? '—'}</p>
                  <p className="text-[10px] text-gray-600">Melhor</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white tabular-nums">{data.correctedCount}</p>
                  <p className="text-[10px] text-gray-600">Corrigidas</p>
                </div>
              </div>

              {/* Weakest competency badge */}
              {data.weakestComp && (
                <div className="mx-4 mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2 flex items-center gap-2">
                  <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />
                  <p className="text-[11px] text-amber-300">
                    Competência mais fraca recorrente:{' '}
                    <span className={`font-bold ${COMP_COLORS[data.weakestComp as 'c1'|'c2'|'c3'|'c4'|'c5']?.text}`}>
                      {data.weakestComp.toUpperCase().replace('C','C')}
                    </span>
                  </p>
                </div>
              )}

              {/* Essay list */}
              <div className="p-4 space-y-2">
                <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-3">
                  {data.essays.length} redaç{data.essays.length !== 1 ? 'ões' : 'ão'} no histórico
                </p>
                {data.essays.map((essay, idx) => {
                  const isCurrent    = essay.id === currentEssayId
                  const hasCorrected = essay.status === 'corrected'
                  return (
                    <div
                      key={essay.id}
                      className={`rounded-xl border p-3 ${
                        isCurrent
                          ? 'border-purple-500/30 bg-purple-500/[0.06]'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'
                      } transition-colors`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className={`text-[12px] font-medium leading-snug line-clamp-2 flex-1 ${isCurrent ? 'text-purple-200' : 'text-gray-300'}`}>
                          {isCurrent && <span className="text-[9px] text-purple-400 font-bold mr-1">ATUAL</span>}
                          {essay.theme_title}
                        </p>
                        {hasCorrected && <ScoreBadge score={essay.total_score} />}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-700">{relativeDate(essay.submitted_at)}</span>

                        {hasCorrected && essay.total_score !== null && !essay.is_zeroed && (
                          <div className="flex gap-1">
                            {COMP_KEYS.map((k, i) => {
                              const score = essay[k]
                              if (score === null) return null
                              const cc = COMP_CC[i]
                              return (
                                <span
                                  key={k}
                                  className={`text-[9px] font-bold px-1 py-0.5 rounded border tabular-nums ${COMP_COLORS[cc].pill}`}
                                >
                                  {COMP_LABELS[i]} {score}
                                </span>
                              )
                            })}
                          </div>
                        )}

                        {essay.is_zeroed && (
                          <span className="text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded px-1.5 py-0.5">
                            Zerada
                          </span>
                        )}

                        {!hasCorrected && (
                          <span className="text-[9px] text-gray-600">Aguardando</span>
                        )}
                      </div>

                      {/* Evolution arrow between consecutive corrected essays */}
                      {hasCorrected && idx > 0 && (() => {
                        const prev = data.essays.slice(idx + 1).find(e => e.status === 'corrected' && e.total_score !== null)
                        if (!prev || essay.total_score === null || prev.total_score === null) return null
                        const delta = essay.total_score - prev.total_score
                        if (delta === 0) return null
                        return (
                          <div className="mt-1.5 flex items-center gap-1">
                            {delta > 0
                              ? <TrendingUp  size={9} className="text-green-400" />
                              : <TrendingDown size={9} className="text-red-400" />}
                            <span className={`text-[9px] font-semibold ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {delta > 0 ? `+${delta}` : delta} vs redação anterior
                            </span>
                          </div>
                        )
                      })()}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.07]">
          <Link
            href={`/professor/alunos/${studentId}`}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-white/[0.08] text-[11px] font-semibold text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            Ver perfil completo do aluno
          </Link>
        </div>
      </div>
    </>
  )
}
