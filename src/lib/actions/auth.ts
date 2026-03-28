'use server'

import { createActionClient } from '@/lib/supabase/server-action'
import { redirect }           from 'next/navigation'
import { getSiteUrl }         from '@/lib/get-site-url'
import { trackOncePerUser }   from '@/lib/analytics'

export type AuthState = {
  error?: string
  confirm?: boolean // sinaliza que o e-mail de confirmação foi enviado
  debugInfo?: string // raw error details — only populated in development
} | null

// ─── Sign In ───────────────────────────────────────────────────────────────────
export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email    = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password)
    return { error: 'Preencha e-mail e senha.' }

  const supabase = await createActionClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('invalid') || msg.includes('credentials'))
      return { error: 'E-mail ou senha incorretos.' }
    if (msg.includes('email not confirmed'))
      return { error: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.' }
    return { error: 'Erro ao entrar. Tente novamente.' }
  }

  // Redireciona por role: admin/reviewer → /professor, student → /aluno (ou ?next=)
  const { data: { user } } = await supabase.auth.getUser()

  // Validate the next param — must be a relative path to prevent open redirects
  const rawNext = (formData.get('next') as string | null)?.trim()
  const safePath = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : null

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const role = (profile as { role: string } | null)?.role
    if (role === 'admin' || role === 'reviewer') {
      redirect('/professor')
    }
  }

  redirect(safePath ?? '/aluno')
}

// ─── Sign Up ───────────────────────────────────────────────────────────────────
export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const fullName = (formData.get('full_name') as string)?.trim()
  const email    = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!fullName || fullName.length < 2)
    return { error: 'Informe seu nome completo.' }
  if (!email)
    return { error: 'E-mail obrigatório.' }
  if (!password || password.length < 6)
    return { error: 'A senha precisa ter pelo menos 6 caracteres.' }

  // Thread ?next= through so checkout flows survive email confirmation
  const rawNext  = (formData.get('next') as string | null)?.trim()
  const safeNext = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/aluno'

  const isDev = process.env.NODE_ENV === 'development'

  let supabase
  try {
    supabase = await createActionClient()
  } catch (clientErr) {
    const rawMsg = clientErr instanceof Error ? clientErr.message : String(clientErr)
    console.error('[signUp] ✗ createActionClient() threw:', rawMsg)
    console.error('[signUp]   NEXT_PUBLIC_SUPABASE_URL defined?', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.error('[signUp]   NEXT_PUBLIC_SUPABASE_ANON_KEY defined?', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return {
      error: isDev
        ? `[DEV] createActionClient falhou: ${rawMsg}`
        : 'Erro ao criar conta. Tente novamente.',
      debugInfo: isDev ? rawMsg : undefined,
    }
  }

  console.log('[signUp] → Calling supabase.auth.signUp for:', email)

  let data, error
  try {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        // redirectTo é usado quando email confirmation está ativado
        emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      },
    })
    data = result.data
    error = result.error
  } catch (signUpErr) {
    const rawMsg = signUpErr instanceof Error ? signUpErr.message : String(signUpErr)
    const stack = signUpErr instanceof Error ? signUpErr.stack : undefined
    console.error('[signUp] ✗ supabase.auth.signUp() THREW (not returned error):', rawMsg)
    if (stack) console.error('[signUp]   Stack:', stack)
    return {
      error: isDev
        ? `[DEV] signUp threw: ${rawMsg}`
        : 'Erro ao criar conta. Tente novamente.',
      debugInfo: isDev ? rawMsg : undefined,
    }
  }

  // Log the full response shape for debugging
  console.log('[signUp] ← Response:', JSON.stringify({
    hasError: !!error,
    errorMessage: error?.message ?? null,
    errorStatus: error?.status ?? null,
    hasUser: !!data.user,
    userId: data.user?.id ?? null,
    hasSession: !!data.session,
    identitiesCount: data.user?.identities?.length ?? null,
    userEmail: data.user?.email ?? null,
    confirmedAt: data.user?.confirmed_at ?? null,
  }))

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('already exists'))
      return { error: 'Este e-mail já está cadastrado. Tente entrar.' }
    if (msg.includes('invalid email'))
      return { error: 'E-mail inválido. Verifique o formato.' }
    if (msg.includes('password'))
      return { error: 'Senha muito fraca. Use pelo menos 6 caracteres.' }

    // Full diagnostic log
    console.error('[signUp] ✗ Unhandled Supabase error:', {
      message: error.message,
      status: error.status,
      name: error.name,
    })

    return {
      error: isDev
        ? `[DEV] Supabase error (${error.status ?? 'no status'}): ${error.message}`
        : 'Erro ao criar conta. Tente novamente.',
      debugInfo: isDev ? `${error.status}: ${error.message}` : undefined,
    }
  }

  // Supabase with email confirmation enabled: when signing up with an already-registered
  // email, it returns data.user with identities: [] (no error) to prevent email enumeration.
  // Detect this and show a helpful message instead of a fake "check your email" state.
  if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
    return { error: 'Este e-mail já está cadastrado. Tente entrar.' }
  }

  // Supabase exige confirmação de e-mail → session é null
  if (data.user && !data.session) {
    console.log('[signUp] ✓ Email confirmation required — returning confirm:true')
    return { confirm: true }
  }

  // Sessão ativa: o trigger DB (handle_new_user) cria o perfil automaticamente.
  // Se precisar de fallback manual, rode o schema.sql no Supabase para garantir o trigger.
  if (data.user) {
    console.log('[signUp] ✓ Auto-confirmed — redirecting to', safeNext)
    trackOncePerUser('account_created', data.user.id, { source: 'cadastro' })
  }

  redirect(safeNext)
}

// ─── Reset Password (enviar e-mail) ───────────────────────────────────────────
export async function resetPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()

  if (!email) return { error: 'Informe seu e-mail.' }

  const supabase = await createActionClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/auth/atualizar-senha`,
  })

  // Não revelar se o e-mail existe ou não — sempre retorna "sucesso"
  if (error) {
    console.error('[resetPassword]', error.message)
  }

  return { confirm: true }
}

// ─── Update Password (após clicar no link do e-mail) ──────────────────────────
export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = formData.get('password') as string
  const confirm  = formData.get('confirm') as string

  if (!password || password.length < 6)
    return { error: 'A senha precisa ter pelo menos 6 caracteres.' }
  if (password !== confirm)
    return { error: 'As senhas não coincidem.' }

  const supabase = await createActionClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: 'Erro ao atualizar senha. Solicite um novo link.' }

  // Redirect to the correct area based on role
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    const role = (profile as { role: string } | null)?.role
    if (role === 'admin' || role === 'reviewer') redirect('/professor')
  }

  redirect('/aluno')
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createActionClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ─── Resend email confirmation ────────────────────────────────────────────────
// Called from the login page when the user's confirmation link expired (otp_expired).
// The account exists but is unconfirmed — supabase.auth.resend() sends a fresh email.
//
// `nextPath` is the page the user should land on after confirming (e.g. /checkout/estrategia).
// We pass it as `emailRedirectTo` so the callback keeps the intended destination.
export async function resendConfirmation(
  email: string,
  nextPath?: string,
): Promise<{ error?: string; success?: boolean }> {
  const trimmed = email?.trim().toLowerCase()
  if (!trimmed || !trimmed.includes('@'))
    return { error: 'Informe um e-mail válido.' }

  const supabase = await createActionClient()

  // Build the emailRedirectTo — keep the intended next destination if provided
  const safeNext =
    nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')
      ? nextPath
      : '/aluno'

  const emailRedirectTo = `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(safeNext)}`

  const { error } = await supabase.auth.resend({
    type:  'signup',
    email: trimmed,
    options: { emailRedirectTo },
  })

  if (error) {
    const msg = error.message.toLowerCase()
    console.error('[resendConfirmation]', error.message)

    if (msg.includes('rate limit') || msg.includes('too many'))
      return { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }
    if (msg.includes('already confirmed') || msg.includes('email confirmed'))
      return { error: 'Este e-mail já foi confirmado. Tente fazer login normalmente.' }
    if (msg.includes('user not found') || msg.includes('no user'))
      return { error: 'E-mail não encontrado. Verifique ou crie uma nova conta.' }

    return { error: 'Erro ao reenviar. Tente novamente em instantes.' }
  }

  console.log(`[resendConfirmation] ✓ novo link enviado para ${trimmed} → next=${safeNext}`)
  return { success: true }
}
