import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { BookOpen, FileText, ExternalLink, Star, Lightbulb, MessageSquare, ClipboardList } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Professor — Materiais de Apoio',
  robots: { index: false, follow: false },
}

// ── Static resource library ───────────────────────────────────────────────────

const COMPETENCY_GUIDES = [
  {
    code: 'C1',
    title: 'Domínio da norma culta',
    description: 'Ortografia, acentuação, concordância, regência e pontuação. Como identificar e quantificar desvios na correção.',
    criteria: [
      'Verificar presença e número de desvios ortográficos',
      'Avaliar concordância verbal e nominal',
      'Observar regência verbal e nominal',
      'Analisar o uso correto da pontuação',
    ],
    scores: [
      { score: 200, label: 'Domínio pleno da norma com pouquíssimos desvios' },
      { score: 160, label: 'Bom domínio, desvios esporádicos não sistemáticos' },
      { score: 120, label: 'Domínio mediano, alguns desvios sistemáticos' },
      { score: 80,  label: 'Pouco domínio, desvios frequentes' },
      { score: 40,  label: 'Domínio precário, desvios graves e recorrentes' },
      { score: 0,   label: 'Desconhecimento da norma' },
    ],
  },
  {
    code: 'C2',
    title: 'Compreensão do tema e gênero dissertativo-argumentativo',
    description: 'Avaliar se o texto aborda o tema proposto dentro do gênero textual correto, com estrutura coerente.',
    criteria: [
      'Texto deve tratar do tema exato da proposta — não tangenciar',
      'Verificar se é dissertativo-argumentativo (não narrativo, não descritivo)',
      'Avaliar repertório sociocultural pertinente ao tema',
      'Verificar recorte temático adequado',
    ],
    scores: [
      { score: 200, label: 'Texto dissertativo-argumentativo com pleno domínio e excelente repertório' },
      { score: 160, label: 'Bom domínio do gênero e do tema, com repertório produtivo' },
      { score: 120, label: 'Domínio mediano, tangencia o tema em algum momento' },
      { score: 80,  label: 'Abordagem tangencial do tema' },
      { score: 40,  label: 'Domínio precário do gênero e tema' },
      { score: 0,   label: 'Fuga ao tema ou texto não dissertativo-argumentativo' },
    ],
  },
  {
    code: 'C3',
    title: 'Seleção e organização de informações e argumentos',
    description: 'Análise da qualidade dos argumentos, coerência lógica e consistência das informações apresentadas.',
    criteria: [
      'Avaliar se os argumentos são pertinentes ao tema e à tese',
      'Verificar a relevância e profundidade dos dados apresentados',
      'Observar se há progressão e encadeamento lógico dos argumentos',
      'Identificar se há contradições ou inconsistências',
    ],
    scores: [
      { score: 200, label: 'Argumentos consistentes, organizados com autoria evidente' },
      { score: 160, label: 'Argumentação bem desenvolvida com boa organização' },
      { score: 120, label: 'Argumentação suficiente mas com alguma generalização' },
      { score: 80,  label: 'Argumentação insuficiente ou com incoerências' },
      { score: 40,  label: 'Argumentação muito fraca ou desorganizada' },
      { score: 0,   label: 'Sem argumentação ou totalmente incoerente' },
    ],
  },
  {
    code: 'C4',
    title: 'Conhecimento dos mecanismos linguísticos para coesão textual',
    description: 'Uso de conectivos, coesão referencial e sequencial para garantir a unidade do texto.',
    criteria: [
      'Verificar uso adequado de conectivos e conjunções',
      'Avaliar coesão referencial (pronomes, sinônimos, hiperônimos)',
      'Observar encadeamento entre parágrafos',
      'Identificar repetições desnecessárias ou quebras de coesão',
    ],
    scores: [
      { score: 200, label: 'Excelente articulação com diversidade de recursos coesivos' },
      { score: 160, label: 'Boa articulação com alguma inadequação pontual' },
      { score: 120, label: 'Uso mediano de conectivos, repetições ocasionais' },
      { score: 80,  label: 'Uso insuficiente de conectivos, articulação fraca' },
      { score: 40,  label: 'Articulação precária, muitas rupturas' },
      { score: 0,   label: 'Inexistência de mecanismos coesivos' },
    ],
  },
  {
    code: 'C5',
    title: 'Proposta de intervenção detalhada e respeitosa aos direitos humanos',
    description: 'A proposta de intervenção é o elemento mais valorizado pela banca. Deve ser detalhada, viável e socialmente responsável.',
    criteria: [
      'Verificar se há proposta explícita de intervenção',
      'Avaliar se apresenta agente (quem irá agir)',
      'Verificar se há ação concreta (o que fazer)',
      'Observar se há modo/meio de execução',
      'Checar se é detalhada e não genérica ("o governo deve...")',
      'Garantir que não viola direitos humanos',
    ],
    scores: [
      { score: 200, label: 'Proposta completa com agente, ação, modo, efeito e detalhamento' },
      { score: 160, label: 'Proposta completa mas com algum elemento pouco desenvolvido' },
      { score: 120, label: 'Proposta relacionada ao tema mas incompleta ou genérica' },
      { score: 80,  label: 'Proposta tangencial, vaga ou desconectada da argumentação' },
      { score: 40,  label: 'Proposta precária, muito vaga ou incompleta' },
      { score: 0,   label: 'Ausência de proposta de intervenção' },
    ],
  },
]

const FEEDBACK_TEMPLATES = [
  {
    title: 'Redação nota 1000 — abertura de parabenização',
    text: 'Parabéns pela excelente redação! Você demonstrou pleno domínio das competências avaliadas pelo ENEM, apresentando uma argumentação consistente, coesão textual fluida e uma proposta de intervenção completa e detalhada.',
  },
  {
    title: 'Fuga ao tema — orientação principal',
    text: 'Atenção: sua redação não abordou o tema proposto conforme exigido. Para o ENEM, é fundamental manter o foco exato no recorte temático da proposta. Recomendo reler o tema com atenção e identificar o problema central antes de começar a escrever.',
  },
  {
    title: 'C5 incompleta — orientação de proposta',
    text: 'Sua proposta de intervenção precisa de mais detalhamento. Certifique-se de incluir: (1) quem deve agir (agente), (2) o que deve ser feito (ação), (3) como será implementado (modo/meio) e (4) qual o efeito esperado. Uma proposta genérica como "o governo deve agir" recebe pontuação baixa na C5.',
  },
  {
    title: 'Desvios de norma culta — orientação de revisão',
    text: 'Foram identificados desvios recorrentes relacionados à [ESPECIFICAR]. Recomendo revisar as regras de concordância nominal/verbal e praticar exercícios focados nesse ponto. Desvios sistemáticos impactam diretamente sua nota na C1.',
  },
  {
    title: 'Boa argumentação mas coesão fraca',
    text: 'Seus argumentos são pertinentes e bem fundamentados, mas a articulação entre as ideias pode melhorar. Trabalhe a variedade de conectivos e garanta que cada parágrafo se conecte logicamente ao anterior. Isso fortalecerá sua C4.',
  },
]

const REFERENCE_LINKS = [
  { label: 'Cartilha do Participante ENEM — MEC',  href: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem' },
  { label: 'Guia de Redação ENEM — Brasil Escola', href: 'https://brasilescola.uol.com.br/redacao/redacao-enem.htm' },
  { label: 'A Redação no ENEM (livro digital MEC)', href: 'https://download.inep.gov.br/publicacoes/institucionais/avaliacoes_e_exames_da_educacao_basica/a_redacao_no_enem_2024_cartilha_do_participante.pdf' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProfessorMateriaisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  const profile = profileRaw as { role: string } | null
  if (!profile || !['admin', 'reviewer'].includes(profile.role)) redirect('/aluno')

  return (
    <div className="max-w-4xl space-y-8">

      {/* ── Header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Materiais de Apoio</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Guias de correção por competência · Rubricas · Modelos de feedback
        </p>
      </div>

      {/* ── Competency guides ─────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList size={14} className="text-amber-400" />
          <h2 className="text-sm font-semibold text-white">Guias de Correção por Competência</h2>
        </div>

        {COMPETENCY_GUIDES.map(comp => (
          <details key={comp.code} className="card-dark rounded-2xl overflow-hidden group">
            <summary className="px-5 py-4 cursor-pointer flex items-center gap-4 hover:bg-white/[0.02] transition-colors list-none">
              <span className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                {comp.code}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{comp.title}</p>
                <p className="text-xs text-gray-600 mt-0.5 truncate">{comp.description}</p>
              </div>
              <span className="text-gray-700 text-xs shrink-0 group-open:rotate-180 transition-transform">▼</span>
            </summary>

            <div className="px-5 pb-5 border-t border-white/[0.06] mt-0 pt-4 space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">{comp.description}</p>

              {/* Criteria */}
              <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">O que observar</p>
                <ul className="space-y-1.5">
                  {comp.criteria.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="text-amber-500/60 shrink-0 mt-0.5">·</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Score table */}
              <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Tabela de pontuação</p>
                <div className="rounded-xl border border-white/[0.07] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-700 uppercase tracking-wider w-16">Nota</th>
                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Critério</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {comp.scores.map(({ score, label }) => (
                        <tr key={score} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-2.5">
                            <span className={`text-xs font-bold tabular-nums ${
                              score >= 180 ? 'text-green-400' :
                              score >= 140 ? 'text-amber-400' :
                              score >= 100 ? 'text-yellow-600' :
                              score >= 60  ? 'text-orange-500' :
                              score >= 20  ? 'text-red-500' :
                                             'text-gray-600'
                            }`}>{score}</span>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-500">{label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>

      {/* ── Feedback templates ────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={14} className="text-blue-400" />
          <h2 className="text-sm font-semibold text-white">Modelos de Feedback</h2>
        </div>
        <div className="space-y-3">
          {FEEDBACK_TEMPLATES.map((t, i) => (
            <div key={i} className="card-dark rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-300 mb-2">{t.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed italic">"{t.text}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tips: nota 1000 essay elements ───────────────────── */}
      <div className="card-dark rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Star size={14} className="text-yellow-400" />
          <h2 className="text-sm font-semibold text-white">Elementos de uma redação nota 1000</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Introdução impactante',         desc: 'Contextualização relevante do problema + tese clara e bem delimitada.' },
            { title: 'Argumentos com repertório',      desc: 'Dados estatísticos, referências culturais, filosóficas ou científicas pertinentes e bem integrados.' },
            { title: 'Coesão entre parágrafos',        desc: 'Conectivos variados, retomadas referenciais e progressão clara das ideias.' },
            { title: 'Proposta de intervenção completa', desc: 'Agente + ação + modo + efeito. Sem generalidades. Vinculada à argumentação desenvolvida.' },
            { title: 'Linguagem formal e precisa',     desc: 'Vocabulário variado, ausência de gírias, norma culta respeitada.' },
            { title: 'Coerência interna total',        desc: 'Tese, argumentos e proposta alinhados ao longo de todo o texto.' },
          ].map(({ title, desc }) => (
            <div key={title} className="flex items-start gap-3 rounded-xl bg-white/[0.025] border border-white/[0.05] p-3.5">
              <Lightbulb size={12} className="text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">{title}</p>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── External references ───────────────────────────────── */}
      <div className="card-dark rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={14} className="text-green-400" />
          <h2 className="text-sm font-semibold text-white">Referências externas</h2>
        </div>
        <ul className="space-y-2.5">
          {REFERENCE_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors group"
              >
                <FileText size={11} className="shrink-0" />
                {label}
                <ExternalLink size={9} className="opacity-50 group-hover:opacity-80 transition-opacity" />
              </a>
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}
