import Link from 'next/link'

/**
 * Global 404 page — rendered when notFound() is called or a route doesn't exist.
 * Renders inside the root layout (globals.css / Tailwind available).
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070c14] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        {/* Large 404 watermark */}
        <p className="text-8xl font-black tabular-nums mb-6 leading-none"
          style={{ color: 'rgba(255,255,255,0.04)' }}>
          404
        </p>

        <h1 className="text-lg font-bold text-white mb-2">Página não encontrada</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          O endereço que você tentou acessar não existe ou foi movido.
          Verifique o link ou volte ao início.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-600
              text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            Voltar ao início
          </Link>
          <Link
            href="/aluno"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white
              border border-white/[0.08] hover:border-white/[0.18] px-4 py-2.5 rounded-xl
              transition-all"
          >
            Ir para o painel
          </Link>
        </div>
      </div>
    </div>
  )
}
