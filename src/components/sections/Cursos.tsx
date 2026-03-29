'use client'
import { trackEvent } from '@/components/Analytics'
import { WHATSAPP_URL } from '@/lib/contact'

const WA_LINK =
  `${WHATSAPP_URL}?text=Ol%C3%A1%2C%20Beatriz!%20Vim%20pelo%20site%20M%C3%A9todo%20Revis%C3%A3o%20e%20quero%20saber%20mais%20sobre%20as%20aulas.`

const cursos = [
  {
    emoji: '📘',
    title: 'Português',
    desc: 'Gramática, interpretação de texto e produção textual. Aulas individuais de reforço escolar do 6º ano ao Ensino Médio.',
    tags: ['Gramática', 'Interpretação', 'Reforço'],
    badge: 'Mais procurado',
  },
  {
    emoji: '🌍',
    title: 'Inglês',
    desc: 'Conversação, gramática e vocabulário. Do básico ao intermediário, com aulas práticas e material adaptado ao nível do aluno.',
    tags: ['Conversação', 'Gramática', 'Vocabulário'],
    badge: null,
  },
  {
    emoji: '✏️',
    title: 'Redação',
    desc: 'Correção ENEM com devolutiva C1–C5, além de aulas ao vivo de redação escolar e vestibular. Do rascunho à nota máxima.',
    tags: ['ENEM', 'Vestibular', 'Nota 1000'],
    badge: 'Alta demanda',
  },
  {
    emoji: '📖',
    title: 'Literatura',
    desc: 'Análise de obras obrigatórias, movimentos literários e interpretação. Preparação para ENEM, vestibular e provas escolares.',
    tags: ['Obras', 'Análise', 'Vestibular'],
    badge: null,
  },
]

export default function Cursos() {
  return (
    <section id="cursos" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            Aulas e Reforço Escolar
          </div>
          <h2 className="section-title mb-4">Português, Inglês, Redação e Literatura</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Aulas individuais de reforço escolar online via Google Meet. Plano personalizado para cada aluno, do 6º ano ao vestibular.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cursos.map((curso) => (
            <button
              key={curso.title}
              className="card text-left hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 relative group cursor-pointer"
              onClick={() => trackEvent('view_course', { course: curso.title })}
              aria-label={`Ver detalhes do curso ${curso.title}`}
            >
              {curso.badge && (
                <span className="absolute top-4 right-4 bg-purple-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {curso.badge}
                </span>
              )}
              <div className="text-4xl mb-4">{curso.emoji}</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{curso.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{curso.desc}</p>
              <div className="flex flex-wrap gap-2">
                {curso.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-lg font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6">
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-700 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all group-hover:text-purple-900"
                  onClick={(e) => {
                    e.stopPropagation()
                    trackEvent('contact_whatsapp', { source: 'curso', course: curso.title })
                  }}
                >
                  Saber mais
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
