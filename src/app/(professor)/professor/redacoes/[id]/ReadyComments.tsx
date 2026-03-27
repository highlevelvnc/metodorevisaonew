'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, MessageSquarePlus } from 'lucide-react'
import { COMP_COLORS, type CompKey } from '@/lib/competency-colors'
import { READY_COMMENTS, type ReadyComment } from '@/lib/ready-comments'

interface Props {
  compKey: CompKey
  onInsert: (text: string) => void
}

const QUALITY_STYLE: Record<ReadyComment['quality'], string> = {
  positive: 'border-emerald-500/25 hover:border-emerald-500/50 hover:bg-emerald-500/[0.06] text-emerald-300/80',
  neutral:  'border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/[0.05] text-amber-200/70',
  negative: 'border-red-500/20 hover:border-red-500/35 hover:bg-red-500/[0.05] text-red-300/70',
}

const QUALITY_DOT: Record<ReadyComment['quality'], string> = {
  positive: 'bg-emerald-500',
  neutral:  'bg-amber-500',
  negative: 'bg-red-500',
}

export function ReadyComments({ compKey, onInsert }: Props) {
  const [open, setOpen] = useState(false)
  const [activeSub, setActiveSub] = useState<number>(0)

  const colors   = COMP_COLORS[compKey]
  const data     = READY_COMMENTS[compKey]
  if (!data) return null

  const subData  = data.subcriteria[activeSub]

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
          open
            ? `${colors.bg} ${colors.border} ${colors.text}`
            : 'bg-white/[0.03] border-white/[0.06] text-gray-600 hover:text-gray-400 hover:bg-white/[0.05]'
        }`}
      >
        <MessageSquarePlus size={9} />
        Comentários prontos
        {open ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
      </button>

      {open && (
        <div className={`mt-2 rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
          {/* Sub-criterion tabs */}
          <div className="flex gap-0 overflow-x-auto scrollbar-none border-b border-white/[0.06]">
            {data.subcriteria.map((sub, i) => (
              <button
                key={sub.label}
                type="button"
                onClick={() => setActiveSub(i)}
                className={`px-3 py-2 text-[10px] font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeSub === i
                    ? `${colors.text} border-b-2 ${colors.border.replace('border-', 'border-b-')}`
                    : 'text-gray-600 hover:text-gray-400 border-b-2 border-transparent'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Comment pills */}
          <div className="p-2.5 space-y-1.5">
            <p className={`text-[9px] font-semibold uppercase tracking-wider mb-2 ${colors.text}`}>
              {subData.label} — clique para inserir
            </p>
            {subData.comments.map((comment, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onInsert(comment.text)}
                className={`w-full text-left text-[11px] leading-relaxed px-3 py-2 rounded-lg border transition-all ${QUALITY_STYLE[comment.quality]}`}
              >
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 mb-0.5 flex-shrink-0 ${QUALITY_DOT[comment.quality]}`} />
                {comment.text}
              </button>
            ))}
          </div>

          <div className="px-3 pb-2 pt-0">
            <p className="text-[9px] text-gray-700">
              O texto inserido pode ser editado no campo de feedback antes de salvar.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
