'use client'

import * as React from 'react'
import { motion } from 'framer-motion'

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

interface TestimonialCardProps {
  handleShuffle: () => void
  testimonial: Testimonial
  position: 'front' | 'middle' | 'back'
}

// ─── Single draggable card ────────────────────────────────────────────────────

export function TestimonialCard({ handleShuffle, testimonial, position }: TestimonialCardProps) {
  const dragRef = React.useRef(0)
  const isFront = position === 'front'

  return (
    <motion.div
      style={{
        zIndex: position === 'front' ? 2 : position === 'middle' ? 1 : 0,
      }}
      animate={{
        rotate: position === 'front' ? '-6deg' : position === 'middle' ? '0deg' : '6deg',
        x:      position === 'front' ? '0%'    : position === 'middle' ? '33%'  : '66%',
      }}
      drag={true}
      dragElastic={0.35}
      dragListener={isFront}
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      onDragStart={(e: MouseEvent) => {
        dragRef.current = e.clientX
      }}
      onDragEnd={(e: MouseEvent) => {
        if (dragRef.current - e.clientX > 150) {
          handleShuffle()
        }
        dragRef.current = 0
      }}
      transition={{ duration: 0.35 }}
      className={`absolute left-0 top-0 grid h-[450px] w-[350px] select-none place-content-center space-y-5 rounded-2xl border border-white/[0.08] bg-[#0d1320]/80 p-6 shadow-2xl backdrop-blur-md ${
        isFront ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      {/* Avatar */}
      <div className="mx-auto">
        {testimonial.avatarUrl ? (
          <img
            src={testimonial.avatarUrl}
            alt={`Foto de ${testimonial.author}`}
            className="pointer-events-none mx-auto h-24 w-24 rounded-full border-2 border-purple-500/30 object-cover"
          />
        ) : (
          <div className="mx-auto h-24 w-24 rounded-full border-2 border-purple-500/30 bg-purple-600/20 flex items-center justify-center">
            <span className="text-3xl font-bold text-purple-300">
              {testimonial.author[0]}
            </span>
          </div>
        )}
      </div>

      {/* Star rating */}
      <div className="flex justify-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>

      {/* Metric badge (when present) */}
      {testimonial.metric && (
        <div className="flex items-center justify-center gap-2 bg-green-500/[0.08] border border-green-500/20 rounded-xl px-4 py-2.5">
          <span className="text-gray-500 text-xs line-through tabular-nums">{testimonial.metric.before}</span>
          <svg className="w-3 h-3 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <span className="text-green-400 font-extrabold text-base tabular-nums">{testimonial.metric.after}</span>
          <span className="text-xs text-gray-500">{testimonial.metric.label}</span>
          <span className="ml-auto text-xs font-bold text-green-400">+{testimonial.metric.after - testimonial.metric.before} pts</span>
        </div>
      )}

      {/* Highlight badge */}
      {!testimonial.metric && testimonial.highlight && (
        <div className="flex justify-center">
          <span className="text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
            {testimonial.highlight}
          </span>
        </div>
      )}

      {/* Quote */}
      <p className="text-center text-sm italic text-gray-300 leading-relaxed line-clamp-4">
        &ldquo;{testimonial.testimonial}&rdquo;
      </p>

      {/* Author */}
      <div className="text-center">
        <p className="text-sm font-semibold text-white">{testimonial.author}</p>
        <p className="text-xs text-gray-500 mt-0.5">{testimonial.role}</p>
      </div>

      {/* Drag hint (front card only) */}
      {isFront && (
        <p className="text-center text-[10px] text-gray-700 flex items-center justify-center gap-1.5">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 8l4 4-4 4M7 8l-4 4 4 4" />
          </svg>
          Arraste para ver o próximo
        </p>
      )}
    </motion.div>
  )
}

// ─── Shuffle deck ─────────────────────────────────────────────────────────────

interface ShuffleCardsProps {
  testimonials: Testimonial[]
}

export function ShuffleCards({ testimonials }: ShuffleCardsProps) {
  // positions array: one entry per testimonial — cycles through front/middle/back/hidden
  const [positions, setPositions] = React.useState<string[]>(
    testimonials.map((_, i) => (i === 0 ? 'front' : i === 1 ? 'middle' : 'back'))
  )

  const handleShuffle = () => {
    setPositions((prev) => {
      const next = [...prev]
      next.push(next.shift()!)     // move first → last
      // Re-map: first 3 visible, rest hidden (same as back visually)
      return next.map((_, i) => (i === 0 ? 'front' : i === 1 ? 'middle' : 'back'))
    })
  }

  // Show only first 3 visible cards (front/middle/back)
  const visibleTestimonials = testimonials.slice(0, 3)

  return (
    <div className="relative h-[450px] w-[350px]">
      {visibleTestimonials.map((testimonial, index) => (
        <TestimonialCard
          key={testimonial.id}
          testimonial={testimonial}
          handleShuffle={handleShuffle}
          position={positions[index] as 'front' | 'middle' | 'back'}
        />
      ))}
    </div>
  )
}
