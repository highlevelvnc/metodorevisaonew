import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog | Redação ENEM — Método Revisão',
  description:
    'Artigos gratuitos sobre Redação ENEM, estrutura textual, argumentação e técnicas de escrita. Conteúdo especializado do Método Revisão.',
}

export default function BlogPage() {
  const posts = getAllPosts()

  const categories = Array.from(new Set(posts.map((p) => p.category)))

  return (
    <div className="pt-16 min-h-screen bg-[#080d18]">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="border-b border-white/[0.05] py-20 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-purple-700/[0.10] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 bg-purple-500/[0.10] border border-purple-500/20 text-purple-300 text-xs font-bold px-3.5 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            Blog
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Redação ENEM — conteúdo que<br className="hidden sm:block" /> realmente faz diferença
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Artigos escritos por especialistas do Método Revisão sobre estrutura textual,
            argumentação, competências da banca e estratégias para nota 960–1000.
          </p>
        </div>
      </div>

      {/* ── Categories ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 border-b border-white/[0.04]">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-gray-500 mr-1">Categorias:</span>
          {categories.map((cat) => (
            <span
              key={cat}
              className="bg-purple-500/[0.08] border border-purple-500/[0.18] text-purple-300 text-xs font-semibold px-3 py-1 rounded-full"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* ── Posts grid ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group card-dark-hover p-6 flex flex-col focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#080d18]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="bg-purple-500/[0.10] border border-purple-500/[0.18] text-purple-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                  {post.category}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(post.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h2 className="font-bold text-white text-base leading-snug mb-3 group-hover:text-purple-300 transition-colors flex-1">
                {post.title}
              </h2>

              <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-3">
                {post.description}
              </p>

              <div className="flex items-center gap-1.5 text-purple-400 text-sm font-semibold group-hover:gap-2.5 transition-all mt-auto">
                Ler artigo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
