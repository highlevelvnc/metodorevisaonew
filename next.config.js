/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Prevent clickjacking — never embed the app in an iframe
  { key: 'X-Frame-Options',        value: 'DENY' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Limit referrer info to same-origin; send origin on cross-origin HTTPS
  { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
  // Disable browser features not used by the app
  { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()' },
  // Basic XSS protection for older browsers
  { key: 'X-XSS-Protection',       value: '1; mode=block' },
]

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  experimental: {
    mdxRs: false,
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
