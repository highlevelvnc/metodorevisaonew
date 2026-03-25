const diferenciais = [
  {
    title: 'Correção humana e estratégica',
    desc: 'Uma especialista real lê sua redação inteira, entende sua argumentação e devolve um feedback que faz sentido para o seu nível.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    title: 'Devolutiva por competência',
    desc: 'Nota e comentário em cada uma das 5 competências do ENEM. Você sabe exatamente onde está forte e onde precisa melhorar.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: 'Diagnóstico de padrões',
    desc: 'Não apontamos só o erro — identificamos o padrão. Se você erra sempre na C3, vai saber disso já na segunda correção.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    title: 'Acompanhamento contínuo',
    desc: 'Não é uma correção solta. Cada devolutiva considera as anteriores. Sua especialista conhece seu histórico e guia sua evolução.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: 'Devolutiva em até 48h',
    desc: 'Você não fica semanas esperando. Em até 48 horas tem seu feedback completo para já aplicar na próxima.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Foco total em resultado',
    desc: 'Não vendemos aula gravada nem apostila. Vendemos uma coisa só: sua nota subindo, redação a redação.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
]

export default function Diferenciais() {
  return (
    <section className="section-padding" style={{ background: 'rgba(255,255,255,0.01)' }}>
      <div className="section-container">
        <div className="text-center mb-14">
          <div className="section-label justify-center">Por que a Método Revisão?</div>
          <h2 className="section-title mb-3">
            Não somos cursinho. Não somos IA.{' '}
            <br className="hidden sm:block" />
            <span className="gradient-text">Somos o acompanhamento que faltava.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {diferenciais.map((d, i) => (
            <div key={d.title} className="card-feature group">
              <div className="icon-box-purple mb-4 group-hover:shadow-glow-purple-xs transition-all duration-300">
                {d.icon}
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{d.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>

        {/* VS banner */}
        <div className="mt-10 rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="grid grid-cols-3 text-center divide-x divide-white/[0.06]">
            <div className="px-4 py-5">
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-3">Cursinho tradicional</p>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>Feedback genérico</li>
                <li>Sem histórico do aluno</li>
                <li>Nota, não diagnóstico</li>
                <li>Espera longa</li>
              </ul>
            </div>
            <div className="px-4 py-5 bg-purple-600/[0.06]">
              <p className="text-xs text-purple-400 font-bold uppercase tracking-wide mb-3">Método Revisão</p>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="font-medium">Especialista humana</li>
                <li className="font-medium">Acompanhamento contínuo</li>
                <li className="font-medium">Diagnóstico de padrões</li>
                <li className="font-medium">Devolutiva em 48h</li>
              </ul>
            </div>
            <div className="px-4 py-5">
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-3">Correção por IA</p>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>Sem leitura real</li>
                <li>Não entende contexto</li>
                <li>Sem orientação</li>
                <li>Não acompanha</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
