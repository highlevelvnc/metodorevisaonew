'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, Send, RotateCcw, ChevronRight } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface BiiaChatProps {
  firstName: string
  worstCompKey: string | null
  avgScore: number | null
  lastTheme: string | null
}

const COMP_NAMES: Record<string, string> = {
  c1_score: 'Norma Culta (C1)',
  c2_score: 'Compreensão do Tema (C2)',
  c3_score: 'Seleção de Argumentos (C3)',
  c4_score: 'Mecanismos de Coesão (C4)',
  c5_score: 'Proposta de Intervenção (C5)',
}

// Suggested prompts — adapt based on context
function getSuggestedPrompts(
  worstCompKey: string | null,
  lastTheme: string | null,
  avgScore: number | null,
): { label: string; prompt: string }[] {
  const base = [
    {
      label: 'Como estruturar minha proposta C5?',
      prompt: 'Explique como estruturar uma proposta de intervenção completa com os 4 elementos obrigatórios (agente, ação, modo e finalidade), com um exemplo prático.',
    },
    {
      label: 'Repertório para um tema atual',
      prompt: 'Me dê 5 referências de autores, dados ou eventos históricos que funcionam bem para temas de desigualdade social no Brasil.',
    },
    {
      label: 'Como melhorar minha coesão textual?',
      prompt: 'Quais conectivos argumentativos devo usar além de "portanto", "porém" e "além disso"? Me dê exemplos de uso correto no contexto da redação ENEM.',
    },
    {
      label: 'O que o ENEM cobra na C1?',
      prompt: 'Quais são os erros de norma culta mais cobrados na C1 do ENEM? Me dê uma lista com exemplos de cada tipo.',
    },
  ]

  const contextual: { label: string; prompt: string }[] = []

  if (worstCompKey && COMP_NAMES[worstCompKey]) {
    contextual.push({
      label: `Treinar ${COMP_NAMES[worstCompKey]}`,
      prompt: `Minha ${COMP_NAMES[worstCompKey]} está fraca. Me dê um exercício prático para melhorá-la com feedback imediato.`,
    })
  }

  if (lastTheme) {
    contextual.push({
      label: `Repertório: "${lastTheme.slice(0, 30)}…"`,
      prompt: `Me ajude a montar um repertório de argumentos para escrever sobre: "${lastTheme}". Inclua dados, autores e perspectivas diferentes.`,
    })
  }

  if (avgScore !== null && avgScore < 600) {
    contextual.push({
      label: 'Plano para chegar a 600 pts',
      prompt: `Minha média atual é ${avgScore} pts. Qual é o caminho mais direto para chegar a 600 pts nas próximas redações?`,
    })
  }

  return [...contextual, ...base].slice(0, 4)
}

// Simulated AI response — in production, replace with real API call
async function getAIResponse(userMessage: string, context: { firstName: string; worstCompKey: string | null; avgScore: number | null }): Promise<string> {
  // Simulate network latency
  await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))

  const msg = userMessage.toLowerCase()

  if (msg.includes('proposta') || msg.includes('c5') || msg.includes('intervenção')) {
    return `Uma proposta de intervenção nota 200 tem **4 elementos obrigatórios**:

**1. Agente** — quem vai executar a ação?
Exemplos: *O Ministério da Educação*, *As prefeituras municipais*, *As instituições de ensino superior*

**2. Ação** — o que será feito especificamente?
Não use verbos genéricos como "investir" ou "melhorar" sem detalhar o objeto.

**3. Modo/Meio** — como será feito?
Esta é a parte mais negligenciada. Especifique: *por meio de campanhas*, *mediante parcerias público-privadas*, *através de legislação específica*

**4. Finalidade** — para quê? Qual o impacto esperado?
Conecte sempre ao problema central da redação.

**Exemplo completo:**
> "O Ministério da Educação *(agente)* deve implementar programas de educação midiática nas escolas públicas *(ação)*, por meio de disciplinas optativas e treinamento de professores *(modo)*, a fim de capacitar os jovens para identificar desinformação e exercer uma cidadania crítica *(finalidade)*."

Quer que eu corrija um rascunho da sua proposta?`
  }

  if (msg.includes('coesão') || msg.includes('conectivo') || msg.includes('c4')) {
    return `Os conectivos mais usados pelos estudantes são justamente os que os corretores mais veem — e que menos impressionam. Aqui está um repertório para variar:

**Adição:**
Ademais · Outrossim · Sob esse viés · Nessa perspectiva

**Contraste:**
Não obstante · Todavia · Conquanto · Em contrapartida

**Causa/consequência:**
Por conseguinte · Em decorrência disso · Haja vista que

**Conclusão:**
Depreende-se que · Infere-se, portanto, que · Diante do exposto

**Exemplificação:**
À guisa de exemplo · A esse respeito · Nesse sentido

**Dica prática:** Releia cada parágrafo e substitua o conectivo inicial por um diferente. Tente não repetir o mesmo conectivo em parágrafos consecutivos.

Quer um exercício? Me mande um parágrafo e eu aponto onde a coesão pode melhorar.`
  }

  if (msg.includes('repertório') || msg.includes('referência') || msg.includes('argumento') || msg.includes('c3')) {
    return `Repertório sólido para desigualdade social no Brasil — temas que aparecem há anos no ENEM:

**Dados e estatísticas:**
- IBGE (2023): 10% mais ricos concentram 41,4% da renda nacional
- IDH Brasil: 0,754 (92º lugar mundial) — apesar do crescimento econômico
- Gini 0,52 — um dos mais altos do mundo

**Autores e obras:**
- **Darcy Ribeiro** — *O Povo Brasileiro*: formação histórica das desigualdades
- **Jessé Souza** — *A Ralé Brasileira*: pobreza como estrutura, não acidente
- **Sérgio Buarque de Holanda** — *Raízes do Brasil*: herança do patrimonialismo
- **Boaventura de Sousa Santos** — epistemologias do Sul, perspectiva crítica

**Perspectiva histórica:**
- Herança colonial e escravidão como base das desigualdades estruturais
- Industrialização concentrada no Sudeste (décadas de 1950–1980)
- Redemocratização e Constituição de 1988 como ponto de virada formal

Quer repertório específico para outro tema?`
  }

  if (msg.includes('norma culta') || msg.includes('c1') || msg.includes('gramática') || msg.includes('erro')) {
    return `Os erros de C1 mais frequentes no ENEM — e como evitá-los:

**1. Concordância verbal**
❌ *"Os dados indica que..."*
✅ *"Os dados indicam que..."*

**2. Concordância nominal**
❌ *"A situação ficaram complexas"*
✅ *"A situação ficou complexa"*

**3. Regência verbal**
❌ *"Assistimos o filme"*
✅ *"Assistimos ao filme"*

**4. Pontuação — vírgula antes de oração adjetiva explicativa**
❌ *"O Brasil que tem grande desigualdade social..."*
✅ *"O Brasil, que tem grande desigualdade social,..."*

**5. Uso do hífen pós-reforma ortográfica**
❌ *"anti-social", "auto-estima"*
✅ *"antissocial", "autoestima"*

**Técnica de releitura:** Leia o texto de trás para frente (última frase primeiro). O cérebro para de autocorrigir e você enxerga os erros reais.

Quer que eu analise um trecho do seu texto?`
  }

  if (msg.includes('600') || msg.includes('700') || msg.includes('800') || msg.includes('plano') || msg.includes('evoluir')) {
    const score = context.avgScore ?? 500
    const gap = 700 - score
    return `Com média de ${score} pts, aqui está o caminho mais direto para os 700:

**Onde estão os pontos mais fáceis:**
Cada competência vale até 200 pts. Se você tem 100 em alguma delas, chegar a 140 é mais rápido do que ir de 160 para 200.

**Plano em 3 redações:**

📝 **Redação 1 — Diagnóstico**
Escreva com atenção máxima à C5 (proposta de intervenção). Use os 4 elementos obrigatórios explicitamente.

📝 **Redação 2 — Repertório**
Antes de escrever, liste 2 dados + 1 autor. Force-se a incluir pelo menos 1 referência concreta por parágrafo.

📝 **Redação 3 — Coesão**
Escreva normalmente, mas na revisão, substitua todos os conectivos genéricos por variações do repertório.

**Meta realista:** ${gap} pts distribuídos em 3 competências = ~${Math.round(gap / 3)} pts por competência. É alcançável em 4–6 redações com esse foco.

Qual competência você quer priorizar primeiro?`
  }

  // Generic helpful response
  return `Entendido. Aqui está o que posso te ajudar com isso:

${userMessage.length > 100 ? 'Com base na sua pergunta, ' : ''}A estratégia mais eficaz para a redação ENEM é focar em uma competência por vez — em vez de tentar melhorar tudo ao mesmo tempo.

**Como posso ajudar você agora:**
- Analisar um parágrafo ou proposta que você escreveu
- Montar repertório específico para um tema
- Criar um plano de 3 redações com foco definido
- Explicar qualquer critério de correção com exemplos reais

Me mande um texto, um tema ou uma dúvida específica e eu dou um feedback direto.`
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  // Convert **bold** to <strong> in AI messages
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
      {/* Avatar */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center self-end mb-0.5 ${
        isUser
          ? 'bg-white/[0.08] border border-white/[0.12]'
          : 'bg-purple-600/25 border border-purple-500/30'
      }`}>
        {isUser
          ? <span className="text-[10px] font-bold text-gray-400">Eu</span>
          : <Sparkles size={11} className="text-purple-400" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
        isUser
          ? 'bg-purple-700/25 border border-purple-600/30 text-gray-200 rounded-br-sm'
          : 'bg-white/[0.04] border border-white/[0.08] text-gray-300 rounded-bl-sm'
      }`}>
        {formatContent(message.content)}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <div className="w-7 h-7 rounded-full bg-purple-600/25 border border-purple-500/30 flex items-center justify-center">
        <Sparkles size={11} className="text-purple-400" />
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

export function BiiaChat({ firstName, worstCompKey, avgScore, lastTheme }: BiiaChatProps) {
  const suggestions = getSuggestedPrompts(worstCompKey, lastTheme, avgScore)

  const getInitialMessage = (): Message => {
    let content = `Oi, ${firstName}! Sou a Biia, sua tutora de redação com IA.`

    if (worstCompKey && COMP_NAMES[worstCompKey]) {
      content += ` Analisei suas redações e vejo que **${COMP_NAMES[worstCompKey]}** tem espaço para crescer.`
    } else if (avgScore !== null) {
      content += ` Sua média atual está em **${avgScore} pts**.`
    }

    content += `\n\nPosso ajudar com:\n- Repertório e argumentos para qualquer tema\n- Revisão de propostas de intervenção (C5)\n- Exercícios direcionados por competência\n- Análise de parágrafos que você escreveu\n\nO que você quer trabalhar hoje?`

    return { id: 'initial', role: 'assistant', content, timestamp: new Date() }
  }

  const [messages, setMessages]   = useState<Message[]>([getInitialMessage()])
  const [input, setInput]         = useState('')
  const [isTyping, setIsTyping]   = useState(false)
  const bottomRef                 = useRef<HTMLDivElement>(null)
  const inputRef                  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

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
      const response = await getAIResponse(trimmed, { firstName, worstCompKey, avgScore })
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } finally {
      setIsTyping(false)
    }
  }, [isTyping, firstName, worstCompKey, avgScore])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleReset = () => {
    setMessages([getInitialMessage()])
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-0 py-4 space-y-4 min-h-0">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions — only when no user messages yet */}
      {messages.length === 1 && !isTyping && (
        <div className="py-3 border-t border-white/[0.05]">
          <p className="text-[10px] text-gray-700 font-semibold uppercase tracking-wider mb-2">Sugestões</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {suggestions.map(s => (
              <button
                key={s.label}
                onClick={() => sendMessage(s.prompt)}
                className="group text-left px-3 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-purple-500/25 transition-all"
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
            aria-label="Reiniciar conversa"
          >
            <RotateCcw size={13} />
          </button>
        </div>
        <p className="text-[10px] text-gray-800 mt-2 text-center">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  )
}
