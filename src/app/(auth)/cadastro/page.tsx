import type { Metadata } from 'next'
import RegisterForm from './RegisterForm'

export const metadata: Metadata = {
  title: 'Criar conta',
  robots: { index: false, follow: false },
}

export default function CadastroPage() {
  return <RegisterForm />
}
