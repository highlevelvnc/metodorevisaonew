import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Meu Perfil',
  robots: { index: false, follow: false },
}

export default function ContaPage() {
  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Meu Perfil</h1>
        <p className="text-gray-500 text-sm">Gerencie seus dados e preferências</p>
      </div>

      <div className="card-dark p-6 rounded-2xl">
        <p className="text-gray-600 text-sm text-center py-8">
          Configurações de perfil em construção
        </p>
      </div>
    </div>
  )
}
