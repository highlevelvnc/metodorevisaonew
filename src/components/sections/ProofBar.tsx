const metrics = [
  { value: '2.000+', label: 'redações corrigidas',     icon: '📄' },
  { value: '+180',   label: 'pontos de evolução média', icon: '📈' },
  { value: '48h',    label: 'prazo de devolutiva',      icon: '⚡' },
  { value: '4.9/5',  label: 'avaliação dos alunos',     icon: '⭐' },
]

export default function ProofBar() {
  return (
    <section id="prova-bar" className="py-6 relative z-10">
      <div className="section-container">
        <div
          className="rounded-2xl border border-white/[0.07] px-6 py-6 sm:py-5"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)' }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {metrics.map((m) => (
              <div key={m.label} className="text-center group">
                <div className="text-2xl sm:text-3xl font-extrabold text-white mb-0.5 tabular-nums">
                  {m.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
