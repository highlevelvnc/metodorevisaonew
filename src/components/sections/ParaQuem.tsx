const paraVoce = [
  'Está se preparando para o ENEM e quer subir sua nota de redação',
  'Já escreveu várias redações mas não vê evolução clara',
  'Quer feedback real, não nota genérica',
  'Está cansado de estudar sozinho sem saber se está no caminho certo',
  'Quer acompanhamento que entenda onde você está e te leve adiante',
  'Valoriza correção humana e estratégica, não robô',
]

const naoParaVoce = [
  'Quer só uma nota rápida sem se importar com o feedback',
  'Procura aulas de gramática ou cursinho online',
  'Não pretende escrever pelo menos uma redação por semana',
  'Espera resultado sem praticar',
  'Quer correção por IA barata',
]

export default function ParaQuem() {
  return (
    <section className="section-padding">
      <div className="section-container">
        <div className="text-center mb-16">
          <div className="section-label justify-center">Para quem é</div>
          <h2 className="section-title mb-4">
            A Método Revisão é para quem quer<br className="hidden sm:block" /> evoluir de verdade.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Para você */}
          <div className="card-dark p-7 border-green-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-green-400">É para você se</h3>
            </div>
            <ul className="space-y-3.5">
              {paraVoce.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-green-500/60 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-400 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Não é para você */}
          <div className="card-dark p-7 border-gray-700/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gray-700/30 border border-gray-700/40 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-400">Não é para você se</h3>
            </div>
            <ul className="space-y-3.5">
              {naoParaVoce.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm text-gray-500 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-10 max-w-md mx-auto">
          Nosso método funciona. Mas ele precisa de um aluno que queira fazer o trabalho.
        </p>
      </div>
    </section>
  )
}
