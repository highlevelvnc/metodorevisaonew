'use client'

import Image from 'next/image'
import Link from 'next/link'
import { trackEvent } from '@/components/Analytics'

// ─── Founders data ─────────────────────────────────────────────────────────────

const FOUNDERS = [
  {
    name:        'Patrícia Guimarães',
    role:        'Sócia fundadora · Professora de redação ENEM',
    image:       '/patricia.jpeg',
    alt:         'Patrícia Guimarães — fundadora e professora de redação ENEM',
    description: 'Formada em Letras pela UERJ, com duas pós-graduações e mestrado pela Universidade de Coimbra. Professora da rede pública do Rio de Janeiro há mais de 36 anos. Especialista em formação de base, estrutura textual e desenvolvimento de argumentação consistente.',
    tags: ['36+ anos de experiência', 'UERJ + Coimbra', 'Formação sólida'],
  },
  {
    name:        'Beatriz Dias',
    role:        'Sócia fundadora · Corretora especialista',
    image:       '/bia.jpg',
    alt:         'Beatriz Dias — fundadora e corretora especialista ENEM',
    description: 'Especialista em correção estratégica para ENEM e vestibulares. Responsável pela aplicação prática do método e acompanhamento da evolução dos alunos. Foco em diagnóstico preciso, identificação de padrões de erro e evolução contínua.',
    tags: ['Correção estratégica', 'Foco em evolução', 'Método aplicado'],
  },
]

// ─── Platform stats (replaces bullet-list credentials) ────────────────────────

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

      {/* Subtle ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        aria-hidden="true"
      />

      <div className="section-container relative">

        {/* ── LAYER 1: Header ───────────────────────────────────────────── */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="section-label justify-center">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            As especialistas
          </p>
          <h2 className="section-title mt-3 mb-5">
            Quem está por trás da<br />
            <span className="gradient-text">sua evolução</span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed">
            Você não está enviando sua redação para um sistema. Está sendo corrigido por especialistas com décadas de experiência real em ensino e aprovação.
          </p>
        </div>

        {/* ── LAYER 2: Founder cards ────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6 xl:gap-8 max-w-4xl mx-auto">
          {FOUNDERS.map((founder) => (
            <FounderCard key={founder.name} {...founder} />
          ))}
        </div>

        {/* ── LAYER 3: Platform trust metrics ──────────────────────────── */}
        <div className="mt-14 max-w-4xl mx-auto">

          {/* Divider line */}
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

// ─── FounderCard ──────────────────────────────────────────────────────────────

interface FounderCardProps {
  name:        string
  role:        string
  image:       string
  alt:         string
  description: string
  tags:        string[]
}

function FounderCard({ name, role, image, alt, description, tags }: FounderCardProps) {
  return (
    <article
      className="group rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'linear-gradient(160deg, rgba(14,19,33,0.95) 0%, rgba(9,13,23,0.98) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.40)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >

      {/* ── Photo area ──────────────────────────────────────────────────── */}
      <div className="relative w-full flex-shrink-0" style={{ height: '280px' }}>

        {/* Portrait image */}
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-top"
          priority
        />

        {/* Gradient fade — photo blends into card content below */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(9,13,23,1) 0%, rgba(9,13,23,0.5) 30%, transparent 60%)',
          }}
          aria-hidden="true"
        />

        {/* Top shimmer accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.50) 50%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        {/* Founder badge pinned to bottom of photo area */}
        <div className="absolute bottom-4 left-5">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(139,92,246,0.18)',
              border: '1px solid rgba(139,92,246,0.35)',
              color: 'rgba(196,168,255,0.9)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.9)' }}
            />
            Sócia fundadora
          </span>
        </div>

      </div>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 px-6 pb-6 pt-5">

        {/* Role */}
        <p className="text-[11px] text-purple-400/80 font-semibold uppercase tracking-widest leading-none mb-2">
          {role.split('·')[1]?.trim() ?? role}
        </p>

        {/* Name */}
        <h3 className="text-xl font-bold text-white leading-tight mb-3">
          {name}
        </h3>

        {/* Description — max 4 lines visible */}
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-4 mb-5">
          {description}
        </p>

        {/* Tags — flex-wrap keeps them inside the card at all viewport widths */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center text-[11px] font-medium px-3 py-1 rounded-full whitespace-nowrap"
              style={{
                background: 'rgba(139,92,246,0.08)',
                border:     '1px solid rgba(139,92,246,0.20)',
                color:      'rgba(196,168,255,0.85)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

      </div>

      {/* Bottom glow accent on hover */}
      <div
        className="h-[1.5px] w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.60) 50%, transparent 100%)',
          boxShadow: '0 0 12px 3px rgba(139,92,246,0.30)',
        }}
        aria-hidden="true"
      />

    </article>
  )
}
