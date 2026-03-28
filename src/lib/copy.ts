/**
 * Centralized marketing & UI copy variants.
 *
 * These are the source-of-truth strings for CTAs, value props,
 * and trial explanations used across the landing page and app.
 *
 * Rules:
 * - All strings must be truthful and match current product behavior
 * - No fake urgency, no fabricated numbers
 * - Keep Portuguese natural and direct
 */

// ── Hero value prop variants ─────────────────────────────────────────────────

export const HERO_HEADLINES = {
  /** Current default */
  default: 'Você não precisa de mais aula de redação. Você precisa entender onde está errando.',
  /** Score-focused */
  score: 'Sua nota de redação não sobe sozinha. Descubra exatamente o que corrigir.',
  /** Method-focused */
  method: 'Um método que mostra seus erros, acompanha seus padrões e faz sua nota subir.',
} as const

export const HERO_SUBHEADLINES = {
  default:
    'A Método Revisão corrige sua redação com estratégia, mostra seus padrões de erro e te acompanha até sua nota subir de verdade. Tudo com uma especialista real, não com inteligência artificial.',
  short:
    'Correção estratégica por especialista humana. Devolutiva completa C1–C5 em até 24h. Acompanhamento real da sua evolução.',
} as const

// ── Trial explanation variants ───────────────────────────────────────────────

export const TRIAL_COPY = {
  /** One-liner for badges/pills */
  badge: '1 correção gratuita',
  /** Short explanation (1 line) */
  short: 'Sua primeira correção é gratuita. Sem cartão, sem compromisso.',
  /** Medium explanation (2-3 lines) */
  medium:
    'Crie sua conta, envie uma redação e receba uma devolutiva completa C1–C5 em até 24h. Sem cartão, sem compromisso. Depois, escolha um plano para continuar evoluindo.',
  /** Post-trial transition */
  postTrial:
    'Agora que você viu sua devolutiva, imagine o que acontece com acompanhamento contínuo. Cada redação seguinte traz uma devolutiva nova — e seus padrões de erro ficam cada vez mais claros.',
  /** For the upgrade page when trial is used */
  upgradePrompt:
    'Agora que você viu como funciona, escolha um plano para receber mais devolutivas e acompanhar sua evolução de verdade.',
} as const

// ── CTA label variants ───────────────────────────────────────────────────────

export const CTA_LABELS = {
  /** Primary: concrete action — enviar + receber */
  sendAndReceive: 'Enviar redação e receber correção grátis',
  /** Short: for tight spaces (mobile floating CTA) */
  sendFree: 'Enviar grátis',
  /** Post-trial: continue evolving */
  continueEvolution: 'Continuar minha evolução',
  /** Upgrade: choose plan */
  choosePlan: 'Escolher meu plano',
  /** Upgrade: make upgrade */
  upgrade: 'Fazer upgrade',
  /** Secondary: how it works */
  howItWorks: 'Como funciona',
} as const

// ── Trust signals ────────────────────────────────────────────────────────────

export const TRUST_SIGNALS = {
  delivery: 'Devolutiva em até 24h',
  human: 'Correção por especialista humana',
  diagnostic: 'Diagnóstico C1–C5 completo',
  noCreditCard: 'Sem cartão, sem compromisso',
  noContract: 'Sem fidelidade. Cancele quando quiser.',
  securePayment: 'Pagamento seguro via Stripe',
} as const

// ── Plan context ─────────────────────────────────────────────────────────────

export const PLAN_CONTEXT = {
  /** Shown below the trial banner on the plans section */
  afterTrial: 'Continue evoluindo com um plano. Quanto mais redações por ciclo, mais rápido sua nota sobe.',
  /** Anchoring line */
  anchoring: 'Uma aula particular de redação custa entre R$80–150 por hora. Aqui você tem acompanhamento o mês todo.',
  /** Confidence note */
  confidence: 'Sem fidelidade. Cancele quando quiser. Sua evolução é o que te mantém.',
} as const
