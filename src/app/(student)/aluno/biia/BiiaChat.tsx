'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, RotateCcw, ChevronRight } from 'lucide-react'

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
  isNewUser: boolean
  recentThemes: string[]
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

// ─── Suggested prompts ────────────────────────────────────────────────────────

function getSuggestedPrompts(
  worstCompKey: string | null,
  lastTheme: string | null,
  avgScore: number | null,
  isNewUser: boolean,
): { label: string; prompt: string }[] {

  // New user gets an orientation-first set
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
      {
        label: 'Como escrever uma boa introdução?',
        prompt: 'Me ensine a escrever uma introdução forte para redação ENEM. Quais são as estratégias mais eficazes para começar e já marcar ponto na C2?',
      },
      {
        label: 'O que os corretores mais reprovam?',
        prompt: 'Quais são os erros mais comuns que fazem as redações do ENEM perderem pontos? Liste os principais por competência.',
      },
      {
        label: 'Me dê um repertório para começar',
        prompt: 'Me dê uma lista de 10 referências (autores, dados, obras, filmes) que funcionam para vários temas do ENEM e que todo estudante deveria conhecer.',
      },
    ]
  }

  const contextual: { label: string; prompt: string }[] = []

  // Weakest competency — most important contextual prompt
  if (worstCompKey && COMP_NAMES[worstCompKey]) {
    const short = COMP_SHORT[worstCompKey]
    contextual.push({
      label: `Melhorar minha ${short} (ponto fraco)`,
      prompt: `Minha ${COMP_NAMES[worstCompKey]} é a competência mais fraca das minhas redações. Me dê um diagnóstico dos erros mais comuns nessa competência e um exercício específico para melhorá-la.`,
    })
  }

  // Last theme — repertoire or revision
  if (lastTheme) {
    const shortTitle = lastTheme.length > 35 ? lastTheme.slice(0, 35) + '…' : lastTheme
    contextual.push({
      label: `Repertório: "${shortTitle}"`,
      prompt: `Quero escrever sobre "${lastTheme}". Me ajude com: 3 dados estatísticos, 2 autores relevantes, 1 perspectiva histórica e 1 exemplo internacional para enriquecer minha argumentação.`,
    })
  }

  // Score-based goal prompt
  if (avgScore !== null && avgScore < 700) {
    const target = avgScore < 500 ? 600 : avgScore < 600 ? 700 : 800
    contextual.push({
      label: `Como chegar a ${target} pts`,
      prompt: `Minha média atual é ${avgScore} pts. Preciso chegar a ${target} pts. Qual é o plano mais direto — quais competências priorizar e quais técnicas aplicar nas próximas redações?`,
    })
  }

  const base = [
    {
      label: 'Proposta de intervenção nota 200',
      prompt: 'Me mostre como montar uma proposta de intervenção que garanta nota 200 na C5. Quero os 4 elementos obrigatórios com exemplo concreto e dicas de como torná-la específica.',
    },
    {
      label: 'Conectivos e coesão textual',
      prompt: 'Minha coesão textual precisa melhorar (C4). Me dê um repertório completo de conectivos organizados por função (adição, contraste, conclusão, causalidade) com exemplos de uso em redações.',
    },
    {
      label: 'Analisar parágrafo que escrevi',
      prompt: 'Quero que você analise um parágrafo da minha redação. Vou colar o texto a seguir — por favor avalie coesão, argumento e adequação ao tema do ENEM:',
    },
    {
      label: 'Repertório: direitos humanos',
      prompt: 'Me dê um repertório sólido sobre direitos humanos para o ENEM: dados do IBGE, legislação (Constituição, ECA, LGBTQIA+), autores clássicos e exemplos internacionais.',
    },
    {
      label: 'Como estruturar minha introdução?',
      prompt: 'Explique as principais estratégias para escrever uma introdução de redação ENEM que já marque presença na C2 (compreensão do tema) e prepare o terreno para os argumentos.',
    },
    {
      label: 'Plano de estudo para o próximo mês',
      prompt: 'Monte um plano de estudo de 4 semanas para redação ENEM. Quero saber quantas redações escrever, qual competência focar em cada semana e como acompanhar minha evolução.',
    },
  ]

  return [...contextual, ...base].slice(0, 6)
}

// ─── AI response engine ────────────────────────────────────────────────────────

async function getAIResponse(
  userMessage: string,
  context: {
    firstName: string
    worstCompKey: string | null
    avgScore: number | null
    isNewUser: boolean
  }
): Promise<string> {
  await new Promise(r => setTimeout(r, 1100 + Math.random() * 900))

  const msg = userMessage.toLowerCase()

  // ── C5 / Proposta ──────────────────────────────────────────────────────────
  if (msg.includes('proposta') || msg.includes('c5') || msg.includes('intervenção')) {
    return `Uma proposta de intervenção nota 200 exige **4 elementos obrigatórios e explícitos**:

**1. Agente** — quem executará a ação?
Seja específico: *O Ministério da Educação*, *As prefeituras municipais*, *As plataformas de tecnologia*, *O Congresso Nacional*

**2. Ação** — o que exatamente será feito?
Evite verbos vagos como "investir", "promover" ou "melhorar" sem objeto claro.
✅ "implementar programas de letramento digital nas escolas públicas"

**3. Modo/Meio** — como será executado?
Esta é a parte mais negligenciada e que faz a diferença entre 160 e 200.
✅ "por meio de parceria com universidades federais e financiamento do FNDE"

**4. Finalidade** — qual o impacto esperado? Conecte ao tema.
✅ "a fim de reduzir a exclusão digital e garantir igualdade de acesso à informação"

**Exemplo completo (nota 200):**
> "O Ministério da Educação *(agente)* deve implementar programas de letramento digital em escolas públicas de baixa renda *(ação)*, por meio de parcerias com empresas de tecnologia e universidades federais para capacitação de professores *(modo)*, a fim de reduzir a exclusão digital e democratizar o acesso ao conhecimento *(finalidade)*."

**Erros que derrubam a nota:**
- Proposta genérica sem agente definido
- Ação vaga sem especificar o objeto
- Ausência de modo/meio de execução
- Finalidade desconectada do problema central

Quer que eu avalie um rascunho da sua proposta?`
  }

  // ── C4 / Coesão / Conectivos ───────────────────────────────────────────────
  if (msg.includes('coesão') || msg.includes('conectivo') || msg.includes('c4') || msg.includes('coerência')) {
    return `A C4 avalia como você **conecta as ideias** — entre frases, entre parágrafos e com o todo do texto. Aqui está um arsenal completo:

**Adição (acumular argumentos):**
Ademais · Outrossim · Além do mais · Soma-se a isso · Nessa perspectiva · Sob esse prisma

**Contraste (mostrar oposição):**
Não obstante · Todavia · Conquanto · Em contrapartida · Apesar disso · Contudo

**Causa e consequência:**
Por conseguinte · Em decorrência disso · Haja vista que · O que acarreta · Isso implica

**Conclusão e síntese:**
Depreende-se que · Infere-se, portanto, que · Diante do exposto · Em suma · Sendo assim

**Exemplificação:**
À guisa de exemplo · A esse respeito · Ilustrativamente · Nesse sentido · Isso se evidencia em

**Referência coesiva (evitar repetição):**
Use pronomes demonstrativos: *esse cenário*, *tal situação*, *essa realidade*, *esse contexto*

**Regras práticas:**
- Nunca repita o mesmo conectivo em parágrafos consecutivos
- Cada parágrafo deve ter pelo menos um conectivo de ligação com o anterior
- Comece a conclusão com algo além de "Portanto" — experimente *Diante do exposto* ou *Em vista disso*

Me mande um parágrafo e eu indico exatamente onde a coesão pode melhorar.`
  }

  // ── C3 / Repertório / Argumentos ──────────────────────────────────────────
  if (msg.includes('repertório') || msg.includes('referência') || msg.includes('argumento') || msg.includes('c3') || msg.includes('dado')) {
    return `Repertório de alto impacto para o ENEM — funciona para múltiplos temas:

**Dados e estatísticas (sempre atualizados):**
- IBGE (2023): 10% mais ricos concentram 41,4% da renda nacional
- ONU: mais de 700 milhões de pessoas vivem com menos de US$2,15/dia
- PISA 2022: Brasil ocupa 65ª posição em leitura entre 81 países
- OMS: burnout é reconhecido como síndrome ocupacional desde 2019

**Filósofos e pensadores:**
- **Hannah Arendt** — condição humana, espaço público, banalidade do mal
- **Zygmunt Bauman** — modernidade líquida, consumismo, identidade
- **Michel Foucault** — poder, disciplina, vigilância
- **Amartya Sen** — desenvolvimento como liberdade, capacidades humanas
- **Byung-Chul Han** — sociedade do cansaço, transparência, positividade

**Autores brasileiros:**
- **Darcy Ribeiro** — formação do povo brasileiro, desigualdade histórica
- **Jessé Souza** — *A Ralé Brasileira*, pobreza como estrutura social
- **Silvio Almeida** — *Racismo Estrutural*, opressão sistêmica
- **Sérgio Buarque de Holanda** — *Raízes do Brasil*, patrimonialismo

**Referências jurídicas (valem ouro na C5):**
- Constituição Federal de 1988 (Art. 5º — direitos fundamentais)
- ECA — Estatuto da Criança e do Adolescente
- Lei Maria da Penha (11.340/2006)
- Marco Civil da Internet (Lei 12.965/2014)

Quer repertório específico para um tema? Me diga qual e monto um kit completo.`
  }

  // ── C1 / Norma Culta / Gramática ──────────────────────────────────────────
  if (msg.includes('norma culta') || msg.includes('c1') || msg.includes('gramática') || msg.includes('ortografi') || msg.includes('erro')) {
    return `Os erros de C1 mais frequentes no ENEM — e como eliminar cada um:

**1. Concordância verbal**
❌ *"Os dados indica que a desigualdade persiste."*
✅ *"Os dados indicam que a desigualdade persiste."*

**2. Concordância nominal**
❌ *"As políticas público precisam ser revistas."*
✅ *"As políticas públicas precisam ser revistas."*

**3. Regência verbal**
❌ *"Assistimos o documentário"* / *"Visamos o lucro"*
✅ *"Assistimos ao documentário"* / *"Visamos ao lucro"*

**4. Crase**
❌ *"Refere-se a uma situação"* (sem crase — substantivo masculino)
✅ *"Refere-se à realidade brasileira"* (com crase — feminino + artigo)

**5. Pontuação — vírgula em orações explicativas**
❌ *"O Brasil que tem grande desigualdade social precisa de reformas"*
✅ *"O Brasil, que tem grande desigualdade social, precisa de reformas."*

**6. Grafia pós-reforma (2009)**
❌ *"anti-social", "auto-estima", "sócio-econômico"*
✅ *"antissocial", "autoestima", "socioeconômico"*

**Técnica de revisão profissional:**
Leia o texto **de trás para frente** — última frase primeiro. Seu cérebro para de "completar" o que deveria estar escrito e você enxerga os erros reais.

Cole um trecho aqui e eu faço uma análise de C1 específica.`
  }

  // ── C2 / Tema / Tese / Compreensão ────────────────────────────────────────
  if (msg.includes('c2') || msg.includes('tese') || msg.includes('tema') || msg.includes('introdução') || msg.includes('compreensão') || msg.includes('fuga') || msg.includes('aderência')) {
    return `A C2 avalia se você **entendeu o tema** e se sua tese está alinhada com o que foi proposto. É a competência que pode zerar a nota inteira se você fugir do tema.

**Como garantir C2 alta:**

**1. Identifique a palavra-chave do tema**
Sublinhe o núcleo do enunciado. Em "Desafios para a inclusão digital no Brasil", a pergunta real é: *por que a inclusão digital ainda não aconteceu para todos?*

**2. Escreva sua tese antes de começar**
Em uma frase, complete: *"Nesta redação, defendo que..."*
Se não conseguir completar sem entrar em contradição, você ainda não domina o tema.

**3. A introdução deve conter:**
- **Contextualização** — situe o leitor no tema (dado, fato histórico, citação)
- **Tese** — sua posição clara e afirmativa
- **Anúncio dos argumentos** — o que você vai desenvolver nos parágrafos

**Exemplo de introdução forte:**
> "Em 2023, segundo o IBGE, 38 milhões de brasileiros ainda não têm acesso à internet. Esse dado revela que, apesar do avanço tecnológico global, a inclusão digital no Brasil é travada por desigualdades estruturais históricas. Diante disso, é imprescindível analisar as barreiras econômicas e educacionais que impedem a universalização do acesso à rede."

**Armadilhas que derrubam a C2:**
- Tratar um tema como causa quando o enunciado pede consequência (ou vice-versa)
- Introdução genérica que não toca na especificidade do tema proposto
- Mudar de assunto no 3º parágrafo

Quer que eu analise a sua introdução?`
  }

  // ── Análise de parágrafo / revisão ────────────────────────────────────────
  if (msg.includes('analisar') || msg.includes('analise') || msg.includes('revisar') || msg.includes('revise') || msg.includes('parágrafo') || msg.includes('trecho') || msg.includes('corrij')) {
    return `Pode colar! Vou analisar seu texto pelas **5 competências do ENEM**:

**O que vou avaliar:**
- **C1** — Norma culta: concordância, regência, pontuação, ortografia
- **C2** — Aderência ao tema: a tese está clara? O parágrafo foca no que foi proposto?
- **C3** — Qualidade do argumento: tem evidência, dado ou referência? O raciocínio é coerente?
- **C4** — Coesão: os conectivos são variados e bem usados? A ligação com o restante do texto está clara?
- **C5** (se for conclusão) — Proposta: tem agente, ação, modo e finalidade?

**Como me mandar:**
Cole o parágrafo (ou a redação completa) diretamente no chat. Se quiser, me diga qual competência você quer que eu priorize no feedback.

Estou pronto para analisar.`
  }

  // ── Plano de estudos ──────────────────────────────────────────────────────
  if (msg.includes('plano') || msg.includes('estudo') || msg.includes('semana') || msg.includes('mês') || msg.includes('cronogram') || msg.includes('organiz')) {
    const score = context.avgScore ?? 0
    const isBegginer = context.isNewUser || score === 0

    if (isBegginer) {
      return `Plano de início — **primeiras 4 redações** para construir uma base sólida:

**Semana 1 — Aprenda a estrutura**
- Leia os critérios oficiais das 5 competências (INEP)
- Escreva 1 redação sobre um tema clássico (desigualdade social, meio ambiente ou violência)
- Não se preocupe com perfeição: o objetivo é ter um diagnóstico real

**Semana 2 — Foco em C5**
- A proposta de intervenção é onde mais pontos são perdidos
- Estude os 4 elementos: agente, ação, modo e finalidade
- Escreva 1 redação com atenção total à conclusão

**Semana 3 — Foco em repertório (C3)**
- Monte uma lista pessoal: 3 dados, 2 autores, 1 evento histórico para cada tema que você praticou
- Escreva 1 redação forçando-se a incluir pelo menos 1 referência por parágrafo

**Semana 4 — Revisão e coesão (C4)**
- Escreva normalmente, depois revise trocando todos os conectivos genéricos
- Leia em voz alta para identificar problemas de C1

**Dica:** Use a plataforma para enviar todas as redações — o feedback de professor em cima da sua evolução real é mais valioso do que qualquer vídeo-aula.`
    }

    const gap = Math.max(0, 700 - score)
    return `Plano de estudo para os próximos 30 dias — baseado na sua média atual de **${score} pts**:

**Semana 1 — Diagnóstico focado**
Escreva 1 redação com atenção máxima à **sua competência mais fraca**${context.worstCompKey ? ` (${COMP_NAMES[context.worstCompKey]})` : ''}. Anote os erros específicos antes de enviar.

**Semana 2 — Repertório**
Antes de escrever, liste: 2 dados numéricos + 1 autor + 1 referência jurídica ou histórica. Integre tudo naturalmente no texto.

**Semana 3 — Coesão e releitura**
Escreva a redação, depois releia exclusivamente para variar conectivos e eliminar repetição de palavras. Use meu arsenal de conectivos (pode perguntar).

**Semana 4 — Proposta de intervenção**
Dedique 20 minutos só para a conclusão. Escreva 3 versões da proposta e escolha a mais específica.

**Meta realista:** ${gap > 0 ? `${gap} pts distribuídos em 4 redações ≈ ${Math.round(gap / 4)} pts por redação. Isso é alcançável focando em C3 e C5 simultaneamente.` : 'Você já tem uma média sólida. O próximo patamar exige consistência e sofisticação argumentativa.'}

Qual competência você quer que a gente aprofunde primeiro?`
  }

  // ── Primeiros passos / nova na plataforma ─────────────────────────────────
  if (context.isNewUser && (msg.includes('começar') || msg.includes('primeira') || msg.includes('como') || msg.includes('estrutura') || msg.includes('dica'))) {
    return `Ótimo começo, ${context.firstName}! Aqui está o mapa para sua primeira redação nota alta:

**A estrutura da redação ENEM perfeita tem 5 parágrafos:**

**§1 — Introdução** (4–5 linhas)
Contextualize o tema com um dado ou citação + apresente sua tese (posição clara) + anuncie os argumentos.

**§2 — Primeiro argumento** (5–7 linhas)
Desenvolva um argumento com: afirmação → justificativa → evidência (dado, autor, exemplo) → conclusão parcial.

**§3 — Segundo argumento** (5–7 linhas)
Mesmo padrão. Use um conectivo de contraste ou adição para ligar com o parágrafo anterior.

**§4 — Segundo argumento (aprofundamento)** — opcional, mas recomendado para textos maiores

**§5 — Conclusão/Proposta** (5–6 linhas)
Retome a tese + apresente a proposta de intervenção com **agente, ação, modo e finalidade** explícitos.

**3 regras de ouro para iniciantes:**
1. Escreva a tese antes de escrever qualquer coisa
2. Cada parágrafo tem UMA ideia central — não misture
3. A proposta de intervenção é específica, não genérica

Quer que eu te ajude a montar a estrutura para um tema específico?`
  }

  // ── Temas recorrentes / quais temas estudar ────────────────────────────────
  if (msg.includes('tema') && (msg.includes('recorrent') || msg.includes('praticar') || msg.includes('treinar') || msg.includes('estudar') || msg.includes('importante'))) {
    return `Os temas mais recorrentes no ENEM nos últimos 10 anos — vale dominar todos:

**Eixo 1 — Desigualdade e exclusão social**
Desigualdade socioeconômica · Racismo estrutural · Desigualdade de gênero · Violência contra a mulher · Trabalho infantil

**Eixo 2 — Tecnologia e sociedade**
Fake news / desinformação · Exclusão digital · Privacidade de dados · Impactos das redes sociais · Inteligência artificial e emprego

**Eixo 3 — Meio ambiente e sustentabilidade**
Desmatamento · Crise hídrica · Mudanças climáticas · Resíduos sólidos · Agroecologia

**Eixo 4 — Saúde e bem-estar**
Saúde mental · Dependência química · Acesso ao sistema de saúde · Sedentarismo

**Eixo 5 — Educação e cultura**
Evasão escolar · Acesso ao ensino superior · Bullying · Educação inclusiva

**Estratégia de priorização:**
Comece pelos eixos 1 e 2 — são os que aparecem com mais frequência e para os quais é mais fácil montar repertório versátil. Aprenda 5 boas referências que funcionem para esses dois eixos e você já cobre 60% das possibilidades do ENEM.

Quer que eu monte um repertório específico para algum eixo?`
  }

  // ── Pontuação / meta específica ────────────────────────────────────────────
  if (msg.includes('600') || msg.includes('700') || msg.includes('800') || msg.includes('900') || msg.includes('1000') || msg.includes('plano') || msg.includes('evoluir') || msg.includes('melhorar nota')) {
    const score = context.avgScore ?? 500
    const targets = [600, 700, 800, 900]
    const target = targets.find(t => t > score) ?? 1000

    return `Com média de **${score} pts**, aqui está o mapa para os ${target}:

**Onde estão os ${target - score} pts que faltam:**
Cada competência vale até 200 pts. Se você tem 120 em alguma, chegar a 160 é muito mais rápido do que ir de 180 para 200. Foque nas competências mais abaixo primeiro.

**Plano em 3 redações:**

📝 **Redação 1 — Proposta de intervenção**
Dedique 20 minutos só à conclusão. Escreva a proposta com os 4 elementos explícitos e peça avaliação específica da C5.

📝 **Redação 2 — Repertório obrigatório**
Antes de escrever: liste 2 dados + 1 autor + 1 referência jurídica. Force-se a incluir pelo menos 1 evidência concreta por parágrafo.

📝 **Redação 3 — Coesão**
Escreva normalmente. Na revisão, troque todos os conectivos genéricos por variações do meu repertório. Releia em voz alta.

**Meta realista:** ${target - score} pts em 3 competências = ~${Math.round((target - score) / 3)} pts por competência. Alcançável em 3–5 redações com foco definido${context.worstCompKey ? ` — comece pela ${COMP_SHORT[context.worstCompKey]}` : ''}.

Qual competência você quer aprofundar primeiro?`
  }

  // ── Resposta genérica útil ─────────────────────────────────────────────────
  return `Entendi. Posso te ajudar com isso de forma direta.

A estratégia mais eficaz na redação ENEM é **focar em uma competência por redação** — em vez de tentar melhorar tudo ao mesmo tempo. Isso acelera muito o progresso.

**Como posso ajudar você agora:**
- 📄 **Cole um parágrafo** e faço análise pelas 5 competências
- 🎯 **Me diga um tema** e monto um kit de repertório completo
- 📊 **Me diga sua meta de pontuação** e crio um plano de 4 semanas
- ✍️ **Pergunte sobre qualquer competência** (C1 a C5) com exemplos reais
- 🔁 **Me mande sua proposta de intervenção** e avaliamos se tem os 4 elementos

Qual dessas opções faz mais sentido para onde você está agora?`
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/biia.webp" alt="Biia" className="w-full h-full object-cover" />
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

// ─── Main component ────────────────────────────────────────────────────────────

// Detect if the user pasted an essay (long text with multiple paragraphs / sentences)
function looksLikeEssay(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 250) return false
  const paragraphs = trimmed.split(/\n\n+/).filter(p => p.trim().length > 30)
  if (paragraphs.length >= 2) return true
  const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 20)
  return sentences.length >= 5
}

export function BiiaChat({ firstName, worstCompKey, avgScore, lastTheme, isNewUser, recentThemes }: BiiaChatProps) {
  const suggestions = getSuggestedPrompts(worstCompKey, lastTheme, avgScore, isNewUser)

  const getInitialMessage = (): Message => {
    let content: string

    if (isNewUser) {
      content = `Oi, ${firstName}! Sou a **Biia**, sua tutora de redação com IA. 🎉\n\nComo você está começando agora, vou te ajudar a construir uma base sólida desde a primeira redação.\n\nPosso te ensinar:\n- A estrutura ideal da redação dissertativa-argumentativa\n- Como montar uma proposta de intervenção nota 200\n- Repertório de argumentos para os temas mais frequentes do ENEM\n- Técnicas de revisão para eliminar erros de C1\n\nQual é a sua maior dúvida antes de escrever sua primeira redação?`
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
  const bottomRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLTextAreaElement>(null)

  // URL param: pre-fill prompt from sidebar links
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const prompt = params.get('prompt')
    if (prompt) {
      setInput(decodeURIComponent(prompt))
      inputRef.current?.focus()
    }
  }, [])

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
      const response = await getAIResponse(trimmed, { firstName, worstCompKey, avgScore, isNewUser })
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
  }, [isTyping, firstName, worstCompKey, avgScore, isNewUser])

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

  // Suppress unused warning for recentThemes — available for future use
  void recentThemes

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

      {/* Suggestions — only before user sends any message */}
      {messages.length === 1 && !isTyping && (
        <div className="py-3 border-t border-white/[0.05]">
          {/* Biia is suggesting — anchor with her avatar */}
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
