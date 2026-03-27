'use client'

import Link from 'next/link'
import { trackEvent } from '@/components/Analytics'
import { TeamSection } from '@/components/ui/team-section-1'

// ─── Founders data ─────────────────────────────────────────────────────────────

const FOUNDERS = [
  {
    name:        'Patrícia Guimarães',
    designation: 'Professora de redação ENEM',
    badge:       'Sócia fundadora',
    imageSrc:    '/patricia.jpeg',
    alt:         'Patrícia Guimarães — fundadora e professora de redação ENEM',
    description: 'Formada em Letras pela UERJ, com duas pós-graduações e mestrado pela Universidade de Coimbra. Professora da rede pública do Rio de Janeiro há mais de 36 anos. Especialista em formação de base, estrutura textual e argumentação consistente.',
    tags: ['36+ anos de experiência', 'UERJ + Coimbra', 'Formação sólida'],
  },
  {
    name:        'Beatriz Dias',
    designation: 'Corretora especialista ENEM',
    badge:       'Sócia fundadora',
    imageSrc:    '/bia.jpg',
    alt:         'Beatriz Dias — fundadora e corretora especialista ENEM',
    description: 'Graduada em Letras — Literatura pela UNESA. Com mais de 3 anos de experiência em correção estratégica para ENEM e vestibulares. Responsável pela aplicação prática do método e pelo acompanhamento da evolução dos alunos. Foco em diagnóstico preciso, identificação de padrões de erro e evolução contínua.',
    tags: ['Letras — Literatura · UNESA', '+3 anos de experiência', 'Correção estratégica'],
  },
]

// ─── Platform stats ───────────────────────────────────────────────────────────

const STATS = [
  {
    value: '+5.000',
    label: 'Redações corrigidas',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        <path d="M19.5 7.125L18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    value: '+10.000',
    label: 'Alunos na plataforma',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    value: '4.9/5',
    label: 'Avaliação pelos alunos',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    value: '36+',
    label: 'Anos de experiência',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
]

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Especialista() {
  return (
    <section id="especialistas" className="section-padding relative overflow-hidden">

      {/* Section border accents */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-600/30 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-600/20 to-transparent" />

      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        aria-hidden="true"
      />

      <div className="section-container relative">

        {/* ── LAYER 1 + 2: Header + Founder cards via TeamSection ──────── */}
        <TeamSection
          label="As especialistas"
          title={
            <>
              Quem está por trás da<br />
              <span className="gradient-text">sua evolução</span>
            </>
          }
          description="Você não está enviando sua redação para um sistema. Está sendo corrigido por especialistas com décadas de experiência real em ensino e aprovação."
          members={FOUNDERS}
        />

        {/* ── LAYER 3: Platform trust metrics ──────────────────────────── */}
        <div className="mt-14 max-w-4xl mx-auto">

          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-white/[0.05]" />
            <p className="text-xs text-gray-600 font-medium tracking-widest uppercase whitespace-nowrap">
              Resultados do método
            </p>
            <div className="flex-1 h-px bg-white/[0.05]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center text-center p-5 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div className="icon-box-purple w-9 h-9 rounded-lg flex-shrink-0 mb-3">
                  {stat.icon}
                </div>
                <p className="text-xl font-extrabold text-white leading-none mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 leading-snug">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <div className="text-center mt-12">
          <Link
            href="/#planos"
            className="btn-primary"
            onClick={() => trackEvent('cta_click', { source: 'especialista' })}
          >
            Quero ser corrigido por estas especialistas
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="text-xs text-gray-700 mt-3">
            Sem fidelidade · Devolutiva em até 48h
          </p>
        </div>

      </div>
    </section>
  )
}
