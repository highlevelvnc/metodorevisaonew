'use client'

import Image from 'next/image'
import Link from 'next/link'
import { trackEvent } from '@/components/Analytics'

// ─── Authority stamp ──────────────────────────────────────────────────────────

function AuthorityBadge() {
  return (
    <div className="inline-flex items-center gap-3 bg-white/[0.05] border border-white/[0.09] backdrop-blur-sm rounded-full px-4 py-2">
      <div className="relative w-6 h-6 rounded-full overflow-hidden ring-2 ring-purple-500/40 flex-shrink-0">
        <Image
          src="/bia.jpg"
          alt="Especialista Método Revisão"
          fill
          sizes="24px"
          className="object-cover object-top"
          priority
        />
      </div>
      <span className="text-sm text-gray-300 font-medium">
        Correção por especialista humana, não IA
      </span>
      <span className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        4.9
      </span>
    </div>
  )
}

// ─── Dashboard screenshot in premium browser frame ────────────────────────────

function DashboardFrame() {
  return (
    <div className="relative w-full max-w-[580px] mx-auto lg:max-w-full">

      {/* Ambient glow — sits behind the frame, animates softly */}
      <div
        className="absolute -inset-6 rounded-3xl blur-[50px] opacity-50 pointer-events-none animate-pulse-slow"
        style={{
          background:
            'radial-gradient(ellipse at 50% 35%, rgba(124,58,237,0.45) 0%, rgba(99,102,241,0.18) 50%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      {/* Outer subtle purple ring */}
      <div
        className="absolute -inset-px rounded-[19px] pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0.06) 40%, rgba(99,102,241,0.12) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Frame wrapper — hover lifts 4px on desktop */}
      <div className="relative rounded-[18px] overflow-hidden border border-white/[0.10] shadow-[0_32px_80px_rgba(0,0,0,0.70),0_8px_24px_rgba(0,0,0,0.40)] lg:transition-transform lg:duration-300 lg:hover:-translate-y-1">

        {/* Browser chrome */}
        <div
          className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.07]"
          style={{ background: 'linear-gradient(to bottom, #0b1021, #090e1b)' }}
          aria-hidden="true"
        >
          {/* Traffic lights */}
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="w-[10px] h-[10px] rounded-full bg-white/[0.08]" />
            <div className="w-[10px] h-[10px] rounded-full bg-white/[0.08]" />
            <div className="w-[10px] h-[10px] rounded-full bg-white/[0.08]" />
          </div>
          {/* Address bar */}
          <div className="flex-1 mx-3 h-[22px] bg-white/[0.04] rounded-md flex items-center px-2.5 border border-white/[0.05]">
            <svg className="w-2.5 h-2.5 text-gray-700 mr-1.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-[9.5px] text-gray-700 select-none font-mono tracking-tight">
              app.metodorevisao.com.br/aluno
            </span>
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-slow" />
            <span className="text-[10px] text-gray-600 font-medium">ao vivo</span>
          </div>
        </div>

        {/* Real product screenshot */}
        <Image
          src="/dashboard.png"
          alt="Painel do aluno — notas por competência, devolutiva estratégica e progresso no Método Revisão"
          width={2047}
          height={1337}
          quality={90}
          priority
          className="w-full h-auto block"
        />

        {/* Bottom fade — ties the frame into the dark page */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #070c14 0%, transparent 100%)' }}
          aria-hidden="true"
        />
      </div>

      {/* Floating badge: top-right — correction delivered */}
      <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-5 bg-[#0d1420]/95 backdrop-blur-md border border-white/[0.10] rounded-[14px] px-3.5 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.50)] hidden sm:block">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow" />
          <span className="text-[10px] text-green-400 font-semibold tracking-wide">Correção entregue</span>
        </div>
        <p className="text-[11px] text-gray-300 font-semibold">Redação #07 · 36h</p>
      </div>

      {/* Floating badge: bottom-left — score progression */}
      <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-5 bg-[#0d1420]/95 backdrop-blur-md border border-white/[0.10] rounded-[14px] px-3.5 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.50)] hidden sm:block">
        <p className="text-[10px] text-gray-500 font-medium mb-1">Evolução média</p>
        <div className="flex items-end gap-1 leading-none">
          <span className="text-[1.35rem] font-extrabold text-white tabular-nums leading-none">+67</span>
          <span className="text-[10px] text-gray-600 mb-px">pts</span>
        </div>
        <p className="text-[10px] text-emerald-400 font-medium mt-0.5">↑ últimas 4 redações</p>
      </div>

    </div>
  )
}

// ─── Hero section ─────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">

      {/* ══ Background ══════════════════════════════════════════════ */}
      <div className="absolute inset-0" aria-hidden="true">

        {/* Video substrate — barely visible, just enough texture */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.10]"
        >
          <source src="/enem.mp4" type="video/mp4" />
        </video>

        {/* Fine dot/grid overlay */}
        <div className="absolute inset-0 grid-bg opacity-20" />

        {/* Primary glow bloom — upper center, bleeds toward the right column */}
        <div
          className="absolute -top-[20%] left-[20%] w-[900px] h-[700px] rounded-full blur-[150px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.22) 0%, transparent 65%)' }}
        />

        {/* Secondary glow — right side, gives the screenshot column depth */}
        <div
          className="absolute top-[10%] -right-[5%] w-[500px] h-[600px] rounded-full blur-[110px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.16) 0%, transparent 65%)' }}
        />

        {/* Bottom vignette — smooth transition to next section */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(7,12,20,0.55) 0%, transparent 18%, transparent 72%, #070c14 100%)',
          }}
        />
      </div>

      {/* ══ Main content ════════════════════════════════════════════ */}
      <div className="relative z-10 section-container pt-28 pb-20 lg:pt-32 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-16 xl:gap-20 items-center">

          {/* ─── LEFT: Copy + CTAs ──────────────────────────────── */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left animate-slide-up">

            {/* Authority stamp */}
            <div className="mb-7">
              <AuthorityBadge />
            </div>

            {/* Eyebrow micro-label */}
            <p className="section-label mb-3">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Sistema completo de evolução
            </p>

            {/* Headline */}
            <h1 className="text-[2.4rem] sm:text-5xl lg:text-[3rem] xl:text-[3.4rem] font-extrabold text-white leading-[1.06] tracking-tight mb-5">
              Evolua sua redação com{' '}
              <span className="gradient-text">direção, estratégia</span>{' '}
              e feedback real.
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-[1.05rem] lg:text-base xl:text-[1.05rem] text-gray-400 leading-relaxed mb-3 max-w-[490px]">
              Correção humana especializada, inteligência da Biia e um sistema pensado para fazer sua nota subir com consistência.
            </p>

            {/* Supporting line */}
            <p className="text-sm text-gray-600 mb-9">
              ENEM, vestibulares e treino estratégico em um só lugar.
            </p>

            {/* CTA group */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-5">
              <Link
                href="/checkout/estrategia"
                onClick={() => trackEvent('checkout_started', { plan: 'estrategia', source: 'hero' })}
                className="btn-primary-lg animate-glow-pulse sm:whitespace-nowrap"
              >
                Começar minha evolução
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href="#como-funciona"
                className="btn-secondary-lg sm:whitespace-nowrap"
              >
                Explorar a plataforma
              </a>
            </div>

            {/* Tertiary CTA */}
            <div className="flex items-center gap-2 mb-5">
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-purple-400 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
                </svg>
                Ver como funciona
              </a>
            </div>

            {/* Micro-trust */}
            <p className="text-xs text-gray-700">
              Sem fidelidade &nbsp;·&nbsp; Cancele quando quiser &nbsp;·&nbsp; Devolutiva em até 48h
            </p>

            {/* Returning user link */}
            <p className="text-sm text-gray-700 mt-3">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Entrar →
              </Link>
            </p>
          </div>

          {/* ─── RIGHT: Dashboard screenshot ────────────────────── */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <DashboardFrame />
          </div>

        </div>
      </div>

      {/* Scroll hint */}
      <a
        href="#prova-bar"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-1.5 text-gray-700 hover:text-gray-500 transition-colors"
        aria-label="Role para baixo"
      >
        <span className="text-[10px] tracking-[0.15em] uppercase">Role para baixo</span>
        <svg className="w-4 h-4 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </a>

    </section>
  )
}
