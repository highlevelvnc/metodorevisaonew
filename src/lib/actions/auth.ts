'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect }     from 'next/navigation'
import { getSiteUrl }   from '@/lib/get-site-url'

export type AuthState = {
  error?: string
  confirm?: boolean // sinaliza que o e-mail de confirmação foi enviado
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

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('invalid') || msg.includes('credentials'))
      return { error: 'E-mail ou senha incorretos.' }
    if (msg.includes('email not confirmed'))
      return { error: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.' }
    return { error: 'Erro ao entrar. Tente novamente.' }
  }

  // Redireciona por role: admin/reviewer → /admin, student → /aluno (ou ?next=)
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
      redirect('/admin')
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

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      // redirectTo é usado quando email confirmation está ativado
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/aluno`,
    },
  })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('already exists'))
      return { error: 'Este e-mail já está cadastrado. Tente entrar.' }
    if (msg.includes('invalid email'))
      return { error: 'E-mail inválido. Verifique o formato.' }
    if (msg.includes('password'))
      return { error: 'Senha muito fraca. Use pelo menos 6 caracteres.' }
    // Never expose raw Supabase/Postgres errors to the client
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }

  // Supabase exige confirmação de e-mail → session é null
  if (data.user && !data.session) {
    return { confirm: true }
  }

  // Sessão ativa: o trigger DB (handle_new_user) cria o perfil automaticamente.
  // Se precisar de fallback manual, rode o schema.sql no Supabase para garantir o trigger.
  redirect('/aluno')
}

// ─── Reset Password (enviar e-mail) ───────────────────────────────────────────
export async function resetPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()

  if (!email) return { error: 'Informe seu e-mail.' }

  const supabase = await createClient()

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

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: 'Erro ao atualizar senha. Solicite um novo link.' }

  redirect('/aluno')
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
