'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { zeroEssay, ZERO_REASON_LABELS, type ZeroReason } from '@/lib/actions/correction-tools'

interface Props {
  essayId: string
  studentName: string
  themeTitle: string
  reviewerName: string
  onClose: () => void
}

const REASONS: ZeroReason[] = [
  'fuga_total_tema',
  'texto_insuficiente',
  'copia_motivadores',
  'improperio',
  'redacao_em_branco',
  'parte_desconectada',
]

export function ZeroEssayModal({ essayId, studentName, themeTitle, reviewerName, onClose }: Props) {
  const [step, setStep]           = useState<1 | 2>(1)
  const [reason, setReason]       = useState<ZeroReason | ''>('')
  const [note, setNote]           = useState('')
  const [error, setError]         = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    if (!reason) { setError('Selecione um motivo antes de continuar.'); return }
    setStep(2)
    setError(null)
  }

  function handleExecute() {
    if (!reason) return
    setError(null)
    startTransition(async () => {
      const result = await zeroEssay(essayId, reason as ZeroReason, note || null, reviewerName)
      if (result?.error) {
        setError(result.error)
        setStep(1)
      }
      // On success, server action redirects — no further action needed
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="w-full max-w-md bg-[#121212] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-red-500/20 bg-red-500/[0.04]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle size={15} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Zerar redação</p>
                <p className="text-[10px] text-red-400/70">Ação irreversível — requer motivo</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-300 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="p-5">
            {/* Essay context */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 mb-4">
              <p className="text-[10px] text-gray-600 mb-0.5">Aluno</p>
              <p className="text-sm font-semibold text-white">{studentName}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{themeTitle}</p>
            </div>

            {step === 1 && (
              <>
                {/* Reason selection */}
                <p className="text-xs font-semibold text-gray-400 mb-3">Selecione o motivo do zeramento:</p>
                <div className="space-y-1.5 mb-4">
                  {REASONS.map(r => (
                    <label
                      key={r}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                        reason === r
                          ? 'border-red-500/40 bg-red-500/[0.07] text-white'
                          : 'border-white/[0.06] hover:border-white/[0.1] text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="zero_reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => { setReason(r); setError(null) }}
                        className="accent-red-500"
                      />
                      <span className="text-[12px] font-medium">{ZERO_REASON_LABELS[r]}</span>
                    </label>
                  ))}
                </div>

                {/* Optional note */}
                <p className="text-xs font-semibold text-gray-400 mb-2">Observação adicional (opcional):</p>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ex: 3 parágrafos copiados do texto motivador 2."
                  rows={2}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-red-500/40 mb-4"
                />

                {error && (
                  <p className="text-xs text-red-400 mb-3">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!reason}
                    className="flex-1 py-2.5 rounded-xl bg-red-600/80 border border-red-500/50 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Continuar →
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Final confirmation */}
                <div className="rounded-xl border border-red-500/25 bg-red-500/[0.05] px-4 py-4 mb-4">
                  <p className="text-xs font-bold text-red-400 mb-2">⚠ Você está prestes a:</p>
                  <ul className="space-y-1 text-[12px] text-gray-400">
                    <li>• Definir todas as competências como 0/200</li>
                    <li>• Marcar a redação como corrigida (nota 0)</li>
                    <li>• Registrar o motivo: <strong className="text-white">{reason ? ZERO_REASON_LABELS[reason as ZeroReason] : ''}</strong></li>
                    <li>• Tornar a devolutiva visível ao aluno imediatamente</li>
                  </ul>
                  <p className="text-[11px] text-red-400/70 mt-3">Esta ação é permanente e não pode ser desfeita sem contato com o administrador.</p>
                </div>

                {error && (
                  <p className="text-xs text-red-400 mb-3">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(null) }}
                    className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
                  >
                    ← Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleExecute}
                    disabled={isPending}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 border border-red-500/60 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Zerando...
                      </span>
                    ) : (
                      'Confirmar zeramento'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
