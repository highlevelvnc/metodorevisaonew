import Link from 'next/link'
import { ArrowRight, Sparkles, BookOpen, Target, Brain, MessageCircle } from 'lucide-react'

interface BiiaCardProps {
  worstCompKey: string | null
  avgScore: number | null
  firstName: string
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

const QUICK_CHIPS = [
  { label: 'Como melhorar minha nota?', href: '/aluno/biia?q=como+melhorar+minha+nota', icon: <Target size={11} /> },
  { label: 'Repertório para este tema',  href: '/aluno/biia?q=repertorio',               icon: <BookOpen size={11} /> },
  { label: 'Revisar proposta C5',        href: '/aluno/biia?q=proposta+c5',              icon: <Brain size={11} /> },
]

function getBiiaPreview(worstCompKey: string | null, avgScore: number | null, firstName: string): string {
  if (worstCompKey && COMP_NAMES[worstCompKey]) {
    const short = COMP_SHORT[worstCompKey]
    const name  = COMP_NAMES[worstCompKey]
    return `Oi, ${firstName}! Analisei suas redações e ${name} (${short}) é seu maior potencial de crescimento agora. Quer um treino direcionado?`
  }
  if (avgScore !== null && avgScore >= 700) {
    return `Olá, ${firstName}! Sua média está ótima. Para cruzar os 900 pts, refinamos a proposta de intervenção — os 4 elementos com exemplos. Vamos?`
  }
  return `Oi, ${firstName}! Sou a Biia, sua tutora de redação com IA. Posso ajudar com repertório, revisar argumentos, sugerir temas e muito mais.`
}

export function BiiaCard({ worstCompKey, avgScore, firstName }: BiiaCardProps) {
  const preview = getBiiaPreview(worstCompKey, avgScore, firstName)

  return (
    <div className="flex flex-col h-full rounded-2xl border border-purple-500/20 overflow-hidden bg-[#0d1220]">

      {/* Header */}
      <div className="relative px-5 pt-5 pb-4 overflow-hidden">
        {/* Header background */}
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

          <div className="flex items-center gap-1.5 text-[10px] font-medium text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Online
          </div>
        </div>
      </div>

      {/* Chat bubble */}
      <div className="px-5 py-4 flex-1">
        <div className="flex gap-2.5">
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-purple-600/20 border border-purple-500/25 flex-shrink-0 flex items-center justify-center mt-0.5">
            <Sparkles size={11} className="text-purple-400" />
          </div>
          {/* Bubble */}
          <div className="flex-1">
            <div className="relative bg-white/[0.04] border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="text-[13px] text-gray-300 leading-relaxed">{preview}</p>
            </div>
          </div>
        </div>

        {/* Quick action chips */}
        <div className="mt-4 space-y-1.5">
          {QUICK_CHIPS.map(chip => (
            <Link
              key={chip.label}
              href={chip.href}
              className="group flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[12px] text-gray-500 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:text-gray-200 hover:border-white/[0.10] transition-all"
            >
              <span className="text-purple-500 group-hover:text-purple-400 transition-colors flex-shrink-0">
                {chip.icon}
              </span>
              {chip.label}
              <ArrowRight size={10} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
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
