import type { Metadata, Viewport } from 'next'
import './globals.css'
import Analytics from '@/components/Analytics'

export const metadata: Metadata = {
  metadataBase: new URL('https://metodorevisao.com'),
  title: {
    default: 'Método Revisão | Correção Estratégica de Redação para o ENEM',
    template: '%s | Método Revisão',
  },
  description:
    'Correção estratégica de redação com acompanhamento real. Entenda seus erros, quebre padrões e suba sua nota no ENEM. Especialista humana, devolutiva em até 24h.',
  keywords: [
    'correção de redação enem',
    'correção estratégica redação',
    'acompanhamento redação enem',
    'subir nota redação enem',
    'correção por competência enem',
    'método revisão',
    'redação enem correção humana',
  ],
  authors: [{ name: 'Método Revisão' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://metodorevisao.com',
    siteName: 'Método Revisão',
    title: 'Método Revisão | Correção Estratégica de Redação para o ENEM',
    description: 'Correção estratégica de redação com acompanhamento real. Entenda seus erros, quebre padrões e suba sua nota no ENEM.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Método Revisão — Correção Estratégica de Redação' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Método Revisão | Correção Estratégica de Redação para o ENEM',
    description: 'Correção estratégica com acompanhamento real. Sua nota subindo, redação a redação.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
}

// themeColor must be declared as a separate viewport export (Next.js 14+ requirement)
export const viewport: Viewport = {
  themeColor: '#070c14',
}

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Método Revisão',
  url: 'https://metodorevisao.com',
  description: 'Correção estratégica de redação para o ENEM com acompanhamento real e devolutiva por competência.',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+5522992682207',
    contactType: 'customer service',
    availableLanguage: 'Portuguese',
  },
}

const jsonLdService = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Correção Estratégica de Redação ENEM',
  provider: { '@type': 'Organization', name: 'Método Revisão' },
  description: 'Correção detalhada por competência com acompanhamento contínuo da evolução do aluno.',
  url: 'https://metodorevisao.com',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdService) }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
