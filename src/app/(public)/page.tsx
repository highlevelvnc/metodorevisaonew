import Hero from '@/components/sections/Hero'
import ProofBar from '@/components/sections/ProofBar'
import Dor from '@/components/sections/Dor'
import ComoFunciona from '@/components/sections/ComoFunciona'
import Especialista from '@/components/sections/Especialista'
import Diferenciais from '@/components/sections/Diferenciais'
import Transformacao from '@/components/sections/Transformacao'
import ParaEscolasTeaser from '@/components/sections/ParaEscolasTeaser'
import Planos from '@/components/sections/Planos'
import Garantia from '@/components/sections/Garantia'
import Depoimentos from '@/components/sections/Depoimentos'
import ParaQuem from '@/components/sections/ParaQuem'
import FAQ from '@/components/sections/FAQ'
import CTAFinal from '@/components/sections/CTAFinal'
import FloatingCTA from '@/components/sections/FloatingCTA'

export default function Home() {
  return (
    <>
      <Hero />
      <ProofBar />
      <Dor />
      <ComoFunciona />
      <Especialista />
      <Diferenciais />
      <Transformacao />
      <ParaEscolasTeaser />
      <Planos />
      <Garantia />
      <Depoimentos />
      <ParaQuem />
      <FAQ />
      <CTAFinal />
      {/* Global conversion elements */}
      <FloatingCTA />
    </>
  )
}
