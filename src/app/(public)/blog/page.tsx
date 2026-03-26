import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog | Dicas de Português, Inglês e ENEM',
  description:
    'Artigos gratuitos sobre Português, Inglês, Redação ENEM e técnicas de estudo. Conteúdo da professora Beatriz Dias — Método Revisão.',
}

export default function BlogPage() {
  const posts = getAllPosts()

  const categories = Array.from(new Set(posts.map((p) => p.category)))

  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            Blog
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Conteúdos gratuitos para você estudar melhor
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Dicas práticas de Português, Inglês, Redação ENEM e organização de estudos — escritas pela professora Beatriz Dias.
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-semibold text-gray-500 mr-2 flex items-center">Categorias:</span>
          {categories.map((cat) => (
            <span key={cat} className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Posts grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-1 rounded-lg">
                  {post.category}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(post.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h2 className="font-bold text-gray-900 text-lg mb-3 leading-snug group-hover:text-purple-700 transition-colors">
                {post.title}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{post.description}</p>
              <div className="flex items-center gap-1 text-purple-700 text-sm font-semibold group-hover:gap-2 transition-all">
                Ler artigo
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
