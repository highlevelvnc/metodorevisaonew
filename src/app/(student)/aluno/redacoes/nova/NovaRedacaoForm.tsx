'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ImagePlus, X, FileText } from 'lucide-react'
import { submitEssay } from '@/lib/actions/essays'

const MIN_LINES = 7
const MAX_LINES = 30
const MIN_CHARS = 300

function countLines(text: string) {
  if (!text.trim()) return 0
  const hardLines = text.split('\n').filter(l => l.trim()).length
  const charLines = Math.ceil(text.replace(/\n/g, ' ').length / 70)
  return Math.max(hardLines, charLines)
}

type Theme = { id: string; title: string }

type InputMode = 'text' | 'image'

export default function NovaRedacaoForm({
  themes,
  creditsLeft,
}: {
  themes: Theme[]
  creditsLeft: number
}) {
  const router = useRouter()

  // Theme — default to 'free' if no themes are available from the server
  const [themeMode, setThemeMode]           = useState<'list' | 'free'>(themes.length === 0 ? 'free' : 'list')
  const [selectedThemeId, setSelectedThemeId] = useState('')
  const [freeTheme, setFreeTheme]           = useState('')

  // Input mode: typed text or image upload
  const [inputMode, setInputMode]           = useState<InputMode>('text')
  const [content, setContent]               = useState('')
  const [imageFile, setImageFile]           = useState<File | null>(null)
  const [imagePreview, setImagePreview]     = useState<string | null>(null)
  const [notes, setNotes]                   = useState('')

  // UI states
  const [submitting, setSubmitting]         = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const textareaRef                          = useRef<HTMLTextAreaElement>(null)
  const fileInputRef                         = useRef<HTMLInputElement>(null)

  const lines    = countLines(content)
  const linesPct = Math.min((lines / MAX_LINES) * 100, 100)
  const linesColor =
    lines < MIN_LINES ? 'text-gray-500' :
    lines > MAX_LINES ? 'text-red-400'  :
    lines >= 25       ? 'text-green-400': 'text-purple-400'

  const selectedTheme = themes.find(t => t.id === selectedThemeId)
  const themeTitle    = themeMode === 'list' ? (selectedTheme?.title ?? '') : freeTheme.trim()
  const themeOk       = themeTitle.length > 3

  const textOk        = inputMode === 'text'
    ? lines >= MIN_LINES && lines <= MAX_LINES && content.trim().length >= MIN_CHARS
    : imageFile !== null

  const canSubmit = themeOk && textOk && creditsLeft > 0

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!ALLOWED.includes(file.type)) {
      setError('Formato não suportado. Use JPG, PNG, WebP ou PDF.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo de 8 MB.')
      return
    }

    setError(null)
    setImageFile(file)

    if (file.type !== 'application/pdf') {
      const reader = new FileReader()
      reader.onload = ev => setImagePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null) // PDF: show name only
    }
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || submitting) return

    setSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.set('theme_title', themeTitle)
    formData.set('notes', notes)
    formData.set('input_mode', inputMode)
    if (themeMode === 'list' && selectedThemeId) {
      formData.set('theme_id', selectedThemeId)
    }

    if (inputMode === 'text') {
      formData.set('content', content)
    } else {
      // For image mode, store a placeholder and attach file
      // The content_text will carry a note; the actual image URL is handled server-side
      formData.set('content', `[Redação enviada como imagem/arquivo: ${imageFile?.name}]`)
      if (imageFile) formData.set('essay_image', imageFile)
    }

    try {
      const result = await submitEssay(null, formData)

      if (result?.error) {
        // Credit exhausted at the DB level (race condition — creditsLeft was stale).
        // Refresh the server component so the page re-reads the subscription and shows
        // the no-credits banner instead of leaving the form in a confusing half-state.
        if (result.code === 'CREDIT_LIMIT_REACHED') {
          setError(result.error)
          setSubmitting(false)
          router.refresh()
          return
        }
        setError(result.error)
        setSubmitting(false)
        return
      }

      // Success: server action redirects internally; router.push is fallback
      router.push('/aluno/redacoes')
    } catch {
      // Network error or unexpected server failure
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/aluno/redacoes"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white leading-none">Enviar redação</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Devolutiva em até 48h
            {creditsLeft > 0 ? (
              <> · <span className={creditsLeft <= 1 ? 'text-amber-400' : 'text-gray-400'}>
                {creditsLeft} crédito{creditsLeft !== 1 ? 's' : ''} restante{creditsLeft !== 1 ? 's' : ''}
              </span></>
            ) : (
              <> · <span className="text-red-400">Sem créditos</span></>
            )}
          </p>
        </div>
      </div>

      {/* Sem créditos */}
      {creditsLeft === 0 && (
        <div className="mb-6 rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-5 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-300 mb-0.5">Créditos esgotados</p>
            <p className="text-xs text-red-400/70 mb-3">Você usou todos os créditos do plano atual. Faça upgrade para continuar enviando redações.</p>
            <Link href="/#planos" className="text-xs font-semibold text-red-300 border border-red-400/30 bg-red-500/10 rounded-lg px-3 py-1.5 hover:bg-red-500/20 transition-colors">
              Ver planos →
            </Link>
          </div>
        </div>
      )}

      {/* Erro geral */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/25 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Tema ────────────────────────────────────────────── */}
        <div className="card-dark rounded-2xl p-6">
          <label className="block text-sm font-semibold text-white mb-4">
            Tema da redação <span className="text-red-400 ml-1">*</span>
          </label>

          <div className="flex gap-2 mb-4">
            {(['list', 'free'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setThemeMode(mode)}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                  themeMode === mode
                    ? 'bg-purple-700 text-white'
                    : 'text-gray-500 hover:text-white bg-white/[0.04] border border-white/[0.06]'
                }`}
              >
                {mode === 'list' ? 'Escolher da lista' : 'Tema livre'}
              </button>
            ))}
          </div>

          {themeMode === 'list' ? (
            <select
              value={selectedThemeId}
              onChange={e => setSelectedThemeId(e.target.value)}
              disabled={submitting}
              className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="" disabled>Selecione um tema...</option>
              {themes.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={freeTheme}
                onChange={e => setFreeTheme(e.target.value)}
                disabled={submitting}
                placeholder="Digite o tema da sua redação..."
                maxLength={200}
                className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              />
              {freeTheme.length > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600">
                  {freeTheme.length}/200
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Modo de envio ────────────────────────────────────── */}
        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-semibold text-white">
              Sua redação <span className="text-red-400 ml-1">*</span>
            </label>
            {/* Tabs: Digitar / Enviar foto */}
            <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 font-medium transition-all ${
                  inputMode === 'text' ? 'bg-purple-700/60 text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                <FileText size={11} />
                Digitar
              </button>
              <button
                type="button"
                onClick={() => setInputMode('image')}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 font-medium transition-all border-l border-white/[0.08] ${
                  inputMode === 'image' ? 'bg-purple-700/60 text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                <ImagePlus size={11} />
                Enviar foto
              </button>
            </div>
          </div>

          {inputMode === 'text' ? (
            <>
              {/* Line progress bar */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${linesColor}`}>
                  {lines} / {MAX_LINES} linhas
                </span>
                {lines >= MIN_LINES && lines <= MAX_LINES && (
                  <span className="text-xs text-gray-600">
                    {content.trim().split(/\s+/).filter(Boolean).length} palavras
                  </span>
                )}
              </div>
              <div className="h-1 bg-white/[0.06] rounded-full mb-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    lines < MIN_LINES ? 'bg-gray-600' :
                    lines > MAX_LINES ? 'bg-red-500'  :
                    lines >= 25       ? 'bg-green-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${linesPct}%` }}
                />
              </div>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                disabled={submitting}
                placeholder={`Escreva sua redação aqui...\n\nDicas:\n• Introdução com contextualização e tese\n• Dois parágrafos de desenvolvimento com argumentos embasados\n• Conclusão com proposta de intervenção completa (agente + ação + modo + finalidade)\n\nO ENEM aceita redações de ${MIN_LINES} a ${MAX_LINES} linhas.`}
                rows={18}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent leading-relaxed disabled:opacity-50"
              />

              {lines > 0 && lines < MIN_LINES && (
                <p className="text-xs text-amber-400 mt-2">
                  ⚠ Mínimo de {MIN_LINES} linhas — você está em {lines}. {MIN_LINES - lines} linha{MIN_LINES - lines !== 1 ? 's' : ''} a mais.
                </p>
              )}
              {lines > MAX_LINES && (
                <p className="text-xs text-red-400 mt-2">
                  ✗ Limite de {MAX_LINES} linhas atingido. Remova {lines - MAX_LINES} linha{lines - MAX_LINES !== 1 ? 's' : ''}.
                </p>
              )}
              {lines >= MIN_LINES && lines <= MAX_LINES && (
                <p className="text-xs text-gray-600 mt-2">✓ Comprimento dentro do limite.</p>
              )}
            </>
          ) : (
            /* ── Image Upload ────────────────────────────────────── */
            <div>
              <p className="text-xs text-gray-500 mb-4">
                Tire uma foto da sua redação manuscrita ou escaneie o PDF.
                Formatos: JPG, PNG, WebP ou PDF · Máx. 8 MB.
              </p>

              {!imageFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/[0.1] rounded-2xl p-10 flex flex-col items-center gap-3 hover:border-purple-500/40 hover:bg-purple-600/[0.03] transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center group-hover:border-purple-500/40 transition-colors">
                    <ImagePlus size={22} className="text-purple-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-300">Clique para selecionar o arquivo</p>
                    <p className="text-xs text-gray-600 mt-0.5">JPG, PNG, WebP ou PDF</p>
                  </div>
                </button>
              ) : (
                <div className="relative">
                  {imagePreview ? (
                    /* Image preview */
                    <div className="relative rounded-2xl overflow-hidden border border-white/[0.08]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Preview da redação"
                        className="w-full max-h-[400px] object-contain bg-white/[0.02]"
                      />
                    </div>
                  ) : (
                    /* PDF: show name card */
                    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{imageFile.name}</p>
                        <p className="text-xs text-gray-600">{(imageFile.size / 1024).toFixed(0)} KB · PDF</p>
                      </div>
                    </div>
                  )}
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 border border-white/[0.15] flex items-center justify-center text-gray-300 hover:text-white hover:bg-black/80 transition-all"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleImageChange}
                className="hidden"
              />

              {imageFile && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Trocar arquivo
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Observações ─────────────────────────────────────── */}
        <div className="card-dark rounded-2xl p-6">
          <label className="block text-sm font-semibold text-white mb-1">
            Observações para a corretora
            <span className="text-gray-600 font-normal ml-2">(opcional)</span>
          </label>
          <p className="text-xs text-gray-600 mb-3">
            Pontos específicos para prestar atenção, contexto da prática, dúvidas...
          </p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            disabled={submitting}
            placeholder="Ex: Quero melhorar a C5. Na última redação errei muito a proposta de intervenção..."
            rows={3}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        {/* ── Submit ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Link href="/aluno/redacoes" className="btn-secondary flex-1 justify-center">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={!canSubmit || submitting || creditsLeft === 0}
            title={
              !themeOk ? 'Informe o tema' :
              !textOk  ? (inputMode === 'text' ? 'Verifique o texto (mínimo 7 linhas)' : 'Selecione uma imagem') :
              creditsLeft === 0 ? 'Sem créditos' : ''
            }
            className="btn-primary flex-1 justify-center"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                Receber minha correção
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
