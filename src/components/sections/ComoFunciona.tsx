'use client'
import { useState } from 'react'
import { BookOpen, PenLine, Send, Star, Sparkles, TrendingUp } from 'lucide-react'
import { trackEvent } from '@/components/Analytics'
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline'

const WA_LINK =
  'https://wa.me/5522992682207?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20M%C3%A9todo%20Revis%C3%A3o%20e%20quero%20come%C3%A7ar%20minha%20evolu%C3%A7%C3%A3o%20na%20reda%C3%A7%C3%A3o.'

const steps = [
  {
    n: '01',
    title: 'Escreva',
    desc: 'Você escolhe um tema (ou recebe nossa proposta) e escreve no seu ritmo.',
    color: 'text-purple-400',
    bg: 'bg-purple-600/10 border-purple-500/20',
  },
  {
    n: '02',
    title: 'Envie',
    desc: 'Manda pelo canal exclusivo. Sem plataforma complicada, sem burocracia.',
    color: 'text-violet-400',
    bg: 'bg-violet-600/10 border-violet-500/20',
  },
  {
    n: '03',
    title: 'Receba a devolutiva',
    desc: 'Em até 24h: nota por competência, anotações no texto e diagnóstico dos seus padrões.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-600/10 border-indigo-500/20',
  },
  {
    n: '04',
    title: 'Evolua',
    desc: 'Cada correção revela um padrão. Cada redação corrige um erro. Sua nota sobe.',
    color: 'text-sky-400',
    bg: 'bg-sky-600/10 border-sky-500/20',
  },
]

// ─── Trust badges above mockup ───────────────────────────────────────────

const trustBadges = [
  {
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    text: 'Especialista humana, não IA',
    color: 'text-purple-400',
    bg: 'bg-purple-500/8 border-purple-500/20',
  },
  {
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    text: 'Anotações em cada parágrafo',
    color: 'text-sky-400',
    bg: 'bg-sky-500/8 border-sky-500/20',
  },
  {
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    text: 'Entregue em até 24h',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/8 border-emerald-500/20',
  },
]

// ─── Correction mockup data ──────────────────────────────────────────────

type SegType = 'normal' | 'error' | 'strong' | 'suggestion'
interface Seg {
  text: string
  type: SegType
  num?: number
}

const introSegs: Seg[] = [
  {
    text: 'A sociedade contemporânea é marcada pela proliferação de plataformas digitais que, segundo dados do IBGE, atingem ',
    type: 'normal',
  },
  { text: '90% dos jovens entre 15 e 29 anos', type: 'strong', num: 2 },
  { text: '. Esse fenômeno ', type: 'normal' },
  { text: 'tem gerado', type: 'error', num: 1 },
  {
    text: ' — como aponta Byung-Chul Han ao discutir a "sociedade do cansaço" — uma fragilização dos vínculos reais, substituídos por relações virtuais efêmeras. ',
    type: 'normal',
  },
  { text: 'Nesse sentido', type: 'suggestion', num: 3 },
  {
    text: ', compete ao Estado e à sociedade civil a criação de mecanismos que resguardem a saúde mental dos cidadãos.',
    type: 'normal',
  },
]

const bodySegs: Seg[] = [
  {
    text: 'Em primeiro lugar, o design persuasivo das redes sociais é estruturado para maximizar o tempo de tela em detrimento do bem-estar. Plataformas como Instagram e TikTok utilizam ',
    type: 'normal',
  },
  { text: 'reforço intermitente variável', type: 'strong', num: 2 },
  {
    text: ' — mecanismo estudado por B.F. Skinner — criando padrões compulsivos de uso. ',
    type: 'normal',
  },
  { text: 'Dessa forma', type: 'suggestion', num: 3 },
  {
    text: ', jovens expostos a esse ambiente desenvolvem quadros de ansiedade e comprometem seu desempenho acadêmico.',
    type: 'normal',
  },
]

const annotations = [
  {
    num: 1,
    badge: 'C1',
    badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    cardClass: 'border-amber-500/20 bg-amber-500/[0.05]',
    dotClass: 'bg-amber-500 text-black',
    title: 'Concordância verbal',
    text: '"Têm gerado" — sujeito plural. Ajuste o verbo para a 3ª pessoa do plural.',
  },
  {
    num: 2,
    badge: 'C2',
    badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    cardClass: 'border-emerald-500/20 bg-emerald-500/[0.05]',
    dotClass: 'bg-emerald-500 text-black',
    title: 'Repertório legitimador',
    text: 'IBGE + Byung-Chul Han bem articulados. Fortalece a credibilidade da introdução.',
  },
  {
    num: 3,
    badge: 'C3',
    badgeClass: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
    cardClass: 'border-purple-500/20 bg-purple-500/[0.05]',
    dotClass: 'bg-purple-500 text-white',
    title: 'Conector repetido (2×)',
    text: 'Alterne com "Diante disso", "Por conseguinte" ou "À vista disso".',
  },
]

const competencias = [
  { label: 'C1', name: 'Norma culta',        score: 160, pct: 80,  bar: 'bg-amber-500',   flag: null },
  { label: 'C2', name: 'Tema e repertório',  score: 200, pct: 100, bar: 'bg-emerald-500',  flag: '★' },
  { label: 'C3', name: 'Argumentação',       score: 120, pct: 60,  bar: 'bg-purple-500',   flag: '↑' },
  { label: 'C4', name: 'Coesão textual',     score: 160, pct: 80,  bar: 'bg-sky-500',      flag: null },
  { label: 'C5', name: 'Proposta',           score: 120, pct: 60,  bar: 'bg-orange-500',   flag: '↑' },
]

// ─── Mobile simplified view data ────────────────────────────────────────

const mobileCards = [
  {
    num: 1,
    type: 'error' as const,
    badge: 'C1 — Correção',
    badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    borderClass: 'border-amber-500/20 bg-amber-500/[0.04]',
    title: 'Concordância verbal identificada',
    text: '"Têm gerado" — sujeito plural exige verbo na 3ª pessoa do plural.',
    icon: '!',
    iconClass: 'bg-amber-500 text-black',
  },
  {
    num: 2,
    type: 'strong' as const,
    badge: 'C2 — Ponto forte',
    badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    borderClass: 'border-emerald-500/20 bg-emerald-500/[0.04]',
    title: 'Repertório legitimador',
    text: 'IBGE + Byung-Chul Han bem articulados. Fortalece a introdução.',
    icon: '★',
    iconClass: 'bg-emerald-500 text-black',
  },
  {
    num: 3,
    type: 'suggestion' as const,
    badge: 'C3 — Sugestão',
    badgeClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    borderClass: 'border-purple-500/20 bg-purple-500/[0.04]',
    title: 'Conector repetido (2×)',
    text: 'Varie com "Diante disso", "Por conseguinte", "À vista disso".',
    icon: '→',
    iconClass: 'bg-purple-500 text-white',
  },
]

// ─── Orbital timeline data (jornada do aluno) ────────────────────────────

const metodoProceso = [
  {
    id: 1,
    title: 'Tema',
    date: 'Passo 1',
    content:
      'Escolha um tema oficial do ENEM, use nossa proposta da semana ou peça à Biia o tema ideal para treinar sua competência mais fraca.',
    category: 'Início',
    icon: BookOpen,
    relatedIds: [2, 6],
    status: 'completed' as const,
    energy: 100,
  },
  {
    id: 2,
    title: 'Escreva',
    date: 'Passo 2',
    content:
      'Redija sua dissertação no seu ritmo. Consulte o banco de repertórios da Biia, os guias de estrutura e a análise prévia de competências.',
    category: 'Redação',
    icon: PenLine,
    relatedIds: [1, 3],
    status: 'completed' as const,
    energy: 90,
  },
  {
    id: 3,
    title: 'Envie',
    date: 'Passo 3',
    content:
      'Submeta sua redação pelo canal exclusivo. Sem plataformas complicadas. A especialista recebe e entra em ação em até 24h.',
    category: 'Envio',
    icon: Send,
    relatedIds: [2, 4],
    status: 'in-progress' as const,
    energy: 75,
  },
  {
    id: 4,
    title: 'Devolutiva',
    date: 'Passo 4',
    content:
      'Em até 24h: nota por competência C1–C5, anotações em cada parágrafo e diagnóstico dos padrões de erro que se repetem.',
    category: 'Correção',
    icon: Star,
    relatedIds: [3, 5],
    status: 'in-progress' as const,
    energy: 60,
  },
  {
    id: 5,
    title: 'Biia',
    date: 'Passo 5',
    content:
      'A Biia analisa seu histórico, identifica padrões de evolução e gera recomendações personalizadas: próximo tema, foco de treino, repertório ideal.',
    category: 'IA',
    icon: Sparkles,
    relatedIds: [4, 6],
    status: 'pending' as const,
    energy: 45,
  },
  {
    id: 6,
    title: 'Evolua',
    date: 'Passo 6',
    content:
      'Cada ciclo eleva sua nota. Acompanhe a evolução por competência no painel de progresso e veja sua nota deixar de estacionar.',
    category: 'Progresso',
    icon: TrendingUp,
    relatedIds: [5, 1],
    status: 'pending' as const,
    energy: 30,
  },
]

// ─── Inline text renderer ────────────────────────────────────────────────

function Seg({ s, idx }: { s: Seg; idx: number }) {
  if (s.type === 'error') {
    return (
      <span key={idx}>
        <mark
          className="bg-amber-500/[0.18] text-amber-100 rounded px-0.5 not-italic"
          style={{ borderBottom: '2px solid rgba(245,158,11,0.7)' }}
        >
          {s.text}
        </mark>
        {s.num != null && (
          <sup
            className="inline-flex items-center justify-center w-[14px] h-[14px] text-[8px] font-extrabold bg-amber-500 text-black rounded-full mx-0.5 relative"
            style={{ top: '-4px' }}
          >
            {s.num}
          </sup>
        )}
      </span>
    )
  }
  if (s.type === 'strong') {
    return (
      <span key={idx}>
        <span
          className="text-emerald-300"
          style={{ borderBottom: '2px dotted rgba(52,211,153,0.55)' }}
        >
          {s.text}
        </span>
        {s.num != null && (
          <sup
            className="inline-flex items-center justify-center w-[14px] h-[14px] text-[8px] font-extrabold bg-emerald-500 text-black rounded-full mx-0.5 relative"
            style={{ top: '-4px' }}
          >
            {s.num}
          </sup>
        )}
      </span>
    )
  }
  if (s.type === 'suggestion') {
    return (
      <span key={idx}>
        <span
          className="text-purple-300"
          style={{ borderBottom: '2px dashed rgba(167,139,250,0.55)' }}
        >
          {s.text}
        </span>
        {s.num != null && (
          <sup
            className="inline-flex items-center justify-center w-[14px] h-[14px] text-[8px] font-extrabold bg-purple-500 text-white rounded-full mx-0.5 relative"
            style={{ top: '-4px' }}
          >
            {s.num}
          </sup>
        )}
      </span>
    )
  }
  return <span key={idx}>{s.text}</span>
}

// ─── Main component ──────────────────────────────────────────────────────

export default function ComoFunciona() {
  const [activeTab, setActiveTab] = useState<'processo' | 'orbital'>('processo')

  return (
    <section
      id="como-funciona"
      className="section-padding relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.01)' }}
    >
      {/* Ambient glows */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-purple-700/8 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-700/5 rounded-full blur-3xl pointer-events-none" />

      <div className="section-container relative">

        {/* ── Header ──────────────────────────────────── */}
        <div className="text-center mb-14">
          <div className="section-label justify-center">Como funciona na prática</div>

          {/* Improved title — shows the 3-step transformation */}
          <h2 className="section-title mb-4">
            Você escreve.{' '}
            <span className="gradient-text">A especialista lê cada linha.</span>
            <br className="hidden sm:block" />
            {' '}Sua nota deixa de estacionar.
          </h2>

          {/* Stronger subtitle — names the differentiators */}
          <p className="section-subtitle mx-auto max-w-2xl">
            Cada redação volta com anotações reais, nota por competência e orientação
            específica para a próxima. <span className="text-white/70 font-medium">Sem IA. Sem resposta genérica.</span>
          </p>
        </div>

        {/* ── Tab bar ──────────────────────────────────── */}
        <div className="flex items-center justify-center gap-1.5 mb-10">
          {([
            { key: 'processo', label: 'Como funciona' },
            { key: 'orbital',  label: 'Explicação de processos' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-purple-700/20 border-purple-500/30 text-purple-300'
                  : 'border-white/[0.07] text-gray-500 hover:text-gray-300 hover:border-white/[0.14] hover:bg-white/[0.03]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Orbital timeline tab ─────────────────────── */}
        {activeTab === 'orbital' && (
          <div className="rounded-2xl overflow-hidden border border-white/[0.07]" style={{ height: '680px' }}>
            {/* Hint bar above the orbital */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
              <p className="text-xs text-gray-600">
                Clique em qualquer nó para ver os detalhes de cada etapa · Clique no fundo para resetar
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-[11px] text-purple-400 font-medium">Jornada do Aluno</span>
              </div>
            </div>
            <div style={{ height: 'calc(680px - 41px)' }}>
              <RadialOrbitalTimeline timelineData={metodoProceso} />
            </div>
          </div>
        )}

        {/* ── Two-column grid (Como funciona tab) ─────── */}
        {activeTab === 'processo' && (
        <div className="grid lg:grid-cols-[2fr_3fr] gap-12 lg:gap-14 items-start">

          {/* Left: steps + CTA */}
          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={s.n} className="flex gap-5 group">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center font-extrabold text-sm flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${s.bg} ${s.color}`}
                  >
                    {s.n}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 mt-2 bg-gradient-to-b from-white/10 to-transparent min-h-[1.5rem]" />
                  )}
                </div>
                <div className={`pb-2 ${i < steps.length - 1 ? 'mb-0' : ''}`}>
                  <h3 className={`font-bold text-base mb-1 ${s.color}`}>{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}

            {/* Quote */}
            <div className="pt-4">
              <div className="inline-block bg-purple-600/[0.08] border border-purple-500/20 rounded-xl px-5 py-4 mb-6">
                <p className="text-purple-300 text-base font-semibold italic">
                  &ldquo;Correção não é só nota. É direção.&rdquo;
                </p>
              </div>

              {/* Primary CTA — positioned right after process is understood */}
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                onClick={() => trackEvent('cta_click', { source: 'como-funciona-primary' })}
              >
                Quero começar minha evolução
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>

              {/* Trust micro-copy below CTA */}
              <p className="text-xs text-gray-700 mt-3">
                Sem fidelidade · Cancele quando quiser · Devolutiva em até 24h
              </p>
            </div>
          </div>

          {/* Right: mockup column */}
          <div className="flex flex-col gap-4">

            {/* ── Contextual framing above mockup ─────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Downward arrow guides the eye toward the mockup */}
                <div className="w-6 h-6 rounded-full bg-purple-600/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-widest leading-none mb-0.5">Exemplo de devolutiva real</p>
                  <p className="text-sm font-semibold text-gray-300">
                    É assim que a sua próxima redação vai voltar:
                  </p>
                </div>
              </div>
              {/* Trust trio */}
              <div className="flex flex-wrap items-center gap-2">
                {trustBadges.map((b) => (
                  <div
                    key={b.text}
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium rounded-full px-2.5 py-1 border ${b.color} ${b.bg}`}
                  >
                    {b.icon}
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Desktop mockup UI (hidden on mobile) ─── */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Glow */}
                <div className="absolute -inset-4 bg-purple-600/10 rounded-3xl blur-2xl pointer-events-none" />

                <div
                  className="relative rounded-2xl border border-white/[0.09] overflow-hidden"
                  style={{
                    background: 'rgba(8,11,20,0.97)',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset',
                  }}
                >
                  {/* Window chrome */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]"
                    style={{ background: 'rgba(255,255,255,0.025)' }}
                  >
                    <div className="flex gap-1.5 flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-red-500/70" />
                      <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="text-[11px] text-gray-600 bg-white/[0.04] border border-white/[0.07] rounded-md px-4 py-1 truncate max-w-[220px]">
                        metodorevisao.com/devolutiva/14
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] text-emerald-400 font-medium">Entregue em 36h</span>
                    </div>
                  </div>

                  {/* Tab bar */}
                  <div className="flex items-center border-b border-white/[0.06] px-4 gap-1">
                    <button className="text-xs font-semibold text-white border-b-2 border-purple-500 px-3 py-3 -mb-px">
                      Texto Corrigido
                    </button>
                    <button className="text-xs text-gray-600 hover:text-gray-400 px-3 py-3 transition-colors">
                      Competências
                    </button>
                    <button className="text-xs text-gray-600 hover:text-gray-400 px-3 py-3 transition-colors">
                      Histórico
                    </button>
                    <div className="ml-auto flex items-center gap-1.5 py-2">
                      <span className="text-[11px] text-gray-600">Redação</span>
                      <span className="text-[11px] font-bold text-gray-400">#14</span>
                    </div>
                  </div>

                  {/* Two-panel content */}
                  <div className="grid grid-cols-[1fr_188px] divide-x divide-white/[0.06]">

                    {/* Essay text */}
                    <div className="p-5">
                      <div className="text-[11px] text-gray-600 mb-4">
                        Tema:{' '}
                        <span className="text-gray-500">
                          A influência das redes sociais na saúde mental dos jovens brasileiros
                        </span>
                      </div>
                      <div className="space-y-4 mb-5">
                        <p className="text-gray-300 text-[13px] leading-[1.9]">
                          {introSegs.map((s, i) => <Seg key={i} s={s} idx={i} />)}
                        </p>
                        <p className="text-gray-300 text-[13px] leading-[1.9]">
                          {bodySegs.map((s, i) => <Seg key={i} s={s} idx={i} />)}
                        </p>
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pb-4 mb-4 border-b border-white/[0.05]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-2.5 rounded-sm bg-amber-500/20" style={{ borderBottom: '2px solid rgba(245,158,11,0.7)' }} />
                          <span className="text-[11px] text-gray-600">Correção</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-2.5 rounded-sm" style={{ borderBottom: '2px dotted rgba(52,211,153,0.6)' }} />
                          <span className="text-[11px] text-gray-600">Ponto forte</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-2.5 rounded-sm" style={{ borderBottom: '2px dashed rgba(167,139,250,0.6)' }} />
                          <span className="text-[11px] text-gray-600">Sugestão</span>
                        </div>
                      </div>

                      {/* Annotation cards */}
                      <div className="space-y-2">
                        {annotations.map((a) => (
                          <div key={a.num} className={`flex gap-3 rounded-xl border p-3 ${a.cardClass}`}>
                            <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-extrabold ${a.dotClass}`}>
                              {a.num}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 border ${a.badgeClass}`}>
                                  {a.badge}
                                </span>
                                <span className="text-[12px] font-semibold text-white leading-tight">{a.title}</span>
                              </div>
                              <p className="text-[11px] text-gray-500 leading-snug">{a.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scores panel */}
                    <div className="p-4">
                      <div className="text-center pb-4 mb-4 border-b border-white/[0.06]">
                        <div className="text-[11px] text-gray-600 mb-1 tracking-wide uppercase">Nota geral</div>
                        <div className="text-[42px] font-extrabold text-white tabular-nums leading-none mb-1">760</div>
                        <div className="text-[11px] text-gray-600">/ 1000 pontos</div>
                        <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                          <span>↑</span>
                          <span>+80 desde a última</span>
                        </div>
                      </div>
                      <div className="space-y-3 mb-5">
                        {competencias.map((c) => (
                          <div key={c.label}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[10px] font-bold text-gray-500 flex-shrink-0">{c.label}</span>
                                <span className="text-[11px] text-gray-600 truncate">{c.name}</span>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {c.flag && <span className="text-[10px] text-emerald-400 font-bold">{c.flag}</span>}
                                <span className="text-[12px] font-bold text-white tabular-nums">{c.score}</span>
                              </div>
                            </div>
                            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${c.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
                        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2.5">
                          Próxima redação
                        </div>
                        <div className="space-y-2">
                          {[
                            { color: 'bg-purple-500', text: 'Foco em C3 — 2 argumentos distintos' },
                            { color: 'bg-orange-500', text: 'Detalhe a proposta: agente, ação, finalidade' },
                            { color: 'bg-amber-500',  text: 'Revise concordância verbal antes de enviar' },
                          ].map((item) => (
                            <div key={item.text} className="flex items-start gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${item.color} mt-[5px] flex-shrink-0`} />
                              <span className="text-[11px] text-gray-500 leading-snug">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Mobile simplified view (visible only below lg) ── */}
            <div className="lg:hidden space-y-3">

              {/* Score card */}
              <div
                className="rounded-2xl border border-white/[0.09] overflow-hidden"
                style={{ background: 'rgba(8,11,20,0.97)' }}
              >
                {/* Mini chrome */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.025)' }}>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] text-emerald-400 font-medium">Entregue em 36h · Redação #14</span>
                  </div>
                </div>

                {/* Score row */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[11px] text-gray-600 mb-0.5 uppercase tracking-wide">Nota geral</div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-extrabold text-white tabular-nums leading-none">760</span>
                        <span className="text-sm text-gray-600">/ 1000</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1 mb-2">
                        <span>↑</span><span>+80 pts</span>
                      </div>
                      <div className="text-[11px] text-gray-600">desde a última redação</div>
                    </div>
                  </div>

                  {/* C1-C5 mini bars */}
                  <div className="grid grid-cols-5 gap-2">
                    {competencias.map((c) => (
                      <div key={c.label} className="text-center">
                        <div className="h-16 bg-white/[0.05] rounded-lg overflow-hidden flex flex-col-reverse mb-1.5">
                          <div className={`rounded-lg ${c.bar} transition-all`} style={{ height: `${c.pct}%` }} />
                        </div>
                        <div className="text-[10px] font-bold text-gray-500">{c.label}</div>
                        <div className="text-[11px] font-bold text-white tabular-nums">{c.score}</div>
                        {c.flag && <div className="text-[10px] text-emerald-400">{c.flag}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Annotation cards */}
              <div className="space-y-2">
                {mobileCards.map((card) => (
                  <div key={card.num} className={`rounded-xl border p-4 ${card.borderClass}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-extrabold mt-0.5 ${card.iconClass}`}>
                        {card.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 border ${card.badgeClass}`}>
                            {card.badge}
                          </span>
                          <span className="text-sm font-semibold text-white">{card.title}</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{card.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Proof + secondary CTA (below mockup, both viewports) ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
              <div className="flex items-start gap-3 min-w-0">
                {/* Upward trend icon */}
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  <span className="text-white font-semibold">Lucas</span> foi de{' '}
                  <span className="text-gray-300">580</span> para{' '}
                  <span className="text-emerald-400 font-bold">760 pontos</span>{' '}
                  em 8 semanas com esse processo.
                </p>
              </div>

              {/* Secondary CTA — converts after visual proof */}
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-bold text-white bg-purple-700/60 hover:bg-purple-600/80 border border-purple-500/50 hover:border-purple-400/70 rounded-xl px-5 py-3 transition-all duration-200 whitespace-nowrap hover:shadow-btn-primary hover:-translate-y-px active:scale-[0.98]"
                onClick={() => trackEvent('cta_click', { source: 'como-funciona-secondary' })}
              >
                Quero minha primeira devolutiva
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

          </div>
        </div>
        )} {/* end activeTab === 'processo' */}

      </div>
    </section>
  )
}
