'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Send, RotateCcw, ChevronRight } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface BiiaChatProps {
  firstName: string
  worstCompKey: string | null
  avgScore: number | null
  lastTheme: string | null
  isNewUser: boolean
  recentThemes: string[]
  compAverages?: { key: string; avg: number }[] | null
  totalCorrected?: number
}

const COMP_NAMES: Record<string, string> = {
  c1_score: 'Norma Culta (C1)',
  c2_score: 'Compreensão do Tema (C2)',
  c3_score: 'Seleção de Argumentos (C3)',
  c4_score: 'Mecanismos de Coesão (C4)',
  c5_score: 'Proposta de Intervenção (C5)',
}

const COMP_SHORT: Record<string, string> = {
  c1_score: 'C1',
  c2_score: 'C2',
  c3_score: 'C3',
  c4_score: 'C4',
  c5_score: 'C5',
}

// ─── Suggested prompts ──────────────��─────────────────────────────────────────

function getSuggestedPrompts(
  worstCompKey: string | null,
  lastTheme: string | null,
  avgScore: number | null,
  isNewUser: boolean,
): { label: string; prompt: string }[] {

  if (isNewUser) {
    return [
      {
        label: 'Como estruturar uma redação ENEM?',
        prompt: 'Me explique a estrutura ideal de uma redação dissertativa-argumentativa do ENEM: quantos parágrafos, o que cada um deve conter e como distribuir as ideias.',
      },
      {
        label: 'O que é proposta de intervenção?',
        prompt: 'Explique o que é proposta de intervenção na C5 do ENEM com um exemplo completo que inclua agente, ação, modo e finalidade.',
      },
      {
        label: 'Quais temas eu devo praticar primeiro?',
        prompt: 'Quais são os temas mais recorrentes no ENEM nos últimos 5 anos? Quais eu devo priorizar para ganhar proficiência rápida?',
      },
    ]
  }

  const prompts: { label: string; prompt: string }[] = []

  if (worstCompKey && COMP_NAMES[worstCompKey]) {
    prompts.push({
      label: `Melhorar minha ${COMP_SHORT[worstCompKey]} (ponto fraco)`,
      prompt: `Me dê um exercício prático e direto para melhorar minha ${COMP_NAMES[worstCompKey]}, que é minha competência mais fraca.`,
    })
  }

  if (lastTheme) {
    prompts.push({
      label: `Repertório: ${lastTheme.length > 30 ? lastTheme.slice(0, 30) + '…' : lastTheme}`,
      prompt: `Me dê um repertório completo (dados, autores, referências) para o tema: "${lastTheme}"`,
    })
  }

  if (avgScore !== null && avgScore < 700) {
    prompts.push({
      label: 'Como chegar a 700 pts',
      prompt: `Minha média é ${avgScore} pontos. Me dê um plano de estudo de 4 semanas para chegar a 700 pontos, focando nas competências que mais valem a pena.`,
    })
  } else if (avgScore !== null && avgScore >= 700) {
    prompts.push({
      label: 'Próximo patamar: 800+',
      prompt: `Minha média é ${avgScore} pontos. O que preciso fazer de diferente para consistentemente atingir 800+?`,
    })
  }

  prompts.push({
    label: 'Analisar um parágrafo',
    prompt: 'Quero colar um parágrafo para você analisar pelas 5 competências do ENEM.',
  })

  return prompts.slice(0, 4)
}

// ─── Formatador de mensagens ───────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  const formatContent = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      const formatted = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-semibold text-white">{part.slice(2, -2)}</strong>
        }
        return part
      })
      return (
        <span key={i}>
          {formatted}
          {i < lines.length - 1 && <br />}
        </span>
      )
    })
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {isUser ? (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center self-end mb-0.5">
          <span className="text-[10px] font-bold text-gray-400">Eu</span>
        </div>
      ) : (
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden border border-purple-500/35 self-end mb-0.5"
          style={{ boxShadow: '0 0 7px rgba(124,58,237,0.30)' }}
        >
          <Image src="/biia.webp" alt="Biia" width={40} height={40} className="w-full h-full object-cover" />
        </div>
      )}

      <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
        isUser
          ? 'bg-purple-700/25 border border-purple-600/30 text-gray-200 rounded-br-sm'
          : 'bg-white/[0.04] border border-white/[0.08] text-gray-300 rounded-bl-sm'
      }`}>
        {formatContent(message.content)}
      </div>
    </div>
  )
}

// ─── Quick action buttons (shown after assistant responses) ───────────────────

const QUICK_ACTIONS = [
  { label: 'Ver erros principais', prompt: 'Liste meus principais erros com base nas minhas redações e como evitar cada um.' },
  { label: 'Melhorar introdução', prompt: 'Me ensine a escrever uma introdução forte para redação ENEM com contextualização e tese clara. Dê um exemplo.' },
  { label: 'Aumentar nota', prompt: 'Qual a estratégia mais rápida para eu aumentar minha nota na próxima redação? Foque nas competências com maior potencial de ganho.' },
]

function QuickActions({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2 ml-10">
      {QUICK_ACTIONS.map(a => (
        <button
          key={a.label}
          onClick={() => onSend(a.prompt)}
          disabled={disabled}
          className="text-[11px] px-3 py-1.5 rounded-lg border border-purple-500/20 bg-purple-500/[0.06] text-purple-300 hover:bg-purple-500/[0.12] hover:border-purple-500/30 disabled:opacity-40 transition-all"
        >
          {a.label}
        </button>
      ))}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <div
        className="w-7 h-7 rounded-full overflow-hidden border border-purple-500/35 flex-shrink-0"
        style={{ boxShadow: '0 0 7px rgba(124,58,237,0.30)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/biia.webp" alt="Biia" className="w-full h-full object-cover" />
      </div>
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Detect if user pasted an essay ──────────────────────────────────────────

function looksLikeEssay(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 250) return false
  const paragraphs = trimmed.split(/\n\n+/).filter(p => p.trim().length > 30)
  if (paragraphs.length >= 2) return true
  const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 20)
  return sentences.length >= 5
}

// ─── Main component ──────────────���───────────────────────────���─────────────────

export function BiiaChat({
  firstName,
  worstCompKey,
  avgScore,
  lastTheme,
  isNewUser,
  recentThemes,
  compAverages,
  totalCorrected,
}: BiiaChatProps) {
  const suggestions = getSuggestedPrompts(worstCompKey, lastTheme, avgScore, isNewUser)

  const getInitialMessage = (): Message => {
    let content: string

    if (isNewUser) {
      content = `Oi, ${firstName}! Sou a **Biia**, sua tutora de redação ENEM. 🎉\n\nComo você está começando agora, vou te ajudar a construir uma base sólida desde a primeira redação.\n\nPosso te ensinar:\n- A estrutura ideal da redação dissertativa-argumentativa\n- Como montar uma proposta de intervenção nota 200\n- Repertório de argumentos para os temas mais frequentes do ENEM\n- Técnicas de revisão para eliminar erros de C1\n\nQual é a sua maior dúvida antes de escrever sua primeira redação?`
    } else if (worstCompKey && COMP_NAMES[worstCompKey]) {
      const compName = COMP_NAMES[worstCompKey]
      const scoreText = avgScore !== null ? ` Sua média está em **${avgScore} pts**` : ''
      content = `Oi, ${firstName}!${scoreText} e analisando suas redações, vejo que **${compName}** tem o maior espaço de crescimento — é por aí que entram os pontos mais fáceis agora.\n\nAlguns tópicos que posso te ajudar hoje:\n- Exercício específico para elevar sua ${COMP_SHORT[worstCompKey]}\n- Análise de um parágrafo que você escreveu\n- Repertório para o próximo tema\n- Revisão da sua proposta de intervenção\n\nO que você quer trabalhar?`
    } else if (avgScore !== null && avgScore >= 700) {
      content = `Oi, ${firstName}! Com **${avgScore} pts** de média, você já está em um nível avançado. 💪\n\nPara chegar a 800+ o trabalho é diferente — não é mais sobre evitar erros básicos, mas sobre sofisticar os argumentos e ter uma proposta de intervenção realmente precisa.\n\nPosso te ajudar com:\n- Argumentação de alto impacto (C3 avançado)\n- Repertório internacional e interdisciplinar\n- Proposta de intervenção com especificidade máxima\n- Coesão de texto elaborado (C4 avançado)\n\nQual competência quer elevar primeiro?`
    } else {
      const scoreText = avgScore !== null ? ` Sua média atual é **${avgScore} pts**.` : ''
      content = `Oi, ${firstName}! Sou a Biia, sua tutora de redação.${scoreText}\n\nPosso ajudar com qualquer parte da redação ENEM:\n- Repertório e argumentos para qualquer tema\n- Revisão de propostas de intervenção (C5)\n- Exercícios direcionados por competência (C1 a C5)\n- Análise de parágrafos que você escreveu\n- Plano de estudos para sua meta de pontuação\n\nO que você quer trabalhar hoje?`
    }

    return { id: 'initial', role: 'assistant', content, timestamp: new Date() }
  }

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()])
  const [input, setInput]       = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLTextAreaElement>(null)
  const initialPromptSentRef    = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Build the context object for the API
  const apiContext = {
    firstName,
    avgScore,
    worstComp: worstCompKey ? (COMP_NAMES[worstCompKey] ?? worstCompKey) : null,
    compScores: compAverages
      ? Object.fromEntries(compAverages.map(c => [c.key.replace('_score', ''), c.avg]))
      : null,
    totalEssays: totalCorrected ?? 0,
    isNewUser,
  }

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    setError(null)

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      // Build conversation history for the API (skip the initial greeting)
      const allMessages = [...messages.filter(m => m.id !== 'initial'), userMsg]
      const apiMessages = allMessages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/biia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          context: apiContext,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Erro de conexão' }))
        throw new Error(data.error ?? `Erro ${res.status}`)
      }

      const data = await res.json()
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao conectar com a Biia'
      setError(errorMessage)

      // Add error message as assistant response so user sees it
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Desculpe, tive um problema técnico: ${errorMessage}. Pode tentar de novo?`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }, [isTyping, messages, apiContext])

  // URL param: auto-send prompt from deep-links (e.g. CompetencyCards CTAs)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (initialPromptSentRef.current) return
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('prompt')
    if (!raw) return
    const decoded = decodeURIComponent(raw)
    initialPromptSentRef.current = true
    const t = setTimeout(() => {
      sendMessage(decoded)
    }, 300)
    return () => clearTimeout(t)
  }, [sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleReset = () => {
    setMessages([getInitialMessage()])
    setInput('')
    setError(null)
    inputRef.current?.focus()
  }

  // Suppress unused warning for recentThemes — available for future use
  void recentThemes

  return (
    <div className="flex flex-col h-full">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-0 py-4 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={msg.id}>
            <MessageBubble message={msg} />
            {/* Quick actions: show after the last assistant message when not typing */}
            {msg.role === 'assistant' && i === messages.length - 1 && i > 0 && !isTyping && (
              <QuickActions onSend={sendMessage} disabled={isTyping} />
            )}
          </div>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions — only before user sends any message */}
      {messages.length === 1 && !isTyping && (
        <div className="py-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-4 h-4 rounded-full overflow-hidden border border-purple-500/30 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/biia.webp" alt="" className="w-full h-full object-cover" />
            </div>
            <p className="text-[10px] text-purple-400/70 font-semibold uppercase tracking-wider">Biia sugere</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {suggestions.map(s => (
              <button
                key={s.label}
                onClick={() => sendMessage(s.prompt)}
                className="group text-left px-3 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-purple-500/[0.05] hover:border-purple-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
              >
                <span className="flex items-center gap-2">
                  <ChevronRight size={11} className="text-purple-500 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
                  <span className="text-[12px] text-gray-500 group-hover:text-gray-200 transition-colors leading-snug">
                    {s.label}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Essay paste detection banner */}
      {looksLikeEssay(input) && (
        <div className="py-2 px-1">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-purple-500/25 bg-purple-500/[0.07] px-3 py-2">
            <p className="text-[11px] text-purple-300 font-medium leading-snug">
              Parece que você colou um texto — quer que eu analise pelas 5 competências?
            </p>
            <button
              onClick={() => sendMessage(`Analise o seguinte texto pelas 5 competências do ENEM (C1 a C5) e me dê feedback específico para cada uma:\n\n${input}`)}
              className="shrink-0 text-[11px] font-semibold text-white bg-purple-700 hover:bg-purple-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              Analisar
            </button>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="py-2 px-1">
          <div className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/[0.07] px-3 py-2">
            <span className="text-[11px] text-red-300">⚠️ {error}</span>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="pt-3 border-t border-white/[0.06]">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva sua dúvida ou cole um trecho da redação…"
              rows={1}
              disabled={isTyping}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[13px] text-white placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500/40 focus:border-purple-500/30 disabled:opacity-50 transition-all leading-relaxed max-h-40 overflow-y-auto"
              style={{ minHeight: '44px' }}
              onInput={e => {
                const t = e.currentTarget
                t.style.height = 'auto'
                t.style.height = Math.min(t.scrollHeight, 160) + 'px'
              }}
            />
          </div>

          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
            aria-label="Enviar mensagem"
          >
            <Send size={14} className="text-white" />
          </button>

          <button
            onClick={handleReset}
            title="Nova conversa"
            className="flex-shrink-0 w-10 h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-gray-600 hover:text-gray-300 flex items-center justify-center transition-all"
          >
            <RotateCcw size={14} />
          </button>
        </div>
        <p className="text-[10px] text-gray-700 mt-2 text-center">
          Biia é uma IA especialista em redação ENEM. Para correção oficial, envie sua redação pela plataforma.
        </p>
      </div>
    </div>
  )
}
