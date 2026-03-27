import Link from 'next/link'
import { ArrowRight, BookOpen, MessageCircle, PenLine, CheckCircle2, Target, Sparkles, Zap } from 'lucide-react'

interface OnboardingDashboardProps {
  firstName: string
  planName: string
  creditsLeft: number
}

const STEPS = [
  {
    num: '01',
    label: 'Escolha um tema',
    desc: 'Explore a biblioteca ou use um tema livre',
    href: '/aluno/temas',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    num: '02',
    label: 'Escreva sua redação',
    desc: 'Dissertação argumentativa de até 30 linhas',
    href: '/aluno/redacoes/nova',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    num: '03',
    label: 'Envie para correção',
    desc: 'Professor especialista avalia em até 24h',
    href: '/aluno/redacoes/nova',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    num: '04',
    label: 'Receba sua devolutiva',
    desc: 'Nota C1–C5 + feedback detalhado por parágrafo',
    href: '/aluno/redacoes',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
]

const FEATURE_CARDS = [
  {
    icon: Target,
    title: 'Correção C1–C5',
    desc: 'Cada redação é avaliada nas 5 competências do ENEM com feedback específico por parágrafo.',
    color: 'text-purple-400',
    iconBg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: Sparkles,
    title: 'Biia AI — tutora pessoal',
    desc: 'Tire dúvidas, peça repertório, analise trechos e planeje seus estudos com inteligência artificial.',
    color: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: BookOpen,
    title: 'Clube do Livro',
    desc: 'Repertório curado de obras e como usá-las estrategicamente em cada competência.',
    color: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Zap,
    title: 'Evolução visível',
    desc: 'Acompanhe sua nota média e evolução por competência a cada redação enviada.',
    color: 'text-green-400',
    iconBg: 'bg-green-500/10 border-green-500/20',
  },
]

const STARTER_THEMES = [
  { title: 'Os desafios da inclusão digital no Brasil', link: '/aluno/redacoes/nova?tema_livre=Os+desafios+da+inclus%C3%A3o+digital+no+Brasil' },
  { title: 'A violência contra a mulher e os direitos humanos', link: '/aluno/redacoes/nova?tema_livre=A+viol%C3%AAncia+contra+a+mulher+e+os+direitos+humanos' },
  { title: 'Desigualdade social no Brasil: causas e caminhos', link: '/aluno/redacoes/nova?tema_livre=Desigualdade+social+no+Brasil%3A+causas+e+caminhos' },
]

export function OnboardingDashboard({ firstName, planName, creditsLeft }: OnboardingDashboardProps) {
  return (
    <div className="max-w-6xl space-y-8">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.07] bg-gradient-to-br from-purple-950/40 via-[#0b1121] to-blue-950/20 p-8 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.08),transparent_60%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Bem-vindo ao Método Revisão</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Olá, {firstName}! 👋
              </h1>
              <p className="text-gray-400 mt-2 max-w-md leading-relaxed">
                Você está a uma redação de distância de entender exatamente onde melhorar.
                Vamos começar?
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300">
              <Zap size={10} />
              {planName}
            </span>
          </div>

          {/* Credits available */}
          <div className="inline-flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/[0.06] px-4 py-2 mb-8">
            <CheckCircle2 size={13} className="text-green-400" />
            <span className="text-sm text-green-300 font-medium">
              {creditsLeft > 0
                ? `${creditsLeft} correção${creditsLeft !== 1 ? 'ões' : ''} disponível${creditsLeft !== 1 ? 'is' : ''} no seu plano`
                : 'Comece sua jornada de redação hoje'}
            </span>
          </div>

          {/* Main CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/aluno/redacoes/nova"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shadow-[0_0_20px_rgba(139,92,246,0.25)]"
            >
              <PenLine size={15} />
              Enviar primeira redação
            </Link>
            <Link
              href="/aluno/temas"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/[0.12] hover:border-white/[0.22] text-gray-300 hover:text-white font-semibold text-sm transition-colors"
            >
              <BookOpen size={15} />
              Explorar temas
            </Link>
            <Link
              href="/aluno/biia"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-purple-500/20 hover:border-purple-500/40 text-purple-300 hover:text-purple-200 font-semibold text-sm transition-colors"
            >
              <MessageCircle size={15} />
              Falar com a Biia
            </Link>
          </div>
        </div>
      </div>

      {/* ── Quick start ──────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4 px-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
            Como funciona
          </p>
          <div className="flex-1 h-px bg-white/[0.05]" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map((step) => (
            <Link
              key={step.num}
              href={step.href}
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] p-4 transition-all flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold ${step.color} tabular-nums`}>{step.num}</span>
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${step.bg}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-0.5">{step.label}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
              <ArrowRight
                size={12}
                className="text-gray-700 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all mt-auto"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Two-column: starter themes + Biia suggestion ─────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Suggested starter themes */}
        <div className="card-dark rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">Temas para começar</p>
              <p className="text-sm font-semibold text-white mt-0.5">Escolhidos para a primeira redação</p>
            </div>
            <Link
              href="/aluno/temas"
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1"
            >
              Ver todos <ArrowRight size={10} />
            </Link>
          </div>
          <div className="space-y-2">
            {STARTER_THEMES.map((t) => (
              <Link
                key={t.title}
                href={t.link}
                className="group flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/[0.06] hover:border-purple-500/25 hover:bg-purple-500/[0.04] transition-all"
              >
                <p className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors leading-snug">
                  {t.title}
                </p>
                <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-medium text-purple-400 whitespace-nowrap">
                  <PenLine size={10} />
                  Escrever
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/aluno/redacoes/nova"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-purple-600/15 border border-purple-500/25 text-purple-300 hover:bg-purple-600/25 text-xs font-semibold transition-all"
          >
            <PenLine size={12} />
            Usar tema livre
          </Link>
        </div>

        {/* First Biia suggestion */}
        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/30 to-[#0b1121] p-5 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/25 flex items-center justify-center">
              <Sparkles size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Biia AI</p>
              <p className="text-[11px] text-green-400">Online · tutora de redação</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 mb-4 flex-1">
            <p className="text-[13px] text-gray-300 leading-relaxed">
              <span className="text-purple-300 font-semibold">Oi, {firstName}!</span> Sou a Biia, sua tutora de redação.
              Posso te ajudar com repertório, estrutura, proposta de intervenção ou qualquer dúvida sobre o ENEM.{' '}
              <span className="text-gray-400">Pode perguntar à vontade — estou aqui para acelerar seu progresso.</span>
            </p>
          </div>
          <div className="space-y-2 mb-4">
            {[
              'Como estruturar minha introdução?',
              'Qual tema devo praticar primeiro?',
              'O que é proposta de intervenção?',
            ].map((q) => (
              <Link
                key={q}
                href={`/aluno/biia?prompt=${encodeURIComponent(q)}`}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-purple-300 transition-colors"
              >
                <ChevronRightIcon />
                {q}
              </Link>
            ))}
          </div>
          <Link
            href="/aluno/biia"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 text-xs font-semibold transition-all"
          >
            <MessageCircle size={12} />
            Abrir chat com a Biia
          </Link>
        </div>
      </div>

      {/* ── What you'll get ───────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4 px-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
            O que você tem disponível
          </p>
          <div className="flex-1 h-px bg-white/[0.05]" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURE_CARDS.map(({ icon: Icon, title, desc, color, iconBg }) => (
            <div key={title} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-3 ${iconBg}`}>
                <Icon size={14} className={color} />
              </div>
              <p className="text-sm font-semibold text-white mb-1">{title}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

// Inline micro-icon to avoid lucide import for this
function ChevronRightIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-gray-700">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
