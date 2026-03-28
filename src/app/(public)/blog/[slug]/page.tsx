import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { remark } from 'remark'
import html from 'remark-html'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: ['Beatriz Dias'],
    },
  }
}

export default async function PostPage({ params }: Props) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const processedContent = await remark().use(html).process(post.content)
  const contentHtml = processedContent.toString()

  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: 'Beatriz Dias',
      url: 'https://metodorevisao.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Método Revisão',
      url: 'https://metodorevisao.com',
    },
  }

  return (
    <div className="pt-16 min-h-screen bg-[#080d18]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
          <span className="text-white/20">/</span>
          <Link href="/blog" className="hover:text-purple-400 transition-colors">Blog</Link>
          <span className="text-white/20">/</span>
          <span className="text-gray-400 truncate max-w-[200px]">{post.title}</span>
        </nav>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-purple-500/[0.10] border border-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full">
            {post.category}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(post.date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Content */}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* CTA post */}
        <div className="mt-16 relative rounded-2xl overflow-hidden border border-purple-500/[0.22] p-8 text-center"
          style={{ background: 'linear-gradient(145deg, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0.04) 100%)' }}>
          {/* Top accent */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          <div className="w-12 h-12 rounded-2xl bg-purple-500/[0.12] border border-purple-500/20 flex items-center justify-center mx-auto mb-5">
            <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-white mb-3">
            Quer correção personalizada da sua redação?
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md mx-auto">
            Professoras especializadas no ENEM entregam devolutiva individual em até 24h —
            com diagnóstico por competência (C1–C5) e plano de evolução.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/cadastro"
              className="btn-primary text-sm px-6 py-3"
            >
              Enviar redação e receber correção grátis
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/#planos"
              className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
            >
              Ver todos os planos →
            </Link>
          </div>
        </div>

        {/* Back to blog */}
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="text-purple-400 font-semibold hover:text-purple-300 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Ver todos os artigos
          </Link>
        </div>
      </article>
    </div>
  )
}
