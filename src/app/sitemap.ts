import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()

  const blogUrls = posts.map((post) => ({
    url: `https://metodorevisao.com/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    { url: 'https://metodorevisao.com', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://metodorevisao.com/blog', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://metodorevisao.com/aulas-de-portugues-online', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://metodorevisao.com/aulas-de-ingles-online', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://metodorevisao.com/redacao-enem', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://metodorevisao.com/reforco-escolar', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    ...blogUrls,
  ]
}
