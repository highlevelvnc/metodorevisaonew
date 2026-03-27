'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Save, Send, ChevronDown, ChevronUp, Clock, Wand2, ArrowRight, History, Search, AlertTriangle, Crosshair } from 'lucide-react'
import { saveCorrection, type Scores } from '@/lib/actions/corrections'
import { COMP_COLORS, type CompKey } from '@/lib/competency-colors'
import { type Annotation } from '@/lib/annotations'
import { ReadyComments } from './ReadyComments'
import { StudentHistoryPanel } from './StudentHistoryPanel'
import { ZeroEssayModal } from './ZeroEssayModal'
import { SimilarityPanel } from './SimilarityPanel'
import { AnnotationLayer, AnnotationList } from './AnnotationLayer'

const COMPETENCIES = [
  {
    key: 'c1' as const,
    label: 'C1',
    name: 'Domínio da Norma Culta',
    desc: 'Ortografia, acentuação, pontuação, morfossintaxe e vocabulário',
    tip: 'Verifique erros ortográficos, regência, concordância e uso de vírgula.',
  },
  {
    key: 'c2' as const,
    label: 'C2',
    name: 'Compreensão da Proposta',
    desc: 'Adequação ao tema e ao tipo textual dissertativo-argumentativo',
    tip: 'A redação discutiu o tema proposto? Há tese clara? Foge da tangência?',
  },
  {
    key: 'c3' as const,
    label: 'C3',
    name: 'Seleção de Argumentos',
    desc: 'Autoria, repertório sociocultural e defesa do ponto de vista',
    tip: 'Os argumentos são pertinentes? Há repertório (dados, autores, obras)?',
  },
  {
    key: 'c4' as const,
    label: 'C4',
    name: 'Mecanismos de Coesão',
    desc: 'Coerência, progressão temática e uso de operadores argumentativos',
    tip: 'Conectivos adequados? Parágrafos bem articulados? Ideias coesas?',
  },
  {
    key: 'c5' as const,
    label: 'C5',
    name: 'Proposta de Intervenção',
    desc: 'Agente, ação detalhada, modo/meio e finalidade da intervenção',
    tip: 'Os 4 elementos estão presentes? A proposta é viável e detalhada?',
  },
] as const

const SCORE_OPTIONS = [0, 40, 80, 120, 160, 200]
const SCORE_LABELS: Record<number, string> = {
  0:   'Ausente',
  40:  'Insufic.',
  80:  'Parcial',
  120: 'Adequado',
  160: 'Bom',
  200: 'Excelente',
}
const AUTOSAVE_DELAY = 8_000 // 8 seconds

// ── Feedback templates per competency per score ──────────────────────────────
const COMP_PHRASES: Record<string, Record<number, string>> = {
  c1: {
    200: 'Excelente domínio da norma culta. Sem desvios ortográficos, de pontuação ou morfossintaxe.',
    160: 'Bom domínio da escrita. Alguns desvios pontuais de pontuação que não comprometem a compreensão.',
    120: 'Domínio mediano. Desvios de ortografia e concordância recorrentes que prejudicam a leitura.',
    80:  'Muitos erros gramaticais comprometendo a clareza. Revise concordância verbal e nominal.',
    40:  'Graves problemas de ortografia e estrutura sintática. Priorize a norma culta.',
    0:   'Desvios críticos que impossibilitam a avaliação adequada do texto.',
  },
  c2: {
    200: 'Excelente compreensão da proposta. Tema abordado com profundidade e tipo textual respeitado.',
    160: 'Boa compreensão do tema. Tese clara e desenvolvimento pertinente, com leve tangência.',
    120: 'Compreensão parcial. A tese está presente, mas o desenvolvimento se afasta do tema em partes.',
    80:  'Tangência ao tema. O texto aborda o assunto superficialmente, sem aprofundar o recorte proposto.',
    40:  'Fuga parcial ao tema. Grande parte do texto não atende à proposta.',
    0:   'Fuga total ao tema proposto.',
  },
  c3: {
    200: 'Argumentação excelente com repertório sociocultural pertinente e bem articulado à tese.',
    160: 'Boa seleção de argumentos. Repertório adequado, mas poderia ser mais aprofundado.',
    120: 'Argumentação com algum repertório, porém os argumentos são pouco desenvolvidos ou genéricos.',
    80:  'Argumentação fraca e previsível. Faltam dados, exemplos ou autores que embasem o ponto de vista.',
    40:  'Argumentação muito superficial. Apresenta apenas afirmações sem fundamentação.',
    0:   'Sem argumentação perceptível.',
  },
  c4: {
    200: 'Excelente coesão. Conectivos variados e bem empregados, progressão temática clara e fluida.',
    160: 'Boa articulação entre as partes. Uso adequado de operadores argumentativos com poucos deslizes.',
    120: 'Coesão parcial. Alguns parágrafos sem boa articulação. Repetição de conectivos básicos.',
    80:  'Problemas de coesão que dificultam a progressão das ideias. Parágrafos pouco encadeados.',
    40:  'Grave déficit de coesão. Texto segmentado sem articulação entre os parágrafos.',
    0:   'Ausência de mecanismos de coesão.',
  },
  c5: {
    200: 'Proposta de intervenção completa! Agente, ação, modo/meio e finalidade presentes de forma viável e detalhada.',
    160: 'Boa proposta de intervenção. Os 4 elementos estão presentes, mas a ação poderia ser mais detalhada.',
    120: 'Proposta com 2–3 elementos. Faltou especificar melhor o modo/meio ou a finalidade.',
    80:  'Proposta incompleta. Menciona o problema sem articular agente, ação, modo e finalidade.',
    40:  'Proposta muito vaga ou apenas menção superficial ao problema sem solução concreta.',
    0:   'Sem proposta de intervenção.',
  },
}

const COMP_LABELS = [
  'C1 – Domínio da Norma Culta',
  'C2 – Compreensão da Proposta',
  'C3 – Seleção de Argumentos',
  'C4 – Mecanismos de Coesão',
  'C5 – Proposta de Intervenção',
]

function generateTemplate(scores: Scores): string {
  const keys = ['c1', 'c2', 'c3', 'c4', 'c5'] as const

  // Separate competencies into positive (≥120) and needs-work (<120)
  const positives  = keys.filter(k => scores[k] >= 120)
  const needsWork  = keys.filter(k => scores[k] <  120)

  const posSection = positives.length > 0
    ? `✅ **O que você fez bem nessa redação:**\n${positives.map(k => {
        const idx = keys.indexOf(k)
        return `${COMP_LABELS[idx]} (${scores[k]}/200)`
      }).join(', ')}`
    : null

  const workSection = needsWork.length > 0
    ? `⚠️ **Para desenvolver na próxima redação:**\n${needsWork.map(k => {
        const idx = keys.indexOf(k)
        return `${COMP_LABELS[idx]} (${scores[k]}/200)`
      }).join(', ')}`
    : null

  const sections = [posSection, workSection].filter(Boolean).join('\n\n')
  const divider = '---'

  // Per-competency detailed feedback
  const compBlocks = keys.map((key, i) => {
    const phrase = COMP_PHRASES[key][scores[key]] ?? '...'
    return `**${COMP_LABELS[i]} (${scores[key]}/200)**\n${phrase}`
  }).join('\n\n')

  return [sections, divider, compBlocks].filter(Boolean).join('\n\n')
}

function ScoreSelector({
  value,
  touched,
  onChange,
}: {
  value: number
  touched: boolean
  onChange: (v: number) => void
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {SCORE_OPTIONS.map(opt => {
        const isSelected = touched && value === opt
        const selectedStyle =
          opt >= 160 ? 'bg-green-700/80 border-green-500 text-white shadow-sm shadow-green-900/40' :
          opt >= 120 ? 'bg-purple-700 border-purple-500 text-white shadow-sm shadow-purple-900/50' :
          opt >= 80  ? 'bg-amber-700/80 border-amber-500 text-white shadow-sm shadow-amber-900/40' :
                       'bg-red-800/70 border-red-600 text-white shadow-sm shadow-red-900/40'
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`w-12 py-2 rounded-lg flex flex-col items-center transition-all ${
              isSelected
                ? selectedStyle
                : 'bg-white/[0.04] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.07] hover:border-white/20'
            }`}
          >
            <span className="text-sm font-bold leading-none">{opt}</span>
            <span className="text-[9px] leading-none mt-1 opacity-80">{SCORE_LABELS[opt]}</span>
          </button>
        )
      })}
    </div>
  )
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export type EssayForCorrection = {
  id: string
  theme_title: string
  content_text: string | null
  notes: string | null
  status: string
  upload_type: 'text' | 'image' | 'pdf' | null
  original_file_url: string | null
  student: { id: string; full_name: string } | null
  plan: string
  existingCorrection: {
    c1_score: number; c2_score: number; c3_score: number
    c4_score: number; c5_score: number; general_feedback: string
    annotations?: Annotation[]
  } | null
}

/** Determine how to render the essay file.
 *  Priority: explicit upload_type → URL extension → fallback to 'image' */
function inferFileType(
  uploadType: 'text' | 'image' | 'pdf' | null,
  url: string | null,
): 'image' | 'pdf' | null {
  if (uploadType === 'image') return 'image'
  if (uploadType === 'pdf')   return 'pdf'
  if (!url) return null
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (ext && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic'].includes(ext)) return 'image'
  // content_text prefix heuristic: both image and pdf use [IMAGEM] prefix,
  // so we can't distinguish here — default to image (most common)
  return 'image'
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function CorrectionForm({
  essay,
  nextEssayId,
  queueCount = 0,
  nextStudentName,
}: {
  essay: EssayForCorrection
  nextEssayId?: string
  queueCount?: number
  nextStudentName?: string
}) {
  const existing = essay.existingCorrection

  const [scores, setScores] = useState<Scores>({
    c1: existing?.c1_score ?? 0,
    c2: existing?.c2_score ?? 0,
    c3: existing?.c3_score ?? 0,
    c4: existing?.c4_score ?? 0,
    c5: existing?.c5_score ?? 0,
  })

  // ── BUG FIX: track explicitly-touched scores ──────────────────────────────
  // allScored must not treat score=0 as "not scored" — 0 is a valid ENEM score
  const [touchedScores, setTouchedScores] = useState<Set<keyof Scores>>(
    () => existing
      ? new Set<keyof Scores>(['c1', 'c2', 'c3', 'c4', 'c5'])
      : new Set<keyof Scores>()
  )

  const [feedback, setFeedback]           = useState(existing?.general_feedback ?? '')
  const [saving, setSaving]               = useState(false)
  const [sending, setSending]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [expandedTip, setExpandedTip]     = useState<string | null>(null)
  const [essayExpanded, setEssayExpanded] = useState(true)
  const [saveStatus, setSaveStatus]       = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved]         = useState<Date | null>(existing ? new Date() : null)
  const [isDirty, setIsDirty]             = useState(false)

  // ── Annotations ────────────────────────────────────────────────────────────
  const [annotations, setAnnotations] = useState<Annotation[]>(
    () => existing?.annotations ?? []
  )
  const [annotating, setAnnotating] = useState(false)

  function addAnnotation(ann: Annotation) {
    setAnnotations(prev => [...prev, ann])
    markDirty()
  }
  function removeAnnotation(id: string) {
    setAnnotations(prev => prev.filter(a => a.id !== id))
    markDirty()
  }
  function focusCompetency(key: CompKey) {
    const el = document.getElementById(`competency-${key}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // ── Operational tool panel state ──────────────────────────────────────────
  const [showHistory,    setShowHistory]    = useState(false)
  const [showSimilarity, setShowSimilarity] = useState(false)
  const [showZeroModal,  setShowZeroModal]  = useState(false)

  const autoSaveTimerRef      = useRef<ReturnType<typeof setTimeout>>()
  const feedbackRef           = useRef<HTMLTextAreaElement>(null)
  const handleSaveRef         = useRef<() => void>(() => {})
  const hasScrolledToFeedback = useRef(false)

  // Refs for the actual document elements — passed to AnnotationLayer so it can
  // measure precise bounding boxes and anchor marks to the paper, not the canvas.
  const imgRef = useRef<HTMLImageElement>(null)
  const pdfRef = useRef<HTMLObjectElement>(null)

  // Use touchedScores for accurate progress tracking (0 is a valid score)
  const allScored = COMPETENCIES.every(c => touchedScores.has(c.key))
  const scored    = COMPETENCIES.filter(c => touchedScores.has(c.key)).length
  const total     = Object.values(scores).reduce((a, b) => a + b, 0)
  const canSend   = allScored && feedback.trim().length >= 50

  /* ── Autosave ─────────────────────────────────────────────────────────────── */
  const doAutoSave = useCallback(async () => {
    if (!isDirty) return
    setSaveStatus('saving')
    const result = await saveCorrection(essay.id, true, scores, feedback, undefined, annotations)
    if (result?.error) {
      setSaveStatus('error')
    } else {
      setSaveStatus('saved')
      setLastSaved(new Date())
      setIsDirty(false)
    }
  }, [essay.id, scores, feedback, annotations, isDirty])

  useEffect(() => {
    if (!isDirty) return
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(doAutoSave, AUTOSAVE_DELAY)
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [scores, feedback, isDirty, doAutoSave])

  /* ── Keyboard shortcut: Ctrl/Cmd+S to save ─────────────────────────────── */
  // Keep ref in sync with latest handleSave without re-registering the listener
  useEffect(() => { handleSaveRef.current = handleSave })

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSaveRef.current()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Auto-scroll to feedback once all scores are filled ─────────────────── */
  useEffect(() => {
    if (allScored && !hasScrolledToFeedback.current && !feedback.trim()) {
      hasScrolledToFeedback.current = true
      setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        feedbackRef.current?.focus()
      }, 200)
    }
  }, [allScored, feedback])

  /* ── Auto-resize feedback textarea ─────────────────────────────────────── */
  useEffect(() => {
    const el = feedbackRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(el.scrollHeight, 280)}px`
  }, [feedback])

  /* ── beforeunload warning ─────────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  /* ── Helpers ──────────────────────────────────────────────────────────────── */
  function markDirty() {
    setIsDirty(true)
    setSaveStatus('idle')
  }

  function setScore(key: keyof Scores, value: number) {
    setScores(prev => ({ ...prev, [key]: value }))
    setTouchedScores(prev => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
    markDirty()
  }

  function scoreColor(score: number) {
    if (score >= 160) return 'text-green-400'
    if (score >= 120) return 'text-purple-400'
    if (score > 0)    return 'text-amber-400'
    return 'text-gray-600'
  }

  async function handleSave() {
    if (saving || sending) return
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    setSaving(true)
    setError(null)
    const result = await saveCorrection(essay.id, true, scores, feedback, undefined, annotations)
    setSaving(false)
    if (result?.error) {
      setError(result.error)
      setSaveStatus('error')
    } else {
      setSaveStatus('saved')
      setLastSaved(new Date())
      setIsDirty(false)
    }
  }

  async function handleSend() {
    if (!canSend) return
    // Explicit confirmation before the irreversible send action
    if (!confirm('Enviar devolutiva para o aluno? Esta ação não pode ser desfeita.')) return
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    setSending(true)
    setError(null)
    const result = await saveCorrection(essay.id, false, scores, feedback, nextEssayId, annotations)
    if (result?.error) {
      setError(result.error)
      setSending(false)
    }
    // On success, server action redirects (next essay or queue)
  }

  function handleInsertTemplate() {
    const template = generateTemplate(scores)
    if (feedback.trim()) {
      if (!confirm('Substituir o feedback atual pela nova estrutura?')) return
      setFeedback(template)
    } else {
      setFeedback(template)
    }
    markDirty()
    setTimeout(() => feedbackRef.current?.focus(), 0)
  }

  function insertPhrase(key: keyof Scores) {
    const phrase = COMP_PHRASES[key][scores[key]]
    if (!phrase) return
    const idx = ['c1', 'c2', 'c3', 'c4', 'c5'].indexOf(key)
    const header = `**${COMP_LABELS[idx]} (${scores[key]}/200)**\n`
    setFeedback(prev => prev.trim() ? prev + '\n\n' + header + phrase : header + phrase)
    markDirty()
  }

  /** Insert a ready-comment text at cursor position (or append to end). */
  function insertComment(text: string) {
    const el = feedbackRef.current
    if (!el) {
      setFeedback(prev => prev.trim() ? prev + '\n\n' + text : text)
      markDirty()
      return
    }
    const start = el.selectionStart ?? el.value.length
    const end   = el.selectionEnd   ?? el.value.length
    const before = el.value.slice(0, start)
    const after  = el.value.slice(end)
    const separator = before.trim() ? '\n\n' : ''
    const updated = before + separator + text + after
    setFeedback(updated)
    markDirty()
    // Restore cursor after inserted text
    setTimeout(() => {
      el.focus()
      const pos = (before + separator + text).length
      el.setSelectionRange(pos, pos)
    }, 0)
  }

  const studentName       = essay.student?.full_name ?? 'Aluno'
  const firstNameNext     = nextStudentName?.split(' ')[0]

  return (
    <>
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* ── Coluna esquerda: texto ──────────────────────────────────────────── */}
      <div className="w-full lg:w-[55%] lg:sticky lg:top-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link href="/professor/redacoes"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all flex-shrink-0"
              onClick={e => {
                if (isDirty && !confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) {
                  e.preventDefault()
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold text-white">{studentName}</h1>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  essay.plan === 'Intensivo'  ? 'text-amber-400 bg-amber-500/10 border-amber-500/25' :
                  essay.plan === 'Estratégia' ? 'text-purple-400 bg-purple-600/10 border-purple-500/25' :
                                                'text-gray-400 bg-white/[0.04] border-white/[0.08]'
                }`}>{essay.plan}</span>
                {essay.status === 'in_review' && (
                  <span className="text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">
                    Rascunho salvo
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{essay.theme_title}</p>
            </div>
          </div>
          <button
            onClick={() => setEssayExpanded(e => !e)}
            className="text-gray-600 hover:text-gray-400 transition-colors lg:hidden"
          >
            {essayExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        <div className={`card-dark rounded-2xl overflow-hidden ${!essayExpanded ? 'lg:block hidden' : ''}`}>
          {(() => {
            // Derive the file URL — prefer original_file_url, fall back to [IMAGEM] prefix extraction
            const hasFilePrefix = essay.content_text?.startsWith('[IMAGEM] ')
            const fileUrlFromText = hasFilePrefix ? essay.content_text!.slice('[IMAGEM] '.length) : null
            const fileUrl = essay.original_file_url ?? fileUrlFromText

            const fileType = fileUrl ? inferFileType(essay.upload_type, fileUrl) : null
            const isFile = fileType !== null && fileUrl !== null

            const wordCount = !isFile && essay.content_text
              ? essay.content_text.trim().split(/\s+/).length
              : null

            const headerLabel = fileType === 'pdf'
              ? 'PDF da redação'
              : fileType === 'image'
              ? 'Imagem da redação'
              : 'Texto da redação'

            return (
              <>
                <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {headerLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    {wordCount !== null && (
                      <span className="text-xs text-gray-600">{wordCount} palavras</span>
                    )}
                    {/* Annotation mode toggle — only for file-based essays */}
                    {isFile && (
                      <button
                        type="button"
                        onClick={() => setAnnotating(a => !a)}
                        className={`flex items-center gap-1 text-[10px] font-semibold rounded-lg px-2 py-1 border transition-all ${
                          annotating
                            ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-900/30'
                            : 'bg-white/[0.03] text-gray-500 border-white/[0.07] hover:text-gray-300 hover:bg-white/[0.06]'
                        }`}
                        title={annotating ? 'Sair do modo de anotação' : 'Ativar anotações — clique para pin, arraste para destaque'}
                      >
                        <Crosshair size={10} />
                        {annotating
                          ? `Anotar${annotations.length > 0 ? ` · ${annotations.length}` : ''}`
                          : 'Anotar'}
                      </button>
                    )}
                  </div>
                </div>
                {isFile ? (
                  <>
                    {/*
                      ── Correction canvas ─────────────────────────────────
                      Dark, padded workspace that makes the essay feel like a
                      real paper on a desk. AnnotationLayer wraps only the
                      canvas so it captures the full 78vh hit area precisely.
                      The "open in new tab" link lives OUTSIDE the annotation
                      layer so it remains clickable even in annotation mode.
                    */}
                    <AnnotationLayer
                      annotations={annotations}
                      onAdd={addAnnotation}
                      onRemove={removeAnnotation}
                      onCompetencyFocus={focusCompetency}
                      isAnnotating={annotating}
                      documentRef={
                        (fileType === 'image'
                          ? imgRef
                          : fileType === 'pdf'
                          ? pdfRef
                          : undefined) as React.RefObject<HTMLElement> | undefined
                      }
                    >
                      {fileType === 'pdf' ? (
                        /* ── PDF canvas ──────────────────────────────────── */
                        <div
                          className="bg-[#060c14] px-4 pt-4"
                          style={{ height: '78vh' }}
                        >
                          <object
                            ref={pdfRef}
                            data={fileUrl!}
                            type="application/pdf"
                            aria-label="PDF da redação"
                            style={{
                              display:   'block',
                              width:     '100%',
                              height:    'calc(78vh - 32px)',
                              minHeight: '420px',
                              borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            {/* Shown only when browser can't embed the PDF */}
                            <div className="h-full flex items-center justify-center p-8">
                              <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 max-w-sm">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400 flex-shrink-0">
                                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                <div>
                                  <p className="text-xs font-medium text-amber-300">PDF não suportado neste navegador</p>
                                  <p className="text-xs text-gray-500 mt-0.5">Use o link abaixo para abrir.</p>
                                </div>
                              </div>
                            </div>
                          </object>
                        </div>
                      ) : (
                        /* ── Image canvas ────────────────────────────────── */
                        /*
                          Flex-centered inside the dark workspace so the paper
                          is always visually large and centered, with generous
                          breathing room. The annotation layer's coordinate
                          reference is this entire container, so annotations at
                          the paper's edge stay precisely attached even after
                          window resize (fractions are stable regardless of
                          absolute canvas dimensions).
                        */
                        <div
                          className="relative flex items-center justify-center bg-[#060c14]"
                          style={{ height: '78vh', padding: '28px' }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            ref={imgRef}
                            src={fileUrl!}
                            alt="Redação enviada pelo aluno"
                            className="max-h-full max-w-full object-contain rounded-lg"
                            style={{
                              boxShadow: '0 4px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
                            }}
                            onError={e => {
                              const el = e.currentTarget
                              el.style.display = 'none'
                              const fallback = el.nextElementSibling as HTMLElement | null
                              if (fallback) fallback.style.display = 'flex'
                            }}
                          />
                          {/* Fallback — hidden until onError fires */}
                          <div className="hidden absolute inset-0 items-center justify-center p-8">
                            <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 max-w-sm">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400 flex-shrink-0">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                              </svg>
                              <div>
                                <p className="text-xs font-medium text-amber-300">Não foi possível carregar a imagem</p>
                                <p className="text-xs text-gray-500 mt-0.5">Use o link abaixo para abrir o original.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </AnnotationLayer>

                    {/* ── Open-in-new-tab link ──────────────────────────── */}
                    {/* Outside AnnotationLayer so it's always clickable,
                        even while annotation mode is active. */}
                    <div className="px-5 py-2.5 bg-[#060c14] border-t border-white/[0.04] flex items-center justify-between">
                      <a
                        href={fileUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-purple-400 transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        Abrir {fileType === 'pdf' ? 'PDF' : 'imagem'} em nova aba
                      </a>
                      {annotating && (
                        <span className="text-[9px] text-gray-700">
                          Clique para pin · Arraste para destaque
                        </span>
                      )}
                    </div>
                  </>
                ) : essay.content_text ? (
                  /* ── Plain text ─────────────────────────────────────────── */
                  <div className="p-5 max-h-[75vh] overflow-y-auto">
                    <p className="text-sm text-gray-300 leading-[1.9] whitespace-pre-wrap">{essay.content_text}</p>
                  </div>
                ) : (
                  <div className="p-5">
                    <p className="text-sm text-gray-600 italic">Texto não disponível.</p>
                  </div>
                )}
              </>
            )
          })()}

          {/* ── Student notes — visible to reviewer ─────────────────────── */}
          {essay.notes && (
            <div className="border-t border-white/[0.06] p-4 bg-amber-500/[0.03]">
              <p className="text-xs font-semibold text-amber-400 mb-1.5 flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Pedido do aluno
              </p>
              <p className="text-xs text-amber-300/80 leading-relaxed">{essay.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Coluna direita: painel de correção ─────────────────────────────── */}
      <div className="w-full lg:w-[45%] space-y-4">

        {/* ── Barra de ferramentas operacionais ─────────────────────────────── */}
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider mr-1">Ferramentas</span>
          {/* Histórico do aluno */}
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            disabled={!essay.student?.id}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 border border-white/[0.08] bg-white/[0.03] rounded-lg px-2.5 py-1.5 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Ver histórico de redações deste aluno"
          >
            <History size={11} />
            Histórico
          </button>
          {/* Verificar similaridade */}
          <button
            type="button"
            onClick={() => setShowSimilarity(true)}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20 bg-amber-500/[0.05] rounded-lg px-2.5 py-1.5 hover:bg-amber-500/[0.12] hover:border-amber-500/35 transition-all"
            title="Verificar similaridade com outras redações"
          >
            <Search size={11} />
            Similaridade
          </button>
          {/* Zerar redação */}
          <button
            type="button"
            onClick={() => setShowZeroModal(true)}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-red-400 border border-red-500/20 bg-red-500/[0.05] rounded-lg px-2.5 py-1.5 hover:bg-red-500/[0.12] hover:border-red-500/35 transition-all ml-auto"
            title="Zerar esta redação com motivo estruturado"
          >
            <AlertTriangle size={11} />
            Zerar
          </button>
        </div>

        {/* Queue progress header */}
        {(nextEssayId || queueCount > 0) && (
          <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <div className="flex items-center gap-1.5">
              {queueCount > 0 ? (
                <>
                  {Array.from({ length: Math.min(queueCount, 8) }).map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
                  ))}
                  {queueCount > 8 && (
                    <span className="text-[10px] text-gray-600 ml-0.5">+{queueCount - 8}</span>
                  )}
                  <span className="text-[10px] text-gray-500 ml-1">
                    {queueCount} na fila
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-gray-600">Última redação na fila</span>
              )}
            </div>
            {nextEssayId && (
              <Link
                href={`/professor/redacoes/${nextEssayId}`}
                onClick={e => {
                  if (isDirty && !confirm('Você tem alterações não salvas. Ir para a próxima redação mesmo assim?')) {
                    e.preventDefault()
                  }
                }}
                className="flex items-center gap-1 text-[10px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
              >
                Próxima <ArrowRight size={10} />
              </Link>
            )}
          </div>
        )}

        {/* Status bar */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className={`font-semibold ${scored === 5 ? 'text-green-400' : 'text-gray-500'}`}>
              {scored}/5 competências
            </span>
            {scored > 0 && (
              <div className="flex gap-0.5">
                {COMPETENCIES.map(c => (
                  <div key={c.key} className={`w-2.5 h-2.5 rounded-full border ${
                    touchedScores.has(c.key)
                      ? 'bg-purple-500 border-purple-400'
                      : 'bg-white/[0.06] border-white/[0.1]'
                  }`} />
                ))}
              </div>
            )}
          </div>
          {/* Autosave status */}
          <div className="flex items-center gap-1.5">
            {saveStatus === 'saving' && (
              <span className="text-gray-500 flex items-center gap-1">
                <span className="w-2.5 h-2.5 border border-gray-500/40 border-t-gray-400 rounded-full animate-spin" />
                Salvando...
              </span>
            )}
            {saveStatus === 'saved' && lastSaved && (
              <span className="text-green-500/70 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                Salvo às {formatTime(lastSaved)}
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-400">⚠ Erro ao salvar</span>
            )}
            {isDirty && saveStatus === 'idle' && (
              <span className="text-gray-600 flex items-center gap-1">
                <Clock size={9} />
                Ctrl+S para salvar
              </span>
            )}
          </div>
        </div>

        {/* Erro geral */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ── Anotações (only shown when there are annotations) ─────────────── */}
        <AnnotationList
          annotations={annotations}
          onRemove={removeAnnotation}
          onCompetencyFocus={focusCompetency}
        />

        {/* ── Pontuação ─────────────────────────────────────────────────────── */}
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pontuação</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-2xl font-extrabold tabular-nums ${
                  total === 0   ? 'text-gray-600' :
                  total >= 800  ? 'text-green-400' :
                  total >= 600  ? 'text-purple-400' : 'text-amber-400'
                }`}>{total}</span>
                <span className="text-gray-600 text-sm font-medium">/ 1000</span>
              </div>
            </div>
            {/* Mini per-competency score pills */}
            <div className="flex gap-1.5 flex-wrap">
              {COMPETENCIES.map(c => (
                <span key={c.key} className={`text-[10px] font-bold px-2 py-0.5 rounded-md border tabular-nums ${
                  !touchedScores.has(c.key)
                    ? 'text-gray-700 bg-white/[0.02] border-white/[0.04]'
                    : COMP_COLORS[c.key as CompKey].pill
                }`}>
                  {c.label} {touchedScores.has(c.key) ? scores[c.key] : '–'}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-5">
            {COMPETENCIES.map(c => (
              <div key={c.key} id={`competency-${c.key}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-bold ${COMP_COLORS[c.key as CompKey].text}`}>{c.label}</span>
                      <span className="text-sm font-medium text-white">{c.name}</span>
                      <button
                        type="button"
                        onClick={() => setExpandedTip(expandedTip === c.key ? null : c.key)}
                        className="text-gray-700 hover:text-gray-400 transition-colors flex-shrink-0"
                        title="Ver dica"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">{c.desc}</p>
                  </div>
                  <span className={`text-lg font-bold ml-3 tabular-nums ${
                    touchedScores.has(c.key) ? scoreColor(scores[c.key]) : 'text-gray-600'
                  }`}>
                    {touchedScores.has(c.key) ? scores[c.key] : '–'}
                  </span>
                </div>

                {expandedTip === c.key && (
                  <div className="mb-2 bg-purple-600/[0.08] border border-purple-500/20 rounded-lg px-3 py-2 space-y-2">
                    <p className="text-xs text-purple-300">💡 {c.tip}</p>
                    {touchedScores.has(c.key) && COMP_PHRASES[c.key][scores[c.key]] && (
                      <div className="flex items-start gap-2">
                        <p className="text-xs text-gray-400 flex-1 italic">
                          &ldquo;{COMP_PHRASES[c.key][scores[c.key]]}&rdquo;
                        </p>
                        <button
                          type="button"
                          onClick={() => insertPhrase(c.key)}
                          className="text-[10px] font-semibold text-purple-400 border border-purple-500/30 bg-purple-600/10 rounded-md px-2 py-0.5 hover:bg-purple-600/20 transition-colors whitespace-nowrap flex-shrink-0"
                        >
                          Inserir
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <ScoreSelector
                  value={scores[c.key]}
                  touched={touchedScores.has(c.key)}
                  onChange={v => setScore(c.key, v)}
                />

                {/* Quick phrase insert — appears inline once a score is selected */}
                {touchedScores.has(c.key) && COMP_PHRASES[c.key][scores[c.key]] && (
                  <button
                    type="button"
                    onClick={() => insertPhrase(c.key)}
                    className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-purple-400 border border-purple-500/20 bg-purple-600/[0.06] rounded-md px-2.5 py-1 hover:bg-purple-600/15 transition-colors"
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Inserir frase sugerida no feedback
                  </button>
                )}

                {/* Ready comments per competency */}
                <ReadyComments
                  compKey={c.key as CompKey}
                  onInsert={insertComment}
                />
              </div>
            ))}
          </div>

          {total > 0 && (
            <div className="px-4 pb-4">
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    total >= 800 ? 'bg-gradient-to-r from-green-600 to-green-400' :
                    total >= 600 ? 'bg-gradient-to-r from-purple-600 to-purple-400' :
                                   'bg-gradient-to-r from-amber-600 to-amber-400'
                  }`}
                  style={{ width: `${(total / 1000) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-gray-700">
                <span>0</span>
                <span className="text-gray-600 font-medium">{total >= 600 ? '✓ Acima da média' : 'Abaixo da média'}</span>
                <span>1000</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Feedback ──────────────────────────────────────────────────────── */}
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Feedback para o aluno</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInsertTemplate}
                className="flex items-center gap-1 text-[10px] font-semibold text-purple-400 border border-purple-500/25 bg-purple-600/[0.08] rounded-md px-2 py-1 hover:bg-purple-600/20 transition-colors"
                title="Gerar estrutura com frases sugeridas para cada competência"
              >
                <Wand2 size={10} />
                {feedback.trim() ? 'Regenerar estrutura' : 'Gerar estrutura'}
              </button>
              <span className={`text-xs tabular-nums ${
                feedback.length === 0  ? 'text-gray-700' :
                feedback.length < 50  ? 'text-amber-500' :
                feedback.length < 200 ? 'text-purple-400' : 'text-green-500'
              }`}>
                {feedback.length}
              </span>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-600 mb-3">
              Comente cada competência. Use{' '}
              <code className="text-purple-400 bg-purple-600/10 px-1 rounded">**negrito**</code>{' '}
              para destaque. O aluno verá este texto como devolutiva.
            </p>
            <textarea
              ref={feedbackRef}
              value={feedback}
              onChange={e => { setFeedback(e.target.value); markDirty() }}
              placeholder={`**C1 – Domínio da Norma Culta (${scores.c1}/200)**\nComente aqui os pontos de ortografia, concordância e pontuação...\n\n**C2 – Compreensão da Proposta (${scores.c2}/200)**\nA redação atendeu ao tema? Há tangência?\n\n**C3 – Seleção de Argumentos (${scores.c3}/200)**\nOs argumentos são sólidos? Há repertório?\n\n**C4 – Mecanismos de Coesão (${scores.c4}/200)**\nOs parágrafos estão bem articulados?\n\n**C5 – Proposta de Intervenção (${scores.c5}/200)**\nOs 4 elementos (agente, ação, modo, finalidade) estão presentes?`}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder:text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/30 leading-[1.8] font-mono text-xs overflow-hidden transition-colors"
              style={{ minHeight: '320px' }}
            />
            {/* Feedback progress bar */}
            {feedback.length > 0 && (
              <div className="mt-2 h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    feedback.length < 50  ? 'bg-amber-500' :
                    feedback.length < 200 ? 'bg-purple-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((feedback.length / 400) * 100, 100)}%` }}
                />
              </div>
            )}
            {allScored && feedback.length > 0 && (
              <p className={`mt-1 text-[10px] font-medium ${canSend ? 'text-green-500' : 'text-gray-600'}`}>
                {canSend
                  ? '✓ Pronto para enviar'
                  : `Mais ${50 - feedback.trim().length} chars para enviar`}
              </p>
            )}
          </div>
        </div>

        {/* ── Ações ─────────────────────────────────────────────────────────── */}
        <div className={`rounded-2xl border p-4 space-y-3 ${
          canSend
            ? 'border-amber-500/20 bg-amber-500/[0.03]'
            : 'border-white/[0.06] bg-white/[0.02]'
        }`}>
          {/* Progress hint */}
          {!canSend && (
            <p className="text-xs text-gray-600 text-center">
              {!allScored
                ? `⟶ Preencha ${5 - scored} competência${5 - scored !== 1 ? 's' : ''} restante${5 - scored !== 1 ? 's' : ''} para liberar o envio`
                : `⟶ Escreva mais ${50 - feedback.trim().length} caracteres de feedback`}
            </p>
          )}
          {canSend && (
            <p className="text-xs text-green-400 text-center font-semibold">
              ✓ Correção completa — pronto para enviar
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || sending}
              className="btn-secondary flex-1 justify-center"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-gray-500/30 border-t-gray-400 rounded-full animate-spin" />
              ) : (
                <Save size={15} />
              )}
              {saving ? 'Salvando...' : 'Salvar rascunho'}
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend || sending || saving}
              className="btn-primary flex-1 justify-center"
              title={!canSend
                ? (!allScored
                    ? `Preencha as ${5 - scored} competência${5 - scored !== 1 ? 's' : ''} restante${5 - scored !== 1 ? 's' : ''}`
                    : `Escreva pelo menos ${50 - feedback.trim().length} caracteres de feedback`)
                : 'Enviar devolutiva para o aluno'}
            >
              {sending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={15} />
              )}
              <span className="truncate">
                {sending
                  ? 'Enviando...'
                  : nextEssayId && firstNameNext
                  ? `Enviar e ir para ${firstNameNext}`
                  : 'Enviar devolutiva'}
              </span>
            </button>
          </div>
        </div>

        {/* ── Fila: próxima redação ──────────────────────────────────────────── */}
        {nextEssayId && (
          <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-600">
                {queueCount > 0
                  ? `${queueCount} redaç${queueCount !== 1 ? 'ões' : 'ão'} aguardando na fila`
                  : 'Última na fila'}
              </span>
              {nextStudentName && (
                <span className="text-[10px] text-gray-700">
                  Próxima: {nextStudentName}
                </span>
              )}
            </div>
            <Link
              href={`/professor/redacoes/${nextEssayId}`}
              onClick={e => {
                if (isDirty && !confirm('Você tem alterações não salvas. Ir para a próxima redação mesmo assim?')) {
                  e.preventDefault()
                }
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
            >
              Próxima <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>
    </div>

    {/* ── Operational panels (rendered outside the two-column layout) ────────── */}

    {showHistory && essay.student?.id && (
      <StudentHistoryPanel
        studentId={essay.student.id}
        studentName={studentName}
        currentEssayId={essay.id}
        onClose={() => setShowHistory(false)}
      />
    )}

    {showSimilarity && (
      <SimilarityPanel
        essayId={essay.id}
        contentText={essay.content_text}
        studentId={essay.student?.id ?? ''}
        onClose={() => setShowSimilarity(false)}
      />
    )}

    {showZeroModal && (
      <ZeroEssayModal
        essayId={essay.id}
        studentName={studentName}
        themeTitle={essay.theme_title}
        reviewerName={studentName /* overridden server-side from profile */}
        onClose={() => setShowZeroModal(false)}
      />
    )}
    </>
  )
}
