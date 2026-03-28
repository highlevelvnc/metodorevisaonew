'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Scene definitions ────────────────────────────────────────────────────────
// Total loop target: ~6.5 s  (sum of dur values below)
// Transition time (0.40 s) is absorbed inside each scene's hold window,
// so the visual loop stays tight without gaps or overlaps.

interface Scene {
  readonly id:             number
  readonly dur:            number    // hold time in ms before advancing
  readonly text:           string    // bottom-bar headline
  readonly sub:            string    // bottom-bar supporting line
  readonly dim:            number    // 0–1 dark overlay opacity
  readonly blur:           number    // px backdrop-blur on veil layer
  readonly generic:        boolean   // Scene 2: weak feedback mock
  readonly scan:           boolean   // Scene 3: radar sweep
  readonly score:          boolean   // Scene 4: counter + C1–C5 + error highlight
  readonly success:        boolean   // Scene 5: evolution glow + badge
}

const SCENES: Scene[] = [
  // ① Pain state — quick, don't linger
  {
    id: 1, dur: 1100,
    text: 'Você escreve sem direção',
    sub:  'Nota parada. Sem diagnóstico.',
    dim: 0.72, blur: 2,
    generic: false, scan: false, score: false, success: false,
  },
  // ② Generic feedback — brief exposure; the contrast is the message
  {
    id: 2, dur: 1000,
    text: 'Feedback genérico não evolui você',
    sub:  '"Continue praticando." — sem estratégia real.',
    dim: 0.52, blur: 1,
    generic: true, scan: false, score: false, success: false,
  },
  // ③ System activation — quick, builds anticipation
  {
    id: 3, dur: 1100,
    text: 'O sistema identifica cada erro',
    sub:  'Mapeando competência por competência.',
    dim: 0.26, blur: 0,
    generic: false, scan: true, score: false, success: false,
  },
  // ④ Correction — most important scene, holds longest
  {
    id: 4, dur: 1900,
    text: 'Erro encontrado. Agora corrigido.',
    sub:  'C3 analisada. Nota subindo.',
    dim: 0.06, blur: 0,
    generic: false, scan: false, score: true, success: false,
  },
  // ⑤ Evolution — emotional close, short and resonant
  {
    id: 5, dur: 1400,
    text: 'Sua evolução tem direção agora.',
    sub:  'É assim que nota sobe de verdade.',
    dim: 0.00, blur: 0,
    generic: false, scan: false, score: false, success: true,
  },
]

const N = SCENES.length

// ─── Easing presets — tighter than before to match 6.5 s loop ────────────────

const EASE   = { ease: [0.4, 0, 0.2, 1] as const, duration: 0.40 }
const EASE_F = { ease: [0.4, 0, 0.2, 1] as const, duration: 0.22 }

// ─── Competency colours ───────────────────────────────────────────────────────

const COMP_COLORS = [
  'rgba(139,92,246,0.9)',   // C1 purple
  'rgba(99,102,241,0.9)',   // C2 indigo
  'rgba(59,130,246,0.9)',   // C3 blue  ← highlighted as the "error" competency
  'rgba(16,185,129,0.9)',   // C4 emerald
  'rgba(245,158,11,0.9)',   // C5 amber
]

// ─── Score counter hook ───────────────────────────────────────────────────────
// 780 → 920 via cubic ease-out in ~500 ms when `active` is true.

function useScoreCounter(active: boolean): number {
  const [score, setScore] = useState(780)
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (ref.current) clearTimeout(ref.current)

    if (!active) { setScore(780); return }

    let progress = 0
    const tick = () => {
      progress = Math.min(progress + 0.06, 1)
      const eased = 1 - Math.pow(1 - progress, 3)          // cubic ease-out
      setScore(Math.round(780 + 140 * eased))
      if (progress < 1) ref.current = setTimeout(tick, 28)  // ~500 ms total
    }
    ref.current = setTimeout(tick, 200)                      // brief entry delay

    return () => { if (ref.current) clearTimeout(ref.current) }
  }, [active])

  return score
}

// ─── Error-highlight hook — drives the C3 "before → after" flip in Scene 4 ──

function useErrorHighlight(active: boolean): boolean {
  const [resolved, setResolved] = useState(false)
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (ref.current) clearTimeout(ref.current)
    if (!active) { setResolved(false); return }
    ref.current = setTimeout(() => setResolved(true), 850)   // show error 850 ms then flip
    return () => { if (ref.current) clearTimeout(ref.current) }
  }, [active])

  return resolved
}

// ─── Main component ────────────────────────────────────────────────────────────

export function ProductDemo() {
  const [sceneIdx, setSceneIdx] = useState(0)
  const scene      = SCENES[sceneIdx]
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Scene clock — single timer per scene, self-restarting
  useEffect(() => {
    timerRef.current = setTimeout(
      () => setSceneIdx(i => (i + 1) % N),
      scene.dur,
    )
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [sceneIdx, scene.dur])

  const score         = useScoreCounter(scene.score)
  const errorResolved = useErrorHighlight(scene.score)

  return (
    <div className="relative w-full max-w-[580px] mx-auto lg:max-w-full select-none">

      {/* ── Ambient glow behind the frame ────────────────────────────────── */}
      <motion.div
        className="absolute -inset-6 rounded-3xl blur-[60px] pointer-events-none"
        animate={{
          opacity: scene.success ? 0.75 : scene.score ? 0.55 : 0.32,
          background: scene.success
            ? 'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.50) 0%, rgba(99,102,241,0.20) 55%, transparent 80%)'
            : 'radial-gradient(ellipse at 50% 35%, rgba(124,58,237,0.32) 0%, rgba(99,102,241,0.10) 55%, transparent 80%)',
        }}
        transition={EASE}
        aria-hidden="true"
      />

      {/* ── Frame wrapper ─────────────────────────────────────────────────── */}
      <div className="relative rounded-[18px] overflow-hidden border border-white/[0.10] shadow-[0_32px_80px_rgba(0,0,0,0.70),0_8px_24px_rgba(0,0,0,0.40)]">

        {/* Browser chrome bar */}
        <div
          className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.07] flex-shrink-0"
          style={{ background: 'linear-gradient(to bottom, #0b1021, #090e1b)' }}
          aria-hidden="true"
        >
          <div className="flex gap-1.5 flex-shrink-0">
            {['', '', ''].map((_, i) => (
              <div key={i} className="w-[10px] h-[10px] rounded-full bg-white/[0.08]" />
            ))}
          </div>
          <div className="flex-1 mx-3 h-[22px] bg-white/[0.04] rounded-md flex items-center px-2.5 border border-white/[0.05]">
            <svg className="w-2.5 h-2.5 text-gray-700 mr-1.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-[9.5px] text-gray-700 select-none font-mono tracking-tight">
              app.metodorevisao.com/aluno
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

        {/* ── Screenshot + all overlay layers ─────────────────────────────── */}
        <div className="relative">

          {/* Base screenshot — never filtered or scaled */}
          <Image
            src="/dashboard.png"
            alt="Painel do aluno — Método Revisão"
            width={2047}
            height={1337}
            quality={90}
            priority
            className="w-full h-auto block"
          />

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* LAYER 1 — Dim overlay                                            */}
          {/* Perceived brightness of the screenshot is controlled entirely    */}
          {/* by the opacity of this solid-dark div — no filter on the image.  */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #070c14, #04080f)' }}
            animate={{ opacity: scene.dim }}
            transition={EASE}
            aria-hidden="true"
          />

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* LAYER 2 — Blur veil (Scenes 1–2)                                 */}
          {/* A separate div so the image element itself is never blurred.     */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ backdropFilter: `blur(${scene.blur}px)` }}
            animate={{ opacity: scene.blur > 0 ? 1 : 0 }}
            transition={EASE}
            aria-hidden="true"
          />

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* LAYER 3 — Scene 2: Generic feedback mock                         */}
          {/* The card is deliberately readable but shallow — short phrases    */}
          {/* that feel hollow compared to a real diagnosis.                   */}
          <AnimatePresence>
            {scene.generic && (
              <motion.div
                key="generic-feedback"
                className="absolute pointer-events-none"
                style={{
                  top: '14%', right: '5%', width: '40%',
                  background: 'rgba(12,18,32,0.88)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  backdropFilter: 'blur(4px)',
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.82, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={EASE_F}
                aria-hidden="true"
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[9px] text-gray-600 font-semibold uppercase tracking-widest">
                    Devolutiva
                  </span>
                  {/* Flat score chip — generic, no context */}
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-md"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: 'rgba(156,163,175,0.8)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    Nota: 620
                  </span>
                </div>

                {/* Explicitly shallow feedback phrases */}
                {[
                  { text: 'Boa estrutura geral.',          w: '78%' },
                  { text: 'Continue praticando a coesão.', w: '92%' },
                  { text: 'Redação dentro do esperado.',   w: '70%' },
                ].map(({ text, w }, i) => (
                  <div key={i} className="flex items-start gap-1.5 mb-1.5">
                    <div className="w-1 h-1 rounded-full bg-gray-700 mt-1 flex-shrink-0" />
                    <p
                      className="text-[8.5px] text-gray-600 leading-snug"
                      style={{ width: w }}
                    >
                      {text}
                    </p>
                  </div>
                ))}

                {/* Filler "action" row — looks generic */}
                <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center gap-1.5">
                  <div className="h-1.5 w-16 bg-gray-700/30 rounded-full" />
                  <div className="h-1.5 w-10 bg-gray-700/20 rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* LAYER 4 — Scene 3: Radar sweep + border ring                     */}
          <AnimatePresence>
            {scene.scan && (
              <motion.div
                key="scan-sweep"
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  height: '72px',
                  background:
                    'linear-gradient(to bottom, transparent 0%, rgba(139,92,246,0.32) 40%, rgba(139,92,246,0.22) 60%, transparent 100%)',
                  boxShadow: '0 0 28px 8px rgba(139,92,246,0.18)',
                }}
                initial={{ top: '-10%', opacity: 0 }}
                animate={{ top: '110%', opacity: [0, 1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.20,
                  ease: 'linear',
                  opacity: { times: [0, 0.04, 0.90, 1] },
                }}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {scene.scan && (
              <motion.div
                key="border-ring"
                className="absolute inset-0 pointer-events-none"
                style={{ border: '1.5px solid rgba(139,92,246,0.45)', borderRadius: '2px' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.9, 0.4, 0.9, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.30, times: [0, 0.15, 0.50, 0.80, 1] }}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* LAYER 5 — Scene 4: Score counter pill                            */}
          <AnimatePresence>
            {scene.score && (
              <motion.div
                key="score-area"
                className="absolute pointer-events-none"
                style={{ top: '6%', right: '4%', width: '22%' }}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={EASE_F}
                aria-hidden="true"
              >
                <div
                  className="absolute -inset-4 rounded-2xl pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.32) 0%, transparent 70%)',
                    filter: 'blur(8px)',
                  }}
                />
                <div
                  className="relative flex flex-col items-center justify-center rounded-xl px-3 py-2"
                  style={{
                    background: 'rgba(10,8,25,0.92)',
                    border: '1px solid rgba(139,92,246,0.42)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 0 20px 4px rgba(139,92,246,0.22)',
                  }}
                >
                  <p className="text-[8.5px] text-purple-400 font-semibold tracking-widest uppercase leading-none mb-0.5">
                    Redação
                  </p>
                  <p className="text-[1.4rem] font-extrabold text-white tabular-nums leading-none">
                    {score}
                  </p>
                  <motion.p
                    className="text-[8.5px] font-semibold mt-0.5"
                    animate={{ color: score >= 850 ? '#34d399' : '#a78bfa' }}
                    transition={EASE_F}
                  >
                    ↑ {score - 780} pts
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* LAYER 5.5 — Scene 4: Error callout → resolved flip               */}
          {/* Appears immediately when Scene 4 starts (amber "C3 error" pill), */}
          {/* then swaps to emerald "resolved" after 850 ms.                   */}
          <AnimatePresence mode="wait">
            {scene.score && !errorResolved ? (
              // ── Before: error state ──────────────────────────────────────
              <motion.div
                key="error-pill"
                className="absolute pointer-events-none"
                style={{ top: '48%', left: '4%' }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={EASE_F}
                aria-hidden="true"
              >
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                  style={{
                    background: 'rgba(28,14,4,0.92)',
                    border: '1px solid rgba(251,146,60,0.45)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 0 16px 3px rgba(251,146,60,0.18)',
                  }}
                >
                  {/* Warning icon */}
                  <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="rgba(251,146,60,0.9)" strokeWidth="2.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div>
                    <p className="text-[9px] font-bold text-orange-400 leading-none">C3 — Proposta fraca</p>
                    <p className="text-[7.5px] text-orange-400/60 leading-none mt-0.5">Intervenção incompleta</p>
                  </div>
                </div>
              </motion.div>
            ) : scene.score && errorResolved ? (
              // ── After: resolved state ────────────────────────────────────
              <motion.div
                key="resolved-pill"
                className="absolute pointer-events-none"
                style={{ top: '48%', left: '4%' }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={EASE_F}
                aria-hidden="true"
              >
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                  style={{
                    background: 'rgba(4,22,12,0.92)',
                    border: '1px solid rgba(52,211,153,0.40)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 0 16px 3px rgba(52,211,153,0.16)',
                  }}
                >
                  {/* Check icon */}
                  <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="rgba(52,211,153,0.9)" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <p className="text-[9px] font-bold text-emerald-400 leading-none">C3 corrigida ✓</p>
                    <p className="text-[7.5px] text-emerald-400/60 leading-none mt-0.5">Estratégia aplicada</p>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* LAYER 6 — Scene 4: C1–C5 competency bars                        */}
          <AnimatePresence>
            {scene.score && (
              <motion.div
                key="comp-glow"
                className="absolute pointer-events-none"
                style={{ top: '28%', left: '4%', width: '28%' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={EASE_F}
                aria-hidden="true"
              >
                <div
                  className="absolute -inset-3 rounded-xl pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, transparent 75%)',
                    filter: 'blur(6px)',
                  }}
                />
                <div className="relative flex flex-col gap-1">
                  {['C1', 'C2', 'C3', 'C4', 'C5'].map((label, i) => (
                    <motion.div
                      key={label}
                      className="flex items-center gap-1.5"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.10, duration: 0.25, ease: 'easeOut' }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          background: COMP_COLORS[i],
                          boxShadow: `0 0 5px 1px ${COMP_COLORS[i]}`,
                        }}
                      />
                      <div
                        className="h-1.5 rounded-full flex-1"
                        style={{
                          background: `linear-gradient(to right, ${COMP_COLORS[i]}, transparent)`,
                          opacity: 0.65,
                          maxWidth: `${[88, 72, 95, 80, 68][i]}%`,
                        }}
                      />
                      <span className="text-[7.5px] font-bold flex-shrink-0 leading-none" style={{ color: COMP_COLORS[i] }}>
                        {label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* LAYER 7 — Scene 5: Evolution glow wash                           */}
          <AnimatePresence>
            {scene.success && (
              <motion.div
                key="evo-glow"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.16) 0%, rgba(99,102,241,0.06) 55%, transparent 80%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.65, 1] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.50, times: [0, 0.25, 0.60, 1] }}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* LAYER 8 — Scene 5: Success badge + next-step forward line        */}
          <AnimatePresence>
            {scene.success && (
              <motion.div
                key="success-badge"
                className="absolute pointer-events-none flex flex-col items-center gap-1.5"
                style={{ top: '30%', left: '50%', translateX: '-50%' }}
                initial={{ opacity: 0, scale: 0.76, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.86, y: -8 }}
                transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                aria-hidden="true"
              >
                {/* Main badge */}
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap"
                  style={{
                    background: 'rgba(5,18,10,0.94)',
                    border: '1px solid rgba(52,211,153,0.42)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 0 24px 6px rgba(52,211,153,0.18), 0 8px 32px rgba(0,0,0,0.60)',
                  }}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0"
                    animate={{
                      boxShadow: [
                        '0 0 0px rgba(52,211,153,0)',
                        '0 0 10px 3px rgba(52,211,153,0.45)',
                        '0 0 4px 1px rgba(52,211,153,0.25)',
                      ],
                    }}
                    transition={{ duration: 1.1, repeat: Infinity, repeatType: 'reverse' }}
                  >
                    <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                  <div>
                    <p className="text-[11px] font-extrabold text-white leading-none">Evolução confirmada</p>
                    <p className="text-[9px] text-emerald-400/85 font-medium leading-none mt-0.5">+140 pts · Você dominou C3</p>
                  </div>
                </div>

                {/* Forward-momentum micro-tag — shows the system knows what's next */}
                <motion.div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl whitespace-nowrap"
                  style={{
                    background: 'rgba(20,10,40,0.88)',
                    border: '1px solid rgba(139,92,246,0.25)',
                    backdropFilter: 'blur(8px)',
                  }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.30, duration: 0.22 }}
                >
                  <svg className="w-2.5 h-2.5 text-purple-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="13 17 18 12 13 7" />
                    <polyline points="6 17 11 12 6 7" />
                  </svg>
                  <p className="text-[8px] text-purple-300/80 font-medium">Próximo tema: Direitos Humanos</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* LAYER 9 — Text overlay bar (persists across all scenes)          */}
          {/* Sits inside the bottom-fade area; AnimatePresence mode="wait"    */}
          {/* ensures the old text exits before new text enters.               */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(7,12,20,0.97) 0%, rgba(7,12,20,0.72) 52%, transparent 100%)',
              paddingTop: '40px',
              paddingBottom: '14px',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={scene.id}
                className="px-5 pb-1"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {/* Scene progress pills */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  {SCENES.map(s => (
                    <motion.div
                      key={s.id}
                      className="rounded-full"
                      animate={{
                        width:           s.id === scene.id ? '14px' : '4px',
                        backgroundColor: s.id === scene.id
                          ? 'rgba(139,92,246,1)'
                          : 'rgba(255,255,255,0.14)',
                      }}
                      style={{ height: '3.5px' }}
                      transition={EASE_F}
                    />
                  ))}
                </div>

                {/* Headline */}
                <p className="text-[13px] sm:text-[13.5px] font-bold text-white leading-tight mb-0.5">
                  {scene.text}
                </p>

                {/* Supporting line */}
                <p className="text-[10px] sm:text-[10.5px] text-gray-500 leading-snug">
                  {scene.sub}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>{/* /screenshot container */}
      </div>{/* /frame wrapper */}

      {/* ── Floating badge: top-right ─────────────────────────────────────── */}
      <motion.div
        className="absolute -top-3 -right-3 sm:-top-4 sm:-right-5 hidden sm:block"
        animate={{ opacity: scene.score || scene.success ? 1 : 0.42 }}
        transition={EASE}
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

      {/* ── Floating badge: bottom-left ──────────────────────────────────── */}
      <motion.div
        className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-5 hidden sm:block"
        animate={{ opacity: scene.score || scene.success ? 1 : 0.38 }}
        transition={EASE}
      >
        <div className="bg-[#0d1420]/95 backdrop-blur-md border border-white/[0.10] rounded-[14px] px-3.5 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.50)]">
          <p className="text-[10px] text-gray-500 font-medium mb-1">Evolução média</p>
          <div className="flex items-end gap-1 leading-none">
            <motion.span
              className="text-[1.35rem] font-extrabold tabular-nums leading-none"
              animate={{
                color: scene.success ? '#34d399' : scene.score ? '#a78bfa' : '#ffffff',
              }}
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
