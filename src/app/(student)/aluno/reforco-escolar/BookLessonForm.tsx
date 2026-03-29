'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarPlus, X, CheckCircle2 } from 'lucide-react'
import { requestLessonAction } from '@/lib/actions/lessons'

const SUBJECTS = ['Português', 'Inglês', 'Redação', 'Literatura'] as const

export default function BookLessonForm() {
  const router   = useRouter()
  const [open, setOpen]     = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone]     = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const result = await requestLessonAction({
      sessionDate: fd.get('session_date') as string,
      sessionTime: (fd.get('session_time') as string) || null,
      subject:     (fd.get('subject') as string) || null,
      notes:       (fd.get('notes') as string)?.trim() || null,
    })

    setSaving(false)
    if (result.error) { setError(result.error); return }
    setDone(true)
    setTimeout(() => {
      setOpen(false)
      setDone(false)
      router.refresh()
    }, 2500)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white transition-colors"
      >
        <CalendarPlus size={16} />
        Solicitar aula
      </button>
    )
  }

  if (done) {
    return (
      <div className="card-dark rounded-2xl p-6 flex items-center gap-3">
        <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-white">Solicitação enviada!</p>
          <p className="text-xs text-gray-500 mt-0.5">A professora receberá um aviso e confirmará em breve.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-dark rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white">Solicitar aula de reforço</h3>
          <p className="text-[11px] text-gray-600 mt-0.5">Informe a data e matéria. A professora confirmará em breve.</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0 ml-3">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Date */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Data preferida *</label>
          <input
            type="date"
            name="session_date"
            required
            min={new Date().toISOString().slice(0, 10)}
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Horário preferido</label>
          <input
            type="time"
            name="session_time"
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Matéria</label>
          <select
            name="subject"
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="">Selecionar</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Notes */}
        <div className="col-span-2 sm:col-span-3">
          <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">O que você quer trabalhar? (opcional)</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Ex: Tenho prova de verbos irregulares na sexta, quero revisar esse conteúdo."
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/50 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="col-span-2 sm:col-span-3 flex items-center gap-3 mt-1">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white transition-colors disabled:opacity-50"
          >
            {saving ? 'Enviando...' : 'Enviar solicitação'}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
          >
            Cancelar
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </form>
    </div>
  )
}
