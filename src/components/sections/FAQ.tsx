'use client'
import { useState } from 'react'
import { trackEvent } from '@/components/Analytics'

const faqs = [
  {
    q: 'Como funciona a correção na prática?',
    a: 'Você escreve sua redação, envia pelo canal de entrega e recebe a devolutiva completa em até 48 horas. A devolutiva inclui nota por competência, anotações no texto, diagnóstico dos seus padrões de erro e orientação específica para a próxima redação.',
  },
  {
    q: 'Quem corrige minha redação?',
    a: 'Uma especialista em redação ENEM com mais de 4 anos de experiência e mais de 10.000 redações corrigidas. Não usamos IA para corrigir. Cada texto é lido, analisado e comentado por uma pessoa real.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. Não existe fidelidade nem multa. Você continua porque está evoluindo, não porque está preso em um contrato.',
  },
  {
    q: 'Em quanto tempo vou ver resultado?',
    a: 'A maioria dos alunos percebe evolução clara nas primeiras 4 a 6 correções. Alunos do plano Estratégia costumam ver aumento de 100 a 200 pontos em 8 a 12 semanas de acompanhamento consistente.',
  },
  {
    q: 'Preciso escrever sobre temas específicos?',
    a: 'Você pode escolher seus temas ou receber propostas nossas. Nos planos Estratégia e Intensivo, enviamos temas direcionados ao seu nível e às competências que você precisa priorizar.',
  },
  {
    q: 'É só para quem vai fazer ENEM?',
    a: 'O foco principal é ENEM, mas o método serve para qualquer pessoa que queira melhorar sua escrita dissertativa-argumentativa — incluindo vestibulandos de outras bancas e concurseiros.',
  },
  {
    q: 'Como recebo a devolutiva?',
    a: 'A devolutiva é enviada em formato visual e organizado, com a redação anotada e os comentários por competência. Você acessa tudo digitalmente.',
  },
  {
    q: 'E se eu não evoluir nas primeiras correções?',
    a: 'Evolução acontece em ritmos diferentes, mas é sempre visível. Se nas primeiras 4 correções você não sentir progresso, conversamos diretamente para entender o que ajustar no processo. Nosso compromisso é com o seu resultado — não apenas com a entrega.',
  },
  {
    q: 'Posso experimentar antes de assinar um plano?',
    a: 'Sim. Ao criar sua conta, você recebe 1 correção gratuita. Envie uma redação, receba a devolutiva completa C1–C5 em até 24h e veja exatamente como funciona. Sem cartão, sem compromisso. Depois, você escolhe um plano para continuar.',
  },
  {
    q: 'Quando começo a escrever após assinar?',
    a: 'Imediatamente. Assim que você criar sua conta (gratuita) ou assinar um plano, já pode enviar sua primeira redação no mesmo dia. Não existe período de espera.',
  },
  {
    q: 'Posso parcelar o pagamento?',
    a: 'Sim. O pagamento pode ser feito via cartão de crédito (parcelado) ou Pix. Entre em contato pelo WhatsApp para combinar a melhor forma de pagamento.',
  },
  {
    q: 'Preciso ter um nível mínimo de escrita?',
    a: 'Não. O método foi desenhado para qualquer nível — do iniciante ao avançado. A devolutiva é adaptada ao seu ponto de partida, e a evolução é gradual e medida a cada correção.',
  },
  {
    q: 'A sessão ao vivo é obrigatória?',
    a: 'Não. Ela está disponível nos planos Estratégia e Intensivo para quem quer tirar dúvidas, revisar a evolução e alinhar o foco das próximas redações. O núcleo do método é a correção escrita.',
  },
]

const jsonLdFAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  const toggle = (i: number) => {
    if (open !== i) trackEvent('faq_open', { question: faqs[i].q })
    setOpen(open === i ? null : i)
  }

  return (
    <section id="faq" className="section-padding bg-slate-900/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
      />
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="section-label justify-center">FAQ</div>
          <h2 className="section-title mb-4">Tire suas dúvidas antes de começar.</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                open === i
                  ? 'bg-slate-900/80 border-purple-500/30'
                  : 'bg-slate-900/40 border-gray-800/60 hover:border-gray-700/60'
              }`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between text-left px-6 py-5 gap-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset"
                aria-expanded={open === i}
                aria-controls={`faq-answer-${i}`}
              >
                <span className="font-semibold text-white text-sm pr-2">{faq.q}</span>
                <span className={`flex-shrink-0 w-5 h-5 text-purple-400 transition-transform duration-200 ${open === i ? 'rotate-45' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>
              {open === i && (
                <div id={`faq-answer-${i}`} className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-gray-800/40 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
