import Link from 'next/link'
import { ArrowRight, MessageCircle, PenLine, CheckCircle2, Sparkles, Zap, Clock, Target } from 'lucide-react'

interface OnboardingDashboardProps {
  firstName: string
  planName: string
  creditsLeft: number
}

const DEFAULT_THEME = 'Os desafios da inclusão digital no Brasil'
const DEFAULT_THEME_URL = `/aluno/redacoes/nova?tema_livre=${encodeURIComponent(DEFAULT_THEME)}`

const STARTER_THEMES = [
  { title: 'Os desafios da inclusão digital no Brasil', link: `/aluno/redacoes/nova?tema_livre=${encodeURIComponent('Os desafios da inclusão digital no Brasil')}` },
  { title: 'A violência contra a mulher e os direitos humanos', link: `/aluno/redacoes/nova?tema_livre=${encodeURIComponent('A violência contra a mulher e os direitos humanos')}` },
  { title: 'Desigualdade social no Brasil: causas e caminhos', link: `/aluno/redacoes/nova?tema_livre=${encodeURIComponent('Desigualdade social no Brasil: causas e caminhos')}` },
]

export function OnboardingDashboard({ firstName, planName, creditsLeft }: OnboardingDashboardProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Primary CTA Hero — single focus: submit first essay ────────────── */}
      <div className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-gradient-to-br from-purple-950/50 via-[#0b1121] to-blue-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.12),transparent_60%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

        <div className="relative px-8 py-10 sm:px-10 sm:py-12 text-center">
          {/* Plan badge */}
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 mb-6">
            <Zap size={10} />
            {planName}
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
            Vamos começar sua primeira redação
          </h1>
          <p className="text-gray-400 max-w-md mx-auto leading-relaxed mb-4">
            Leva menos de 2 minutos para enviar. Você recebe uma devolutiva
            detalhada com nota C1–C5 em até 24h.
          </p>

          {/* Credits available */}
          {creditsLeft > 0 && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/[0.06] px-4 py-2 mb-8">
              <CheckCircle2 size={13} className="text-green-400" />
              <span className="text-sm text-green-300 font-medium">
                {creditsLeft} correção{creditsLeft !== 1 ? 'ões' : ''} disponível{creditsLeft !== 1 ? 'is' : ''}
              </span>
            </div>
          )}

          {/* Single dominant CTA */}
          <div className="flex flex-col items-center gap-3">
            <Link
              href={DEFAULT_THEME_URL}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-base transition-all shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <PenLine size={18} />
              Enviar primeira redação
              <ArrowRight size={16} />
            </Link>
            <p className="text-[11px] text-gray-600">
              Tema sugerido: &ldquo;{DEFAULT_THEME}&rdquo; — você pode mudar depois
            </p>
          </div>
        </div>
      </div>

      {/* ── How it works — compact 3-step ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { n: '1', label: 'Escreva', desc: 'Sua redação com tema escolhido', icon: PenLine, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { n: '2', label: 'Envie', desc: 'Professora corrige em até 24h', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { n: '3', label: 'Evolua', desc: 'Devolutiva C1–C5 com feedback', icon: Target, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
        ].map((step) => (
          <div key={step.n} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-center">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mx-auto mb-3 ${step.bg}`}>
              <step.icon size={15} className={step.color} />
            </div>
            <p className="text-sm font-semibold text-white mb-0.5">{step.label}</p>
            <p className="text-[11px] text-gray-600 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Quick theme selection — one-click to submission ────────────────── */}
      <div className="card-dark rounded-2xl p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-3">
          Ou escolha um tema diferente
        </p>
        <div className="space-y-2 mb-3">
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
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.06] text-xs font-semibold transition-all"
        >
          <PenLine size={12} />
          Usar meu próprio tema
        </Link>
      </div>

      {/* ── Biia — compact nudge ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-purple-500/15 bg-purple-950/20 p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white mb-0.5">Tem dúvidas antes de escrever?</p>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            A Biia te ajuda com estrutura, repertório e proposta de intervenção.
          </p>
        </div>
        <Link
          href="/aluno/biia"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-purple-500/25 text-purple-300 hover:bg-purple-600/20 text-xs font-semibold transition-all"
        >
          <MessageCircle size={12} />
          Falar com Biia
        </Link>
      </div>

    </div>
  )
}
