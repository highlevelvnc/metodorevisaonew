'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CalendarPlus, X, CheckCircle2, CreditCard } from 'lucide-react'
import { requestLessonAction } from '@/lib/actions/lessons'

const SUBJECTS = ['Português', 'Inglês', 'Redação', 'Literatura'] as const

export default function BookLessonForm({ hasCredits = true, creditsLeft, creditsTotal }: { hasCredits?: boolean; creditsLeft?: number; creditsTotal?: number }) {
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
    router.refresh()
  }

  if (!hasCredits) {
    return (
      <Link
        href="/aluno/reforco-escolar/planos"
        className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white transition-colors"
      >
        <CreditCard size={16} />
        Adquirir plano de aulas
      </Link>
    )
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
      <div className="card-dark rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={18} className="text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Solicitação enviada com sucesso!</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              A professora recebeu sua solicitação por e-mail e vai confirmar em até 24 horas.
              Quando confirmada, você receberá um e-mail com o link do Google Meet.
            </p>
          </div>
          <button
            onClick={() => { setDone(false); setOpen(false) }}
            className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-3">
          <button
            onClick={() => setDone(false)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            <CalendarPlus size={12} />
            Agendar mais uma aula
          </button>
          <span className="text-[10px] text-gray-700">Enquanto aguarda a confirmação</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card-dark rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white">Solicitar aula de reforço</h3>
          <p className="text-[11px] text-gray-600 mt-0.5">
            Com Beatriz Dias (8+ anos, ★ 4.9)
            {creditsLeft !== undefined && creditsTotal !== undefined && (
              <span className="ml-2 text-purple-400 font-medium">· {creditsLeft}/{creditsTotal} aulas</span>
            )}
          </p>
        </div>
        <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0 ml-3">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-3 gap-3" aria-disabled={saving}>
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
          <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Matéria *</label>
          <select
            name="subject"
            required
            defaultValue=""
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="" disabled>Selecionar matéria</option>
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
