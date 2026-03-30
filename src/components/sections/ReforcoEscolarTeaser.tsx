'use client'

import Link from 'next/link'
import { trackEvent } from '@/components/Analytics'

const bullets = [
  {
    title: 'Aulas ao vivo via Google Meet',
    desc: 'Aula individual com tela compartilhada, exercícios em tempo real e devolutiva na hora. Sem vídeo gravado.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    title: 'Acompanhamento contínuo',
    desc: 'A professora conhece o histórico do aluno e adapta cada aula ao que ele precisa. Não é aula genérica.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: 'Plano de evolução individual',
    desc: 'Antes da primeira aula, diagnóstico do nível do aluno. Depois, plano adaptado ao conteúdo e às provas do colégio.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    ),
  },
  {
    title: 'Correção de redação integrada',
    desc: 'Alunos de reforço podem também assinar correção de redação ENEM com devolutiva por competência. Tudo na mesma plataforma.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    ),
  },
]

const subjects = [
  { name: 'Português', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { name: 'Inglês',    color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  { name: 'Redação',   color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { name: 'Literatura', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
]

export default function ReforcoEscolarTeaser() {
  return (
    <section className="section-padding relative overflow-hidden" id="reforco-escolar">
      {/* Subtle gradient separator from essay plans above */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/[0.06] to-transparent pointer-events-none" />

      <div className="section-container relative">
        {/* Label */}
        <div className="text-center mb-12">
          <span className="section-label">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
            </svg>
            Reforço Escolar
          </span>

          <h2 className="section-title mb-4">
            Aulas particulares com<br className="hidden sm:block" />
            <span className="gradient-text">acompanhamento individual</span>
          </h2>

          <p className="section-subtitle max-w-xl mx-auto mb-3">
            Notas caindo ou conteúdo travado? A professora encontra o ponto exato da dificuldade e trabalha até destravar.
          </p>
          <p className="text-xs text-gray-500 mb-6">
            Acompanhamento individual · Do 6o ano ao vestibular · 100% via Google Meet
          </p>

          {/* Subject pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {subjects.map(s => (
              <span key={s.name} className={`text-[11px] font-bold px-3 py-1 rounded-full border ${s.color}`}>
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-10">
          {bullets.map((b) => (
            <div
              key={b.title}
              className="card-dark-hover p-5 flex gap-4"
            >
              <div className="icon-box-purple flex-shrink-0 mt-0.5">
                {b.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1.5">{b.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10 text-center">
          <div>
            <p className="text-2xl font-black text-white">4</p>
            <p className="text-[11px] text-gray-500">matérias</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">1:1</p>
            <p className="text-[11px] text-gray-500">individual</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">100%</p>
            <p className="text-[11px] text-gray-500">online</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/reforco-escolar/planos"
            className="btn-primary-lg"
            onClick={() => { trackEvent('cta_click', { source: 'reforco_teaser' }); trackEvent('reforco_cta_clicked', { source: 'homepage_teaser' }) }}
          >
            Escolher meu plano
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="text-xs text-gray-600 mt-3">
            Planos a partir de R$ 65/aula · Comece quando quiser
          </p>
        </div>
      </div>
    </section>
  )
}
