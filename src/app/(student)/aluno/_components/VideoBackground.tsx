'use client'

/**
 * VideoBackground — client-only component so `muted` is set correctly and
 * there are zero SSR/hydration mismatches. The server renders nothing for
 * this element; the client mounts the video after hydration. Because the
 * element is position:absolute inside an overflow-hidden container, there
 * is no layout shift on mount.
 */
export function VideoBackground({ src }: { src: string }) {
  return (
    <>
      {/* Subtle video layer — very low opacity + slight desaturation */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover rounded-2xl pointer-events-none"
        style={{
          opacity: 0.2,
          filter: 'grayscale(30%) blur(0.4px)',
          mixBlendMode: 'luminosity',
        }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Dark gradient overlay — ensures AA text contrast over the video */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(11,17,33,0.88) 0%, rgba(11,17,33,0.80) 45%, rgba(11,17,33,0.68) 100%)',
        }}
      />
    </>
  )
}
