const depoimentos = [
  {
    name: 'Aline R.',
    role: 'Ensino Médio',
    text: 'Depois de 6 correções, finalmente entendi o que estava travando minha nota na C3. Fui de 620 para 780 em dois meses.',
    metric: { before: 620, after: 780, label: 'na redação' },
    rating: 5,
  },
  {
    name: 'Lucas M.',
    role: 'Vestibulando',
    text: 'Já tinha feito cursinho e assistido aula de tudo que é tipo. Nada funcionava porque ninguém olhava para a minha redação de verdade. A devolutiva da Método Revisão é outra coisa.',
    metric: { before: 520, after: 820, label: 'na redação' },
    rating: 5,
  },
  {
    name: 'Fernanda S.',
    role: 'Mãe de aluno',
    text: 'Meu filho odiava escrever. Em 30 dias de acompanhamento, ele já estava pedindo tema novo. A diferença foi ele finalmente entender onde errava.',
    metric: null,
    highlight: '30 dias de mudança',
    rating: 5,
  },
  {
    name: 'Rafael T.',
    role: 'Treineiro ENEM',
    text: 'Comecei com medo de redação. Hoje é a parte da prova que eu mais confio. O plano Estratégia me deu a estrutura que eu precisava.',
    metric: null,
    highlight: 'Plano Estratégia',
    rating: 5,
  },
]

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(n)].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

export default function Depoimentos() {
  return (
    <section id="depoimentos" className="section-padding">
      <div className="section-container">
        <div className="text-center mb-14">
          <div className="section-label justify-center">Resultados</div>
          <h2 className="section-title mb-5">Quem usa, evolui.</h2>
          {/* Rating summary */}
          <div className="inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-xl px-5 py-3">
            <span className="text-3xl font-extrabold text-white">4.9</span>
            <div>
              <Stars n={5} />
              <p className="text-xs text-gray-500 mt-1">Avaliação média dos alunos</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {depoimentos.map((d) => (
            <div key={d.name} className="card-dark p-6 sm:p-7 flex flex-col">
              <Stars n={d.rating} />

              {/* Metric badge */}
              {d.metric && (
                <div className="flex items-center gap-3 my-4 bg-green-500/[0.07] border border-green-500/20 rounded-xl px-4 py-3">
                  <div className="text-gray-500 text-xs line-through tabular-nums">{d.metric.before}</div>
                  <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <div className="text-green-400 font-extrabold text-lg tabular-nums">{d.metric.after}</div>
                  <div className="text-xs text-gray-500">{d.metric.label}</div>
                  <div className="ml-auto text-xs font-bold text-green-400">
                    +{d.metric.after - d.metric.before} pts
                  </div>
                </div>
              )}
              {!d.metric && d.highlight && (
                <div className="my-4 badge-purple self-start">{d.highlight}</div>
              )}

              <p className="text-gray-300 text-sm leading-relaxed flex-1 mb-5">
                &ldquo;{d.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                <div className="w-9 h-9 rounded-full bg-purple-600/20 border border-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-sm flex-shrink-0">
                  {d.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{d.name}</div>
                  <div className="text-xs text-gray-600">{d.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
