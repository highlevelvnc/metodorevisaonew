import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — Alunos',
  robots: { index: false, follow: false },
}

export default function AdminAlunosPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Alunos</h1>
        <p className="text-gray-500 text-sm">Lista de todos os alunos cadastrados</p>
      </div>
      <div className="card-dark p-6 rounded-2xl">
        <p className="text-gray-600 text-sm text-center py-8">
          Lista de alunos em construção
        </p>
      </div>
    </div>
  )
}
