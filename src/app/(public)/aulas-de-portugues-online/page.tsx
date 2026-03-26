import type { Metadata } from 'next'
import Link from 'next/link'

const WA_LINK =
  'https://wa.me/5522992682207?text=Ol%C3%A1%2C%20Beatriz!%20Vim%20pelo%20site%20e%20quero%20saber%20sobre%20as%20aulas%20de%20Portugu%C3%AAs%20online.'

export const metadata: Metadata = {
  title: 'Aulas de Português Online | Reforço Escolar com Método Próprio',
  description:
    'Aulas particulares de Português online para alunos do 6º ano ao Ensino Médio. Metodologia personalizada da professora Beatriz Dias. Atendimento em todo o Brasil.',
}

export default function AulasPortugues() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
            Português Online
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Aulas de Português Online com Método Próprio
          </h1>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Aprenda Português de verdade com a professora Beatriz Dias — metodologia personalizada para alunos do 6º ano ao Ensino Médio.
          </p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors">
            Falar no WhatsApp
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Sobre as aulas */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Por que escolher aulas particulares de Português online?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            O ensino coletivo na escola nem sempre consegue atender às necessidades individuais de cada aluno. Com aulas particulares de Português online, você tem atenção total do professor, um plano de estudos adaptado às suas dificuldades e progresso muito mais rápido.
          </p>
          <p className="text-gray-600 leading-relaxed">
            No <strong>Método Revisão</strong>, cada aluno passa por uma avaliação inicial que identifica seus pontos fracos — seja gramática, interpretação de texto ou produção escrita — e recebe um plano personalizado para evoluir de forma consistente.
          </p>
        </section>

        {/* O que é trabalhado */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">O que é trabalhado nas aulas</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '📖', title: 'Interpretação de Texto', desc: 'Técnicas para ler com atenção, identificar a ideia central e responder questões com precisão.' },
              { icon: '📝', title: 'Gramática Aplicada', desc: 'Concordância, crase, regência e pontuação aprendidos no contexto, não decorados.' },
              { icon: '✏️', title: 'Produção Textual', desc: 'Redação dissertativo-argumentativa, narração e outros gêneros textuais cobrados em provas.' },
              { icon: '📚', title: 'Literatura', desc: 'Autores, estilos literários e análise de obras para o Ensino Médio e ENEM.' },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Para quem é */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Para quem são as aulas de Português online?</h2>
          <ul className="space-y-3">
            {[
              'Alunos do 6º ao 9º ano com dificuldade em Português, gramática ou interpretação',
              'Estudantes do Ensino Médio que querem melhorar a redação e a nota em provas',
              'Candidatos ao ENEM que precisam de acompanhamento em Linguagens',
              'Quem quer um reforço escolar online com atenção individualizada',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Perguntas frequentes</h2>
          <div className="space-y-4">
            {[
              { q: 'As aulas de Português são online ou presenciais?', a: '100% online, por videochamada. Funciona para alunos de qualquer cidade do Brasil.' },
              { q: 'Como funciona a avaliação inicial?', a: 'Na primeira aula, fazemos uma conversa para entender as dificuldades e objetivos do aluno e montamos o plano de estudos.' },
              { q: 'Quais séries são atendidas?', a: 'Do 6º ano ao 3º ano do Ensino Médio, incluindo preparação para o ENEM.' },
            ].map((faq) => (
              <div key={faq.q} className="border border-gray-100 rounded-2xl p-5">
                <div className="font-semibold text-gray-900 mb-2">{faq.q}</div>
                <div className="text-gray-600 text-sm">{faq.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Links internos */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Conteúdo relacionado</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/blog/como-melhorar-interpretacao-de-texto" className="text-purple-700 font-medium hover:underline text-sm">→ Como melhorar na interpretação de texto</Link>
            <Link href="/blog/gramatica-sem-decorar-metodo-revisao" className="text-purple-700 font-medium hover:underline text-sm">→ Gramática sem decorar</Link>
            <Link href="/redacao-enem" className="text-purple-700 font-medium hover:underline text-sm">→ Redação ENEM</Link>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-purple-700 rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Comece suas aulas de Português online</h2>
          <p className="text-purple-200 mb-6">Entre em contato agora. Atendimento rápido, plano personalizado, resultado real.</p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors">
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
