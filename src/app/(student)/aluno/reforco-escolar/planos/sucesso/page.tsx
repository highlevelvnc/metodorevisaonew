import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { AutoRedirect } from './AutoRedirect'
import { TrackPageView } from '@/components/TrackPageView'

export const metadata = { title: 'Aulas ativadas | Método Revisão' }
export const dynamic  = 'force-dynamic'

export default async function SucessoAulasPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const sp = await searchParams
  const sessionId = sp?.session_id
  if (!sessionId) redirect('/aluno/reforco-escolar/planos')

  /* ── Stripe verification ─────────────────────────────────────────────── */
  let planName    = 'Plano'
  let lessonCount = 0
  let paymentOk   = false

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    })
    paymentOk   = session.payment_status === 'paid'
    planName    = session.line_items?.data[0]?.description?.replace('Método Revisão — ', '') ?? 'Plano'
    const desc  = session.line_items?.data[0]?.description ?? ''
    const match = desc.match(/^(\d+)\s+aula/)
    if (match) lessonCount = parseInt(match[1])
  } catch (err) {
    console.error('[sucesso-aulas] Stripe retrieve failed:', err)
    paymentOk = true
  }

  /* ── Subscription check ──────────────────────────────────────────────── */
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: sub } = await db
    .from('subscriptions')
    .select('id, lessons_used, lessons_limit, plans!inner(name, slug, plan_type)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .eq('plans.plan_type', 'lesson')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const isActive     = !!sub
  const creditsTotal = sub?.lessons_limit ?? lessonCount

  return (
    <div className="max-w-lg mx-auto mt-12 px-4">
      <TrackPageView event="reforco_success_viewed" userId={user.id} metadata={{ plan: sub?.plans?.name ?? planName, credits: creditsTotal }} />
      <div className="card-dark rounded-2xl p-8 text-center">

        {/* Status icon */}
        <div className={`w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center ${
          isActive ? 'bg-green-500/15 border border-green-500/25' : 'bg-purple-500/15 border border-purple-500/25'
        }`}>
          {isActive ? (
            <span className="text-3xl">✓</span>
          ) : (
            <span className="text-2xl animate-pulse">⏳</span>
          )}
        </div>

        {/* Headline */}
        <h1 className="text-xl font-bold text-white mb-2">
          {isActive ? 'Suas aulas foram ativadas!' : 'Pagamento confirmado!'}
        </h1>
        {isActive ? (
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Seu plano {sub?.plans?.name ?? planName} está ativo com {creditsTotal} aulas disponíveis.
          </p>
        ) : (
          <div className="mb-6 space-y-2">
            <p className="text-sm text-gray-400 leading-relaxed">
              Seu pagamento foi processado com sucesso. Estamos ativando seu plano agora.
            </p>
            <div className="rounded-lg bg-blue-500/[0.06] border border-blue-500/20 px-4 py-3 text-left">
              <p className="text-xs text-blue-300 font-medium mb-1">Ativando automaticamente…</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Seus créditos aparecem aqui em até 30 segundos. Não precisa recarregar.
              </p>
            </div>
          </div>
        )}

        {/* Credits card */}
        {isActive && (
          <div className="rounded-xl bg-green-500/[0.06] border border-green-500/20 px-5 py-4 mb-6">
            <p className="text-3xl font-black text-white mb-1">{creditsTotal}</p>
            <p className="text-xs text-gray-500">aulas disponíveis este mês</p>
          </div>
        )}

        {/* Next steps */}
        <div className="text-left space-y-3 mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Próximos passos</p>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-[10px] font-bold text-purple-400 flex-shrink-0 mt-0.5">1</span>
            <p className="text-xs text-gray-400">Acesse seu painel de aulas e clique em "Solicitar aula"</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-[10px] font-bold text-purple-400 flex-shrink-0 mt-0.5">2</span>
            <p className="text-xs text-gray-400">Escolha data, horário e matéria — a professora confirma e envia o link do Meet</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-[10px] font-bold text-purple-400 flex-shrink-0 mt-0.5">3</span>
            <p className="text-xs text-gray-400">Entre na aula via Google Meet e estude com acompanhamento individualizado</p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/aluno/reforco-escolar"
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm w-full justify-center"
        >
          Solicitar minha primeira aula →
        </Link>

        <AutoRedirect isActive={isActive} />
      </div>
    </div>
  )
}
