'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const SUBJECTS = ['Português', 'Inglês', 'Redação', 'Literatura'] as const

export default function NewLessonForm({ professorId }: { professorId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const sessionDate = fd.get('session_date') as string
    const sessionTime = (fd.get('session_time') as string) || null
    const subject     = (fd.get('subject') as string) || null
    const studentName = (fd.get('student_name') as string)?.trim() || null
    const meetLink    = (fd.get('meet_link') as string)?.trim() || null
    const topic       = (fd.get('topic') as string)?.trim() || null
    const durationMin = parseInt(fd.get('duration_min') as string) || 60
    const priceBrl    = parseFloat(fd.get('price_brl') as string) || 20

    if (!sessionDate) {
      setError('Data é obrigatória')
      setSaving(false)
      return
    }

    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertErr } = await (supabase as any)
      .from('lesson_sessions')
      .insert({
        professor_id: professorId,
        session_date: sessionDate,
        session_time: sessionTime,
        subject,
        student_name: studentName,
        meet_link: meetLink,
        topic,
        duration_min: durationMin,
        price_brl: priceBrl,
        status: 'scheduled',
      })

    if (insertErr) {
      console.error('[NewLessonForm] Insert error:', insertErr)
      setError(insertErr.message ?? 'Erro ao criar aula')
      setSaving(false)
      return
    }

    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white transition-colors"
      >
        <Plus size={16} />
        Nova aula
      </button>
    )
  }

  return (
    <div className="card-dark rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Agendar nova aula</h3>
        <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-400 transition-colors">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Date */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Data *</label>
          <input
            type="date"
            name="session_date"
            required
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Horário</label>
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

        {/* Student name */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Aluno(a)</label>
          <input
            type="text"
            name="student_name"
            placeholder="Nome do aluno"
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Meet link */}
        <div className="col-span-2 sm:col-span-2">
          <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Link Google Meet</label>
          <input
            type="url"
            name="meet_link"
            placeholder="https://meet.google.com/..."
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Topic */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Tópico</label>
          <input
            type="text"
            name="topic"
            placeholder="Ex: Verbos irregulares"
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Duração (min)</label>
          <input
            type="number"
            name="duration_min"
            defaultValue={60}
            min={15}
            max={180}
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Valor (R$)</label>
          <input
            type="number"
            name="price_brl"
            defaultValue={20}
            min={0}
            step={0.01}
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Submit */}
        <div className="col-span-2 sm:col-span-3 flex items-center gap-3 mt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Agendar aula'}
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
