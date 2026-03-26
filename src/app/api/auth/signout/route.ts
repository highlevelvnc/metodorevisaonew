export const runtime = 'nodejs'

import { NextResponse }  from 'next/server'
import { createClient }  from '@/lib/supabase/server'
import { getSiteUrl }    from '@/lib/get-site-url'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const dest = new URL('/login', getSiteUrl())
  console.log(`[signout POST] → ${dest.toString()}`)
  return NextResponse.redirect(dest, { status: 302 })
}

/**
 * GET /api/auth/signout?next=/checkout/evolucao
 * Used by "Usar outra conta" links that can't use a form POST.
 * Validates `next` to prevent open redirect.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawNext  = searchParams.get('next')
  const safePath =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')
      ? rawNext
      : '/login'

  const supabase = await createClient()
  await supabase.auth.signOut()

  const siteUrl = getSiteUrl()
  const dest    = `${siteUrl}${safePath}`
  console.log(`[signout GET] next="${safePath}" → ${dest}`)
  return NextResponse.redirect(dest, { status: 302 })
}
