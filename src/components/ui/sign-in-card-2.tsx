'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Mail, Lock, Eye, EyeClosed, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Inline Input ─────────────────────────────────────────────────────────────

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SignInCardProps {
  /** Called when the user submits — return an error string or null on success */
  onSubmit: (email: string, password: string) => Promise<string | null>
  isLoading?: boolean
  error?: string | null
  /** ?next= path forwarded to signup link */
  nextPath?: string
  /** Extra content rendered above the form card (e.g. OTP-expired block) */
  headerExtra?: React.ReactNode
  isProfessor?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SignInCard({
  onSubmit,
  isLoading: externalLoading,
  error: externalError,
  nextPath = '',
  headerExtra,
  isProfessor = false,
}: SignInCardProps) {
  const [showPassword, setShowPassword]   = useState(false)
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [isLoading, setIsLoading]         = useState(false)
  const [internalError, setInternalError] = useState<string | null>(null)
  const [focusedInput, setFocusedInput]   = useState<string | null>(null)

  // Combine external and internal loading/error
  const loading = externalLoading ?? isLoading
  const error   = externalError ?? internalError

  // 3D card tilt
  const mouseX  = useMotionValue(0)
  const mouseY  = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10])
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    setIsLoading(true)
    setInternalError(null)
    const result = await onSubmit(email, password)
    if (result) {
      setInternalError(result)
      setIsLoading(false)
    }
    // On success the parent redirects — component unmounts
  }

  const signupHref = nextPath
    ? `/cadastro?next=${encodeURIComponent(nextPath)}`
    : '/cadastro'

  return (
    <div className="w-full max-w-sm relative z-10">
      {/* Ambient glow behind the card */}
      <div className="absolute -inset-x-20 -top-20 h-40 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute -inset-x-16 -bottom-16 h-32 bg-purple-500/15 blur-[60px] rounded-full pointer-events-none" />

      {/* OTP / extra header block */}
      {headerExtra && <div className="mb-4">{headerExtra}</div>}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="relative group">
            {/* Animated card glow pulse */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
              animate={{
                boxShadow: [
                  '0 0 10px 2px rgba(255,255,255,0.03)',
                  '0 0 15px 5px rgba(255,255,255,0.05)',
                  '0 0 10px 2px rgba(255,255,255,0.03)',
                ],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
            />

            {/* ── Traveling border beams ───────────────────────────────────── */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
              {/* Top beam */}
              <motion.div
                className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ left: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3], filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'] }}
                transition={{ left: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror' }, filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror' } }}
              />
              {/* Right beam */}
              <motion.div
                className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent"
                animate={{ top: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3], filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'] }}
                transition={{ top: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 0.6 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 0.6 }, filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay: 0.6 } }}
              />
              {/* Bottom beam */}
              <motion.div
                className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ right: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3], filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'] }}
                transition={{ right: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 1.2 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 1.2 }, filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay: 1.2 } }}
              />
              {/* Left beam */}
              <motion.div
                className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent"
                animate={{ bottom: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3], filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'] }}
                transition={{ bottom: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 1.8 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 1.8 }, filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay: 1.8 } }}
              />

              {/* Corner glows */}
              {[
                { className: 'top-0 left-0',     size: 'h-[5px] w-[5px]', delay: 0,   opacity: 'bg-white/40' },
                { className: 'top-0 right-0',    size: 'h-[8px] w-[8px]', delay: 0.5, opacity: 'bg-white/60' },
                { className: 'bottom-0 right-0', size: 'h-[8px] w-[8px]', delay: 1,   opacity: 'bg-white/60' },
                { className: 'bottom-0 left-0',  size: 'h-[5px] w-[5px]', delay: 1.5, opacity: 'bg-white/40' },
              ].map((c, i) => (
                <motion.div
                  key={i}
                  className={`absolute ${c.className} ${c.size} rounded-full ${c.opacity} blur-[1px]`}
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2 + i * 0.1, repeat: Infinity, repeatType: 'mirror', delay: c.delay }}
                />
              ))}
            </div>

            {/* Border hover glow */}
            <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-white/3 via-white/7 to-white/3 opacity-0 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none" />

            {/* ── Glass card ───────────────────────────────────────────────── */}
            <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl overflow-hidden">
              {/* Subtle grid texture */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)',
                  backgroundSize: '30px 30px',
                }}
              />

              {/* ── Header ─────────────────────────────────────────────────── */}
              <div className="text-center space-y-1 mb-5">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className="mx-auto w-10 h-10 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden"
                >
                  <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                    M
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
                >
                  {isProfessor ? 'Área do Professor' : 'Bem-vindo de volta'}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/60 text-xs"
                >
                  {isProfessor
                    ? 'Acesse o painel para corrigir redações'
                    : 'Acesse sua conta Método Revisão'}
                </motion.p>
              </div>

              {/* ── Form ───────────────────────────────────────────────────── */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Hidden next field */}
                <input type="hidden" name="next" value={nextPath} />

                {/* Error display */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {/* Email */}
                  <motion.div
                    className={`relative ${focusedInput === 'email' ? 'z-10' : ''}`}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Mail
                        className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                          focusedInput === 'email' ? 'text-white' : 'text-white/40'
                        }`}
                      />
                      <Input
                        type="email"
                        name="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                        disabled={loading}
                        required
                        autoComplete="email"
                        className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                      />
                      {focusedInput === 'email' && (
                        <motion.div
                          layoutId="input-highlight"
                          className="absolute inset-0 bg-white/5 -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    className={`relative ${focusedInput === 'password' ? 'z-10' : ''}`}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Lock
                        className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                          focusedInput === 'password' ? 'text-white' : 'text-white/40'
                        }`}
                      />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        disabled={loading}
                        required
                        autoComplete="current-password"
                        className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 cursor-pointer"
                      >
                        {showPassword ? (
                          <Eye className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                        ) : (
                          <EyeClosed className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                        )}
                      </button>
                      {focusedInput === 'password' && (
                        <motion.div
                          layoutId="input-highlight"
                          className="absolute inset-0 bg-white/5 -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Forgot password */}
                <div className="flex justify-end pt-0.5">
                  <Link
                    href="/esqueci-senha"
                    className="text-xs text-white/60 hover:text-white transition-colors duration-200"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>

                {/* Submit button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full relative group/button mt-1"
                >
                  <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                  <div className="relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                    {/* Shimmer while loading */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
                      style={{ opacity: loading ? 1 : 0, transition: 'opacity 0.3s ease' }}
                    />
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center"
                        >
                          <div className="w-4 h-4 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-1 text-sm font-medium"
                        >
                          Entrar
                          <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>

                {/* Divider */}
                <div className="relative flex items-center mt-2 mb-1">
                  <div className="flex-grow border-t border-white/5" />
                  <motion.span
                    className="mx-3 text-xs text-white/40"
                    animate={{ opacity: [0.7, 0.9, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    ou
                  </motion.span>
                  <div className="flex-grow border-t border-white/5" />
                </div>

                {/* Sign up link */}
                <motion.p
                  className="text-center text-xs text-white/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {isProfessor ? (
                    <>
                      Acesso restrito a professores cadastrados.{' '}
                      <Link href="/login" className="text-white/70 hover:text-white transition-colors font-medium underline underline-offset-2">
                        Entrar como aluno
                      </Link>
                    </>
                  ) : (
                    <>
                      Não tem conta?{' '}
                      <Link href={signupHref} className="relative inline-block group/signup">
                        <span className="relative z-10 text-white group-hover/signup:text-white/70 transition-colors duration-300 font-medium">
                          Criar conta grátis
                        </span>
                        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover/signup:w-full transition-all duration-300" />
                      </Link>
                    </>
                  )}
                </motion.p>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
