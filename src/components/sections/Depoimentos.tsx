'use client'

import { ShuffleCards } from '@/components/ui/testimonial-cards'
import type { Testimonial } from '@/components/ui/testimonial-cards'

// ─── Data ─────────────────────────────────────────────────────────────────────

const depoimentos: Testimonial[] = [
  {
    id: 1,
    author:      'Aline R.',
    role:        'Ensino Médio — ENEM',
    testimonial: 'Depois de 6 correções, finalmente entendi o que estava travando minha nota na C3. Fui de 620 para 780 em dois meses.',
    metric:      { before: 620, after: 780, label: 'na redação' },
    highlight:   null,
  },
  {
    id: 2,
    author:      'Lucas M.',
    role:        'Vestibulando',
    testimonial: 'Já tinha feito cursinho e assistido aula de tudo que é tipo. Nada funcionava porque ninguém olhava para a minha redação de verdade. A devolutiva da Método Revisão é outra coisa.',
    metric:      { before: 520, after: 820, label: 'na redação' },
    highlight:   null,
  },
  {
    id: 3,
    author:      'Fernanda S.',
    role:        'Mãe de aluno',
    testimonial: 'Meu filho odiava escrever. Em 30 dias de acompanhamento, ele já estava pedindo tema novo. A diferença foi ele finalmente entender onde errava.',
    metric:      null,
    highlight:   '30 dias de mudança',
  },
  {
    id: 4,
    author:      'Rafael T.',
    role:        'Treineiro ENEM',
    testimonial: 'Comecei com medo de redação. Hoje é a parte da prova que eu mais confio. O plano Estratégia me deu a estrutura que eu precisava.',
    metric:      null,
    highlight:   'Plano Estratégia',
  },
]

// ─── Stars helper ─────────────────────────────────────────────────────────────

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

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Depoimentos() {
  return (
    <section id="depoimentos" className="section-padding relative overflow-hidden">
      {/* Top border glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-600/30 to-transparent" />

      <div className="section-container">
        {/* ── Header ────────────────────────────────────────────────────── */}
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

        {/* ── Two-column layout ──────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-16 lg:gap-20 max-w-5xl mx-auto">

          {/* LEFT — interactive shuffle deck */}
          <div className="flex-shrink-0 flex flex-col items-center gap-6">
            {/* offset wrapper so rotated back card doesn't overflow left */}
            <div className="relative ml-[100px] md:ml-[175px]">
              <ShuffleCards testimonials={depoimentos} />
            </div>
          </div>

          {/* RIGHT — metric highlights + social proof */}
          <div className="flex flex-col justify-center gap-6 lg:pt-6 w-full max-w-sm lg:max-w-xs">
            <p className="text-gray-400 text-sm leading-relaxed">
              Cada devolutiva é lida por uma especialista real. Não é algoritmo, não é feedback genérico — é orientação que muda o resultado redação a redação.
            </p>

            {/* Score improvements */}
            <div className="space-y-3">
              {depoimentos.filter(d => d.metric).map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                  {/* Avatar initial */}
                  <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-purple-300">{d.author[0]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{d.author}</p>
                    <p className="text-[11px] text-gray-600">{d.role}</p>
                  </div>
                  {d.metric && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-gray-600 text-xs line-through tabular-nums">{d.metric.before}</span>
                      <svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                      <span className="text-green-400 font-extrabold text-sm tabular-nums">{d.metric.after}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Trust stats */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { value: '+5.000', label: 'redações corrigidas' },
                { value: '+10.000', label: 'alunos ativos'     },
                { value: '4.9 ★', label: 'avaliação média'    },
              ].map((s) => (
                <div key={s.label} className="text-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-2 py-3">
                  <p className="text-sm font-extrabold text-white tabular-nums leading-none mb-1">{s.value}</p>
                  <p className="text-[10px] text-gray-600 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
