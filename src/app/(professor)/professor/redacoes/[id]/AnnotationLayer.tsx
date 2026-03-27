'use client'

/**
 * AnnotationLayer — interactive overlay for essay correction.
 *
 * Renders on top of any essay content (image, PDF, or plain text).
 * Converts click → pin and drag → highlight box.
 * All coordinates are stored as fractions (x_pct, y_pct, w_pct, h_pct)
 * so annotations survive container resizes and different screen widths.
 *
 * Structure:
 *   <AnnotationLayer>
 *     {essay preview content}   ← sits below the overlay layers
 *   </AnnotationLayer>
 *
 * The component renders three layers stacked on top of content:
 *   1. Annotation marks (pins & highlight boxes) — pointer-events off by
 *      default, on per-mark for hover/delete.
 *   2. Live drag preview rectangle (while dragging in annotation mode).
 *   3. Interaction capture div (only active while annotation mode is ON).
 *
 * The popover is rendered as position:fixed to escape overflow:hidden parents.
 */

import { useState, useRef, useCallback, useEffect, type MouseEvent } from 'react'
import { X, Crosshair } from 'lucide-react'
import { COMP_COLORS, type CompKey } from '@/lib/competency-colors'
import { type Annotation, type AnnotationType, newAnnotationId } from '@/lib/annotations'

// ── Ready comments per competency ────────────────────────────────────────────

const COMP_KEYS: CompKey[] = ['c1', 'c2', 'c3', 'c4', 'c5']

export const READY_COMMENTS: Record<CompKey, Array<{ id: string; label: string; text: string }>> = {
  c1: [
    { id: 'c1-1', label: 'Ortografia',   text: 'Erro ortográfico neste trecho.' },
    { id: 'c1-2', label: 'Gramática',    text: 'Problema de gramática — verifique a regência.' },
    { id: 'c1-3', label: 'Concordância', text: 'Concordância nominal ou verbal inadequada.' },
    { id: 'c1-4', label: 'Sintaxe',      text: 'Estrutura sintática comprometida.' },
    { id: 'c1-5', label: 'Pontuação',    text: 'Pontuação incorreta nesta passagem.' },
  ],
  c2: [
    { id: 'c2-1', label: 'Proposta',     text: 'Compreensão parcial da proposta neste ponto.' },
    { id: 'c2-2', label: 'Aderência',    text: 'Tangência ao tema — retome o recorte proposto.' },
    { id: 'c2-3', label: 'Tipo textual', text: 'Desvio do tipo textual dissertativo-argumentativo.' },
    { id: 'c2-4', label: 'Repertório',   text: 'Repertório mal conectado à proposta.' },
  ],
  c3: [
    { id: 'c3-1', label: 'Superficial',  text: 'Argumentação superficial — aprofunde esta ideia.' },
    { id: 'c3-2', label: 'Aprofund.',    text: 'Argumento não desenvolvido suficientemente.' },
    { id: 'c3-3', label: 'Tese',         text: 'Tese pouco sustentada aqui.' },
    { id: 'c3-4', label: 'Repertório',   text: 'Repertório pouco explorado ou genérico.' },
  ],
  c4: [
    { id: 'c4-1', label: 'Conectivos',   text: 'Repetição de conectivos — varie os operadores.' },
    { id: 'c4-2', label: 'Progressão',   text: 'Progressão temática fraca nesta transição.' },
    { id: 'c4-3', label: 'Articulação',  text: 'Articulação insuficiente entre os parágrafos.' },
    { id: 'c4-4', label: 'Coesão',       text: 'Coesão comprometida nesta passagem.' },
  ],
  c5: [
    { id: 'c5-1', label: 'Agente',       text: 'Agente da intervenção ausente ou vago.' },
    { id: 'c5-2', label: 'Ação',         text: 'Ação muito genérica — especifique o que será feito.' },
    { id: 'c5-3', label: 'Meio',         text: 'Meio/modo da intervenção pouco detalhado.' },
    { id: 'c5-4', label: 'Finalidade',   text: 'Finalidade da intervenção vaga.' },
    { id: 'c5-5', label: 'Incompleta',   text: 'Proposta de intervenção incompleta — faltam elementos.' },
  ],
}

// ── Drag state helpers ────────────────────────────────────────────────────────

const DRAG_THRESHOLD_PX = 8

// ── Popover geometry ─────────────────────────────────────────────────────────
// Measured from the rendered popover: w-72 = 288px, rows sum to ~320px.
const POPOVER_W  = 288
const POPOVER_H  = 320
const POP_GAP    = 10   // gap between anchor point and popover edge
const POP_MARGIN = 10   // minimum distance from viewport edge

/**
 * Compute the (fixed) screen position for the annotation popover.
 *
 * Strategy — 4-quadrant preference:
 *   1. Try to open to the RIGHT  of the anchor.
 *   2. If there isn't enough horizontal space, open to the LEFT.
 *   3. Try to open BELOW the anchor.
 *   4. If there isn't enough vertical space, open ABOVE.
 *   5. Final clamp keeps the popover inside the visible viewport in all cases.
 *
 * This means on a wide desktop the popover almost always opens bottom-right
 * (the natural quadrant), flips left near the right edge, and flips up near
 * the bottom — the professor never has to hunt for it.
 */
function computePopoverPos(anchorX: number, anchorY: number): { x: number; y: number } {
  // Horizontal
  let x: number
  const spaceRight = window.innerWidth - anchorX - POP_GAP - POP_MARGIN
  const spaceLeft  = anchorX           - POP_GAP - POP_MARGIN
  if (spaceRight >= POPOVER_W) {
    x = anchorX + POP_GAP
  } else if (spaceLeft >= POPOVER_W) {
    x = anchorX - POP_GAP - POPOVER_W
  } else {
    // Neither side has clean room — center on anchor, then clamp
    x = anchorX - POPOVER_W / 2
  }
  x = Math.max(POP_MARGIN, Math.min(window.innerWidth - POPOVER_W - POP_MARGIN, x))

  // Vertical
  let y: number
  const spaceBelow = window.innerHeight - anchorY - POP_GAP - POP_MARGIN
  const spaceAbove = anchorY            - POP_GAP - POP_MARGIN
  if (spaceBelow >= POPOVER_H) {
    y = anchorY + POP_GAP
  } else if (spaceAbove >= POPOVER_H) {
    y = anchorY - POP_GAP - POPOVER_H
  } else {
    y = anchorY - POPOVER_H / 2
  }
  y = Math.max(POP_MARGIN, Math.min(window.innerHeight - POPOVER_H - POP_MARGIN, y))

  return { x, y }
}

interface DragState {
  startXPct: number; startYPct: number
  curXPct:   number; curYPct:   number
  startRawX: number; startRawY: number
  curRawX:   number; curRawY:   number
}

interface PendingMark {
  type: AnnotationType
  x_pct: number; y_pct: number
  w_pct: number; h_pct: number
  /** Viewport-relative position for the fixed popover */
  popX: number; popY: number
}

/** Rendered bounding box of the actual document element (img/object),
 *  expressed in pixels relative to the AnnotationLayer container's top-left.
 *  Used to map click coordinates to document-relative fractions and to
 *  render annotation marks precisely over the paper — not the surrounding canvas. */
interface DocBounds {
  left: number
  top: number
  width: number
  height: number
}

// ── AnnotationLayer (main export) ────────────────────────────────────────────

interface AnnotationLayerProps {
  annotations: Annotation[]
  onAdd: (ann: Annotation) => void
  onRemove: (id: string) => void
  onCompetencyFocus?: (key: CompKey) => void
  /** Controlled from outside so the toggle can live in the card header */
  isAnnotating: boolean
  children: React.ReactNode
  /**
   * Ref to the actual rendered document element (<img> or <object>).
   * When provided, annotations are positioned relative to the document's
   * rendered bounding box rather than the full canvas container.
   * Coordinates are re-measured on mount, resize, and image load.
   */
  documentRef?: React.RefObject<HTMLElement>
}

export function AnnotationLayer({
  annotations,
  onAdd,
  onRemove,
  onCompetencyFocus,
  isAnnotating,
  children,
  documentRef,
}: AnnotationLayerProps) {
  const containerRef          = useRef<HTMLDivElement>(null)
  const [drag, setDrag]       = useState<DragState | null>(null)
  const [pending, setPending] = useState<PendingMark | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Popover fields
  const [popComp, setPopComp] = useState<CompKey>('c1')
  const [popText, setPopText] = useState('')

  // ── Document bounding box ─────────────────────────────────────────────────
  // When a documentRef is provided (img or object element inside the canvas),
  // we track its rendered bounding box relative to the container so that
  // annotation coordinates are anchored to the paper, not the dark canvas.
  const [docBounds, setDocBounds] = useState<DocBounds | null>(null)

  const measureDoc = useCallback(() => {
    if (!containerRef.current || !documentRef?.current) return
    const cRect = containerRef.current.getBoundingClientRect()
    const dRect = documentRef.current.getBoundingClientRect()
    // Skip if document element has no rendered size yet (e.g. image still loading)
    if (dRect.width === 0 || dRect.height === 0) return
    setDocBounds({
      left:   dRect.left - cRect.left,
      top:    dRect.top  - cRect.top,
      width:  dRect.width,
      height: dRect.height,
    })
  }, [documentRef])

  useEffect(() => {
    if (!documentRef?.current || !containerRef.current) return
    const docEl = documentRef.current

    // ResizeObserver watches both container and document element for size changes
    const ro = new ResizeObserver(() => measureDoc())
    ro.observe(containerRef.current)
    ro.observe(docEl)

    // For <img> elements: also fire after the image finishes loading
    if (docEl instanceof HTMLImageElement) {
      docEl.addEventListener('load', measureDoc)
    }

    measureDoc() // initial measurement

    return () => {
      ro.disconnect()
      if (docEl instanceof HTMLImageElement) {
        docEl.removeEventListener('load', measureDoc)
      }
    }
  }, [measureDoc, documentRef])

  // Close active tooltip when clicking outside
  useEffect(() => {
    if (!activeId) return
    function handler(e: globalThis.MouseEvent) {
      const t = e.target as Node
      const container = containerRef.current
      if (container && !container.contains(t)) setActiveId(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [activeId])

  // Close popover on Escape
  useEffect(() => {
    if (!pending) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') { setPending(null); setPopText('') }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [pending])

  // ── Coordinate helpers ──────────────────────────────────────────────────────

  /**
   * Convert a mouse event to document-relative fractions (0–1).
   *
   * When `docBounds` is available the coordinates are relative to the actual
   * rendered document element (img / object).  Clicks outside that element
   * return `inBounds: false` so the caller can ignore them.
   *
   * Falls back to container-relative fractions when no docBounds has been
   * measured yet (e.g. during the first render before the image loads).
   */
  function getRelative(e: MouseEvent<HTMLDivElement>): {
    x_pct: number; y_pct: number
    rawX: number; rawY: number
    inBounds: boolean
  } {
    const cRect = containerRef.current!.getBoundingClientRect()

    if (docBounds) {
      const docLeft = cRect.left + docBounds.left
      const docTop  = cRect.top  + docBounds.top
      const relX    = e.clientX - docLeft
      const relY    = e.clientY - docTop
      const inBounds =
        relX >= 0 && relY >= 0 &&
        relX <= docBounds.width && relY <= docBounds.height
      return {
        x_pct:    Math.max(0, Math.min(1, relX / docBounds.width)),
        y_pct:    Math.max(0, Math.min(1, relY / docBounds.height)),
        rawX:     e.clientX,
        rawY:     e.clientY,
        inBounds,
      }
    }

    // Fallback: container-relative (used for text essays or before doc loads)
    return {
      x_pct:    Math.max(0, Math.min(1, (e.clientX - cRect.left) / cRect.width)),
      y_pct:    Math.max(0, Math.min(1, (e.clientY - cRect.top)  / cRect.height)),
      rawX:     e.clientX,
      rawY:     e.clientY,
      inBounds: true,
    }
  }

  // ── Mouse handlers (annotation mode only) ────────────────────────────────

  function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
    e.preventDefault()
    const { x_pct, y_pct, rawX, rawY, inBounds } = getRelative(e)
    // Ignore clicks outside the actual document area (e.g. canvas padding)
    if (!inBounds) return
    setDrag({ startXPct: x_pct, startYPct: y_pct, curXPct: x_pct, curYPct: y_pct, startRawX: rawX, startRawY: rawY, curRawX: rawX, curRawY: rawY })
  }

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!drag) return
    const { x_pct, y_pct, rawX, rawY } = getRelative(e)
    setDrag(d => d ? { ...d, curXPct: x_pct, curYPct: y_pct, curRawX: rawX, curRawY: rawY } : null)
  }

  function handleMouseUp(e: MouseEvent<HTMLDivElement>) {
    if (!drag) return
    const dx = drag.curRawX - drag.startRawX
    const dy = drag.curRawY - drag.startRawY
    const isDrag = Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD_PX

    if (isDrag) {
      // For a highlight, anchor the popover at the top-center of the drawn box
      // so it opens above or below the selection, not obscuring it.
      const boxCenterX = (drag.startRawX + drag.curRawX) / 2
      const boxTopY    = Math.min(drag.startRawY, drag.curRawY)
      const { x: popX, y: popY } = computePopoverPos(boxCenterX, boxTopY)
      setPending({
        type:  'highlight',
        x_pct: Math.min(drag.startXPct, drag.curXPct),
        y_pct: Math.min(drag.startYPct, drag.curYPct),
        w_pct: Math.abs(drag.curXPct - drag.startXPct),
        h_pct: Math.abs(drag.curYPct - drag.startYPct),
        popX, popY,
      })
    } else {
      // For a pin, anchor at the exact click point
      const { x: popX, y: popY } = computePopoverPos(e.clientX, e.clientY)
      setPending({ type: 'pin', x_pct: drag.startXPct, y_pct: drag.startYPct, w_pct: 0, h_pct: 0, popX, popY })
    }

    setDrag(null)
    setPopText('')
  }

  // ── Save / cancel ──────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    if (!pending || !popText.trim()) return
    onAdd({
      id:          newAnnotationId(),
      type:        pending.type,
      competency:  popComp,
      text:        popText.trim(),
      x_pct:       pending.x_pct,
      y_pct:       pending.y_pct,
      w_pct:       pending.w_pct,
      h_pct:       pending.h_pct,
      created_at:  new Date().toISOString(),
    })
    setPending(null)
    setPopText('')
  }, [pending, popComp, popText, onAdd])

  function handleCancel() {
    setPending(null)
    setPopText('')
  }

  // ── Live drag preview rect ─────────────────────────────────────────────────
  // Use pixel positioning when docBounds is known (anchors rect to the paper),
  // fall back to percentage-of-container when no docBounds yet.

  const liveRect = drag
    ? docBounds
      ? {
          left:   `${docBounds.left + Math.min(drag.startXPct, drag.curXPct) * docBounds.width}px`,
          top:    `${docBounds.top  + Math.min(drag.startYPct, drag.curYPct) * docBounds.height}px`,
          width:  `${Math.abs(drag.curXPct  - drag.startXPct) * docBounds.width}px`,
          height: `${Math.abs(drag.curYPct  - drag.startYPct) * docBounds.height}px`,
        }
      : {
          left:   `${Math.min(drag.startXPct, drag.curXPct) * 100}%`,
          top:    `${Math.min(drag.startYPct, drag.curYPct) * 100}%`,
          width:  `${Math.abs(drag.curXPct  - drag.startXPct) * 100}%`,
          height: `${Math.abs(drag.curYPct  - drag.startYPct) * 100}%`,
        }
    : null

  return (
    <>
      {/* ── Content + overlays ───────────────────────────────────────────── */}
      <div ref={containerRef} className="relative" style={{ userSelect: isAnnotating ? 'none' : undefined }}>
        {children}

        {/* Layer 1: existing annotation marks (pointer-events off except per-mark) */}
        <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 5 }}>
          {annotations.map(ann => (
            <AnnotationMark
              key={ann.id}
              annotation={ann}
              docBounds={docBounds}
              isActive={activeId === ann.id}
              onActivate={(id) => setActiveId(activeId === id ? null : id)}
              onRemove={onRemove}
              onCompetencyFocus={onCompetencyFocus}
            />
          ))}

          {/* Live drag preview */}
          {liveRect && (
            <div
              className="absolute border-2 border-dashed border-purple-400/60 bg-purple-500/10 pointer-events-none rounded"
              style={liveRect}
            />
          )}
        </div>

        {/* Layer 2: interaction capture (annotation mode only, no pending popover) */}
        {isAnnotating && !pending && (
          <div
            className="absolute inset-0"
            style={{ cursor: 'crosshair', zIndex: 10 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        )}
      </div>

      {/* ── Popover (fixed, escapes overflow containers) ─────────────────── */}
      {pending && (
        <AnnotationPopover
          type={pending.type}
          x={pending.popX}
          y={pending.popY}
          selectedComp={popComp}
          text={popText}
          onCompChange={(k) => { setPopComp(k); setPopText('') }}
          onTextChange={setPopText}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}

// ── AnnotationMark ────────────────────────────────────────────────────────────

function AnnotationMark({
  annotation: ann,
  docBounds,
  isActive,
  onActivate,
  onRemove,
  onCompetencyFocus,
}: {
  annotation: Annotation
  /** When provided, positions marks in px relative to the document element.
   *  Falls back to percentage-of-container when null. */
  docBounds: DocBounds | null
  isActive: boolean
  onActivate: (id: string) => void
  onRemove: (id: string) => void
  onCompetencyFocus?: (key: CompKey) => void
}) {
  const colors = COMP_COLORS[ann.competency]

  // Compute CSS position values — px when docBounds is known, % otherwise
  const posLeft   = docBounds
    ? `${docBounds.left + ann.x_pct * docBounds.width}px`
    : `${ann.x_pct * 100}%`
  const posTop    = docBounds
    ? `${docBounds.top  + ann.y_pct * docBounds.height}px`
    : `${ann.y_pct * 100}%`
  const posWidth  = docBounds
    ? `${ann.w_pct * docBounds.width}px`
    : `${ann.w_pct * 100}%`
  const posHeight = docBounds
    ? `${ann.h_pct * docBounds.height}px`
    : `${ann.h_pct * 100}%`

  const tooltip = isActive ? (
    <AnnotationTooltip
      annotation={ann}
      onRemove={onRemove}
      onCompetencyFocus={onCompetencyFocus}
    />
  ) : null

  if (ann.type === 'highlight') {
    return (
      <div
        className={`absolute pointer-events-auto rounded cursor-pointer border ${colors.border}`}
        style={{
          left:   posLeft,
          top:    posTop,
          width:  posWidth,
          height: posHeight,
          backgroundColor: `color-mix(in srgb, currentColor 6%, transparent)`,
        }}
        title={ann.text}
        onClick={() => onActivate(ann.id)}
      >
        {/* Competency badge on top-left of highlight */}
        <span
          className={`absolute -top-3 left-0 text-[8px] font-bold px-1 py-0 rounded ${colors.bg} ${colors.text} border ${colors.border}`}
          style={{ whiteSpace: 'nowrap' }}
        >
          {ann.competency.toUpperCase()}
        </span>
        {tooltip}
      </div>
    )
  }

  // pin / note
  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left:      posLeft,
        top:       posTop,
        transform: 'translate(-50%, -50%)',
        zIndex:    isActive ? 20 : 6,
      }}
    >
      <button
        type="button"
        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-extrabold border-2 border-white/30 shadow-lg transition-transform hover:scale-110 ${colors.bar}`}
        onClick={() => onActivate(ann.id)}
        title={ann.text}
      >
        {ann.competency.toUpperCase().replace('C', '')}
      </button>
      {tooltip}
    </div>
  )
}

// ── AnnotationTooltip ─────────────────────────────────────────────────────────

function AnnotationTooltip({ annotation: ann, onRemove, onCompetencyFocus }: {
  annotation: Annotation
  onRemove: (id: string) => void
  onCompetencyFocus?: (key: CompKey) => void
}) {
  const colors = COMP_COLORS[ann.competency]
  return (
    <div
      className={`absolute z-30 w-48 bg-[#0d1520] border ${colors.border} rounded-xl p-3 shadow-2xl`}
      style={{ top: 'calc(100% + 4px)', left: '50%', transform: 'translateX(-50%)' }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-[10px] font-extrabold uppercase ${colors.text}`}>
          {ann.competency.toUpperCase()}
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(ann.id) }}
          className="text-gray-600 hover:text-red-400 transition-colors"
        >
          <X size={11} />
        </button>
      </div>
      <p className="text-xs text-gray-300 leading-relaxed">{ann.text}</p>
      {onCompetencyFocus && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onCompetencyFocus(ann.competency) }}
          className={`mt-2 text-[9px] font-semibold ${colors.text} hover:opacity-70 transition-opacity`}
        >
          → ir para pontuação {ann.competency.toUpperCase()}
        </button>
      )}
    </div>
  )
}

// ── AnnotationPopover ─────────────────────────────────────────────────────────

function AnnotationPopover({
  type, x, y,
  selectedComp, text,
  onCompChange, onTextChange,
  onSave, onCancel,
}: {
  type: AnnotationType
  x: number; y: number
  selectedComp: CompKey; text: string
  onCompChange: (k: CompKey) => void
  onTextChange: (t: string) => void
  onSave: () => void
  onCancel: () => void
}) {
  const colors        = COMP_COLORS[selectedComp]
  const readyComments = READY_COMMENTS[selectedComp]
  const taRef         = useRef<HTMLTextAreaElement>(null)

  // Auto-focus text field when popover opens or competency changes
  useEffect(() => { taRef.current?.focus() }, [selectedComp])

  return (
    <div
      className="fixed z-50 w-72 bg-[#0b1119] border border-white/[0.10] rounded-2xl shadow-2xl overflow-hidden"
      style={{ left: x, top: y }}
      onMouseDown={e => e.stopPropagation()} // prevent essay layer from catching these
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-white/[0.06] flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-wide ${colors.text}`}>
          {type === 'pin' ? '📍 Pin' : '▬ Destaque'}
        </span>
        <button type="button" onClick={onCancel} className="text-gray-600 hover:text-gray-300 transition-colors">
          <X size={12} />
        </button>
      </div>

      {/* Competency tabs */}
      <div className="px-3 pt-2.5 flex gap-1">
        {COMP_KEYS.map(k => {
          const c = COMP_COLORS[k]
          return (
            <button
              key={k}
              type="button"
              onClick={() => onCompChange(k)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold border transition-all ${
                selectedComp === k
                  ? `${c.bg} ${c.border} ${c.text}`
                  : 'bg-white/[0.03] border-white/[0.06] text-gray-600 hover:text-gray-400 hover:bg-white/[0.05]'
              }`}
            >
              {k.toUpperCase()}
            </button>
          )
        })}
      </div>

      {/* Ready comments */}
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-[9px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Comentários rápidos</p>
        <div className="flex flex-wrap gap-1">
          {readyComments.map(rc => (
            <button
              key={rc.id}
              type="button"
              onClick={() => onTextChange(rc.text)}
              className={`text-[9px] font-medium px-2 py-0.5 rounded-full border transition-all ${
                text === rc.text
                  ? `${colors.bg} ${colors.border} ${colors.text}`
                  : 'bg-white/[0.03] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:bg-white/[0.05]'
              }`}
            >
              {rc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom text */}
      <div className="px-3 pb-2">
        <textarea
          ref={taRef}
          value={text}
          onChange={e => onTextChange(e.target.value)}
          placeholder="Escreva o comentário... (⌘↵ para salvar)"
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/40 leading-relaxed"
          rows={3}
          onKeyDown={e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); onSave() }
            if (e.key === 'Escape') { e.preventDefault(); onCancel() }
          }}
        />
      </div>

      {/* Actions */}
      <div className="px-3 pb-3 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold text-gray-500 border border-white/[0.06] hover:text-gray-300 hover:bg-white/[0.04] transition-all"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!text.trim()}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-white border transition-all ${
            text.trim()
              ? `${colors.bg} ${colors.border} hover:opacity-80`
              : 'bg-white/[0.03] border-white/[0.06] text-gray-700 cursor-not-allowed'
          }`}
        >
          Salvar ⌘↵
        </button>
      </div>
    </div>
  )
}

// ── AnnotationList (right-panel summary) ──────────────────────────────────────

export function AnnotationList({
  annotations,
  onRemove,
  onCompetencyFocus,
}: {
  annotations: Annotation[]
  onRemove: (id: string) => void
  onCompetencyFocus: (key: CompKey) => void
}) {
  if (annotations.length === 0) return null

  const grouped = COMP_KEYS.reduce<Partial<Record<CompKey, Annotation[]>>>((acc, key) => {
    const items = annotations.filter(a => a.competency === key)
    if (items.length > 0) acc[key] = items
    return acc
  }, {})

  return (
    <div className="card-dark rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Anotações</span>
        <span className="text-[10px] text-gray-700 tabular-nums">{annotations.length}</span>
      </div>
      <div className="p-3 space-y-3 max-h-52 overflow-y-auto">
        {COMP_KEYS.map(key => {
          const items = grouped[key]
          if (!items) return null
          const colors = COMP_COLORS[key]
          return (
            <div key={key}>
              {/* Competency group header */}
              <div className="flex items-center gap-1.5 mb-1">
                <button
                  type="button"
                  onClick={() => onCompetencyFocus(key)}
                  className={`text-[10px] font-extrabold uppercase ${colors.text} hover:opacity-70 transition-opacity`}
                >
                  {key.toUpperCase()}
                </button>
                <span className={`text-[9px] font-bold px-1.5 py-px rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                  {items.length}
                </span>
              </div>
              {/* Annotation items */}
              {items.map(ann => (
                <div key={ann.id} className="flex items-start gap-2 pl-3 py-0.5">
                  <span
                    className={`w-1 h-1 rounded-full flex-shrink-0 mt-1.5 ${colors.bar}`}
                  />
                  <p className="text-[10px] text-gray-400 leading-relaxed flex-1 min-w-0">{ann.text}</p>
                  <button
                    type="button"
                    onClick={() => onRemove(ann.id)}
                    className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                    title="Remover anotação"
                  >
                    <X size={9} />
                  </button>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
