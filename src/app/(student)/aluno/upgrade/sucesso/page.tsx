import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { AutoRedirect } from './AutoRedirect'

export const metadata = { title: 'Acesso liberado | Método Revisão' }
export const dynamic  = 'force-dynamic'

export default async function SucessoPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams.session_id
  if (!sessionId) redirect('/aluno/upgrade')

  /* ── Stripe verification ─────────────────────────────────────────────────── */
  let planName   = 'Plano'
  let planSlug   = ''
  let essayCount = 0
  let paymentOk  = false

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    })
    paymentOk  = session.payment_status === 'paid'
    planSlug   = (session.metadata?.planSlug as string) ?? ''
    planName   = session.line_items?.data[0]?.description?.replace('Método Revisão — ', '') ?? 'Plano'
    const desc  = session.line_items?.data[0]?.description ?? ''
    const match = desc.match(/^(\d+)\s+redaç/)
    if (match) essayCount = parseInt(match[1])
  } catch (err) {
    console.error('[sucesso] Stripe retrieve failed:', err)
    paymentOk = true // fall-through: webhook may already have activated
  }

  /* ── Subscription check ──────────────────────────────────────────────────── */
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let subscriptionActive = false
  let creditsAvailable   = 0
  let finalPlanName      = planName

  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data: sub } = await db
      .from('subscriptions')
      .select('essays_limit, essays_used, plans(name, essay_count)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sub) {
      subscriptionActive = true
      creditsAvailable   = Math.max(0, sub.essays_limit - sub.essays_used)
      finalPlanName      = sub.plans?.name ?? planName
      if (!essayCount) essayCount = sub.plans?.essay_count ?? 0
    }
  }

  if (!paymentOk) redirect('/aluno/upgrade?cancelado=1')

  return (
    <div className="max-w-lg mx-auto">
      <div className="card-dark rounded-2xl overflow-hidden">

        {/* ── Top accent bar ─────────────────────────────────────────────── */}
        <div className="h-1 bg-gradient-to-r from-purple-600 via-purple-400 to-emerald-500" />

        <div className="p-7 sm:p-8">

          {/* ── Icon + headline ──────────────────────────────────────────── */}
          <div className="text-center mb-7">
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-2xl border border-emerald-500/20 animate-ping opacity-30" />
            </div>

            <h1 className="text-2xl font-extrabold text-white leading-tight mb-2">
              Acesso liberado.<br />
              <span className="bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                Sua evolução começa agora.
              </span>
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              {subscriptionActive
                ? `Você tem ${creditsAvailable} ${creditsAvailable === 1 ? 'crédito' : 'créditos'} disponíveis. Envie sua primeira redação hoje e receba a devolutiva em até 24h.`
                : `Seu plano ${finalPlanName} está sendo ativado. Em instantes seus créditos estarão disponíveis.`
              }
            </p>
          </div>

          {/* ── Activation warning (if webhook pending) ──────────────────── */}
          {!subscriptionActive && (
            <div className="rounded-xl border border-amber-500/[0.15] bg-amber-500/[0.03] px-4 py-3 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-[11px] font-bold text-amber-400">Ativando plano…</p>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Confirmação em até 30 segundos. Se os créditos não aparecerem, recarregue o painel.
              </p>
            </div>
          )}

          {/* ── Plan pill ────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 mb-7">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-600/20 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-purple-400">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Plano {finalPlanName}</p>
                {essayCount > 0 && (
                  <p className="text-[10px] text-gray-600">{essayCount} redações · devolutiva C1–C5</p>
                )}
              </div>
            </div>
            {/* Badge reflects the actual DB state — not just "payment received" */}
            {subscriptionActive ? (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                ✓ Ativo
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full animate-pulse">
                Ativando…
              </span>
            )}
          </div>

          {/* ── What happens next ────────────────────────────────────────── */}
          <div className="mb-7">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
              O que acontece agora
            </p>
            <div className="space-y-2.5">
              {[
                {
                  n: '1',
                  color: 'bg-purple-600',
                  text: 'Envie sua primeira redação — leva menos de 5 minutos',
                  active: true,
                },
                {
                  n: '2',
                  color: 'bg-white/[0.06]',
                  text: 'A especialista lê, analisa e anota em até 24h',
                  active: false,
                },
                {
                  n: '3',
                  color: 'bg-white/[0.06]',
                  text: 'Você recebe o diagnóstico completo e sabe exatamente o que melhorar',
                  active: false,
                },
              ].map((step) => (
                <div key={step.n} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                    step.active ? 'bg-purple-600 text-white' : 'bg-white/[0.06] text-gray-600'
                  }`}>
                    {step.n}
                  </div>
                  <p className={`text-sm leading-snug ${step.active ? 'text-gray-200' : 'text-gray-600'}`}>
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Primary CTA ──────────────────────────────────────────────── */}
          <div className="space-y-3">
            <Link
              href="/aluno/redacoes/nova"
              className="flex items-center justify-center gap-2.5 w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-[15px] py-4 rounded-xl transition-colors shadow-[0_4px_20px_rgba(124,58,237,0.35)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Enviar minha primeira redação
            </Link>
            <Link
              href="/aluno"
              className="flex items-center justify-center gap-2 w-full text-sm text-gray-500 hover:text-white border border-white/[0.07] hover:border-white/[0.15] py-3 rounded-xl transition-all"
            >
              Ver meu painel
            </Link>
          </div>

          {/* ── Countdown ────────────────────────────────────────────────── */}
          {/* When webhook has already confirmed the sub: auto-redirect after 10s.
              When it hasn't landed yet: show a manual "go to dashboard" prompt
              instead of pushing the user to /aluno with stale plan data.       */}
          <AutoRedirect
            planSlug={planSlug || undefined}
            delay={10}
            confirmed={subscriptionActive}
          />
        </div>
      </div>

      {/* ── Footer reassurance ───────────────────────────────────────────────── */}
      <p className="text-center text-xs text-gray-700 mt-5 leading-relaxed">
        Você receberá um e-mail de confirmação do Stripe.
        Dúvidas? Entre em contato pelo chat da plataforma.
      </p>
    </div>
  )
}
