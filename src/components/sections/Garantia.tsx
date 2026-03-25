const pilares = [
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
      </svg>
    ),
    title: 'Cancele quando quiser',
    desc: 'Sem fidelidade. Sem multa. Sem justificativa. Você fica porque está evoluindo — não porque está preso.',
    color: 'text-green-400',
    bg: 'bg-green-500/[0.07] border-green-500/20',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: 'Transparência total',
    desc: 'Você vê sua evolução a cada correção. Notas registradas, padrões mapeados, progresso visível — sem surpresas.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/[0.07] border-purple-500/20',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Entrega pontual garantida',
    desc: 'Comprometemos com devolutiva em até 48h. Se não cumprirmos, você recebe uma correção extra sem custo.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/[0.07] border-sky-500/20',
  },
]

const badges = [
  { icon: '🔒', label: 'Pagamento seguro' },
  { icon: '📄', label: 'Sem contrato' },
  { icon: '💬', label: 'Suporte humano' },
  { icon: '✅', label: 'Cancelamento imediato' },
]

export default function Garantia() {
  return (
    <section className="py-14 md:py-20 relative">
      {/* Subtle separator */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-4 py-2 rounded-full mb-4">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
            </svg>
            Risco zero para você
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Você só continua porque está evoluindo.
          </h2>
        </div>

        {/* Pillars */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {pilares.map((p) => (
            <div key={p.title} className={`rounded-2xl border p-5 ${p.bg}`}>
              <div className={`mb-3 ${p.color}`}>{p.icon}</div>
              <h3 className={`font-bold text-sm mb-1.5 ${p.color}`}>{p.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-3">
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2">
              <span className="text-base">{b.icon}</span>
              <span className="text-gray-500 text-xs font-medium">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
