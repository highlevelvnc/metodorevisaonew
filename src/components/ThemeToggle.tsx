'use client'

import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
      className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors
        ${theme === 'dark'
          ? 'bg-white/[0.06] hover:bg-white/[0.10] text-gray-400 hover:text-yellow-300'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700'
        } ${className}`}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
