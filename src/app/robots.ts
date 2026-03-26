import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Private authenticated areas — must not be indexed
        disallow: ['/aluno/', '/admin/', '/api/', '/auth/'],
      },
    ],
    sitemap: 'https://metodorevisao.com/sitemap.xml',
  }
}
