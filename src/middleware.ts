import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware — centralized route protection.
 *
 * Protects /aluno/* and /professor/* routes by checking for a valid Supabase
 * session in cookies. If no session exists, redirects to /login.
 *
 * Also refreshes the Supabase auth token on every request (keeps session alive).
 *
 * This replaces the need for every page to individually call
 * `getUser() → if (!user) redirect('/login')`.
 * Pages may still call getUser() for data-fetching purposes,
 * but the auth gate is handled here.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create a response to potentially modify (set refreshed cookies)
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

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
          // Set cookies on the request (for downstream server components)
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          // Set cookies on the response (for the browser)
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh the auth token (this keeps the session alive and writes fresh cookies)
  const { data: { user } } = await supabase.auth.getUser()

  // ── Protect authenticated routes ──────────────────────────────────────────
  const isProtectedRoute =
    pathname.startsWith('/aluno') ||
    pathname.startsWith('/professor')

  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Redirect authenticated users away from auth pages ─────────────────────
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/cadastro'

  if (isAuthRoute && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/aluno'
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, robots.txt, sitemap.xml (static files)
     * - Public assets (images, videos, fonts)
     * - API routes (handled by their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|rss.xml|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|mp4|woff2?|ttf|eot)$|api/).*)',
  ],
}
