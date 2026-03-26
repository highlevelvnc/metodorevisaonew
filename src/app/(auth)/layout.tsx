import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070c14] flex flex-col">
      {/* Minimal header */}
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

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer strip */}
      <footer className="py-4 text-center text-xs text-gray-700">
        © {new Date().getFullYear()} Método Revisão
      </footer>
    </div>
  )
}
