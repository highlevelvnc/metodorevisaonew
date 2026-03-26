'use client'
import Link from 'next/link'
import { trackEvent } from '@/components/Analytics'

const semMetodo = [
  'Escreve a redação e não sabe se está boa',
  'Recebe só uma nota, sem explicação',
  'Repete os mesmos erros sem perceber',
  'Não sabe qual competência priorizar',
  'Sente que estuda muito e evolui pouco',
  'Chega no ENEM sem confiança no texto',
]

const comMetodo = [
  'Cada redação volta com um mapa do que melhorar',
  'Entende exatamente onde perdeu ponto e por quê',
  'Identifica seus padrões de erro e quebra eles',
  'Sabe qual competência atacar a cada semana',
  'Vê a nota subindo de forma concreta',
  'Chega no ENEM sabendo que está preparado',
]

export default function Transformacao() {
  return (
    <section className="section-padding bg-slate-900/30">
      <div className="section-container">
        <div className="text-center mb-16">
          <div className="section-label justify-center">Transformação</div>
          <h2 className="section-title mb-4">
            A diferença entre treinar sozinho<br className="hidden sm:block" /> e treinar com direção.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Sem */}
          <div className="card-dark p-7 border-red-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-red-400">Sem a Método Revisão</h3>
            </div>
            <ul className="space-y-3.5">
              {semMetodo.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  </div>
                  <span className="text-sm text-gray-400 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Com */}
          <div className="card-dark p-7 border-green-500/20 bg-green-500/[0.03]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-green-400">Com a Método Revisão</h3>
            </div>
            <ul className="space-y-3.5">
              {comMetodo.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Highlight box */}
        <div className="mt-10 max-w-3xl mx-auto">
          <div className="card-dark border-purple-500/20 bg-purple-500/[0.03] p-7">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  <strong className="text-white">Lucas M.</strong> começou com 520 na redação. Em 12 semanas de acompanhamento, chegou a 820. Entendeu que seus erros estavam concentrados na Competência 3 e na proposta de intervenção. Com direção clara, evoluiu <strong className="text-purple-400">+300 pontos</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA at peak emotional moment */}
        <div className="mt-10 text-center">
          <p className="text-gray-400 text-sm mb-5">Sua evolução começa na próxima redação.</p>
          <Link
            href="/cadastro?next=/aluno/upgrade"
            className="btn-primary-lg"
            onClick={() => trackEvent('checkout_started', { plan: 'transformacao' })}
          >
            Começar minha evolução
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="text-xs text-gray-700 mt-3">Sem fidelidade · Cancele quando quiser</p>
        </div>
      </div>
    </section>
  )
}
