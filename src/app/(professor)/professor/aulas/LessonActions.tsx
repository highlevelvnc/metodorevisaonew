'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, CheckCircle2 } from 'lucide-react'
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
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [meetLink, setMeetLink] = useState('')

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
    router.refresh()
  }

  async function handleComplete() {
    if (!window.confirm('Marcar esta aula como concluída?')) return
    setBusy(true)
    setError(null)
    const result = await completeLessonAction(lessonId)
    setBusy(false)
    if (result.error) { setError(result.error); return }
    router.refresh()
  }

  async function handleCancel() {
    if (!window.confirm('Cancelar esta aula?')) return
    setBusy(true)
    setError(null)
    const result = await cancelLessonAction(lessonId)
    setBusy(false)
    if (result.error) { setError(result.error); return }
    router.refresh()
  }

  if (status === 'completed' || status === 'cancelled') return null

  return (
    <div className="flex items-center gap-1.5">
      {error && <span className="text-[10px] text-red-400 mr-1">{error}</span>}

      {/* Requested → show confirm inline form or button */}
      {status === 'requested' && !confirmOpen && (
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={busy}
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-green-500/15 border border-green-500/25 text-green-400 hover:bg-green-500/25 transition-colors disabled:opacity-50"
          title="Confirmar aula"
        >
          <Check size={10} />
          Confirmar
        </button>
      )}

      {status === 'requested' && confirmOpen && (
        <div className="flex items-center gap-1.5">
          <input
            type="url"
            value={meetLink}
            onChange={e => setMeetLink(e.target.value)}
            placeholder="Link do Meet (opcional)"
            className="w-44 bg-white/[0.04] border border-white/[0.10] rounded-md px-2 py-1 text-[11px] text-white placeholder-gray-700 focus:outline-none focus:border-green-500/50"
          />
          <button
            onClick={handleConfirm}
            disabled={busy}
            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-green-600 text-white hover:bg-green-500 transition-colors disabled:opacity-50"
          >
            {busy ? '...' : <><Check size={10} /> OK</>}
          </button>
          <button
            onClick={() => setConfirmOpen(false)}
            className="text-gray-600 hover:text-gray-400 transition-colors"
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
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-green-500/15 border border-green-500/25 text-green-400 hover:bg-green-500/25 transition-colors disabled:opacity-50"
          title="Marcar como concluída"
        >
          <CheckCircle2 size={10} />
          Concluir
        </button>
      )}

      {/* Cancel button for both requested and scheduled */}
      {(status === 'requested' || status === 'scheduled') && !confirmOpen && (
        <button
          onClick={handleCancel}
          disabled={busy}
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-gray-500 hover:text-red-400 hover:border-red-500/25 transition-colors disabled:opacity-50"
          title="Cancelar aula"
        >
          <X size={10} />
        </button>
      )}
    </div>
  )
}
