const dores = [
  {
    title: 'Você escreve no escuro',
    desc: 'Escreve a redação, entrega… e nunca entende de verdade o que errou. O máximo que recebe é uma nota solta, sem explicação. Sem saber o que corrigir, você repete os mesmos erros na próxima.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ),
    tag: 'Sem direção',
  },
  {
    title: 'Cursinho corrige em massa',
    desc: 'No cursinho, um corretor analisa dezenas de redações por dia. A sua é mais uma. O feedback é raso, genérico e não acompanha sua evolução individual. Você é tratado como número, não como aluno.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    tag: 'Feedback genérico',
  },
  {
    title: 'IA não entende contexto',
    desc: 'Ferramentas de IA podem apontar erros gramaticais, mas não entendem sua argumentação, sua tese ou a coerência do seu texto como um todo. Correção de redação exige leitura humana estratégica.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
      </svg>
    ),
    tag: 'IA não resolve',
  },
  {
    title: 'Você não tem um plano',
    desc: 'Escrever uma redação por semana sem saber o que priorizar é como treinar sem ficha na academia. Sem um diagnóstico claro dos seus pontos fracos, o esforço não vira resultado.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
    tag: 'Sem estratégia',
  },
]

export default function Dor() {
  return (
    <section className="section-padding">
      <div className="section-container">
        <div className="text-center mb-14">
          <div className="section-label justify-center">Por que sua nota não sobe?</div>
          <h2 className="section-title mb-4">
            Você treina, escreve, tenta de novo —<br className="hidden sm:block" /> e a nota continua travada.
          </h2>
          <p className="section-subtitle mx-auto max-w-xl">
            Isso não é falta de esforço. É falta de direção.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {dores.map((d) => (
            <div key={d.title} className="card-feature group">
              <div className="flex items-start gap-4">
                <div className="icon-box-red mt-0.5 group-hover:scale-105 transition-transform duration-200">
                  {d.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-base font-bold text-white">{d.title}</h3>
                    <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {d.tag}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{d.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Transition */}
        <div className="text-center mt-14">
          <div className="inline-flex items-center gap-3">
            <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-purple-600/40" />
            <p className="text-lg sm:text-xl font-bold text-white">
              A Método Revisão existe para resolver{' '}
              <span className="gradient-text">exatamente isso</span>.
            </p>
            <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-purple-600/40" />
          </div>
        </div>
      </div>
    </section>
  )
}
