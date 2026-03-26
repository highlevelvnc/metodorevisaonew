import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── Dev bypass ───────────────────────────────────────────────────────────────
// Em desenvolvimento local, o middleware de autenticação é desativado para
// permitir inspeção visual das rotas sem precisar de sessão ativa.
// Em PRODUÇÃO isso nunca ativa: Next.js sempre define NODE_ENV='production'
// durante `next build` / `next start`, portanto o bypass é automaticamente
// desligado — não é necessário nenhuma alteração antes do deploy.
const DEV_BYPASS_AUTH = process.env.NODE_ENV === 'development'
// ─────────────────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  // Passa direto sem verificar sessão em desenvolvimento
  if (DEV_BYPASS_AUTH) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — obrigatório para Server Components lerem o estado de auth
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── /aluno/* → precisa estar autenticado ──────────────────────────────────
  if (pathname.startsWith('/aluno')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── /admin/* → precisa estar autenticado + ter role admin/reviewer ─────────
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'reviewer')) {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/aluno'
      return NextResponse.redirect(dashboardUrl)
    }
  }

  // ── /login, /cadastro → redireciona se já estiver logado ──────────────────
  if (pathname === '/login' || pathname === '/cadastro') {
    if (user) {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/aluno'
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)).*)',
  ],
}
