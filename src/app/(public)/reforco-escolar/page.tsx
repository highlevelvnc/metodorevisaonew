import type { Metadata } from 'next'
import Link from 'next/link'
import { trackProductEvent } from '@/lib/analytics'

export const metadata: Metadata = {
  title: 'Reforço Escolar de Português, Inglês, Redação e Literatura | Método Revisão',
  description:
    'Aulas particulares online de Português, Inglês, Redação e Literatura. Do 6o ano ao vestibular. Acompanhamento individualizado via Google Meet com a professora Beatriz Dias.',
}

const subjects = [
  {
    emoji: '📘',
    title: 'Português',
    desc: 'Gramática, interpretação de texto e produção textual. Do 6o ano ao Ensino Médio. Cada aula adaptada ao material e às provas do aluno.',
    tags: ['Gramática', 'Interpretação', 'Ensino Médio'],
  },
  {
    emoji: '🌍',
    title: 'Inglês',
    desc: 'Conversação, gramática e vocabulário. Do básico ao intermediário, com material adaptado ao nível e objetivo de cada aluno.',
    tags: ['Conversação', 'Gramática', 'Vocabulário'],
  },
  {
    emoji: '✏️',
    title: 'Redação',
    desc: 'Estrutura dissertativa, repertório cultural, proposta de intervenção. Preparação para ENEM, vestibular e redações escolares.',
    tags: ['ENEM', 'Dissertativa', 'Nota 1000'],
  },
  {
    emoji: '📖',
    title: 'Literatura',
    desc: 'Análise das obras da lista do ENEM e vestibulares, movimentos literários, interpretação. Vai direto ao ponto para as provas.',
    tags: ['ENEM', 'Obras', 'Análise'],
  },
]

const steps = [
  {
    n: '01',
    title: 'Escolha seu plano',
    desc: 'Selecione a quantidade de aulas que melhor se encaixa na rotina de estudos — de 4 a 34 aulas por mês.',
  },
  {
    n: '02',
    title: 'Solicite suas aulas',
    desc: 'Escolha data, horário e matéria diretamente pelo painel. A professora recebe e confirma em até 24 horas.',
  },
  {
    n: '03',
    title: 'Aula ao vivo via Google Meet',
    desc: 'Aula individual com tela compartilhada, exercícios em tempo real e devolutiva na hora. Link enviado por e-mail.',
  },
  {
    n: '04',
    title: 'Acompanhamento contínuo',
    desc: 'A professora conhece o histórico do aluno e adapta o plano conforme a evolução. Sem aula genérica.',
  },
]

const faqs = [
  {
    q: 'O reforço é para alunos com dificuldade ou para quem quer se destacar?',
    a: 'Para os dois. Trabalhamos com alunos que precisam recuperar conteúdo e com alunos que querem tirar notas excelentes, se preparar para vestibulares ou dominar o ENEM.',
  },
  {
    q: 'Preciso informar o conteúdo do meu colégio?',
    a: 'Sim. Nos primeiros contatos pedimos o material (livro, apostila ou ementa) para adaptar as aulas exatamente ao que será cobrado na prova do aluno.',
  },
  {
    q: 'Quantas aulas por semana são recomendadas?',
    a: 'Para reforço regular, 1 a 2 aulas por semana é suficiente. Em véspera de prova ou recuperação, podemos intensificar o ritmo.',
  },
  {
    q: 'As aulas de redação incluem correção?',
    a: 'Sim. Nas aulas de redação o aluno escreve, recebe feedback ao vivo e aprende a corrigir os próprios erros. Para correção ENEM avulsa (sem aula), temos os planos de assinatura.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: 'Você escolhe um plano com a quantidade de aulas que precisa e paga online via cartão. Tudo pelo site, sem burocracia.',
  },
]

export default function ReforcoEscolarPage() {
  trackProductEvent('reforco_landing_viewed', null)

  return (
    <div className="pt-16 min-h-screen bg-[var(--bg-body)] text-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <span className="inline-block bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold px-3 py-1 rounded-full mb-5 uppercase tracking-wider">
            Reforço Escolar Online
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
            Aulas particulares de<br className="hidden sm:block" />
            <span className="text-purple-400"> Português, Inglês, Redação e Literatura</span>
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Notas caindo ou conteúdo travado? A professora encontra o ponto exato da dificuldade e trabalha até destravar — com plano adaptado às provas do aluno.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/reforco-escolar/planos"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-sm"
            >
              Ver planos e preços
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-gray-200 font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm"
            >
              Criar conta grátis
            </Link>
          </div>
          <p className="text-xs text-gray-600 mt-4">
            Planos a partir de R$ 65/aula · Comece quando quiser
          </p>
        </div>
      </section>

      {/* ── Subjects ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 mb-3">Matérias</p>
            <h2 className="text-2xl md:text-3xl font-bold">Quatro matérias, um método</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto text-sm">
              Cada aula é preparada individualmente. Nada de apostila genérica — o conteúdo é exatamente o que será cobrado na prova do aluno.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.map(s => (
              <div key={s.title} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 hover:border-purple-500/30 hover:bg-purple-500/[0.04] transition-all">
                <div className="text-3xl mb-3">{s.emoji}</div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">{s.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.tags.map(t => (
                    <span key={t} className="text-[10px] font-semibold bg-white/[0.05] text-gray-400 px-2 py-0.5 rounded-full border border-white/[0.08]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 mb-3">Como funciona</p>
            <h2 className="text-2xl md:text-3xl font-bold">Do plano à evolução</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {steps.map(step => (
              <div key={step.n} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 flex gap-4">
                <span className="text-2xl font-black text-purple-500/30 tabular-nums leading-none flex-shrink-0 mt-0.5">
                  {step.n}
                </span>
                <div>
                  <h3 className="font-bold text-white mb-1.5 text-sm">{step.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Results strip ────────────────────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-6 text-center">
          {[
            { stat: '6o ano → EM', label: 'Atendemos todos os níveis escolares' },
            { stat: '1-2x/semana', label: 'Frequência recomendada para evolução clara' },
            { stat: '100% online', label: 'Aulas ao vivo via Google Meet' },
          ].map(item => (
            <div key={item.stat}>
              <p className="text-2xl font-black text-white mb-1">{item.stat}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 mb-3">FAQ</p>
            <h2 className="text-2xl font-bold">Perguntas frequentes</h2>
          </div>
          <div className="space-y-3">
            {faqs.map(faq => (
              <div key={faq.q} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                <p className="font-semibold text-white text-sm mb-2">{faq.q}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto rounded-3xl border border-purple-500/20 bg-purple-500/[0.06] p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Pronto para começar?</h2>
          <p className="text-gray-400 mb-7 text-sm leading-relaxed max-w-md mx-auto">
            Escolha seu plano, solicite sua primeira aula e comece a evoluir com acompanhamento individual.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/reforco-escolar/planos"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-sm"
            >
              Ver planos e preços
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/cadastro"
              className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
            >
              Criar conta grátis →
            </Link>
          </div>
          <p className="text-xs text-gray-600 mt-4">
            Planos a partir de R$ 65/aula · Pagamento online via cartão
          </p>
        </div>
      </section>
    </div>
  )
}
