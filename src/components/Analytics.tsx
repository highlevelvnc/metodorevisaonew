'use client'

import { useEffect } from 'react'

// ============================================================
// TRACKING / ANALYTICS
// Para ativar GA4: substitua 'G-XXXXXXXXXX' pelo seu ID real
// Para ativar Meta Pixel: substitua 'XXXXXXXXXXXXXXXXX' pelo seu ID real
// ============================================================

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
    _trackEvent?: (event: string, data?: Record<string, unknown>) => void
  }
}

export function trackEvent(event: string, data?: Record<string, unknown>) {
  // Log no console apenas em desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Método Revisão Tracking] Event: ${event}`, data || '')
  }

  // GA4 — descomente e insira seu ID quando tiver
  // if (typeof window.gtag === 'function') {
  //   window.gtag('event', event, data)
  // }

  // Meta Pixel — descomente e insira seu ID quando tiver
  // if (typeof window.fbq === 'function') {
  //   window.fbq('track', event, data)
  // }
}

export default function Analytics() {
  useEffect(() => {
    // Expor trackEvent globalmente para uso em componentes client
    window._trackEvent = trackEvent

    // ============================================================
    // GA4 — Adicione o script abaixo quando tiver seu ID
    // ============================================================
    // const GA4_ID = 'G-XXXXXXXXXX'
    // const script1 = document.createElement('script')
    // script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`
    // script1.async = true
    // document.head.appendChild(script1)
    // window.gtag = function(...args) { (window as any).dataLayer = (window as any).dataLayer || []; (window as any).dataLayer.push(args) }
    // window.gtag('js', new Date())
    // window.gtag('config', GA4_ID)

    // ============================================================
    // Meta Pixel — Adicione o script abaixo quando tiver seu ID
    // ============================================================
    // const META_PIXEL_ID = 'XXXXXXXXXXXXXXXXX'
    // !function(f,b,e,v,n,t,s){...}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js')
    // window.fbq('init', META_PIXEL_ID)
    // window.fbq('track', 'PageView')
  }, [])

  return null
}
