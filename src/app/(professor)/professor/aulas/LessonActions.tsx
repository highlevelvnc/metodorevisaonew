'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, CheckCircle2, Loader2 } from 'lucide-react'
import { confirmLessonAction, completeLessonAction, cancelLessonAction } from '@/lib/actions/lessons'
import type { LessonStatus } from '@/lib/supabase/types'

export default function LessonActions({
  lessonId,
  status,
}: {
  lessonId: string
  status: LessonStatus
}) {
  const router  = useRouter()
  const [busy, setBusy]           = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [meetLink, setMeetLink]   = useState('')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 4000)
  }

  async function handleConfirm() {
    setBusy(true)
    setError(null)
    const result = await confirmLessonAction({
      lessonId,
      meetLink: meetLink.trim() || null,
    })
    setBusy(false)
    if (result.error) { setError(result.error); return }
    setConfirmOpen(false)
    showSuccess('Aula confirmada! Aluno notificado por e-mail.')
    router.refresh()
  }

  async function handleComplete() {
    if (!window.confirm('Marcar esta aula como concluída?')) return
    setBusy(true)
    setError(null)
    const result = await completeLessonAction(lessonId)
    setBusy(false)
    if (result.error) { setError(result.error); return }
    showSuccess('Aula marcada como concluída.')
    router.refresh()
  }

  async function handleCancel() {
    const msg = status === 'scheduled'
      ? 'Cancelar esta aula confirmada? O crédito será devolvido ao aluno.'
      : 'Cancelar esta solicitação?'
    if (!window.confirm(msg)) return
    setBusy(true)
    setError(null)
    const result = await cancelLessonAction(lessonId)
    setBusy(false)
    if (result.error) { setError(result.error); return }
    router.refresh()
  }

  if (status === 'completed' || status === 'cancelled') return null

  // Success feedback banner
  if (successMsg) {
    return (
      <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg animate-fade-in">
        <CheckCircle2 size={11} />
        {successMsg}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {error && <span className="text-[10px] text-red-400 mr-1 max-w-[160px] truncate">{error}</span>}

      {/* Requested → show confirm inline form or button */}
      {status === 'requested' && !confirmOpen && (
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={busy}
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-green-500/15 border border-green-500/25 text-green-400 hover:bg-green-500/25 transition-colors disabled:opacity-50"
          title="Confirmar aula e notificar aluno"
        >
          <Check size={10} />
          Confirmar
        </button>
      )}

      {status === 'requested' && confirmOpen && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <input
            type="url"
            value={meetLink}
            onChange={e => setMeetLink(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="w-full sm:w-64 bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-1.5 text-[11px] text-white placeholder-gray-700 focus:outline-none focus:border-green-500/50"
          />
          <button
            onClick={handleConfirm}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors disabled:opacity-50"
          >
            {busy ? (
              <><Loader2 size={10} className="animate-spin" /> Confirmando...</>
            ) : (
              <><Check size={10} /> Confirmar e notificar aluno</>
            )}
          </button>
          <button
            onClick={() => setConfirmOpen(false)}
            className="text-gray-600 hover:text-gray-400 transition-colors p-1"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Scheduled → show complete button */}
      {status === 'scheduled' && (
        <button
          onClick={handleComplete}
          disabled={busy}
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-green-500/15 border border-green-500/25 text-green-400 hover:bg-green-500/25 transition-colors disabled:opacity-50"
          title="Marcar como concluída"
        >
          {busy ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />}
          Concluir
        </button>
      )}

      {/* Cancel button for both requested and scheduled */}
      {(status === 'requested' || status === 'scheduled') && !confirmOpen && (
        <button
          onClick={handleCancel}
          disabled={busy}
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-500 hover:text-red-400 hover:border-red-500/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={status === 'scheduled' ? 'Cancelar aula (crédito devolvido)' : 'Cancelar solicitação'}
        >
          <X size={10} />
        </button>
      )}
    </div>
  )
}
