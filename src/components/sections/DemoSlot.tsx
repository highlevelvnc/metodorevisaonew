'use client'

/**
 * DemoSlot — Product demo/walkthrough section (G4).
 *
 * Renders a conversion-ready video slot on the landing page.
 * Currently shows a placeholder — drop in a Loom embed or hosted
 * MP4 by updating VIDEO_SRC or the iframe embed below.
 *
 * Set VIDEO_SRC to a valid URL to activate the video player.
 * Set EMBED_HTML to an iframe string (e.g. Loom) for embed mode.
 */

import Link from 'next/link'

// ── Config: update these to activate the real demo ─────────────────────────
/** Direct MP4/WebM URL. Set to null to show placeholder. */
const VIDEO_SRC: string | null = null
/** Loom/YouTube embed iframe. Takes precedence over VIDEO_SRC if set. */
const EMBED_URL: string | null = null

export default function DemoSlot() {
  return (
    <section className="section-padding border-t border-white/[0.04]">
      <div className="section-container">
        <div className="text-center mb-10">
          <div className="section-label justify-center">Veja na prática</div>
          <h2 className="section-title mb-3">
            Como funciona uma devolutiva{' '}
            <span className="gradient-text">de verdade</span>
          </h2>
          <p className="section-subtitle mx-auto max-w-xl">
            Acompanhe o processo completo: do envio da redação até o diagnóstico
            por competência com orientação para a próxima.
          </p>
        </div>

        {/* Video container */}
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl border border-white/[0.08] overflow-hidden bg-[#0b1121]">
            {EMBED_URL ? (
              /* ── Embed mode (Loom, YouTube, etc.) ── */
              <div className="aspect-video">
                <iframe
                  src={EMBED_URL}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title="Demo do Método Revisão"
                />
              </div>
            ) : VIDEO_SRC ? (
              /* ── Direct video mode ── */
              <div className="aspect-video">
                <video
                  controls
                  preload="metadata"
                  className="w-full h-full object-cover"
                  poster="/demo-poster.jpg"
                >
                  <source src={VIDEO_SRC} type="video/mp4" />
                  Seu navegador não suporta vídeo.
                </video>
              </div>
            ) : (
              /* ── Placeholder mode — ready for video drop-in ── */
              <div className="aspect-video flex flex-col items-center justify-center p-8 sm:p-12">
                {/* Play icon */}
                <div className="w-20 h-20 rounded-full bg-purple-600/15 border border-purple-500/20 flex items-center justify-center mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-purple-400 ml-1">
                    <path d="M8 5.14v14.72a1 1 0 001.5.86l11.57-7.36a1 1 0 000-1.72L9.5 4.28a1 1 0 00-1.5.86z" fill="currentColor" />
                  </svg>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  Demonstração em breve
                </h3>
                <p className="text-sm text-gray-500 text-center max-w-sm leading-relaxed mb-6">
                  Estamos preparando um walkthrough completo do processo de correção.
                  Enquanto isso, crie sua conta e experimente na prática.
                </p>

                <Link
                  href="/cadastro"
                  className="btn-primary text-sm py-3 px-6 rounded-xl"
                >
                  Experimentar agora — é grátis
                </Link>
              </div>
            )}

            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          </div>

          {/* Supporting points */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { icon: '📝', text: 'Envie foto, PDF ou texto digitado' },
              { icon: '⏱️', text: 'Devolutiva completa em até 24h' },
              { icon: '📊', text: 'Diagnóstico C1–C5 com orientação' },
            ].map(item => (
              <div key={item.text} className="text-center">
                <span className="text-lg mb-1 block">{item.icon}</span>
                <p className="text-[11px] text-gray-500 leading-snug">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
