import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export const metadata = { title: 'Pagamento confirmado | Método Revisão' }

// Disable caching — subscription state must be fresh
export const dynamic = 'force-dynamic'

export default async function SucessoPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams.session_id

  if (!sessionId) redirect('/aluno/upgrade')

  /* ── Verify session with Stripe (server-to-server) ──────────────────────── */
  let planName   = 'Plano'
  let essayCount = 0
  let paymentOk  = false

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    })
    paymentOk  = session.payment_status === 'paid'
    planName   = session.line_items?.data[0]?.description?.replace('Método Revisão — ', '') ?? 'Plano'
    // Extract essay count from the product description if available
    const desc = session.line_items?.data[0]?.description ?? ''
    const match = desc.match(/^(\d+)\s+redaç/)
    if (match) essayCount = parseInt(match[1])
  } catch (err) {
    console.error('[sucesso] Failed to retrieve Stripe session:', err)
    // Fall through — webhook may have already activated; show generic success
    paymentOk = true
  }

  /* ── Check if webhook already activated the subscription ────────────────── */
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
      .select('essays_limit, essays_used, stripe_checkout_session_id, plans(name, essay_count)')
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

  if (!paymentOk) {
    redirect('/aluno/upgrade?cancelado=1')
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="card-dark rounded-2xl p-8 text-center">
        {/* Success icon */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
          <svg
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.5"
            className="text-emerald-400"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Pagamento confirmado!</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {subscriptionActive
            ? `Seu plano ${finalPlanName} está ativo. Você tem ${creditsAvailable} ${creditsAvailable === 1 ? 'crédito disponível' : 'créditos disponíveis'} para usar agora.`
            : `Seu plano ${finalPlanName} está sendo ativado. Em instantes seus créditos estarão disponíveis.`
          }
        </p>

        {/* Plan summary */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 mb-6 text-left">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-white">{finalPlanName}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Ativo
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              {essayCount > 0 ? `${essayCount} redações por ciclo` : 'Redações disponíveis'}
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Devolutiva completa C1–C5
            </div>
          </div>
        </div>

        {/* Activation status */}
        {!subscriptionActive && (
          <div className="rounded-xl border border-amber-500/[0.15] bg-amber-500/[0.03] px-4 py-3 mb-6 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-[11px] font-bold text-amber-400">Ativando plano…</p>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              A confirmação do pagamento leva até 30 segundos. Se seus créditos não aparecerem,
              recarregue a página do painel.
            </p>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href="/aluno/redacoes/nova"
            className="inline-flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Enviar minha primeira redação
          </Link>
          <Link
            href="/aluno"
            className="inline-flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-white border border-white/[0.08] hover:border-white/[0.18] px-4 py-2.5 rounded-xl transition-all"
          >
            Ir para o painel
          </Link>
        </div>
      </div>

      {/* Reassurance */}
      <p className="text-center text-xs text-gray-700 mt-5 leading-relaxed">
        Você receberá um e-mail de confirmação do Stripe.
        Dúvidas? Entre em contato pelo chat da plataforma.
      </p>
    </div>
  )
}
