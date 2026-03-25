import type { Metadata } from 'next'
import Link from 'next/link'

const WA_LINK =
  'https://wa.me/5522992682207?text=Ol%C3%A1%2C%20Beatriz!%20Vim%20pelo%20site%20e%20quero%20saber%20sobre%20as%20aulas%20de%20Ingl%C3%AAs%20online.'

export const metadata: Metadata = {
  title: 'Aulas de Inglês Online para Escola | Do 6º Ano ao Ensino Médio',
  description:
    'Aulas de Inglês online para alunos do 6º ano ao Ensino Médio. Aprenda gramática, conversação e interpretação em inglês com a professora Beatriz Dias.',
}

export default function AulasIngles() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">Inglês Online</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Aulas de Inglês Online para Escola</h1>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Do 6º ano ao Ensino Médio. Aprenda Inglês com método, progressão e acompanhamento real da professora Beatriz Dias.
          </p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors">
            Falar no WhatsApp
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Inglês para escola: por que as aulas particulares fazem diferença?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Muitos alunos chegam ao Ensino Médio sem entender inglês básico — porque as aulas coletivas avançam sem que as dúvidas sejam resolvidas. Com aulas particulares online, você tem tempo e atenção para aprender no seu ritmo.
          </p>
          <p className="text-gray-600 leading-relaxed">
            No Método Revisão, o inglês é ensinado de forma progressiva e contextualizada: começamos onde o aluno está, não onde o livro manda.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">O que é ensinado nas aulas</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '🗣️', title: 'Conversação', desc: 'Desenvolvimento da fluência básica e intermediária com prática real de diálogos.' },
              { icon: '📝', title: 'Gramática', desc: 'Tempos verbais, preposições, pronomes e estruturas cobradas na escola e no ENEM.' },
              { icon: '📖', title: 'Interpretação de Texto', desc: 'Leitura e compreensão de textos em inglês — essencial para provas e vestibulares.' },
              { icon: '✍️', title: 'Escrita', desc: 'Produção de frases, parágrafos e textos curtos em inglês com vocabulário ampliado.' },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Perguntas frequentes</h2>
          <div className="space-y-4">
            {[
              { q: 'Atende alunos sem nenhum conhecimento de inglês?', a: 'Sim! Começamos do zero com vocabulário, saudações e estruturas básicas. O ritmo é totalmente adaptado ao aluno.' },
              { q: 'Como são as aulas de conversação?', a: 'Fazemos diálogos simulados, exercícios de pronúncia e situações do cotidiano — tudo com feedback imediato.' },
              { q: 'As aulas ajudam nas provas escolares?', a: 'Sim. Além de conversação, trabalhamos gramática e interpretação de textos em inglês, que são os focos das provas escolares e do ENEM.' },
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
            <Link href="/blog/ingles-para-escola-destravar-conversacao" className="text-purple-700 font-medium hover:underline text-sm">→ Como destravar a conversação em inglês</Link>
            <Link href="/blog/checklist-revisao-7-dias-prova" className="text-purple-700 font-medium hover:underline text-sm">→ Checklist de revisão em 7 dias</Link>
          </div>
        </section>

        <div className="bg-purple-700 rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Comece suas aulas de Inglês hoje</h2>
          <p className="text-purple-200 mb-6">Do zero à conversação com método e acompanhamento personalizado.</p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors">
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
