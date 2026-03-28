'use client'

import { useEffect, useRef } from 'react'
import { markCorrectionViewed } from '@/lib/actions/activity'

/**
 * Invisible client component that marks a correction as viewed on mount.
 * Renders nothing. Fire-and-forget — errors are silently caught.
 */
export function MarkViewed({ essayId }: { essayId: string }) {
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true
    markCorrectionViewed(essayId).catch(() => {
      // Non-fatal: view tracking failure should never block the page
    })
  }, [essayId])

  return null
}
