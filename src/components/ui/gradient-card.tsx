'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface GradientCardProps {
  title: string
  desc: string
  icon: React.ReactNode
  href?: string
  ctaLabel?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export const GradientCard = ({
  title,
  desc,
  icon,
  href = '#como-funciona',
  ctaLabel = 'Saiba mais',
}: GradientCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setRotation({
      x: -(y / rect.height) * 5,
      y:  (x / rect.width)  * 5,
    })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotation({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={cardRef}
      className="relative rounded-[32px] overflow-hidden w-full"
      style={{
        minHeight: '380px',
        transformStyle: 'preserve-3d',
        backgroundColor: '#0e131f',
        boxShadow:
          '0 -10px 100px 10px rgba(78, 99, 255, 0.20), 0 0 10px 0 rgba(0,0,0,0.5)',
      }}
      initial={{ y: 0 }}
      animate={{
        y: isHovered ? -5 : 0,
        rotateX: rotation.x,
        rotateY: rotation.y,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Glass reflection overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 35,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(2px)',
        }}
        animate={{ opacity: isHovered ? 0.7 : 0.5 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* Dark base */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 0,
          background: 'linear-gradient(180deg, #000000 0%, #000000 70%)',
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
        style={{
          zIndex: 10,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Purple/blue bottom glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2/3 pointer-events-none"
        style={{
          zIndex: 20,
          background: `
            radial-gradient(ellipse at bottom right, rgba(172,92,255,0.7) -10%, rgba(79,70,229,0) 70%),
            radial-gradient(ellipse at bottom left,  rgba(56,189,248,0.7) -10%, rgba(79,70,229,0) 70%)
          `,
          filter: 'blur(40px)',
        }}
        animate={{ opacity: isHovered ? 0.9 : 0.75 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* Central purple glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2/3 pointer-events-none"
        style={{
          zIndex: 21,
          background:
            'radial-gradient(circle at bottom center, rgba(161,58,229,0.7) -20%, rgba(79,70,229,0) 60%)',
          filter: 'blur(45px)',
        }}
        animate={{ opacity: isHovered ? 0.85 : 0.7, y: '10%' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* Bottom border glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
        style={{
          zIndex: 25,
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.05) 100%)',
        }}
        animate={{
          boxShadow: isHovered
            ? '0 0 20px 4px rgba(172,92,255,0.9), 0 0 30px 6px rgba(138,58,185,0.7), 0 0 40px 8px rgba(56,189,248,0.5)'
            : '0 0 15px 3px rgba(172,92,255,0.8), 0 0 25px 5px rgba(138,58,185,0.6), 0 0 35px 7px rgba(56,189,248,0.4)',
          opacity: isHovered ? 1 : 0.9,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* Bottom-left corner glow edge */}
      <motion.div
        className="absolute bottom-0 left-0 h-1/4 w-[1px] rounded-full pointer-events-none"
        style={{
          zIndex: 25,
          background:
            'linear-gradient(to top, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0) 80%)',
        }}
        animate={{
          boxShadow: isHovered
            ? '0 0 20px 4px rgba(172,92,255,0.9)'
            : '0 0 15px 3px rgba(172,92,255,0.8)',
          opacity: isHovered ? 1 : 0.9,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* Bottom-right corner glow edge */}
      <motion.div
        className="absolute bottom-0 right-0 h-1/4 w-[1px] rounded-full pointer-events-none"
        style={{
          zIndex: 25,
          background:
            'linear-gradient(to top, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0) 80%)',
        }}
        animate={{
          boxShadow: isHovered
            ? '0 0 20px 4px rgba(172,92,255,0.9)'
            : '0 0 15px 3px rgba(172,92,255,0.8)',
          opacity: isHovered ? 1 : 0.9,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* ── Card content ─────────────────────────────────────────── */}
      <motion.div
        className="relative flex flex-col h-full p-8"
        style={{ zIndex: 40, minHeight: '380px' }}
      >
        {/* Icon bubble */}
        <motion.div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-6 text-purple-400 flex-shrink-0"
          style={{
            background: 'linear-gradient(225deg, #171c2c 0%, #121624 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
          animate={{
            boxShadow: isHovered
              ? '0 8px 16px -2px rgba(0,0,0,0.3), inset 2px 2px 5px rgba(255,255,255,0.15), inset -2px -2px 5px rgba(0,0,0,0.7)'
              : '0 6px 12px -2px rgba(0,0,0,0.25), inset 1px 1px 3px rgba(255,255,255,0.12), inset -2px -2px 4px rgba(0,0,0,0.5)',
            y: isHovered ? -2 : 0,
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Top-left highlight */}
          <div
            className="absolute top-0 left-0 w-2/3 h-2/3 opacity-40 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at top left, rgba(255,255,255,0.5), transparent 80%)',
              filter: 'blur(10px)',
            }}
          />
          {/* Bottom depth */}
          <div
            className="absolute bottom-0 left-0 w-full h-1/2 opacity-50 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
            }}
          />
          {/* Icon */}
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            {icon}
          </div>
        </motion.div>

        {/* Text block */}
        <motion.div
          className="flex flex-col flex-1"
          animate={{
            rotateX: isHovered ? -rotation.x * 0.3 : 0,
            rotateY: isHovered ? -rotation.y * 0.3 : 0,
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <motion.h3
            className="text-xl font-semibold text-white mb-3 leading-snug"
            style={{ letterSpacing: '-0.01em' }}
            animate={{
              textShadow: isHovered ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
            }}
            transition={{ duration: 0.4 }}
          >
            {title}
          </motion.h3>

          <motion.p
            className="text-sm text-gray-400 leading-relaxed mb-6 flex-1"
            style={{ fontWeight: 400 }}
            animate={{ opacity: isHovered ? 0.95 : 0.8 }}
            transition={{ duration: 0.4 }}
          >
            {desc}
          </motion.p>

          {/* CTA */}
          <motion.a
            href={href}
            className="inline-flex items-center text-white/70 hover:text-white text-sm font-medium transition-colors mt-auto group"
            animate={{ opacity: isHovered ? 1 : 0.7 }}
            transition={{ duration: 0.3 }}
          >
            {ctaLabel}
            <motion.svg
              className="ml-1.5 w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <path
                d="M1 8H15M15 8L8 1M15 8L8 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.a>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
