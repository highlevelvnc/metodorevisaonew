import type { Metadata } from 'next'
import Link from 'next/link'
import { WHATSAPP_URL } from '@/lib/contact'

const WA_LINK =
  `${WHATSAPP_URL}?text=Ol%C3%A1%2C%20Beatriz!%20Vim%20pelo%20site%20e%20quero%20saber%20sobre%20o%20refor%C3%A7o%20escolar%20de%20Portugu%C3%AAs%20e%20Ingl%C3%AAs.`

export const metadata: Metadata = {
  title: 'Reforço Escolar de Português e Inglês Online | Método Revisão',
  description:
    'Reforço escolar online de Português e Inglês para alunos do 6º ao 9º ano e Ensino Médio. Acompanhamento individualizado com a professora Beatriz Dias.',
}

export default function ReforcoEscolar() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">Reforço Escolar</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Reforço Escolar Online de Português e Inglês</h1>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Acompanhamento individualizado para alunos que precisam melhorar as notas, recuperar conteúdo ou se preparar para provas importantes.
          </p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors">
            Falar no WhatsApp
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">O reforço escolar certo faz toda a diferença</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Muitas famílias buscam reforço escolar quando as notas caem — mas o ideal é usar o reforço de forma preventiva, como um acompanhamento contínuo. No Método Revisão, o reforço é individualizado: a professora Beatriz entende exatamente onde o aluno está falhando e trabalha aquele ponto específico.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Não é só "fazer a lição de casa junto". É ensinar o conteúdo de forma diferente, mais clara e eficiente, até o aluno realmente entender.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Resultados que os alunos alcançam</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '📈', title: 'Melhora nas notas', desc: 'Alunos com média baixa chegam a 8+ em poucas semanas de acompanhamento.' },
              { icon: '💪', title: 'Mais confiança', desc: 'O aluno passa a participar mais das aulas e a se sentir capaz em provas.' },
              { icon: '🎯', title: 'Foco no que importa', desc: 'Trabalhamos os conteúdos que realmente vão cair na prova do aluno.' },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="font-bold text-gray-900 mb-2">{item.title}</div>
                <div className="text-gray-600 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Perguntas frequentes</h2>
          <div className="space-y-4">
            {[
              { q: 'O reforço é para alunos com dificuldade ou para quem quer se destacar?', a: 'Para os dois! Trabalhamos tanto com alunos que precisam recuperar conteúdo quanto com alunos que querem tirar notas excelentes e se preparar para concursos e vestibulares.' },
              { q: 'Preciso informar o conteúdo do colégio?', a: 'Sim, nos primeiros contatos pedimos o material do colégio (livro, apostila ou ementa) para adaptar as aulas exatamente ao que será cobrado na prova.' },
              { q: 'Quantas aulas por semana são recomendadas?', a: 'Para reforço regular, 1 a 2 aulas por semana é o suficiente. Em véspera de prova ou recuperação, podemos intensificar.' },
            ].map((faq) => (
              <div key={faq.q} className="border border-gray-100 rounded-2xl p-5">
                <div className="font-semibold text-gray-900 mb-2">{faq.q}</div>
                <div className="text-gray-600 text-sm">{faq.a}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Leia também</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/blog/como-estudar-portugues-6-ao-9-ano" className="text-purple-700 font-medium hover:underline text-sm">→ Plano de estudos para o 6º ao 9º ano</Link>
            <Link href="/aulas-de-portugues-online" className="text-purple-700 font-medium hover:underline text-sm">→ Aulas de Português Online</Link>
            <Link href="/aulas-de-ingles-online" className="text-purple-700 font-medium hover:underline text-sm">→ Aulas de Inglês Online</Link>
          </div>
        </section>

        <div className="bg-purple-700 rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Agende o reforço escolar online agora</h2>
          <p className="text-purple-200 mb-6">Atendimento rápido, plano personalizado e resultado visível em semanas.</p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors">
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
