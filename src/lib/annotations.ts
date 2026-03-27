/**
 * Annotation data types shared by the server action (corrections.ts)
 * and the client-side AnnotationLayer component.
 *
 * Stored in the corrections.annotations JSONB column so they survive
 * page reloads and can later be rendered on the student feedback page.
 */

import type { CompKey } from './competency-colors'

export type AnnotationType = 'pin' | 'highlight' | 'note'

/**
 * A single annotation on the essay preview.
 *
 * Position is stored as fractions (0–1) relative to the annotation
 * layer container dimensions — NOT raw pixel values.  This means:
 *
 *   rendered_left = x_pct * container_width
 *   rendered_top  = y_pct * container_height
 *
 * Annotations therefore remain visually aligned when the professor
 * resizes the window, uses a different screen, or zooms the layout.
 */
export interface Annotation {
  /** Client-generated stable ID — format: "ann_{timestamp36}_{random}" */
  id: string
  type: AnnotationType
  competency: CompKey
  /** Annotation text — editable before saving, shown on hover */
  text: string

  /** Left edge as fraction of container width (0–1) */
  x_pct: number
  /** Top edge as fraction of container height (0–1) */
  y_pct: number
  /** Width as fraction of container width (0 for type='pin' and 'note') */
  w_pct: number
  /** Height as fraction of container height (0 for type='pin' and 'note') */
  h_pct: number

  created_at: string
}

/** Generate a stable client-side annotation ID without crypto.randomUUID */
export function newAnnotationId(): string {
  return `ann_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}
