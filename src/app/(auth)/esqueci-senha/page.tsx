import type { Metadata } from 'next'
import ResetForm from './ResetForm'

export const metadata: Metadata = {
  title: 'Recuperar senha',
  robots: { index: false, follow: false },
}

export default function EsqueciSenhaPage() {
  return <ResetForm />
}
