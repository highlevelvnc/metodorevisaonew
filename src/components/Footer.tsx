import Link from 'next/link'
import Image from 'next/image'

const WA_LINK =
  'https://wa.me/5522992682207?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20M%C3%A9todo%20Revis%C3%A3o%20e%20quero%20come%C3%A7ar%20minha%20evolu%C3%A7%C3%A3o%20na%20reda%C3%A7%C3%A3o.'

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-gray-800/50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-5">
              {/* Container crops the PNG whitespace for clean display */}
              <div style={{ position: 'relative', width: '164px', height: '52px', overflow: 'hidden' }}>
                <Image
                  src="/logo.png"
                  alt="Método Revisão"
                  fill
                  sizes="164px"
                  style={{ objectFit: 'cover', objectPosition: '50% 52%' }}
                />
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Correção estratégica de redação para o ENEM. Acompanhamento real, devolutiva por competência e evolução visível a cada redação.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-green-400 transition-colors"
                aria-label="WhatsApp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.424h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a
                href="mailto:revisaometodo@gmail.com"
                className="text-gray-500 hover:text-purple-400 transition-colors"
                aria-label="Email"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 7l10 7 10-7" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Navegação</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/#como-funciona" className="text-gray-500 hover:text-purple-400 transition-colors">Como funciona</Link></li>
              <li><Link href="/#planos" className="text-gray-500 hover:text-purple-400 transition-colors">Planos</Link></li>
              <li><Link href="/#depoimentos" className="text-gray-500 hover:text-purple-400 transition-colors">Resultados</Link></li>
              <li><Link href="/#faq" className="text-gray-500 hover:text-purple-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contato</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-purple-400 transition-colors">WhatsApp</a></li>
              <li><a href="mailto:revisaometodo@gmail.com" className="text-gray-500 hover:text-purple-400 transition-colors">revisaometodo@gmail.com</a></li>
              <li><Link href="/blog" className="text-gray-500 hover:text-purple-400 transition-colors">Blog</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Método Revisão. Todos os direitos reservados.</p>
          <p className="text-gray-700">Correção estratégica de redação para o ENEM</p>
        </div>
      </div>
    </footer>
  )
}
