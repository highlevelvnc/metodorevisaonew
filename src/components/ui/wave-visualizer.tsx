'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'

// ─── Types ────────────────────────────────────────────────────────────────────

interface WaveDatum {
  value: number
  targetValue: number
  speed: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WaveVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    let time   = 0

    // Wave state — 8 independent oscillators
    const waveData: WaveDatum[] = Array.from({ length: 8 }).map(() => ({
      value:       Math.random() * 0.5 + 0.1,
      targetValue: Math.random() * 0.5 + 0.1,
      speed:       Math.random() * 0.02 + 0.01,
    }))

    // Resize canvas to match its CSS size (uses ResizeObserver, not window)
    function resize() {
      const rect = canvas!.getBoundingClientRect()
      canvas!.width  = rect.width  || canvas!.offsetWidth
      canvas!.height = rect.height || canvas!.offsetHeight
    }

    function updateWaveData() {
      waveData.forEach((d) => {
        if (Math.random() < 0.01) d.targetValue = Math.random() * 0.7 + 0.1
        d.value += (d.targetValue - d.value) * d.speed
      })
    }

    function draw() {
      ctx!.fillStyle = '#000000'
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)

      waveData.forEach((d, i) => {
        const freq = d.value * 7
        ctx!.beginPath()
        for (let x = 0; x < canvas!.width; x++) {
          const nx = (x / canvas!.width) * 2 - 1
          const px = nx + i * 0.04 + freq * 0.03
          const py =
            Math.sin(px * 10 + time) *
            Math.cos(px * 2) *
            freq *
            0.1 *
            ((i + 1) / 8)
          const y = (py + 1) * (canvas!.height / 2)
          x === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y)
        }
        const intensity      = Math.min(1, freq * 0.3)
        const r              = Math.round(79  + intensity * 100)
        const g              = Math.round(70  + intensity * 130)
        const b              = 229
        ctx!.lineWidth       = 1 + i * 0.3
        ctx!.strokeStyle     = `rgba(${r},${g},${b},0.6)`
        ctx!.shadowColor     = `rgba(${r},${g},${b},0.5)`
        ctx!.shadowBlur      = 5
        ctx!.stroke()
        ctx!.shadowBlur      = 0
      })
    }

    function animate() {
      time += 0.02
      updateWaveData()
      draw()
      animId = requestAnimationFrame(animate)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    animate()

    return () => {
      ro.disconnect()
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    /* Outer container — contained, no fixed positioning */
    <div className="relative rounded-3xl overflow-hidden w-full" style={{ minHeight: '440px' }}>

      {/* ── Wave canvas ─────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />

      {/* ── Floating specialist card ─────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div
          className="relative w-full max-w-[290px] rounded-2xl overflow-hidden animate-float"
          style={{
            background:
              'linear-gradient(145deg, rgba(14,19,31,0.93) 0%, rgba(7,12,20,0.96) 100%)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow:
              '0 -8px 60px 8px rgba(78,99,255,0.18), 0 24px 70px rgba(0,0,0,0.65)',
          }}
        >
          {/* Top shimmer line */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)',
            }}
            aria-hidden="true"
          />

          {/* Card body */}
          <div className="p-5 flex flex-col items-center text-center">

            {/* Portrait — primary visual anchor */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-purple-500/50 mb-3 flex-shrink-0"
              style={{ boxShadow: '0 0 24px 4px rgba(139,92,246,0.25)' }}
            >
              <Image
                src="/bia.jpg"
                alt="Especialista Método Revisão"
                fill
                sizes="80px"
                className="object-cover object-top"
                priority
              />
            </div>

            {/* Name + role */}
            <p className="text-sm font-bold text-white leading-tight mb-0.5">
              Bianca Lima
            </p>
            <p className="text-[11px] text-gray-500 leading-snug mb-1">
              Especialista em redação ENEM
            </p>

            {/* Live indicator */}
            <div className="flex items-center justify-center gap-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400 font-medium">Online agora</span>
            </div>

            {/* Divider */}
            <div
              className="w-full h-px mb-4"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            />

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 w-full">
              {[
                { value: '+5k', label: 'Redações' },
                { value: '+10k', label: 'Alunos' },
                { value: '4.9★', label: 'Avaliação' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-sm font-extrabold text-white tabular-nums leading-none mb-0.5">
                    {s.value}
                  </p>
                  <p className="text-[10px] text-gray-600 leading-none">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom border glow */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[1.5px] pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.50) 50%, transparent 100%)',
              boxShadow:
                '0 0 12px 3px rgba(172,92,255,0.65), 0 0 24px 5px rgba(56,189,248,0.35)',
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  )
}
