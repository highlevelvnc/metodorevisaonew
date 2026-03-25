'use client'
import Image from 'next/image'
import { trackEvent } from '@/components/Analytics'

const WA_LINK =
  'https://wa.me/5522992682207?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20M%C3%A9todo%20Revis%C3%A3o%20e%20quero%20come%C3%A7ar%20minha%20evolu%C3%A7%C3%A3o%20na%20reda%C3%A7%C3%A3o.'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden">

      {/* ── Video background (enem.mp4) ──────────── */}
      <div className="absolute inset-0 video-overlay">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.18]"
          aria-hidden="true"
        >
          <source src="/enem.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── Grid overlay ─────────────────────────── */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* ── Glow orbs ────────────────────────────── */}
      <div className="absolute pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-700/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-900/20 rounded-full blur-[80px]" />
      </div>

      {/* ── Content ──────────────────────────────── */}
      <div className="relative section-container py-20 lg:py-28">
        <div className="max-w-3xl mx-auto text-center">

          {/* Specialist authority stamp */}
          <div className="inline-flex items-center gap-3 bg-white/[0.05] border border-white/[0.09] backdrop-blur-sm rounded-full px-4 py-2 mb-8">
            <div className="relative w-7 h-7 rounded-full overflow-hidden ring-2 ring-purple-500/40 flex-shrink-0">
              <Image
                src="/bia.jpg"
                alt="Especialista Método Revisão"
                fill
                sizes="28px"
                className="object-cover object-top"
                priority
              />
            </div>
            <span className="text-sm text-gray-300 font-medium">
              Correção por especialista humana, não IA
            </span>
            <span className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              4.9
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[2.6rem] sm:text-5xl lg:text-[3.6rem] font-extrabold text-white leading-[1.08] tracking-tight mb-6">
            Você não precisa de mais aula.{' '}
            <span className="gradient-text">Precisa entender onde está errando.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-10 max-w-2xl mx-auto">
            A Método Revisão corrige sua redação com estratégia, mostra seus padrões de erro e te
            acompanha até sua nota subir de verdade.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-lg animate-glow-pulse"
              onClick={() => trackEvent('cta_click', { source: 'hero' })}
            >
              Quero começar minha evolução
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#como-funciona" className="btn-secondary-lg">
              Ver como funciona
            </a>
          </div>

          {/* Micro trust */}
          <p className="text-sm text-gray-600">
            Sem fidelidade &nbsp;·&nbsp; Cancele quando quiser &nbsp;·&nbsp; Devolutiva em até 48h
          </p>
        </div>

        {/* ── Correction preview card ───────────── */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div
            className="rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/[0.07]"
            style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)' }}
          >
            {/* Top bar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] bg-black/20">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <span className="text-xs text-gray-500 font-medium">Devolutiva Estratégica — Redação #07</span>
              <div className="ml-auto badge-green">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Entregue em 36h
              </div>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-7">
              <div className="grid sm:grid-cols-5 gap-5 sm:gap-7">

                {/* Scores */}
                <div className="sm:col-span-2 space-y-3.5">
                  <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider mb-4">Nota por competência</p>
                  {[
                    { label: 'C1 — Norma culta',    score: 160, pct: 80,  color: 'bg-emerald-500' },
                    { label: 'C2 — Compreensão',    score: 180, pct: 90,  color: 'bg-emerald-500' },
                    { label: 'C3 — Argumentação',   score: 120, pct: 60,  color: 'bg-amber-500' },
                    { label: 'C4 — Coesão',         score: 140, pct: 70,  color: 'bg-amber-500' },
                    { label: 'C5 — Intervenção',    score: 100, pct: 50,  color: 'bg-red-500' },
                  ].map((c) => (
                    <div key={c.label}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-gray-500">{c.label}</span>
                        <span className="text-white font-bold tabular-nums">{c.score}</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-sm text-gray-500 font-medium">Total</span>
                    <span className="text-2xl font-extrabold text-white tabular-nums">700</span>
                  </div>
                </div>

                {/* Feedback */}
                <div className="sm:col-span-3 space-y-3.5">
                  <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider mb-4">Diagnóstico da especialista</p>

                  <div className="rounded-xl p-4 bg-red-500/[0.08] border border-red-500/20">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide mb-2">Padrão identificado — C3 · C5</p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Seus argumentos estão vagos. Você apresenta a tese mas não desenvolve com dados concretos. Esse padrão se repetiu nas últimas 3 redações.
                    </p>
                  </div>

                  <div className="rounded-xl p-4 bg-purple-600/[0.08] border border-purple-500/20">
                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wide mb-2">Foco para a próxima</p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Use pelo menos um dado estatístico por parágrafo de desenvolvimento. Isso vai fortalecer sua C3 e elevar a C5.
                    </p>
                  </div>

                  <div className="rounded-xl p-4 bg-emerald-500/[0.07] border border-emerald-500/20">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide mb-2">Ponto forte</p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Sua C2 está excelente. Repertório diversificado e boa interpretação da proposta.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="flex justify-center mt-12">
          <a href="#prova-bar" className="flex flex-col items-center gap-2 text-gray-700 hover:text-gray-500 transition-colors">
            <span className="text-xs tracking-widest uppercase">Role para baixo</span>
            <svg className="w-4 h-4 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
