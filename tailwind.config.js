/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#581c87',
          950: '#3b0764',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple':    '0 0 60px rgba(124, 58, 237, 0.30)',
        'glow-purple-sm': '0 0 24px rgba(124, 58, 237, 0.20)',
        'glow-purple-xs': '0 0 12px rgba(124, 58, 237, 0.15)',
        'card-dark':      '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset',
        'card-hover':     '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.25)',
        'btn-primary':    '0 4px 20px rgba(124, 58, 237, 0.35)',
        'btn-primary-lg': '0 6px 30px rgba(124, 58, 237, 0.40)',
      },
      animation: {
        'fade-in':    'fadeIn 0.7s ease-out forwards',
        'slide-up':   'slideUp 0.7s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':      'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity:'0' }, '100%': { opacity:'1' } },
        slideUp:   { '0%': { opacity:'0', transform:'translateY(24px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        float:     { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-10px)' } },
        glowPulse: { '0%,100%': { boxShadow:'0 0 20px rgba(124,58,237,0.2)' }, '50%': { boxShadow:'0 0 40px rgba(124,58,237,0.45)' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
