'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Scene definitions ────────────────────────────────────────────────────────
// Each scene drives ALL visual states declaratively — no imperative timeline.
// Changing `scene` re-evaluates every `animate` prop simultaneously.

interface Scene {
  readonly id:      number
  readonly dur:     number   // hold duration in ms (not including transition time)
  readonly text:    string
  readonly sub:     string
  readonly dim:     number   // 0–1 opacity of the dark overlay (1 = fully black)
  readonly blur:    number   // px blur on the screenshot
  readonly generic: boolean  // Scene 2: show faded "generic feedback" mock
  readonly scan:    boolean  // Scene 3: show scanning sweep
  readonly score:   boolean  // Scene 4: animate score counter + comp glows
  readonly success: boolean  // Scene 5: show success badge + evolution glow
}

const SCENES: Scene[] = [
  {
    id: 1, dur: 1900,
    text: 'Você escreve sem direção',
    sub:  'Sem saber onde errar. Sem saber como evoluir.',
    dim: 0.72, blur: 2,
    generic: false, scan: false, score: false, success: false,
  },
  {
    id: 2, dur: 1900,
    text: 'Feedback genérico não resolve',
    sub:  'Nota sem diagnóstico. Correção sem estratégia.',
    dim: 0.56, blur: 1,
    generic: true, scan: false, score: false, success: false,
  },
  {
    id: 3, dur: 1800,
    text: 'Aqui você entende o erro',
    sub:  'O sistema mapeia cada competência.',
    dim: 0.28, blur: 0,
    generic: false, scan: true, score: false, success: false,
  },
  {
    id: 4, dur: 2600,
    text: 'Correção real, resultado real',
    sub:  'C1–C5 analisados. Nota em ascensão.',
    dim: 0.06, blur: 0,
    generic: false, scan: false, score: true, success: false,
  },
  {
    id: 5, dur: 2000,
    text: 'Você evolui com clareza e estratégia',
    sub:  'Redação a redação. Competência a competência.',
    dim: 0.00, blur: 0,
    generic: false, scan: false, score: false, success: true,
  },
]

const N = SCENES.length

// ─── Easing presets ───────────────────────────────────────────────────────────

const EASE  = { ease: [0.4, 0, 0.2, 1] as const, duration: 0.55 }
const EASE_F = { ease: [0.4, 0, 0.2, 1] as const, duration: 0.35 }

// ─── Competency indicators (C1–C5) ───────────────────────────────────────────

const COMP_COLORS = [
  'rgba(139,92,246,0.9)',  // C1 purple
  'rgba(99,102,241,0.9)',  // C2 indigo
  'rgba(59,130,246,0.9)',  // C3 blue
  'rgba(16,185,129,0.9)',  // C4 emerald
  'rgba(245,158,11,0.9)',  // C5 amber
]

// ─── Score counter hook ────────────────────────────────────────────────────────
// Animates from 780 → 920 when `active` flips true; resets immediately when false.

function useScoreCounter(active: boolean): number {
  const [score, setScore] = useState(780)
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (rafRef.current) clearTimeout(rafRef.current)

    if (!active) {
      setScore(780)
      return
    }

    let progress = 0
    const tick = () => {
      progress = Math.min(progress + 0.045, 1)
      // cubic ease-out: starts fast, eases into 920
      const eased = 1 - Math.pow(1 - progress, 3)
      setScore(Math.round(780 + 140 * eased))
      if (progress < 1) rafRef.current = setTimeout(tick, 35)
    }
    rafRef.current = setTimeout(tick, 280)

    return () => { if (rafRef.current) clearTimeout(rafRef.current) }
  }, [active])

  return score
}

// ─── Main component ────────────────────────────────────────────────────────────

export function ProductDemo() {
  const [sceneIdx, setSceneIdx] = useState(0)           // 0-based index into SCENES
  const scene = SCENES[sceneIdx]
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Scene clock ─────────────────────────────────────────────────────────────
  // Each scene drives its own next-advance after `dur` ms.
  // Transition overlap (0.55s) is absorbed inside the hold duration.
  useEffect(() => {
    timerRef.current = setTimeout(
      () => setSceneIdx(i => (i + 1) % N),
      scene.dur,
    )
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [sceneIdx, scene.dur])

  const score = useScoreCounter(scene.score)

  // ── Shared transition ────────────────────────────────────────────────────────
  const t = EASE

  return (
    <div className="relative w-full max-w-[580px] mx-auto lg:max-w-full select-none">

      {/* ── Ambient glow behind the frame ──────────────────────────────────── */}
      <motion.div
        className="absolute -inset-6 rounded-3xl blur-[60px] pointer-events-none"
        animate={{
          opacity: scene.success ? 0.75 : scene.score ? 0.55 : 0.35,
          background: scene.success
            ? 'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.5) 0%, rgba(99,102,241,0.2) 50%, transparent 80%)'
            : 'radial-gradient(ellipse at 50% 35%, rgba(124,58,237,0.35) 0%, rgba(99,102,241,0.12) 50%, transparent 80%)',
        }}
        transition={t}
        aria-hidden="true"
      />

      {/* ── Frame wrapper ──────────────────────────────────────────────────── */}
      <div className="relative rounded-[18px] overflow-hidden border border-white/[0.10] shadow-[0_32px_80px_rgba(0,0,0,0.70),0_8px_24px_rgba(0,0,0,0.40)]">

        {/* Browser chrome */}
        <div
          className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.07] flex-shrink-0"
          style={{ background: 'linear-gradient(to bottom, #0b1021, #090e1b)' }}
          aria-hidden="true"
        >
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="w-[10px] h-[10px] rounded-full bg-white/[0.08]" />
            <div className="w-[10px] h-[10px] rounded-full bg-white/[0.08]" />
            <div className="w-[10px] h-[10px] rounded-full bg-white/[0.08]" />
          </div>
          <div className="flex-1 mx-3 h-[22px] bg-white/[0.04] rounded-md flex items-center px-2.5 border border-white/[0.05]">
            <svg className="w-2.5 h-2.5 text-gray-700 mr-1.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-[9.5px] text-gray-700 select-none font-mono tracking-tight">
              app.metodorevisao.com.br/aluno
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <motion.span
              className="w-1.5 h-1.5 rounded-full"
              animate={{ backgroundColor: scene.score || scene.success ? '#34d399' : '#6b7280' }}
              transition={EASE_F}
            />
            <span className="text-[10px] text-gray-600 font-medium">ao vivo</span>
          </div>
        </div>

        {/* ── Screenshot + all overlays ──────────────────────────────────── */}
        <div className="relative">

          {/* Base screenshot — never animated, always crisp */}
          <Image
            src="/dashboard.png"
            alt="Painel do aluno — Método Revisão"
            width={2047}
            height={1337}
            quality={90}
            priority
            className="w-full h-auto block"
          />

          {/* ── Layer 1: Dim overlay ──────────────────────────────────────── */}
          {/* Controls perceived brightness of the screenshot per scene.      */}
          {/* GPU: only opacity changes — no filter on the actual image.       */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #070c14 0%, #04080f 100%)' }}
            animate={{ opacity: scene.dim }}
            transition={t}
            aria-hidden="true"
          />

          {/* ── Layer 2: Blur veil (Scenes 1–2 only) ─────────────────────── */}
          {/* Separate div so we don't blur the screenshot element itself.     */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ backdropFilter: `blur(${scene.blur}px)` }}
            animate={{ opacity: scene.blur > 0 ? 1 : 0 }}
            transition={t}
            aria-hidden="true"
          />

          {/* ── Layer 3: Scene 2 — generic feedback mockup ───────────────── */}
          {/* A deliberately weak, washed-out fake "feedback" card.           */}
          <AnimatePresence>
            {scene.generic && (
              <motion.div
                key="generic-feedback"
                className="absolute pointer-events-none"
                style={{
                  top: '18%', right: '5%',
                  width: '38%',
                  background: 'rgba(15,20,35,0.80)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  backdropFilter: 'blur(4px)',
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.70, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={EASE_F}
                aria-hidden="true"
              >
                {/* Fake title bar */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-gray-700" />
                  <div className="h-1.5 bg-gray-700/60 rounded-full flex-1" />
                </div>
                {/* Fake feedback lines */}
                {[80, 65, 72, 50].map((w, i) => (
                  <div key={i} className="h-1 bg-gray-700/40 rounded-full mb-1.5" style={{ width: `${w}%` }} />
                ))}
                {/* Generic score chip */}
                <div className="mt-2 inline-flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-gray-700/50" />
                  <div className="h-2 w-10 bg-gray-700/40 rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Layer 4: Scene 3 — scanner sweep ────────────────────────── */}
          {/* A purple glow band sweeps top-to-bottom like a radar pass.      */}
          <AnimatePresence>
            {scene.scan && (
              <motion.div
                key="scan-sweep"
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  height: '80px',
                  background:
                    'linear-gradient(to bottom, transparent 0%, rgba(139,92,246,0.35) 40%, rgba(139,92,246,0.25) 60%, transparent 100%)',
                  boxShadow: '0 0 30px 10px rgba(139,92,246,0.20)',
                }}
                initial={{ top: '-10%', opacity: 0 }}
                animate={{ top: '110%', opacity: [0, 1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'linear', opacity: { times: [0, 0.05, 0.9, 1] } }}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>

          {/* Scene 3 — border pulse ring */}
          <AnimatePresence>
            {scene.scan && (
              <motion.div
                key="border-ring"
                className="absolute inset-0 pointer-events-none rounded-[2px]"
                style={{ border: '2px solid rgba(139,92,246,0.4)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0.4, 0.8, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, times: [0, 0.2, 0.5, 0.8, 1] }}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>

          {/* ── Layer 5: Scene 4 — score glow + counter ──────────────────── */}
          <AnimatePresence>
            {scene.score && (
              <motion.div
                key="score-area"
                className="absolute pointer-events-none"
                style={{ top: '6%', right: '4%', width: '22%' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={EASE_F}
                aria-hidden="true"
              >
                {/* Glow halo */}
                <div
                  className="absolute -inset-4 rounded-2xl pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.35) 0%, transparent 70%)',
                    filter: 'blur(8px)',
                  }}
                />
                {/* Score counter pill */}
                <div
                  className="relative flex flex-col items-center justify-center rounded-xl px-3 py-2"
                  style={{
                    background: 'rgba(10,8,25,0.90)',
                    border: '1px solid rgba(139,92,246,0.40)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 0 20px 4px rgba(139,92,246,0.25)',
                  }}
                >
                  <p className="text-[9px] text-purple-400 font-semibold tracking-widest uppercase leading-none mb-0.5">
                    Redação
                  </p>
                  <p className="text-2xl font-extrabold text-white tabular-nums leading-none">
                    {score}
                  </p>
                  <p className="text-[9px] text-emerald-400 font-semibold mt-0.5">↑ 140 pts</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Layer 6: Scene 4 — C1–C5 competency glow ────────────────── */}
          <AnimatePresence>
            {scene.score && (
              <motion.div
                key="comp-glow"
                className="absolute pointer-events-none"
                style={{ top: '28%', left: '4%', width: '30%' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={EASE_F}
                aria-hidden="true"
              >
                {/* Glow backdrop */}
                <div
                  className="absolute -inset-3 rounded-xl pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.20) 0%, transparent 75%)',
                    filter: 'blur(6px)',
                  }}
                />
                {/* C1–C5 badges lighting up with staggered delay */}
                <div className="relative flex flex-col gap-1">
                  {['C1', 'C2', 'C3', 'C4', 'C5'].map((label, i) => (
                    <motion.div
                      key={label}
                      className="flex items-center gap-1.5"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.12, duration: 0.3, ease: 'easeOut' }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: COMP_COLORS[i], boxShadow: `0 0 6px 2px ${COMP_COLORS[i]}` }}
                      />
                      <div
                        className="h-1.5 rounded-full flex-1"
                        style={{
                          background: `linear-gradient(to right, ${COMP_COLORS[i]}, transparent)`,
                          opacity: 0.7,
                          maxWidth: `${[88, 72, 95, 80, 68][i]}%`,
                        }}
                      />
                      <span
                        className="text-[8px] font-bold flex-shrink-0 leading-none"
                        style={{ color: COMP_COLORS[i] }}
                      >
                        {label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Layer 7: Scene 5 — evolution glow ──────────────────────── */}
          <AnimatePresence>
            {scene.success && (
              <motion.div
                key="evo-glow"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.18) 0%, rgba(99,102,241,0.08) 50%, transparent 80%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.7, 1] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, times: [0, 0.3, 0.6, 1] }}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>

          {/* ── Layer 8: Scene 5 — success badge ───────────────────────── */}
          <AnimatePresence>
            {scene.success && (
              <motion.div
                key="success-badge"
                className="absolute pointer-events-none"
                style={{ top: '32%', left: '50%', translateX: '-50%' }}
                initial={{ opacity: 0, scale: 0.75, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -8 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                aria-hidden="true"
              >
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap"
                  style={{
                    background: 'rgba(6, 20, 12, 0.92)',
                    border: '1px solid rgba(52,211,153,0.40)',
                    backdropFilter: 'blur(10px)',
                    boxShadow:
                      '0 0 24px 6px rgba(52,211,153,0.20), 0 8px 32px rgba(0,0,0,0.60)',
                  }}
                >
                  {/* Animated check */}
                  <motion.div
                    className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0"
                    animate={{ boxShadow: ['0 0 0px rgba(52,211,153,0)', '0 0 12px 3px rgba(52,211,153,0.5)', '0 0 6px 1px rgba(52,211,153,0.3)'] }}
                    transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
                  >
                    <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                  <div>
                    <p className="text-[11px] font-extrabold text-white leading-none">Evolução detectada</p>
                    <p className="text-[9px] text-emerald-400/80 font-medium leading-none mt-0.5">+140 pts · C3 dominada</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Layer 9: Text overlay bar (all scenes) ─────────────────── */}
          {/* Anchored to the bottom of the screenshot, floats over the       */}
          {/* existing bottom-fade. Text swaps on scene change.               */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(7,12,20,0.97) 0%, rgba(7,12,20,0.70) 55%, transparent 100%)',
              paddingBottom: '14px',
              paddingTop: '40px',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={scene.id}
                className="px-5 pb-1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.30, ease: 'easeOut' }}
              >
                {/* Scene number + dot indicator */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  {SCENES.map((s) => (
                    <motion.div
                      key={s.id}
                      className="rounded-full"
                      animate={{
                        width:            s.id === scene.id ? '16px' : '4px',
                        backgroundColor:  s.id === scene.id ? 'rgba(139,92,246,1)' : 'rgba(255,255,255,0.15)',
                      }}
                      style={{ height: '4px' }}
                      transition={EASE_F}
                    />
                  ))}
                </div>

                {/* Main text */}
                <p className="text-[13px] sm:text-sm font-bold text-white leading-tight mb-0.5">
                  {scene.text}
                </p>

                {/* Sub text */}
                <p className="text-[10px] sm:text-[11px] text-gray-500 leading-snug">
                  {scene.sub}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>{/* end screenshot container */}
      </div>{/* end frame wrapper */}

      {/* ── Floating badge: top-right — correction delivered ─────────────── */}
      <motion.div
        className="absolute -top-3 -right-3 sm:-top-4 sm:-right-5 hidden sm:block"
        animate={{ opacity: scene.score || scene.success ? 1 : 0.45 }}
        transition={t}
      >
        <div className="bg-[#0d1420]/95 backdrop-blur-md border border-white/[0.10] rounded-[14px] px-3.5 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.50)]">
          <div className="flex items-center gap-1.5 mb-0.5">
            <motion.span
              className="w-1.5 h-1.5 rounded-full"
              animate={{ backgroundColor: scene.score || scene.success ? '#4ade80' : '#374151' }}
              transition={EASE_F}
            />
            <span className="text-[10px] text-green-400 font-semibold tracking-wide">Correção entregue</span>
          </div>
          <p className="text-[11px] text-gray-300 font-semibold">Redação #07 · 36h</p>
        </div>
      </motion.div>

      {/* ── Floating badge: bottom-left — score progression ─────────────── */}
      <motion.div
        className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-5 hidden sm:block"
        animate={{ opacity: scene.score || scene.success ? 1 : 0.40 }}
        transition={t}
      >
        <div className="bg-[#0d1420]/95 backdrop-blur-md border border-white/[0.10] rounded-[14px] px-3.5 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.50)]">
          <p className="text-[10px] text-gray-500 font-medium mb-1">Evolução média</p>
          <div className="flex items-end gap-1 leading-none">
            <motion.span
              className="text-[1.35rem] font-extrabold tabular-nums leading-none"
              animate={{ color: scene.success ? '#34d399' : scene.score ? '#a78bfa' : '#ffffff' }}
              transition={EASE_F}
            >
              {scene.score ? `+${score - 780}` : '+67'}
            </motion.span>
            <span className="text-[10px] text-gray-600 mb-px">pts</span>
          </div>
          <p className="text-[10px] text-emerald-400 font-medium mt-0.5">↑ últimas 4 redações</p>
        </div>
      </motion.div>

    </div>
  )
}
