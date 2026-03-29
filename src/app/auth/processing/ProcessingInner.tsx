'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams }   from 'next/navigation'
import { createClient }                 from '@/lib/supabase/client'

export default function ProcessingInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const next         = searchParams.get('next') ?? '/aluno'

  const [timedOut, setTimedOut] = useState(false)
  const done = useRef(false)

  useEffect(() => {
    const supabase = createClient()

    function redirect(target: string) {
      if (done.current) return
      done.current = true
      router.replace(target)
    }

    // ── Timeout fallback ────────────────────────────────────────────────────
    // If SIGNED_IN never fires within 6 s, the token was invalid/expired.
    const timeout = setTimeout(() => {
      if (!done.current) {
        console.warn('[auth/processing] timed out waiting for SIGNED_IN — redirecting to login error')
        setTimedOut(true)
        redirect('/login?error=link_expirado&next=' + encodeURIComponent(next))
      }
    }, 6000)

    // ── Auth state listener ──────────────────────────────────────────────────
    // createBrowserClient (from @supabase/ssr) auto-detects #access_token in the URL
    // and fires SIGNED_IN here. The session is written to document.cookie by the
    // BrowserCookieAuthStorageAdapter, making it available to server-side requests.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        clearTimeout(timeout)
        console.log('[auth/processing] SIGNED_IN — user=' + session.user.id + ' → ' + next)
        redirect(next)
      }
    })

    // ── Check for existing session immediately ───────────────────────────────
    // Handles the case where the browser client already has a session (e.g. page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        clearTimeout(timeout)
        console.log('[auth/processing] existing session found — user=' + session.user.id)
        redirect(next)
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [next, router])

  if (timedOut) return null

  return (
    <div className="min-h-screen bg-[var(--bg-body)] flex flex-col items-center justify-center gap-3">
      <span
        className="w-5 h-5 border-2 border-t-purple-400 rounded-full animate-spin"
        style={{ borderColor: 'rgba(168,85,247,.25)', borderTopColor: '#a855f7' }}
      />
      <p className="text-sm text-gray-500">Autenticando sua conta…</p>
      <p className="text-xs text-gray-700">Isso leva apenas um segundo.</p>
    </div>
  )
}
