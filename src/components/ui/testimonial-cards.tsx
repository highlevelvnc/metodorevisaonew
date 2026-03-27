'use client'

import * as React from 'react'
import { motion, PanInfo } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Testimonial {
  id: number
  testimonial: string
  author: string
  role: string
  avatarUrl?: string
  metric?: { before: number; after: number; label: string } | null
  highlight?: string | null
}

// ─── Single card content ──────────────────────────────────────────────────────

function CardContent({
  t,
  isActive,
}: {
  t: Testimonial
  isActive: boolean
}) {
  const delta = t.metric ? t.metric.after - t.metric.before : 0

  return (
    <motion.div
      className="h-full w-full rounded-2xl border p-6 flex flex-col gap-4 overflow-hidden select-none backdrop-blur-md"
      style={{
        background: 'linear-gradient(160deg, rgba(13,19,34,0.96) 0%, rgba(10,14,26,0.98) 100%)',
        borderColor: isActive ? 'rgba(124,58,237,0.45)' : 'rgba(255,255,255,0.06)',
        boxShadow: isActive
          ? '0 0 0 1px rgba(124,58,237,0.18), 0 28px 64px rgba(0,0,0,0.65), 0 0 40px rgba(124,58,237,0.08)'
          : '0 8px 24px rgba(0,0,0,0.35)',
      }}
      animate={{
        opacity: isActive ? 1 : 0.52,
        scale:   isActive ? 1 : 0.93,
        y:       isActive ? 0 : 12,
      }}
      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* ── Header: avatar + author info + stars ─────────────────────── */}
      <div className="flex items-center gap-3.5 flex-shrink-0">
        {t.avatarUrl ? (
          <img
            src={t.avatarUrl}
            alt={`Foto de ${t.author}`}
            className="w-11 h-11 rounded-full object-cover border border-purple-500/30 flex-shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-base font-extrabold text-purple-300">
              {t.author[0]}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-tight truncate">{t.author}</p>
          <p className="text-[11px] text-gray-500 leading-tight mt-0.5 truncate">{t.role}</p>
        </div>
        {/* Stars */}
        <div className="flex gap-0.5 flex-shrink-0">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-3 h-3 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
      </div>

      {/* ── Score progression ─────────────────────────────────────────── */}
      {t.metric && (
        <div className="flex items-center gap-2.5 bg-green-500/[0.07] border border-green-500/[0.15] rounded-xl px-4 py-2.5 flex-shrink-0">
          {/* Before */}
          <div className="text-center">
            <p className="text-[9px] text-gray-700 font-semibold uppercase tracking-wider mb-0.5">Antes</p>
            <span className="text-sm text-gray-500 line-through tabular-nums font-semibold">{t.metric.before}</span>
          </div>
          {/* Arrow + line */}
          <div className="flex-1 flex items-center gap-1.5">
            <div className="h-px flex-1 bg-gradient-to-r from-gray-700 to-green-500/50" />
            <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          {/* After */}
          <div className="text-center">
            <p className="text-[9px] text-gray-700 font-semibold uppercase tracking-wider mb-0.5">Depois</p>
            <span className="text-xl font-extrabold text-green-400 tabular-nums leading-none">{t.metric.after}</span>
          </div>
          {/* Delta pill */}
          <div className="ml-1 bg-green-500/10 border border-green-500/20 rounded-lg px-2.5 py-1.5 flex-shrink-0">
            <span className="text-xs font-extrabold text-green-400 tabular-nums">+{delta}&thinsp;pts</span>
          </div>
        </div>
      )}

      {/* ── Highlight pill (no metric) ────────────────────────────────── */}
      {!t.metric && t.highlight && (
        <div className="flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {t.highlight}
          </span>
        </div>
      )}

      {/* ── Quote ────────────────────────────────────────────────────── */}
      <p className="text-sm text-gray-300 leading-[1.75] flex-1 line-clamp-[7]">
        &ldquo;{t.testimonial}&rdquo;
      </p>
    </motion.div>
  )
}

// ─── Gap between cards (px) ───────────────────────────────────────────────────

const CARD_GAP = 20

// ─── Main carousel ───────────────────────────────────────────────────────────

export interface TestimonialsCarouselProps {
  testimonials: Testimonial[]
  /** Fixed card height in px. Default 360 desktop, 320 mobile handled via CSS. */
  cardHeight?: number
}

export function TestimonialsCarousel({
  testimonials,
}: TestimonialsCarouselProps) {
  const n = testimonials.length

  // ── Measure container width ──────────────────────────────────────────────
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = React.useState(0)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setContainerW(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // ── Card dimensions ──────────────────────────────────────────────────────
  // Responsive peek: 9% of container on desktop, floored at 36px on mobile.
  // peek = (containerW - cardW) / 2 - CARD_GAP
  // → cardW = containerW - 2 * (peek + CARD_GAP)
  const peekPerSide = Math.max(Math.round(containerW * 0.09), 36)
  const cardW = Math.max(containerW - 2 * (peekPerSide + CARD_GAP), 200)

  // ── Navigation state ─────────────────────────────────────────────────────
  const [activeIdx, setActiveIdx] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)

  // ── Track X position ─────────────────────────────────────────────────────
  // Centers card[idx] within the viewport container.
  const trackXFor = React.useCallback(
    (idx: number) => -(idx * (cardW + CARD_GAP)) + (containerW - cardW) / 2,
    [cardW, containerW],
  )

  // targetX drives the animate prop — framer-motion springs to it.
  const [targetX, setTargetX] = React.useState(0)

  React.useEffect(() => {
    if (containerW > 0) setTargetX(trackXFor(activeIdx))
  }, [activeIdx, containerW, trackXFor])

  // ── Go to index ──────────────────────────────────────────────────────────
  const goTo = React.useCallback(
    (idx: number) => {
      const next = Math.max(0, Math.min(n - 1, idx))
      setActiveIdx(next)
      setTargetX(trackXFor(next))
    },
    [n, trackXFor],
  )

  // ── Drag handlers ────────────────────────────────────────────────────────
  const OFFSET_THRESHOLD   = 55   // px to count as intentional swipe
  const VELOCITY_THRESHOLD = 350  // px/s flick threshold

  function handleDragStart() {
    setIsDragging(true)
  }

  function handleDragEnd(_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    setIsDragging(false)

    const wentLeft  = info.offset.x < -OFFSET_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD
    const wentRight = info.offset.x >  OFFSET_THRESHOLD || info.velocity.x >  VELOCITY_THRESHOLD

    if (wentLeft)       goTo(activeIdx + 1)
    else if (wentRight) goTo(activeIdx - 1)
    else                setTargetX(trackXFor(activeIdx)) // snap back
  }

  // Drag bounds: allow tiny elastic overshoot at extremes
  const ELASTIC_OVERSHOOT = 32
  const dragLeft  = trackXFor(n - 1) - ELASTIC_OVERSHOOT
  const dragRight = trackXFor(0)      + ELASTIC_OVERSHOOT

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full select-none">

      {/* ── Carousel viewport ──────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="w-full overflow-hidden"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Render the track only once containerW is known to avoid a layout
            flash where all cards appear at x=0 before measurement. */}
        {containerW > 0 && (
          <motion.div
            className="flex"
            style={{ gap: CARD_GAP }}
            animate={{ x: targetX }}
            transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.85 }}
            drag="x"
            dragConstraints={{ left: dragLeft, right: dragRight }}
            dragElastic={0.10}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {testimonials.map((t, i) => (
              <div
                key={t.id}
                style={{ width: cardW, height: 360, flexShrink: 0 }}
                // Clicking a non-active card navigates to it
                onClick={() => { if (!isDragging && i !== activeIdx) goTo(i) }}
              >
                <CardContent t={t} isActive={i === activeIdx} />
              </div>
            ))}
          </motion.div>
        )}

        {/* Skeleton height while containerW is being measured */}
        {containerW === 0 && <div style={{ height: 360 }} />}
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 mt-7">

        {/* Prev arrow — desktop only */}
        <button
          type="button"
          aria-label="Depoimento anterior"
          onClick={() => goTo(activeIdx - 1)}
          disabled={activeIdx === 0}
          className="hidden sm:flex w-9 h-9 rounded-full border border-white/[0.09] bg-white/[0.04] items-center justify-center text-gray-500 hover:text-white hover:border-white/[0.18] hover:bg-white/[0.08] transition-all disabled:opacity-20 disabled:cursor-not-allowed flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para depoimento ${i + 1} de ${n}`}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIdx
                  ? 'w-6 h-[7px] bg-purple-500 shadow-[0_0_8px_rgba(124,58,237,0.6)]'
                  : 'w-[7px] h-[7px] bg-white/[0.18] hover:bg-white/[0.35]'
              }`}
            />
          ))}
        </div>

        {/* Next arrow — desktop only */}
        <button
          type="button"
          aria-label="Próximo depoimento"
          onClick={() => goTo(activeIdx + 1)}
          disabled={activeIdx === n - 1}
          className="hidden sm:flex w-9 h-9 rounded-full border border-white/[0.09] bg-white/[0.04] items-center justify-center text-gray-500 hover:text-white hover:border-white/[0.18] hover:bg-white/[0.08] transition-all disabled:opacity-20 disabled:cursor-not-allowed flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Swipe hint — mobile only, unobtrusive ────────────────────────── */}
      <p className="flex sm:hidden items-center justify-center gap-1.5 mt-3 text-[10px] text-gray-700">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 8l4 4-4 4M7 8l-4 4 4 4" />
        </svg>
        Arraste para ver o próximo resultado
      </p>
    </div>
  )
}

// Backward-compat alias (ShuffleCards is still imported by Depoimentos)
export const ShuffleCards = TestimonialsCarousel
