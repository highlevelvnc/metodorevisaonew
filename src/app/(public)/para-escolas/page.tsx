import type { Metadata } from 'next'
import ParaEscolasContent from './ParaEscolasContent'

export const metadata: Metadata = {
  title: 'Método Revisão para Escolas — Correção estratégica de redação ENEM por turma',
  description:
    'Sistema de correção estratégica de redação para escolas: professoras especializadas em ENEM entregam devolutiva individual em 24h, com diagnóstico por competência e acompanhamento de evolução por turma — resultado mensurável, sem sobrecarga para os professores.',
}

export default function ParaEscolasPage() {
  return <ParaEscolasContent />
}
