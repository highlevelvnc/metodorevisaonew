import type { Metadata } from 'next'
import Link from 'next/link'

const WA_LINK =
  'https://wa.me/5522992682207?text=Ol%C3%A1%2C%20Beatriz!%20Vim%20pelo%20site%20e%20quero%20saber%20sobre%20as%20aulas%20de%20Reda%C3%A7%C3%A3o%20ENEM.'

export const metadata: Metadata = {
  title: 'Redação ENEM | Correção e Acompanhamento Personalizado Online',
  description:
    'Aprenda a fazer redação do ENEM com nota alta. Correção personalizada, feedback detalhado e acompanhamento semanal com a professora Beatriz Dias.',
}

export default function RedacaoEnem() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">Redação ENEM</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Redação ENEM: do rascunho à nota máxima</h1>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Correção personalizada, feedback detalhado em cada critério e acompanhamento até você dominar a redação dissertativo-argumentativa.
          </p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors">
            Falar no WhatsApp
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Por que a redação do ENEM é tão importante?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            A redação vale até 1.000 pontos e pode ser o diferencial decisivo na sua nota final. Muitos candidatos perdem pontos não por falta de conhecimento, mas por não dominar a estrutura e os critérios de avaliação da banca.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Com o Método Revisão, você aprende a estrutura correta da redação dissertativo-argumentativa, como construir tese e tópicos frasais, e como fazer uma proposta de intervenção completa — os quatro aspectos que mais impactam a nota.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Os 5 critérios do ENEM — e como dominar cada um</h2>
          <div className="space-y-4">
            {[
              { num: '1', title: 'Domínio da norma culta', desc: 'Gramática, ortografia e pontuação. Trabalhamos os principais erros e como evitá-los.' },
              { num: '2', title: 'Compreensão da proposta', desc: 'Entender o tema e desenvolver dentro do que foi pedido, sem fugir ao tema.' },
              { num: '3', title: 'Seleção de argumentos', desc: 'Escolher argumentos relevantes, concretos e bem desenvolvidos para defender a tese.' },
              { num: '4', title: 'Coesão e coerência', desc: 'Conectores, progressão textual e organização lógica dos parágrafos.' },
              { num: '5', title: 'Proposta de intervenção', desc: 'Agente + ação + modo + finalidade. A fórmula completa para garantir a nota máxima.' },
            ].map((item) => (
              <div key={item.num} className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-purple-700 text-white rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">{item.num}</div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">{item.title}</div>
                  <div className="text-gray-600 text-sm">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Perguntas frequentes</h2>
          <div className="space-y-4">
            {[
              { q: 'Com quantas redações precisarei escrever?', a: 'Depende do seu nível inicial. Em geral, trabalhamos de 1 a 2 redações por semana com correção completa e feedback detalhado.' },
              { q: 'Funciona para quem está começando do zero?', a: 'Sim. Começamos pela estrutura básica e avançamos progressivamente. Não é necessário ter conhecimento prévio sobre redação ENEM.' },
              { q: 'Como recebo o feedback das redações?', a: 'Você recebe a redação corrigida com anotações em cada parágrafo, nota estimada por critério e orientações para a próxima redação.' },
            ].map((faq) => (
              <div key={faq.q} className="border border-gray-100 rounded-2xl p-5">
                <div className="font-semibold text-gray-900 mb-2">{faq.q}</div>
                <div className="text-gray-600 text-sm">{faq.a}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Artigos relacionados</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/blog/redacao-enem-tese-topico-frasal" className="text-purple-700 font-medium hover:underline text-sm">→ Como criar tese e tópico frasal no ENEM</Link>
            <Link href="/blog/checklist-revisao-7-dias-prova" className="text-purple-700 font-medium hover:underline text-sm">→ Checklist de revisão em 7 dias</Link>
          </div>
        </section>

        <div className="bg-purple-700 rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Comece a melhorar sua redação agora</h2>
          <p className="text-purple-200 mb-6">Acompanhamento personalizado, correção detalhada e resultado real no ENEM.</p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors">
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
