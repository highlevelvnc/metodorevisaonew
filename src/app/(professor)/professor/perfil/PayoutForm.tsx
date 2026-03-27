'use client'

import { useRef, useTransition } from 'react'
import { Loader2, Save } from 'lucide-react'
import { upsertPayoutProfile } from './actions'
import type { PixKeyType } from '@/lib/supabase/types'

interface PayoutFormProps {
  initial: {
    pix_key:      string | null
    pix_key_type: PixKeyType | null
    cpf:          string | null
    short_bio:    string | null
  } | null
}

const PIX_TYPES: { value: PixKeyType; label: string }[] = [
  { value: 'cpf',    label: 'CPF'          },
  { value: 'cnpj',   label: 'CNPJ'         },
  { value: 'email',  label: 'E-mail'       },
  { value: 'phone',  label: 'Celular'      },
  { value: 'random', label: 'Chave aleatória' },
]

export default function PayoutForm({ initial }: PayoutFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(() => upsertPayoutProfile(fd))
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

      {/* Bio */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1.5">
          Biografia curta
          <span className="text-gray-700 font-normal ml-1">(opcional)</span>
        </label>
        <textarea
          name="short_bio"
          defaultValue={initial?.short_bio ?? ''}
          rows={3}
          maxLength={300}
          placeholder="Escreva uma apresentação breve para os alunos..."
          className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder:text-gray-700 focus:outline-none focus:border-amber-500/40 resize-none leading-relaxed"
        />
      </div>

      {/* CPF */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1.5">CPF</label>
        <input
          type="text"
          name="cpf"
          defaultValue={initial?.cpf ?? ''}
          placeholder="000.000.000-00"
          maxLength={14}
          className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder:text-gray-700 focus:outline-none focus:border-amber-500/40"
        />
        <p className="text-[10px] text-gray-700 mt-1.5">Usado para emissão de recibos e registros de pagamento.</p>
      </div>

      {/* PIX */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Tipo de chave PIX</label>
          <select
            name="pix_key_type"
            defaultValue={initial?.pix_key_type ?? ''}
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-amber-500/40 appearance-none"
          >
            <option value="" disabled className="bg-neutral-900 text-gray-500">Selecione...</option>
            {PIX_TYPES.map(t => (
              <option key={t.value} value={t.value} className="bg-neutral-900 text-gray-200">
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Chave PIX</label>
          <input
            type="text"
            name="pix_key"
            defaultValue={initial?.pix_key ?? ''}
            placeholder="Sua chave PIX"
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder:text-gray-700 focus:outline-none focus:border-amber-500/40"
          />
        </div>
      </div>
      <p className="text-[10px] text-gray-700 -mt-2">
        Usada exclusivamente para recebimento de pagamentos pelo Método Revisão.
      </p>

      {/* Submit */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          {isPending
            ? <><Loader2 size={14} className="animate-spin" /> Salvando...</>
            : <><Save size={14} /> Salvar dados de pagamento</>}
        </button>
      </div>
    </form>
  )
}
