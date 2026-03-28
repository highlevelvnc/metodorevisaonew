import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { touchActivity } from '@/lib/actions/activity'

export const runtime = 'nodejs'

// ─── System prompt ──────────────────────────────────────────────────────────

function buildSystemPrompt(ctx: StudentContext): string {
  const parts: string[] = [
    `Você é a Biia, tutora de redação ENEM do Método Revisão.`,
    `Você é direta, estratégica e empática. Fala como uma professora experiente que conhece o aluno pessoalmente.`,
    `Sempre responda em português brasileiro.`,
    ``,
    `REGRAS OBRIGATÓRIAS:`,
    `- Foque exclusivamente em redação ENEM (dissertativo-argumentativa).`,
    `- Nunca invente dados ou estatísticas — se citar, diga a fonte.`,
    `- Nunca diga que vai "corrigir" a redação — você orienta, quem corrige é a professora humana.`,
    `- Quando o aluno colar um texto/parágrafo, analise pelas 5 competências (C1-C5) com feedback específico por competência.`,
    `- Respostas devem ter no máximo 400 palavras. Seja densa e prática, nunca genérica.`,
    `- Use negrito (**texto**) para destaque, mas sem exagero.`,
    `- Termine com uma pergunta ou sugestão de próximo passo quando fizer sentido.`,
    ``,
    `FORMATO DE RESPOSTA OBRIGATÓRIO quando o aluno perguntar sobre erros ou como melhorar:`,
    `Sempre organize a resposta em seções claras:`,
    `1. **Principais erros** — liste os erros mais comuns ou relevantes`,
    `2. **Como melhorar** — dê orientações práticas e específicas`,
    `3. **Exemplo reescrito** — quando aplicável, mostre um antes/depois com a correção`,
    `Se o aluno colar um texto, OBRIGATORIAMENTE inclua essas 3 seções na resposta.`,
    ``,
    `COMPETÊNCIAS DO ENEM:`,
    `C1 — Norma Culta da Língua Portuguesa (concordância, regência, pontuação, ortografia)`,
    `C2 — Compreensão do Tema (tese clara, aderência ao recorte temático, repertório produtivo)`,
    `C3 — Seleção e Organização de Argumentos (coerência, progressão, repertório sociocultural legitimado)`,
    `C4 — Mecanismos Linguísticos de Coesão (conectivos, referenciação, paragrafação)`,
    `C5 — Proposta de Intervenção (agente + ação + meio + finalidade + detalhamento, vinculada ao tema)`,
  ]

  // Add student context if available
  if (ctx.firstName) {
    parts.push(``, `CONTEXTO DO ALUNO:`, `Nome: ${ctx.firstName}`)
  }
  if (ctx.avgScore !== null && ctx.avgScore > 0) {
    parts.push(`Nota média: ${ctx.avgScore} pts (de 1000)`)
  }
  if (ctx.compScores) {
    const labels: Record<string, string> = {
      c1: 'C1 (Norma Culta)',
      c2: 'C2 (Tema)',
      c3: 'C3 (Argumentos)',
      c4: 'C4 (Coesão)',
      c5: 'C5 (Intervenção)',
    }
    const scores = Object.entries(ctx.compScores)
      .filter(([, v]) => v !== null && v > 0)
      .map(([k, v]) => `${labels[k] ?? k}: ${v}/200`)
    if (scores.length > 0) {
      parts.push(`Médias por competência: ${scores.join(' | ')}`)
    }
  }
  if (ctx.worstComp) {
    parts.push(`Competência mais fraca: ${ctx.worstComp}`)
  }
  if (ctx.totalEssays !== undefined && ctx.totalEssays > 0) {
    parts.push(`Redações corrigidas: ${ctx.totalEssays}`)
  }
  if (ctx.isNewUser) {
    parts.push(`Este aluno é NOVO na plataforma — ainda não tem redações corrigidas. Priorize orientação estrutural básica.`)
  }

  return parts.join('\n')
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface StudentContext {
  firstName: string
  avgScore: number | null
  worstComp: string | null
  compScores: Record<string, number | null> | null
  totalEssays?: number
  isNewUser: boolean
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  messages: ChatMessage[]
  context: StudentContext
}

// ─── Handler ────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const t0 = Date.now()

  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Parse body
  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { messages, context } = body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Mensagens obrigatórias' }, { status: 400 })
  }

  // Limit conversation history to last 20 messages to control token usage
  const trimmedMessages = messages.slice(-20)

  // Determine which LLM provider to use
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  try {
    let reply: string

    if (anthropicKey) {
      reply = await callAnthropic(anthropicKey, trimmedMessages, context)
    } else if (openaiKey) {
      reply = await callOpenAI(openaiKey, trimmedMessages, context)
    } else {
      console.error('[biia] No LLM API key configured — set ANTHROPIC_API_KEY or OPENAI_API_KEY')
      return NextResponse.json(
        { error: 'Biia está temporariamente indisponível. Tente novamente em alguns minutos.' },
        { status: 503 }
      )
    }

    console.log(`[biia] Response generated in ${Date.now() - t0}ms for user=${user.id}`)

    // Update last_activity_at (R3 — non-blocking, non-fatal)
    touchActivity().catch(() => {})

    return NextResponse.json({ reply })
  } catch (err) {
    console.error(`[biia] LLM call failed:`, err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Erro ao gerar resposta. Tente novamente.' },
      { status: 502 }
    )
  }
}

// ─── Anthropic (Claude) ─────────────────────────────────────────────────────

async function callAnthropic(
  apiKey: string,
  messages: ChatMessage[],
  context: StudentContext
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context)

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Anthropic API ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? 'Desculpe, não consegui gerar uma resposta.'
}

// ─── OpenAI (fallback) ──────────────────────────────────────────────────────

async function callOpenAI(
  apiKey: string,
  messages: ChatMessage[],
  context: StudentContext
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context)

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`OpenAI API ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? 'Desculpe, não consegui gerar uma resposta.'
}
