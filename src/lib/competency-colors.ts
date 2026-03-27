/**
 * Canonical competency identity colors.
 * C1 = blue  · C2 = emerald  · C3 = amber  · C4 = purple  · C5 = pink
 *
 * Use these EVERYWHERE a competency label, pill, badge, or marker appears
 * so the professor and student can instantly recognize each competency by color.
 */

export type CompKey = 'c1' | 'c2' | 'c3' | 'c4' | 'c5'

export interface CompColorSet {
  /** e.g. "text-blue-400" */
  text: string
  /** e.g. "bg-blue-500/10" */
  bg: string
  /** e.g. "border-blue-500/20" */
  border: string
  /** solid bar fill e.g. "bg-blue-500" */
  bar: string
  /** pre-composed pill classes for <span className={pill}> */
  pill: string
  /** ring for focus/active states */
  ring: string
}

export const COMP_COLORS: Record<CompKey, CompColorSet> = {
  c1: {
    text:   'text-blue-400',
    bg:     'bg-blue-500/10',
    border: 'border-blue-500/20',
    bar:    'bg-blue-500',
    pill:   'bg-blue-500/10 border-blue-500/20 text-blue-400',
    ring:   'ring-blue-500/30',
  },
  c2: {
    text:   'text-emerald-400',
    bg:     'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    bar:    'bg-emerald-500',
    pill:   'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    ring:   'ring-emerald-500/30',
  },
  c3: {
    text:   'text-amber-400',
    bg:     'bg-amber-500/10',
    border: 'border-amber-500/20',
    bar:    'bg-amber-500',
    pill:   'bg-amber-500/10 border-amber-500/20 text-amber-400',
    ring:   'ring-amber-500/30',
  },
  c4: {
    text:   'text-purple-400',
    bg:     'bg-purple-500/10',
    border: 'border-purple-500/20',
    bar:    'bg-purple-500',
    pill:   'bg-purple-500/10 border-purple-500/20 text-purple-400',
    ring:   'ring-purple-500/30',
  },
  c5: {
    text:   'text-pink-400',
    bg:     'bg-pink-500/10',
    border: 'border-pink-500/20',
    bar:    'bg-pink-500',
    pill:   'bg-pink-500/10 border-pink-500/20 text-pink-400',
    ring:   'ring-pink-500/30',
  },
}

/** Returns Tailwind classes for a score-based quality color (red→amber→green) */
export function scoreQualityColor(score: number): string {
  if (score >= 160) return 'text-green-400'
  if (score >= 120) return 'text-purple-400'
  if (score > 0)    return 'text-amber-400'
  return 'text-red-400'
}
