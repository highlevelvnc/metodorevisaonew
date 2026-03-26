/**
 * Professor remuneration — single source of truth.
 *
 * Any page that computes or displays professor earnings must import from here.
 * Never hard-code rates inline; update this file when rates change.
 */

// ── Rates ────────────────────────────────────────────────────────────────────

/** R$ earned per corrected essay. */
export const RATE_ESSAY  = 4.50

/** R$ earned per completed 30-minute lesson session. */
export const RATE_LESSON = 16.50

// ── Formatting ───────────────────────────────────────────────────────────────

/** Format a number as Brazilian Real currency (e.g. R$ 4,50). */
export function formatBRL(val: number): string {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Lifecycle status of a monthly payout cycle.
 *
 * - open       current month, still accumulating
 * - closed     month ended, total confirmed, payment not yet processed
 * - paid       payment transferred to professor
 * - no_record  past month with no payout record yet (system in construction)
 */
export type ClosingStatus = 'open' | 'closed' | 'paid' | 'no_record'

/** A calendar-month window with ISO timestamps for DB range queries. */
export interface MonthWindow {
  year: number
  month: number      // 0-indexed (Jan = 0)
  label: string      // Capitalised pt-BR label, e.g. "Março 2026"
  first: string      // ISO: 00:00:00 on 1st of month
  last: string       // ISO: 23:59:59 on last day of month
  isCurrent: boolean // true only for the most recent window (i === 0)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build `count` month windows ending at `from` (defaults to today).
 * Index 0 = current month, index 1 = previous month, etc.
 */
export function buildMonthWindows(count: number, from: Date = new Date()): MonthWindow[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth() - i, 1)
    const raw = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    return {
      year:      d.getFullYear(),
      month:     d.getMonth(),
      label:     raw.charAt(0).toUpperCase() + raw.slice(1),
      first:     d.toISOString(),
      last:      new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString(),
      isCurrent: i === 0,
    }
  })
}
