'use client'
import { useState } from 'react'
import { trackEvent } from '@/components/Analytics'

const WA_LINK =
  'https://wa.me/5522992682207?text=Ol%C3%A1%2C%20Beatriz!%20Quero%20entrar%20na%20lista%20de%20espera%20da%20Plataforma%20M%C3%A9todo%20Revis%C3%A3o.'

const benefits = [
  { icon: '🗺️', label: 'Trilhas personalizadas por nível e série' },
  { icon: '📝', label: 'Exercícios com correção automática e comentada' },
  { icon: '📅', label: 'Cronograma inteligente de estudos' },
  { icon: '📊', label: 'Acompanhamento da evolução em tempo real' },
  { icon: '🇧🇷🇺🇸', label: 'Conteúdos de Português e Inglês' },
]

export default function Plataforma() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Conectar a um serviço de e-mail (ex: Mailchimp, ConvertKit, Resend, ou sua própria API)
    // Exemplo: POST para /api/waitlist com { name, email }
    trackEvent('waitlist_submit', { email_domain: email.split('@')[1] })
    setSubmitted(true)
  }

  return (
    <section id="plataforma" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text + form */}
          <div>
            <span className="inline-block bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
              🚀 Lançamento em breve
            </span>
            <h2 className="section-title mb-4">
              Em breve: Plataforma Método Revisão
            </h2>
            <p className="section-subtitle mb-8">
              Um app para alunos com trilhas de revisão, exercícios, cronogramas e acompanhamento — tudo no seu ritmo.
            </p>

            <ul className="space-y-3 mb-10">
              {benefits.map((b) => (
                <li key={b.label} className="flex items-center gap-3 text-gray-700">
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-sm font-medium">{b.label}</span>
                </li>
              ))}
            </ul>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Entrar na lista de espera</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    aria-label="Nome"
                  />
                  <input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    aria-label="E-mail"
                  />
                  <button type="submit" className="btn-primary w-full justify-center">
                    Quero participar da lista de espera
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Sem spam. Você será o primeiro a saber do lançamento.
                </p>
              </form>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3">🎉</div>
                <h3 className="font-bold text-green-800 text-lg mb-1">Cadastro recebido!</h3>
                <p className="text-green-700 text-sm">
                  Ótimo, {name}! Você será avisado assim que a plataforma estiver disponível.
                </p>
              </div>
            )}

            <div className="mt-4 text-center">
              <span className="text-sm text-gray-400">Ou, se preferir: </span>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-700 font-semibold hover:text-purple-900 underline"
                onClick={() => trackEvent('contact_whatsapp', { source: 'plataforma' })}
              >
                chamar no WhatsApp
              </a>
            </div>
          </div>

          {/* Right: App mockup */}
          <div className="flex justify-center">
            <div className="w-[280px] bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
              <div className="bg-white rounded-[2rem] overflow-hidden">
                {/* Status bar */}
                <div className="bg-purple-700 px-4 py-3 flex items-center justify-between">
                  <span className="text-white text-xs font-bold">Método Revisão</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
                {/* App content */}
                <div className="p-4 space-y-3 bg-gray-50">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Olá, Aluno(a) 👋</div>
                  {/* Progress indicator */}
                  <div className="bg-white rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700">Progresso semanal</span>
                      <span className="text-xs font-bold text-purple-700">73%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: '73%' }} />
                    </div>
                  </div>
                  {/* Cards */}
                  {[
                    { label: 'Trilha da Semana', icon: '🗺️', color: 'bg-purple-50 border-purple-200' },
                    { label: 'Redação ENEM', icon: '✏️', color: 'bg-orange-50 border-orange-200' },
                    { label: 'Revisão 6º ano', icon: '📘', color: 'bg-blue-50 border-blue-200' },
                    { label: 'Simulados', icon: '📝', color: 'bg-green-50 border-green-200' },
                    { label: 'Acompanhamento', icon: '📊', color: 'bg-yellow-50 border-yellow-200' },
                  ].map((card) => (
                    <div key={card.label} className={`flex items-center gap-3 p-3 rounded-xl border ${card.color}`}>
                      <span className="text-base">{card.icon}</span>
                      <span className="text-xs font-semibold text-gray-800">{card.label}</span>
                      <svg className="w-3 h-3 text-gray-400 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
