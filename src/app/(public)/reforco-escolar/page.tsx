import type { Metadata } from 'next'
import Link from 'next/link'
import { WHATSAPP_URL } from '@/lib/contact'

const WA_LINK =
  `${WHATSAPP_URL}?text=Ol%C3%A1%2C%20Beatriz!%20Vim%20pelo%20site%20e%20quero%20saber%20sobre%20o%20refor%C3%A7o%20escolar.`

export const metadata: Metadata = {
  title: 'Reforço Escolar de Português, Inglês, Redação e Literatura | Método Revisão',
  description:
    'Aulas particulares online de Português, Inglês, Redação e Literatura. Do 6º ano ao vestibular. Acompanhamento individualizado via Google Meet com a professora Beatriz Dias.',
}

const subjects = [
  {
    emoji: '📘',
    title: 'Português',
    desc: 'Gramática, interpretação de texto e produção textual. Do 6º ano ao Ensino Médio. Cada aula adaptada ao material e às provas do aluno.',
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
    title: 'Diagnóstico rápido',
    desc: 'Antes da primeira aula, entendemos onde o aluno está: qual o colégio, quais as notas, o que está caindo nas provas.',
  },
  {
    n: '02',
    title: 'Plano personalizado',
    desc: 'Cada aluno tem um plano diferente. Sem apostila genérica — trabalhamos exatamente o conteúdo que vai ser cobrado.',
  },
  {
    n: '03',
    title: 'Aulas via Google Meet',
    desc: 'Aulas ao vivo, com tela compartilhada, exercícios em tempo real e devolutiva na hora. Gravação disponível para revisão.',
  },
  {
    n: '04',
    title: 'Acompanhamento contínuo',
    desc: 'Entre aulas, o aluno pode tirar dúvidas via WhatsApp. Ajustamos o ritmo conforme o progresso.',
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
    q: 'Como funciona a cobrança?',
    a: 'O valor é combinado individualmente conforme frequência e matéria. Fale no WhatsApp para receber uma proposta.',
  },
]

export default function ReforcoEscolarPage() {
  return (
    <div className="pt-16 min-h-screen bg-[#070c14] text-white">

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
            Acompanhamento individualizado ao vivo via Google Meet. Do 6º ano ao vestibular — com plano adaptado ao conteúdo e às provas de cada aluno.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-sm"
            >
              Falar no WhatsApp
            </a>
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-gray-200 font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm"
            >
              Criar conta grátis
            </Link>
          </div>
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
            <h2 className="text-2xl md:text-3xl font-bold">Do diagnóstico à evolução</h2>
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
            { stat: '6º ano → EM', label: 'Atendemos todos os níveis escolares' },
            { stat: '1–2×/semana', label: 'Frequência recomendada para evolução clara' },
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
            Fale com a Beatriz, explique a situação do aluno e receba uma proposta personalizada. Atendimento rápido no WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-sm"
            >
              Falar no WhatsApp
            </a>
            <Link
              href="/cadastro"
              className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
            >
              Criar conta e ver planos →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
