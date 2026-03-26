import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import UpdatePasswordForm from './UpdatePasswordForm'

export const metadata: Metadata = {
  title: 'Nova senha',
  robots: { index: false, follow: false },
}

export default function AtualizarSenhaPage() {
  return (
    <div className="min-h-screen bg-[#070c14] flex flex-col">
      <header className="py-5 px-6 flex justify-center border-b border-white/[0.04]">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <div style={{ position: 'relative', width: '140px', height: '44px', overflow: 'hidden' }}>
            <Image
              src="/logo.png"
              alt="Método Revisão"
              fill
              sizes="140px"
              style={{ objectFit: 'cover', objectPosition: '50% 52%' }}
              priority
            />
          </div>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <UpdatePasswordForm />
      </main>
    </div>
  )
}
