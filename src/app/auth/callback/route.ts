/**
 * Rota de callback do Supabase Auth (PKCE flow).
 *
 * Usada em dois cenários:
 * 1. Confirmação de e-mail após cadastro
 * 2. Redefinição de senha (link enviado por e-mail)
 *
 * O Supabase envia o usuário para esta URL com ?code=xxx.
 * Aqui trocamos o code por uma sessão e redirecionamos para ?next=.
 *
 * Em Supabase Dashboard → Authentication → URL Configuration:
 *   Site URL:      http://localhost:3000
 *   Redirect URLs: http://localhost:3000/auth/callback
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code    = searchParams.get('code')
  const rawNext = searchParams.get('next')
  // Validate next to prevent open redirect — must be a relative path
  const next    = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')
    ? rawNext
    : '/aluno'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirecionar para a página solicitada
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
  }

  // Algo deu errado — volta para login com mensagem
  return NextResponse.redirect(`${origin}/login?error=link_invalido`)
}
