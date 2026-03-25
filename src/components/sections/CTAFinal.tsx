'use client'
import Image from 'next/image'
import { trackEvent } from '@/components/Analytics'

const WA_LINK    = 'https://wa.me/5522992682207?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20M%C3%A9todo%20Revis%C3%A3o%20e%20quero%20come%C3%A7ar%20minha%20evolu%C3%A7%C3%A3o%20na%20reda%C3%A7%C3%A3o.'
const WA_DUVIDAS = 'https://wa.me/5522992682207?text=Ol%C3%A1!%20Tenho%20d%C3%BAvidas%20sobre%20a%20M%C3%A9todo%20Revis%C3%A3o.%20Pode%20me%20ajudar%3F'

export default function CTAFinal() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Gradient fade from bottom */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-700/10 rounded-full blur-3xl" />
      </div>
      {/* Top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-600/30 to-transparent" />

      <div className="section-container relative">
        {/* Specialist quote card */}
        <div className="max-w-3xl mx-auto mb-16">
          <div
            className="rounded-2xl border border-purple-500/20 p-7 sm:p-8"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(124,58,237,0.02) 100%)' }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden ring-2 ring-purple-500/30 flex-shrink-0">
                <Image
                  src="/bia.jpg"
                  alt="Especialista Método Revisão"
                  fill
                  sizes="64px"
                  className="object-cover object-top"
                />
              </div>
              <div>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed italic mb-3">
                  &ldquo;Cada redação que chega até mim, eu leio do início ao fim. Anoto tudo. E entrego um diagnóstico que o aluno nunca recebeu antes. É exatamente isso que faz a nota subir.&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">Especialista</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-xs text-gray-500">Método Revisão</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Headline + CTAs */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
            O ENEM não espera.{' '}
            <span className="gradient-text">Sua evolução começa agora.</span>
          </h2>
          <p className="text-lg text-gray-400 mb-10 leading-relaxed">
            Cada semana sem acompanhamento estratégico é uma semana repetindo os mesmos erros. Sua próxima redação pode ser a primeira com direção de verdade.
          </p>

          {/* Soft urgency */}
          <div className="inline-flex items-center gap-2 text-xs text-amber-400/80 bg-amber-500/[0.07] border border-amber-500/15 rounded-full px-4 py-2 mb-6">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            Vagas limitadas este mês — novas correções abertas toda segunda-feira
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-lg"
              onClick={() => trackEvent('cta_click', { source: 'cta_final' })}
            >
              Quero começar minha evolução
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href={WA_DUVIDAS}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-lg"
              onClick={() => trackEvent('cta_click', { source: 'cta_final_duvidas' })}
            >
              Ainda tem dúvidas?
            </a>
          </div>

          {/* Micro trust */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-700">
            <span>+2.000 redações corrigidas</span>
            <span className="text-gray-800">·</span>
            <span>Evolução média de +180 pontos</span>
            <span className="text-gray-800">·</span>
            <span>4.9/5 de avaliação</span>
          </div>
        </div>
      </div>
    </section>
  )
}
