'use client'
import { trackEvent } from '@/components/Analytics'

const WA_LINK =
  'https://wa.me/5522992682207?text=Ol%C3%A1%2C%20Beatriz!%20Vim%20pelo%20site%20M%C3%A9todo%20Revis%C3%A3o%20e%20quero%20saber%20mais%20sobre%20as%20aulas.'

const cases = [
  {
    icon: '🏆',
    title: 'Aprovado no ENEM (Redação)',
    context: 'Plano de revisão + acompanhamento semanal com correção de 5 redações.',
    result: 'Aprovado',
    highlight: 'bg-yellow-50 border-yellow-200',
    resultColor: 'text-yellow-700',
  },
  {
    icon: '🏅',
    title: 'Aprovada em Concurso CHAMEX',
    context: 'Preparação intensiva com foco em interpretação de texto e gramática.',
    result: 'Aprovada',
    highlight: 'bg-green-50 border-green-200',
    resultColor: 'text-green-700',
  },
  {
    icon: '📈',
    title: 'Evolução de 520 → 820 na Redação',
    context: 'Trabalho em coesão, argumentação e proposta de intervenção no ENEM.',
    result: '+300 pontos',
    highlight: 'bg-purple-50 border-purple-200',
    resultColor: 'text-purple-700',
  },
  {
    icon: '⚡',
    title: 'Melhora na Interpretação em 30 dias',
    context: 'Técnicas de leitura ativa aplicadas nas provas semanais do colégio.',
    result: '30 dias',
    highlight: 'bg-blue-50 border-blue-200',
    resultColor: 'text-blue-700',
  },
  {
    icon: '📚',
    title: 'Aumento de notas no 9º ano',
    context: 'Reforço escolar em Português com foco em gramática e redação escolar.',
    result: 'Notas 8+',
    highlight: 'bg-orange-50 border-orange-200',
    resultColor: 'text-orange-700',
  },
  {
    icon: '💬',
    title: 'Inglês: conversação destravada',
    context: 'Imersão comunicativa com exercícios práticos e conversação semanal.',
    result: 'Fluência básica',
    highlight: 'bg-teal-50 border-teal-200',
    resultColor: 'text-teal-700',
  },
]

export default function Cases() {
  return (
    <section id="cases" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            Resultados reais
          </div>
          <h2 className="section-title mb-4">Cases de Sucesso</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Histórias reais de alunos que transformaram seu desempenho com o Método Revisão.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {cases.map((c) => (
            <button
              key={c.title}
              className={`text-left p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${c.highlight}`}
              onClick={() => trackEvent('view_case', { case: c.title })}
              aria-label={`Case: ${c.title}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{c.icon}</div>
                <span className={`text-sm font-bold px-3 py-1 rounded-full bg-white ${c.resultColor}`}>
                  {c.result}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">{c.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{c.context}</p>
            </button>
          ))}
        </div>

        {/* CTA mini */}
        <div className="text-center bg-gray-50 rounded-3xl p-8 border border-gray-100">
          <p className="text-xl font-bold text-gray-900 mb-2">Quer ser o próximo case?</p>
          <p className="text-gray-500 mb-6">Vamos montar seu plano personalizado.</p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            onClick={() => trackEvent('contact_whatsapp', { source: 'cases_cta' })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.424h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chamar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
