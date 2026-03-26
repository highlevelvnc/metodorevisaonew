import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Minha Evolução',
  robots: { index: false, follow: false },
}

export default function EvolucaoPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Minha Evolução</h1>
        <p className="text-gray-500 text-sm">Acompanhe sua progressão em cada competência do ENEM</p>
      </div>

      <div className="card-dark p-6 rounded-2xl">
        <p className="text-gray-600 text-sm text-center py-8">
          Gráficos de evolução em construção — aqui você verá C1 a C5 ao longo do tempo
        </p>
      </div>
    </div>
  )
}
