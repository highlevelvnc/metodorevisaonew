'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { CheckoutButton } from '../../upgrade/CheckoutButton'

type Plan = {
  id: string
  name: string
  slug: string
  price_brl: number
  lesson_count: number
}

export default function ExpandablePlans({
  plans,
  features,
  currentSlug,
  hasCurrentSub,
}: {
  plans: Plan[]
  features: Record<string, string[]>
  currentSlug: string | null
  hasCurrentSub: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-300 transition-colors py-2"
      >
        {open ? (
          <><ChevronUp size={14} /> Ocultar planos adicionais</>
        ) : (
          <><ChevronDown size={14} /> Ver mais {plans.length} planos (16, 22 e 34 aulas)</>
        )}
      </button>

      {open && (
        <div className="grid sm:grid-cols-3 gap-3 mt-2 animate-fade-in">
          {plans.map(plan => {
            const isCurrent      = currentSlug === plan.slug
            const pricePerLesson = plan.lesson_count > 0 ? Math.round(plan.price_brl / plan.lesson_count) : 0
            const featureList    = features[plan.slug] ?? [`${plan.lesson_count} aulas por mês`]

            return (
              <div key={plan.id} className={`card-dark rounded-2xl p-4 flex flex-col ${isCurrent ? 'border-green-500/30' : ''}`}>
                <h3 className="text-base font-bold text-white mb-0.5">{plan.name}</h3>
                <p className="text-[11px] text-gray-500 mb-3">{plan.lesson_count} aulas por mês</p>
                <div className="mb-3">
                  <span className="text-2xl font-black text-white">
                    R${plan.price_brl.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </span>
                  <span className="text-xs text-gray-600">/mês</span>
                  <p className="text-[10px] text-gray-500 mt-0.5">R${pricePerLesson} por aula</p>
                </div>
                <ul className="space-y-1.5 mb-4 flex-1">
                  {featureList.map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-[11px] text-gray-400">
                      <span className="text-green-400 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="text-center text-[11px] text-gray-600 py-2">Plano atual</div>
                ) : (
                  <CheckoutButton
                    planSlug={plan.slug}
                    label={hasCurrentSub ? 'Trocar plano' : 'Assinar'}
                    variant="secondary"
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
