'use client'
import Link from 'next/link'
import { trackEvent } from '@/components/Analytics'
import type { Post } from '@/lib/blog'

export default function BlogPreview({ posts }: { posts: Post[] }) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="inline-block bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
              Blog
            </div>
            <h2 className="section-title">Conteúdos para você estudar melhor</h2>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-2 text-purple-700 font-semibold text-sm hover:text-purple-900 transition-colors"
          >
            Ver todos os artigos
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 group"
              onClick={() => trackEvent('blog_open', { slug: post.slug })}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-1 rounded-lg">
                  {post.category}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug group-hover:text-purple-700 transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{post.description}</p>
              <div className="mt-4 flex items-center gap-1 text-purple-700 text-sm font-semibold group-hover:gap-2 transition-all">
                Ler artigo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/blog" className="btn-secondary">
            Ver todos os artigos
          </Link>
        </div>
      </div>
    </section>
  )
}
