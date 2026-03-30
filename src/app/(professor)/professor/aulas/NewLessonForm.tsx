'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Search, UserCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { scheduleLessonAction } from '@/lib/actions/lessons'

const SUBJECTS = ['Português', 'Inglês', 'Redação', 'Literatura'] as const

type StudentResult = { id: string; full_name: string | null; email: string }

function StudentPicker({
  onSelect,
}: {
  onSelect: (s: StudentResult | null) => void
}) {
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState<StudentResult[]>([])
  const [loading, setLoading]     = useState(false)
  const [selected, setSelected]   = useState<StudentResult | null>(null)
  const [open, setOpen]           = useState(false)
  const debounceRef               = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef              = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleInput(value: string) {
    setQuery(value)
    setOpen(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const supabase = createClient()
      const search = value.trim()
      const { data } = await (supabase as any)
        .from('users')
        .select('id, full_name, email')
        .or(`email.ilike.${search}%,full_name.ilike.%${search}%`)
        .eq('role', 'student')
        .limit(6)
      setResults((data as StudentResult[]) ?? [])
      setLoading(false)
    }, 300)
  }

  function pick(s: StudentResult) {
    setSelected(s)
    setQuery(s.email)
    setResults([])
    setOpen(false)
    onSelect(s)
  }

  function clear() {
    setSelected(null)
    setQuery('')
    setResults([])
    onSelect(null)
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
        Aluno(a) — buscar por nome ou email
      </label>
      <div className="relative flex items-center">
        {selected ? (
          <UserCheck size={13} className="absolute left-3 text-green-400 pointer-events-none" />
        ) : (
          <Search size={13} className="absolute left-3 text-gray-600 pointer-events-none" />
        )}
        <input
          type="email"
          value={query}
          onChange={e => { if (selected) clear(); handleInput(e.target.value) }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Nome ou email do aluno"
          autoComplete="off"
          className={`w-full bg-white/[0.04] border rounded-lg pl-8 pr-8 py-2 text-sm placeholder-gray-700 focus:outline-none focus:border-purple-500/50 transition-colors ${
            selected ? 'border-green-500/40 text-green-300' : 'border-white/[0.10] text-white'
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2.5 text-gray-600 hover:text-gray-400 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {selected && (
        <p className="text-[11px] text-green-400 mt-1 truncate">
          {selected.full_name ? `${selected.full_name} · ${selected.email}` : selected.email}
        </p>
      )}

      {open && (results.length > 0 || loading) && (
        <ul className="absolute z-50 top-full mt-1 w-full bg-[#0f1623] border border-white/[0.12] rounded-xl shadow-xl overflow-hidden">
          {loading && (
            <li className="px-3 py-2.5 text-xs text-gray-600">Buscando…</li>
          )}
          {!loading && results.map(s => (
            <li key={s.id}>
              <button
                type="button"
                onMouseDown={() => pick(s)}
                className="w-full text-left px-3 py-2.5 hover:bg-white/[0.06] transition-colors"
              >
                <p className="text-xs font-medium text-gray-200 truncate">{s.full_name ?? '—'}</p>
                <p className="text-[11px] text-gray-500 truncate">{s.email}</p>
              </button>
            </li>
          ))}
          {!loading && results.length === 0 && query.length >= 2 && (
            <li className="px-3 py-2.5 text-xs text-gray-600">Nenhum aluno encontrado</li>
          )}
        </ul>
      )}
    </div>
  )
}

export default function NewLessonForm({ professorId: _ }: { professorId: string }) {
  const router = useRouter()
  const [open, setOpen]         = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [student, setStudent]   = useState<StudentResult | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const sessionDate = fd.get('session_date') as string
    const sessionTime = (fd.get('session_time') as string) || null
    const subject     = (fd.get('subject') as string) || null
    const meetLink    = (fd.get('meet_link') as string)?.trim() || null
    const topic       = (fd.get('topic') as string)?.trim() || null
    const durationMin = parseInt(fd.get('duration_min') as string) || 60
    const priceBrl    = parseFloat(fd.get('price_brl') as string) || 20

    if (!sessionDate) {
      setError('Data é obrigatória')
      setSaving(false)
      return
    }

    const result = await scheduleLessonAction({
      sessionDate,
      sessionTime,
      subject,
      studentId:   student?.id   ?? null,
      studentName: student?.full_name ?? null,
      meetLink,
      topic,
      durationMin,
      priceBrl,
    })

    if (result.error) {
      setError(result.error)
      setSaving(false)
      return
    }

    setSaving(false)
    setOpen(false)
    setStudent(null)
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
            min={new Date().toISOString().slice(0, 10)}
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

        {/* Student picker — full width */}
        <div className="col-span-2 sm:col-span-3">
          <StudentPicker onSelect={setStudent} />
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
