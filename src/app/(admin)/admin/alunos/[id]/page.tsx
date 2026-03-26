import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Admin — Perfil do Aluno',
  robots: { index: false, follow: false },
}

export default function AdminAlunoPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <Link href="/admin/alunos" className="text-gray-500 hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-white">Perfil do Aluno</h1>
      </div>
      <div className="card-dark p-6 rounded-2xl">
        <p className="text-gray-600 text-sm text-center py-8">
          Perfil detalhado em construção
        </p>
      </div>
    </div>
  )
}
