import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** Canonical site URL — mirrors the same resolution order as getSiteUrl() in auth.ts */
function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL)           return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(
    new URL('/login', getSiteUrl()),
    { status: 302 },
  )
}
