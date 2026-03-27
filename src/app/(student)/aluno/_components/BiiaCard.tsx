import Link from 'next/link'
import { ArrowRight, Sparkles, BookOpen, Target, MessageCircle, FileText, Flame, PenLine, Clock } from 'lucide-react'

interface BiiaCardProps {
  worstCompKey: string | null
  avgScore: number | null
  firstName: string
  daysSinceLastCorrection: number | null
  lastCorrectedEssayId: string | null
  streak: number
}

const COMP_NAMES: Record<string, string> = {
  c1_score: 'Norma Culta',
  c2_score: 'Compreensão do Tema',
  c3_score: 'Seleção de Argumentos',
  c4_score: 'Mecanismos de Coesão',
  c5_score: 'Proposta de Intervenção',
}

const COMP_SHORT: Record<string, string> = {
  c1_score: 'C1', c2_score: 'C2', c3_score: 'C3', c4_score: 'C4', c5_score: 'C5',
}

// ─── Context-aware quick chips ────────────────────────────────────────────────

interface QuickChip { label: string; href: string; icon: React.ReactNode }

function getChips(
  worstCompKey: string | null,
  avgScore: number | null,
  daysSinceLastCorrection: number | null,
  lastCorrectedEssayId: string | null,
): QuickChip[] {
  const chips: QuickChip[] = []

  // 1. Weakest competency — most specific and highest value
  if (worstCompKey && COMP_NAMES[worstCompKey]) {
    chips.push({
      label: `Exercício de ${COMP_SHORT[worstCompKey]} — ${COMP_NAMES[worstCompKey]}`,
      href: `/aluno/biia?prompt=${encodeURIComponent(`Minha ${COMP_NAMES[worstCompKey]} é meu ponto mais fraco. Me dê um exercício prático com feedback imediato para melhorá-la.`)}`,
      icon: <Target size={11} />,
    })
  }

  // 2. Recent correction — very actionable
  if (daysSinceLastCorrection !== null && daysSinceLastCorrection <= 7 && lastCorrectedEssayId) {
    const timing = daysSinceLastCorrection === 0 ? 'hoje' : `${daysSinceLastCorrection}d atrás`
    chips.push({
      label: `Entender devolutiva de ${timing}`,
      href: `/aluno/biia?prompt=${encodeURIComponent('Recebi minha devolutiva recentemente. Me ajude a entender cada nota e criar um plano de melhoria específico para a próxima redação.')}`,
      icon: <FileText size={11} />,
    })
  }

  // 3. Score gap goal
  if (avgScore !== null && avgScore < 700) {
    const target = avgScore < 500 ? 600 : avgScore < 600 ? 700 : 800
    chips.push({
      label: `Plano para ${target} pts`,
      href: `/aluno/biia?prompt=${encodeURIComponent(`Minha média é ${avgScore} pts. Quero chegar a ${target} pts. Qual é o plano mais direto para as próximas 3 redações?`)}`,
      icon: <ArrowRight size={11} />,
    })
  }

  // 4. Repertoire (always valuable)
  chips.push({
    label: 'Montar repertório para próximo tema',
    href: `/aluno/biia?prompt=${encodeURIComponent('Me ajude a montar um repertório de argumentos, dados e referências para escrever sobre um tema atual do ENEM.')}`,
    icon: <BookOpen size={11} />,
  })

  // 5. C5 is always a gap
  chips.push({
    label: 'Revisar proposta de intervenção (C5)',
    href: `/aluno/biia?prompt=${encodeURIComponent('Me mostre como montar uma proposta de intervenção nota 200 com os 4 elementos obrigatórios e um exemplo completo.')}`,
    icon: <PenLine size={11} />,
  })

  return chips.slice(0, 3)
}

// ─── Preview message ──────────────────────────────────────────────────────────

function getPreview(
  worstCompKey: string | null,
  avgScore: number | null,
  firstName: string,
  daysSinceLastCorrection: number | null,
  streak: number,
): string {
  if (daysSinceLastCorrection !== null && daysSinceLastCorrection <= 2) {
    const timing = daysSinceLastCorrection === 0 ? 'hoje' : 'ontem'
    return `${firstName}, sua devolutiva chegou ${timing}! Quer que eu te ajude a entender cada nota e criar um plano de melhoria para a próxima redação?`
  }
  if (streak >= 3) {
    return `${streak} semanas consecutivas, ${firstName}! 🔥 Com esse ritmo, posso te ajudar a transformar cada redação num salto de pontuação. O que trabalhamos hoje?`
  }
  if (worstCompKey && COMP_NAMES[worstCompKey]) {
    const short = COMP_SHORT[worstCompKey]
    const name  = COMP_NAMES[worstCompKey]
    return `${firstName}, analisei suas redações: ${name} (${short}) é onde estão os pontos mais fáceis de recuperar agora. Quer um exercício específico?`
  }
  if (avgScore !== null && avgScore >= 700) {
    return `${firstName}, ${avgScore} pts de média é ótimo. Para cruzar os 900, o diferencial está na precisão da proposta de intervenção — quer refiná-la?`
  }
  return `Oi, ${firstName}! Posso analisar seus parágrafos, montar repertório, revisar proposta de intervenção ou criar um plano de estudos. O que precisa hoje?`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BiiaCard({
  worstCompKey,
  avgScore,
  firstName,
  daysSinceLastCorrection,
  lastCorrectedEssayId,
  streak,
}: BiiaCardProps) {
  const preview = getPreview(worstCompKey, avgScore, firstName, daysSinceLastCorrection, streak)
  const chips   = getChips(worstCompKey, avgScore, daysSinceLastCorrection, lastCorrectedEssayId)

  return (
    <div className="flex flex-col h-full rounded-2xl border border-purple-500/20 overflow-hidden bg-[#0d1220]">

      {/* Header */}
      <div className="relative px-5 pt-5 pb-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-purple-800/20 to-transparent" />
        <div
          className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/25 border border-purple-500/30 flex items-center justify-center">
              <Sparkles size={17} className="text-purple-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Biia AI</p>
              <p className="text-[11px] text-purple-400/80">Tutora de redação ENEM</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {streak >= 2 && (
              <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">
                <Flame size={9} />
                {streak}w
              </div>
            )}
            {daysSinceLastCorrection !== null && daysSinceLastCorrection <= 7 && (
              <div className="flex items-center gap-1 text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full">
                <Clock size={9} />
                {daysSinceLastCorrection === 0 ? 'hoje' : `${daysSinceLastCorrection}d`}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Online
            </div>
          </div>
        </div>

        {/* Context line */}
        {avgScore !== null && (
          <div className="relative mt-3 flex items-center gap-2 text-[11px] text-gray-600">
            <span>Média atual:</span>
            <span className="font-semibold text-white">{avgScore} pts</span>
            {worstCompKey && (
              <>
                <span className="text-gray-700">·</span>
                <span>Foco:</span>
                <span className="text-amber-400 font-semibold">{COMP_SHORT[worstCompKey]}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Chat bubble */}
      <div className="px-5 py-4 flex-1">
        <div className="flex gap-2.5">
          <div className="w-7 h-7 rounded-full bg-purple-600/20 border border-purple-500/25 flex-shrink-0 flex items-center justify-center mt-0.5">
            <Sparkles size={11} className="text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="text-[13px] text-gray-300 leading-relaxed">{preview}</p>
            </div>
          </div>
        </div>

        {/* Context-aware chips */}
        <div className="mt-4 space-y-1.5">
          {chips.map((chip, i) => (
            <Link
              key={i}
              href={chip.href}
              className="group flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[12px] text-gray-500 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:text-gray-200 hover:border-white/[0.10] transition-all"
            >
              <span className="text-purple-500 group-hover:text-purple-400 transition-colors flex-shrink-0">
                {chip.icon}
              </span>
              <span className="line-clamp-1">{chip.label}</span>
              <ArrowRight size={10} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <Link
          href="/aluno/biia"
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-purple-700/20 border border-purple-600/30 text-sm font-semibold text-purple-300 hover:bg-purple-700/35 hover:text-purple-200 hover:border-purple-500/50 transition-all"
        >
          <MessageCircle size={14} />
          Abrir conversa com Biia
          <ArrowRight size={13} className="opacity-50" />
        </Link>
      </div>
    </div>
  )
}
