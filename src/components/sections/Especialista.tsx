'use client'
import Image from 'next/image'
import Link from 'next/link'
import { trackEvent } from '@/components/Analytics'

const credentials = [
  {
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    label: 'Graduada pela Universidade Estácio',
  },
  {
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: '4+ anos de experiência em correção estratégica',
  },
  {
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
    label: 'Mais de 2.000 redações corrigidas',
  },
  {
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    label: 'Avaliação 4.9/5 pelos alunos',
  },
]

export default function Especialista() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Subtle top border glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-600/30 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-600/20 to-transparent" />

      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-5xl mx-auto">

          {/* Photo */}
          <div className="flex justify-center lg:justify-start order-2 lg:order-1">
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-purple-600/20 blur-3xl scale-90 rounded-full pointer-events-none" />
              {/* Frame */}
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-2 border-purple-500/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                <Image
                  src="/bia.jpg"
                  alt="Especialista da Método Revisão"
                  fill
                  sizes="(max-width: 640px) 224px, 288px"
                  className="object-cover object-top"
                />
                {/* Bottom gradient */}
                <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              {/* Rating badge */}
              <div className="absolute -bottom-4 -right-4 bg-black/90 backdrop-blur border border-white/10 rounded-2xl px-4 py-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-white font-bold text-sm">4.9</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">+2.000 correções</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <div className="section-label">A especialista</div>
            <h2 className="section-title mb-4">
              Uma especialista real.<br />
              <span className="gradient-text">Não um algoritmo.</span>
            </h2>
            <p className="section-subtitle mb-8 max-w-md">
              Cada redação é lida, analisada e comentada por quem entende profundamente as competências do ENEM — e sabe exatamente o que faz uma redação subir de nota.
            </p>

            <ul className="space-y-4 mb-8">
              {credentials.map((c) => (
                <li key={c.label} className="flex items-center gap-3">
                  <div className="icon-box-purple w-9 h-9 rounded-lg">
                    {c.icon}
                  </div>
                  <span className="text-sm text-gray-300">{c.label}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/#planos"
              className="btn-primary"
              onClick={() => trackEvent('cta_click', { source: 'especialista' })}
            >
              Quero a correção desta especialista
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
