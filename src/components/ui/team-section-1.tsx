'use client'

// ─── team-section-1.tsx ───────────────────────────────────────────────────────
// Adapted from the original TeamSection component.
// Color system mapped to Método Revisão's dark purple palette.
// Replaces: hsl(--primary) → rgba(139,92,246,…)
//           hsl(--muted)   → rgba(255,255,255,0.04)
//           bg-background  → rgba(8,12,22,…)
//           bg-card        → rgba(12,17,30,…)
// Added:    description, tags, alt fields on TeamMember
//           next/image replacing <img>
//           forwardRef preserved, displayName set

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TeamMember {
  name:         string
  designation:  string   // role / title
  description?: string   // short bio — displayed below name
  imageSrc:     string
  alt?:         string
  tags?:        string[] // skill / credential pills
  badge?:       string   // optional badge overlaid on avatar (e.g. "Sócia fundadora")
}

export interface TeamSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Eyebrow label rendered above the heading */
  label?:      string
  /** Section heading — accepts ReactNode so callers can use gradient spans */
  title?:      React.ReactNode
  description: string
  members:     TeamMember[]
}

// ─── Per-index card accent colours ───────────────────────────────────────────
// Subtle background tint that shifts across the grid.
// Wave, avatar ring, and badge all inherit the site's main purple.

const CARD_ACCENTS = [
  'rgba(139,92,246,0.07)',   // purple  — index 0
  'rgba(99,102,241,0.07)',   // indigo  — index 1
  'rgba(124,58,237,0.06)',   // violet  — index 2 (fallback)
]

// ─── TeamSection (forwardRef) ─────────────────────────────────────────────────

export const TeamSection = React.forwardRef<HTMLDivElement, TeamSectionProps>(
  ({ label, title, description, members, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>

        {/* ── Optional header block ──────────────────────────────────────── */}
        {(label || title || description) && (
          <div className="text-center max-w-2xl mx-auto mb-14">

            {label && (
              <p className="section-label justify-center mb-3">
                {/* People icon */}
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
                {label}
              </p>
            )}

            {title && (
              <h2 className="section-title mb-5">{title}</h2>
            )}

            <p className="text-gray-400 text-base leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {/* ── Member grid ────────────────────────────────────────────────── */}
        {/* Breakpoint logic adapts column count to member count             */}
        <div
          className={cn(
            'mx-auto grid gap-6 xl:gap-8',
            members.length === 1 ? 'max-w-sm'                              :
            members.length === 2 ? 'max-w-4xl lg:grid-cols-2'             :
            members.length === 3 ? 'max-w-5xl md:grid-cols-3'             :
                                   'max-w-5xl sm:grid-cols-2 lg:grid-cols-4',
          )}
        >
          {members.map((member, index) => (
            <MemberCard
              key={member.name}
              member={member}
              accentBg={CARD_ACCENTS[index % CARD_ACCENTS.length]}
              animDelay={index * 60}
            />
          ))}
        </div>

      </div>
    )
  },
)
TeamSection.displayName = 'TeamSection'

// ─── MemberCard ───────────────────────────────────────────────────────────────

interface MemberCardProps {
  member:    TeamMember
  accentBg:  string   // e.g. 'rgba(139,92,246,0.07)'
  animDelay: number   // ms stagger for wave + ring transitions
}

function MemberCard({ member, accentBg, animDelay }: MemberCardProps) {
  return (
    <article
      className={cn(
        'group relative flex flex-col items-center overflow-hidden',
        'rounded-2xl px-7 pb-7 pt-8 text-center',
        // Elevation: lifts 2 % and deepens shadow on hover
        'transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl',
        // Border: transparent → site purple on hover (pure Tailwind, no inline)
        'border border-white/[0.07] hover:border-purple-500/40',
      )}
      style={{
        // Base card colour + subtle per-index radial tint at the top
        background: [
          `radial-gradient(ellipse at 50% -10%, ${accentBg} 0%, transparent 65%)`,
          'linear-gradient(160deg, rgba(12,17,30,0.96) 0%, rgba(8,12,22,0.99) 100%)',
        ].join(', '),
        boxShadow: '0 4px 32px rgba(0,0,0,0.45)',
      }}
    >

      {/* ── Hover wave — scales up from the bottom (original behaviour) ── */}
      {/* scale-y-0 → scale-y-100 on group-hover, origin-bottom             */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2/3 origin-bottom scale-y-0 rounded-t-full
                   bg-gradient-to-t from-purple-600/[0.14] to-transparent
                   transition-transform duration-500 ease-out group-hover:scale-y-100"
        style={{ transitionDelay: `${animDelay}ms` }}
        aria-hidden="true"
      />

      {/* ── Top shimmer line ─────────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.45) 50%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── Avatar circle ─────────────────────────────────────────────────── */}
      {/* 224 px (14 rem) satisfies the 220 px minimum from the brief.        */}
      {/* On hover: border appears + ring + inner image scales 110 %.         */}
      <div
        className={cn(
          'relative z-10 flex-shrink-0',
          'h-56 w-56 overflow-hidden rounded-full',
          'border-4 border-transparent',
          'bg-white/[0.04]',
          'transition-all duration-500 ease-out',
          'group-hover:border-purple-500/55 group-hover:scale-105',
        )}
        style={{
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
          transitionDelay: `${animDelay + 40}ms`,
        }}
      >
        <Image
          src={member.imageSrc}
          alt={member.alt ?? member.name}
          fill
          sizes="224px"
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
          priority
        />

        {/* ── Hover glow ring behind the avatar ───────────────────────── */}
        <div
          className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.25) 0%, transparent 70%)',
            filter: 'blur(8px)',
            transitionDelay: `${animDelay + 40}ms`,
          }}
          aria-hidden="true"
        />
      </div>

      {/* ── Optional badge (e.g. "Sócia fundadora") ──────────────────────── */}
      {member.badge && (
        <div className="relative z-10 mt-4">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold
                       tracking-wide uppercase px-3 py-1 rounded-full"
            style={{
              background:    'rgba(139,92,246,0.14)',
              border:        '1px solid rgba(139,92,246,0.32)',
              color:         'rgba(196,168,255,0.90)',
              backdropFilter:'blur(6px)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.85)' }}
            />
            {member.badge}
          </span>
        </div>
      )}

      {/* ── Name ──────────────────────────────────────────────────────────── */}
      <h3
        className="relative z-10 mt-4 text-xl font-bold leading-tight text-white"
        style={{ marginTop: member.badge ? '12px' : undefined }}
      >
        {member.name}
      </h3>

      {/* ── Designation ──────────────────────────────────────────────────── */}
      <p className="relative z-10 mt-1 text-[11px] font-semibold uppercase tracking-widest text-purple-400/80 leading-none">
        {member.designation}
      </p>

      {/* ── Description ──────────────────────────────────────────────────── */}
      {member.description && (
        <p className="relative z-10 mt-3 text-sm text-gray-400 leading-relaxed line-clamp-4">
          {member.description}
        </p>
      )}

      {/* ── Credential tags ──────────────────────────────────────────────── */}
      {member.tags && member.tags.length > 0 && (
        <div className="relative z-10 mt-5 flex flex-wrap justify-center gap-2">
          {member.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center text-[11px] font-medium
                         px-3 py-1 rounded-full whitespace-nowrap"
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
      )}

      {/* ── Bottom glow accent — appears on hover ────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1.5px]
                   opacity-0 group-hover:opacity-100
                   transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.60) 50%, transparent 100%)',
          boxShadow: '0 0 10px 2px rgba(139,92,246,0.28)',
        }}
        aria-hidden="true"
      />

    </article>
  )
}
