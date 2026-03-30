'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { trackEvent } from './Analytics'

function useTrackView(source: string, target: string) {
  const tracked = useRef(false)
  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    trackEvent('cross_sell_viewed', { source, target })
  }, [source, target])
}

export function CrossSellReforco() {
  useTrackView('dashboard_redacao', 'reforco')

  return (
    <div className="rounded-xl border border-blue-500/15 bg-blue-500/[0.03] px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white mb-0.5">Travado em alguma matéria?</p>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Aulas individuais de Português, Inglês, Redação e Literatura com acompanhamento real. Alunos que combinam correção + reforço evoluem mais rápido.
        </p>
      </div>
      <Link
        href="/aluno/reforco-escolar/planos?ref=cross_sell"
        onClick={() => trackEvent('cross_sell_clicked', { source: 'dashboard_redacao', target: 'reforco' })}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0 whitespace-nowrap"
      >
        Ver planos de aula →
      </Link>
    </div>
  )
}

export function CrossSellRedacao() {
  useTrackView('dashboard_reforco', 'redacao')

  return (
    <div className="rounded-xl border border-purple-500/15 bg-purple-500/[0.03] px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white mb-0.5">Quer melhorar sua redação?</p>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Correção estratégica com devolutiva C1–C5 por especialista. Combine com suas aulas para resultado completo no ENEM.
        </p>
      </div>
      <Link
        href="/aluno/upgrade?ref=cross_sell"
        onClick={() => trackEvent('cross_sell_clicked', { source: 'dashboard_reforco', target: 'redacao' })}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex-shrink-0 whitespace-nowrap"
      >
        Ver planos de redação →
      </Link>
    </div>
  )
}
