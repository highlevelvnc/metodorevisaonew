import Link from 'next/link'
import { MessageCircle, ArrowRight, Sparkles, BookOpen, Target, Brain } from 'lucide-react'

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

const QUICK_CHIPS = [
  { label: 'Como melhorar minha nota?',     href: '/aluno/biia?q=como+melhorar+minha+nota', icon: <Target size={12} /> },
  { label: 'Repertório para este tema',      href: '/aluno/biia?q=repertorio',               icon: <BookOpen size={12} /> },
  { label: 'Revisar minha proposta C5',     href: '/aluno/biia?q=proposta+c5',              icon: <Brain size={12} /> },
]

function getBiiaPreview(worstCompKey: string | null, avgScore: number | null, firstName: string): string {
  if (worstCompKey && COMP_NAMES[worstCompKey]) {
    return `Oi, ${firstName}! Analisei suas redações e identifiquei que ${COMP_NAMES[worstCompKey]} é seu maior potencial de crescimento. Quer que eu prepare um treino específico para essa competência?`
  }
  if (avgScore !== null && avgScore >= 700) {
    return `Olá, ${firstName}! Sua média está excelente. Para cruzar os 900 pts, o próximo nível é refinar a proposta de intervenção com todos os 4 elementos. Vamos trabalhar nisso?`
  }
  return `Oi, ${firstName}! Sou a Biia, sua parceira de estudos com IA. Posso ajudar com repertório, revisar sua proposta de intervenção, sugerir temas e muito mais. Por onde começamos?`
}

export function BiiaCard({ worstCompKey, avgScore, firstName }: BiiaCardProps) {
  const preview = getBiiaPreview(worstCompKey, avgScore, firstName)

  return (
    <div className="rounded-2xl overflow-hidden border border-purple-500/20 flex flex-col h-full">
      {/* Header gradient */}
      <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-purple-900/60 via-purple-800/30 to-[#0d1220]">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(ellipse at top right, #7c3aed, transparent 70%)' }}
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center">
              <Sparkles size={18} className="text-purple-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Biia AI</p>
              <p className="text-xs text-purple-400">Tutora de redação ENEM</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] text-green-400 font-medium bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Online
          </span>
        </div>
      </div>

      {/* Chat preview */}
      <div className="flex-1 bg-[#0d1220] px-5 py-4">
        <div className="flex gap-2.5">
          <div className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-500/30 flex-shrink-0 flex items-center justify-center mt-0.5">
            <Sparkles size={10} className="text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl rounded-tl-none px-3.5 py-2.5">
              <p className="text-sm text-gray-300 leading-relaxed">{preview}</p>
            </div>
          </div>
        </div>

        {/* Quick chips */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {QUICK_CHIPS.map(chip => (
            <Link
              key={chip.label}
              href={chip.href}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:text-gray-200 hover:border-white/[0.12] transition-all"
            >
              {chip.icon}
              {chip.label}
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 py-4 bg-[#0d1220] border-t border-white/[0.06]">
        <Link
          href="/aluno/biia"
          className="flex items-center justify-center gap-2 w-full h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 text-sm font-medium text-purple-300 hover:bg-purple-600/30 hover:text-purple-200 transition-all"
        >
          <MessageCircle size={14} />
          Conversar com Biia
          <ArrowRight size={13} className="opacity-60" />
        </Link>
      </div>
    </div>
  )
}
