const items = [
  {
    icon: '🎓',
    title: 'Formação Acadêmica',
    desc: 'Graduada pela Universidade Estácio',
  },
  {
    icon: '💼',
    title: 'Experiência',
    desc: 'Desde 2022 • Monitorias • Byju\'s Future School',
  },
  {
    icon: '📚',
    title: 'Especialização',
    desc: 'Português e Inglês para 6º ano ao Ensino Médio',
  },
  {
    icon: '✨',
    title: 'Método Revisão',
    desc: 'Criado em 2022 • Mais de 500 alunos atendidos',
  },
  {
    icon: '🏆',
    title: 'Experiência Docente',
    desc: '4 anos de experiência em ensino personalizado',
  },
]

export default function Sobre() {
  return (
    <section id="sobre" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: bio card */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl p-8 text-white">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl mb-6">
                👩‍🏫
              </div>
              <h2 className="text-3xl font-extrabold mb-1">Beatriz Dias</h2>
              <p className="text-purple-200 text-sm font-medium mb-6">Criadora do Método Revisão</p>
              <p className="text-purple-100 leading-relaxed text-base">
                Beatriz Dias é a criadora do Método Revisão. Graduada pela Universidade Estácio, desenvolveu em 2022 uma metodologia única de ensino personalizado de Português e Inglês.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-extrabold">4+</div>
                  <div className="text-xs text-purple-200 mt-1">Anos de exp.</div>
                </div>
                <div className="text-center bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-extrabold">500+</div>
                  <div className="text-xs text-purple-200 mt-1">Alunos</div>
                </div>
                <div className="text-center bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-extrabold">4.9</div>
                  <div className="text-xs text-purple-200 mt-1">Avaliação</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: details */}
          <div>
            <div className="inline-block bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
              Sobre
            </div>
            <h2 className="section-title mb-4">
              Conheça o método que já transformou mais de 500 histórias
            </h2>
            <p className="section-subtitle mb-10">
              Um ensino que respeita o ritmo de cada aluno, com acompanhamento constante e estratégias que realmente funcionam.
            </p>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm mb-0.5">{item.title}</div>
                    <div className="text-gray-500 text-sm">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
