'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function LoadingScreen() {
  const [hidden, setHidden] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => setHidden(true), 1100)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null

  return (
    <div className={`loading-screen${hidden ? ' hidden' : ''}`} aria-hidden="true">
      {/* Logo com fade-in + escala + glow roxo sutil */}
      <div
        style={{
          animation: 'logoEntrance 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          filter: 'drop-shadow(0 0 22px rgba(124, 58, 237, 0.45))',
        }}
      >
        <Image
          src="/logo.png"
          alt="Método Revisão"
          width={160}
          height={107}
          priority
          style={{ width: '160px', height: 'auto' }}
        />
      </div>
      <div className="spinner" style={{ marginTop: '8px' }} />
    </div>
  )
}
