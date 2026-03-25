'use client'
import { trackEvent } from '@/components/Analytics'

const WA_BASE = 'https://wa.me/5522992682207?text='

const planos = [
  {
    name: 'Evolução',
    tagline: 'Para quem está começando a levar a redação a sério',
    price: 97,
    pricePerDay: '3,23',
    corrections: 4,
    perCorrection: '24,25',
    popular: false,
    savings: null,
    features: [
      '4 redações corrigidas por mês',
      'Devolutiva estratégica completa',
      'Nota detalhada por competência (C1–C5)',
      'Anotações no texto parágrafo a parágrafo',
      'Diagnóstico de padrões de erro',
      'Orientação para a próxima redação',
      'Devolutiva em até 48h',
    ],
    cta: 'Começar com o Evolução',
    sub: 'Uma redação por semana, com feedback real.',
    waText: encodeURIComponent('Olá! Quero assinar o plano Evolução da Método Revisão.'),
  },
  {
    name: 'Estratégia',
    tagline: 'Para quem quer resultado consistente e visível',
    price: 167,
    pricePerDay: '5,57',
    corrections: 8,
    perCorrection: '20,88',
    popular: true,
    savings: 'Mais eficiente por correção',
    features: [
      '8 redações corrigidas por mês',
      'Tudo do plano Evolução',
      '1 sessão ao vivo mensal (30min)',
      'Revisão de evolução mensal comparativa',
      'Propostas de tema direcionadas',
      'Prioridade na devolutiva',
    ],
    cta: 'Quero o plano Estratégia',
    sub: 'O plano que mais gera resultado.',
    waText: encodeURIComponent('Olá! Quero assinar o plano Estratégia da Método Revisão.'),
  },
  {
    name: 'Intensivo',
    tagline: 'Para quem está a poucos meses do ENEM',
    price: 227,
    pricePerDay: '7,57',
    corrections: 12,
    perCorrection: '18,92',
    popular: false,
    savings: null,
    features: [
      '12 redações corrigidas por mês',
      'Tudo do plano Estratégia',
      '2 sessões ao vivo mensais',
      'Plano de estudo por competência',
      'Simulados com temas inéditos',
      'Análise quinzenal de evolução',
      'Canal direto para dúvidas rápidas',
    ],
    cta: 'Quero o Intensivo',
    sub: 'Aceleração máxima antes da prova.',
    waText: encodeURIComponent('Olá! Quero assinar o plano Intensivo da Método Revisão.'),
  },
]

const CheckIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${active ? 'text-purple-400' : 'text-gray-700'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 13l4 4L19 7" />
  </svg>
)

export default function Planos() {
  return (
    <section id="planos" className="section-padding relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-700/6 rounded-full blur-3xl pointer-events-none" />

      <div className="section-container relative">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="section-label justify-center">Planos</div>
          <h2 className="section-title mb-4">Escolha seu ritmo de evolução.</h2>
          <p className="section-subtitle mx-auto max-w-xl">
            Todos os planos incluem correção por especialista, devolutiva detalhada por competência e acompanhamento da sua evolução.
          </p>
        </div>

        {/* Anchoring line */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Uma aula particular de redação custa entre R$80–150 por hora. Aqui você tem acompanhamento o mês todo.
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid lg:grid-cols-3 gap-5 max-w-5xl mx-auto items-start">
          {planos.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-2xl border transition-all duration-300 ${
                p.popular
                  ? 'border-purple-500/40 shadow-glow-purple bg-gradient-to-b from-purple-600/[0.09] to-purple-700/[0.04] lg:scale-[1.04] lg:-translate-y-1 z-10'
                  : 'border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent hover:border-white/[0.12]'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                  <span className="bg-purple-600 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-btn-primary">
                    Mais escolhido
                  </span>
                </div>
              )}

              <div className="p-6 sm:p-7 flex flex-col flex-1">
                {/* Name & tagline */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-extrabold text-white">{p.name}</h3>
                    {p.savings && (
                      <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                        {p.savings}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">{p.tagline}</p>
                </div>

                {/* Price block */}
                <div className="mb-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-gray-500">R$</span>
                    <span className="text-4xl font-extrabold text-white tabular-nums">{p.price}</span>
                    <span className="text-sm text-gray-500">/mês</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-600">{p.corrections} correções</span>
                    <span className="text-gray-800">·</span>
                    <span className="text-xs text-gray-600">R$ {p.perCorrection} /redação</span>
                    <span className="text-gray-800">·</span>
                    <span className="text-xs text-gray-600 font-medium">R$ {p.pricePerDay}/dia</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="divider my-5" />

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-7">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckIcon active={p.popular} />
                      <span className={`text-sm leading-snug ${p.popular ? 'text-gray-300' : 'text-gray-500'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={`${WA_BASE}${p.waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full text-center rounded-xl font-semibold py-3.5 text-sm transition-all duration-200 ${
                    p.popular
                      ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-btn-primary hover:shadow-btn-primary-lg'
                      : 'bg-white/[0.05] border border-white/[0.09] text-gray-400 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.15]'
                  }`}
                  onClick={() => trackEvent('plan_click', { plan: p.name })}
                >
                  {p.cta}
                </a>
                <p className="text-xs text-gray-700 mt-3 text-center">{p.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee strip */}
        <div className="max-w-5xl mx-auto mt-6">
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-6 py-4">
            {[
              { icon: '🔒', text: 'Pagamento seguro' },
              { icon: '📄', text: 'Sem contrato ou fidelidade' },
              { icon: '↩', text: 'Cancele quando quiser' },
              { icon: '⚡', text: 'Devolutiva em até 48h' },
              { icon: '💬', text: 'Suporte humano' },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-1.5">
                <span className="text-sm">{b.icon}</span>
                <span className="text-xs text-gray-600">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
