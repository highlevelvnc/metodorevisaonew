import Link from 'next/link'

const benefits = [
  {
    icon: (
      <svg className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: 'Correção completa em até 24h — sem atraso na aula.',
  },
  {
    icon: (
      <svg className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    text: 'Feedback estruturado por competência (C1–C5), padrão ENEM.',
  },
  {
    icon: (
      <svg className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    text: 'Acompanhamento da evolução de cada aluno ao longo do tempo.',
  },
  {
    icon: (
      <svg className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    text: 'Menos carga para professores — mais qualidade para os alunos.',
  },
]

const steps = [
  'A escola define a turma ou grupo',
  'Os alunos enviam as redações (foto, PDF ou texto)',
  'Correção entregue em até 24h com diagnóstico por competência',
  'A escola acompanha a evolução individual de cada aluno',
]

export default function ParaEscolasTeaser() {
  return (
    <section id="para-escolas" className="section-padding relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-800/[0.07] rounded-full blur-3xl pointer-events-none" />

      <div className="section-container relative">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-center">

            {/* ── Left: copy ──────────────────────────────────────── */}
            <div>
              <div className="section-label mb-4">Para Escolas</div>
              <h2 className="section-title mb-4">
                Seu aluno evolui na redação.{' '}
                <span className="gradient-text">
                  Seu professor não precisa fazer tudo sozinho.
                </span>
              </h2>
              <p className="section-subtitle mb-8 max-w-md">
                Integre o Método Revisão na sua escola e ofereça correção estratégica e individual —
                com devolutiva em 24h — sem aumentar a carga dos seus professores.
              </p>

              <ul className="space-y-4 mb-10">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {b.icon}
                    <span className="text-sm text-gray-400 leading-relaxed">{b.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/para-escolas"
                className="inline-flex items-center gap-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/25 hover:border-purple-500/45 text-purple-300 hover:text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition-all duration-200"
              >
                Levar para minha escola
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* ── Right: how-it-works card ─────────────────────────── */}
            <div className="card-dark p-7 border-purple-500/[0.12]">

              {/* Card header */}
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-white">Como funciona na escola</p>
              </div>

              {/* Steps */}
              <ol className="space-y-4">
                {steps.map((step, i) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold text-purple-400 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-400 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>

              <div className="divider my-6" />

              {/* Trust signals */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-xs text-gray-500">10.000+ redações corrigidas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="text-xs text-gray-500">Devolutiva em até 24h</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="text-xs text-gray-500">Correção humana</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
