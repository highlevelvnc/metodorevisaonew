'use client'
import Image from 'next/image'
import Link from 'next/link'
import { trackEvent } from '@/components/Analytics'
import { WHATSAPP_URL } from '@/lib/contact'

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

        {/* Headline + Two product paths */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
            Pronto para{' '}
            <span className="gradient-text">evoluir de verdade?</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 mb-10 leading-relaxed">
            Correção de redação com devolutiva por competência ou aulas particulares com acompanhamento individual. Escolha o caminho que faz sentido para você.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-8">
            {/* Redação path */}
            <div className="card-dark rounded-2xl p-5 text-left">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-white">Correção de Redação</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Devolutiva C1–C5 por especialista humana. Sua nota subindo, redação a redação.
              </p>
              <Link
                href="/cadastro"
                className="btn-primary w-full text-xs justify-center"
                onClick={() => { trackEvent('landing_cta_clicked', { source: 'cta_final', target: 'cadastro' }); trackEvent('cta_click', { source: 'cta_final_redacao' }) }}
              >
                Correção grátis →
              </Link>
              <p className="text-[10px] text-gray-700 mt-2 text-center">1 correção gratuita · Sem cartão</p>
            </div>

            {/* Reforço path */}
            <div className="card-dark rounded-2xl p-5 text-left">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-white">Reforço Escolar</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Aulas individuais de Português, Inglês, Redação e Literatura via Google Meet.
              </p>
              <Link
                href="/reforco-escolar/planos"
                className="btn-secondary w-full text-xs justify-center border-blue-500/20 hover:border-blue-400/40 hover:bg-blue-500/10 text-blue-300 hover:text-blue-200"
                onClick={() => { trackEvent('reforco_cta_clicked', { source: 'cta_final' }); trackEvent('cta_click', { source: 'cta_final_reforco' }) }}
              >
                Ver planos de aula →
              </Link>
              <p className="text-[10px] text-gray-700 mt-2 text-center">A partir de R$ 65/aula · Sem fidelidade</p>
            </div>
          </div>

          {/* Micro trust */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-700">
            <span>Acompanhamento individual</span>
            <span className="text-gray-800">·</span>
            <span>Sem fidelidade</span>
            <span className="text-gray-800">·</span>
            <span>100% online</span>
          </div>
        </div>
      </div>
    </section>
  )
}
