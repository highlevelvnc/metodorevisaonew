import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Método Revisão para Escolas — Correção estratégica de redação ENEM por turma',
  description:
    'Sistema de correção estratégica de redação para escolas: professoras especializadas em ENEM entregam devolutiva individual em 24h, com diagnóstico por competência e acompanhamento de evolução por turma — resultado mensurável, sem sobrecarga para os professores.',
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const painPoints = [
  {
    title: 'Professores sem tempo para corrigir com profundidade',
    desc: 'Numa turma de 30 alunos, corrigir redação com profundidade exige horas que simplesmente não existem. O resultado são comentários genéricos — e alunos que não sabem o que mudar.',
    icon: (
      <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Feedback genérico não produz evolução',
    desc: '"Desenvolva melhor a argumentação" não é feedback. É frustração disfarçada de orientação. O aluno entrega a próxima redação com os mesmos erros — e continua sem entender por quê.',
    icon: (
      <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    title: 'Sem dados, a gestão pedagógica opera no escuro',
    desc: 'A escola investe em aulas de redação mas não sabe quem evoluiu, quem estancou e quem vai chegar ao ENEM sem estrutura. A decisão de intervir chega tarde — quando já é tarde demais.',
    icon: (
      <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ),
  },
]

const studentBenefits = [
  'Clareza sobre onde está errando — por competência, não por impressão',
  'Diagnóstico claro após cada texto: o que melhorou, o que ainda precisa de trabalho',
  'Anotações direto no texto, parágrafo a parágrafo — sem espaço para dúvidas',
  'Orientação clara para a próxima redação já na devolutiva',
  'Confiança para escrever com estratégia, não no chute',
]

const schoolBenefits = [
  'Professores livres para ensinar — sem sobrecarga de correção',
  'Qualidade de feedback padronizada para toda a turma',
  'Histórico individual de evolução — identifique quem precisa de atenção antes que seja tarde',
  'Resultado do ENEM como evidência concreta do seu método de ensino',
  'Dados de evolução por turma para decisões pedagógicas precisas',
]

const steps = [
  {
    n: '01',
    title: 'A escola define a turma ou grupo',
    desc: 'Você escolhe quais alunos participam — pode ser uma turma inteira, um grupo de reforço ou alunos selecionados. Sem comprometer toda a escola de uma vez.',
  },
  {
    n: '02',
    title: 'Os alunos enviam suas redações',
    desc: 'Foto, PDF ou texto digitado — como for mais fácil. Sem plataforma nova para aprender, sem treinamento, sem burocracia para implementar.',
  },
  {
    n: '03',
    title: 'Devolutiva completa em até 24h',
    desc: 'Cada redação volta com nota por competência, anotações direto no texto e orientação para a próxima. Feita por professoras especializadas em redação ENEM — sem IA, sem automação.',
  },
  {
    n: '04',
    title: 'A escola acompanha a evolução',
    desc: 'Relatório por aluno e por turma, com evolução por competência e período. Você sabe quem avança, quem precisa de atenção — e tem base concreta para o próximo planejamento pedagógico.',
  },
]

const tiers = [
  {
    name: 'Essencial',
    freq: '1 redação por mês',
    desc: 'Para escolas que querem introduzir feedback estratégico na rotina sem grande comprometimento inicial.',
    who: 'Ideal para escolas que querem validar o modelo antes de expandir para mais turmas.',
  },
  {
    name: 'Evolução',
    freq: '2 redações por mês',
    desc: 'Para escolas que querem ritmo constante e resultado mensurável ao longo do trimestre.',
    who: 'Ideal para turmas de 3º ano com foco em ENEM.',
    popular: true,
  },
  {
    name: 'Intensivo',
    freq: '4 redações por mês',
    desc: 'Para escolas em sprint de preparação — máxima frequência de correção nos meses antes do ENEM.',
    who: 'Ideal para turmas de alto desempenho ou grupos de preparação intensiva.',
  },
]

// ─── Icon helpers ──────────────────────────────────────────────────────────────

function CheckGreen() {
  return (
    <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ParaEscolasPage() {
  return (
    <div className="bg-[#080d18] min-h-screen">

      {/* ════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">

        {/* ── Layer 1: Background video ─────────────────────────────── */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
        >
          <source src="/escola.mp4" type="video/mp4" />
        </video>

        {/* ── Layer 2: Cinematic overlay ────────────────────────────── */}
        {/*
          Multi-stop gradient strategy:
          - Top: very dark   → seamless navbar transition + badge readability
          - Mid-upper: opens → video texture visible, adds institutional feel
          - Mid-lower: closes→ keeps body copy clean
          - Bottom: very dark→ CTA + trust bar always readable
          Fallback: bg-[#080d18] ensures solid dark if video fails
        */}
        <div
          className="absolute inset-0 bg-[#080d18]"
          style={{
            background: 'linear-gradient(to bottom, rgba(8,13,24,0.90) 0%, rgba(8,13,24,0.54) 38%, rgba(8,13,24,0.68) 65%, rgba(8,13,24,0.94) 100%)',
          }}
        />

        {/* ── Layer 3: Brand color wash ─────────────────────────────── */}
        {/* Keeps the purple identity alive over the real-world footage */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-purple-700/[0.14] rounded-full blur-3xl" />
        </div>

        {/* ── Layer 4: Content ──────────────────────────────────────── */}
        <div className="section-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-widest uppercase">
            Método Revisão · Para Escolas
          </div>

          <h1 className="text-[2.1rem] sm:text-5xl lg:text-[3.2rem] font-extrabold text-white leading-[1.1] tracking-tight mb-6 max-w-3xl mx-auto">
            A redação dos seus alunos melhora.{' '}
            <span className="gradient-text">
              O trabalho do seu professor, não aumenta.
            </span>
          </h1>

          {/* Subheadline: bumped to gray-300 — video texture behind needs lighter text */}
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl mx-auto mb-10">
            Correção individual e estratégica com devolutiva em 24h, para cada aluno da sua escola —
            sem mudar a rotina, sem treinamento de plataforma, sem burocracia.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <a
              href="https://wa.me/5522992682207?text=Ol%C3%A1%2C+tenho+interesse+em+levar+o+M%C3%A9todo+Revis%C3%A3o+para+minha+escola.+Gostaria+de+entender+como+funciona."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-7 py-3.5 text-sm font-bold rounded-xl"
            >
              Solicitar proposta para minha escola →
            </a>
            <Link
              href="#como-funciona"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200 underline underline-offset-4"
            >
              Ver como funciona ↓
            </Link>
          </div>

          {/* Low-friction note — bumped to gray-500 for video legibility */}
          <p className="text-xs text-gray-500 mb-10">
            A conversa leva em média 20 minutos. Proposta enviada em até 24h. Sem compromisso.
          </p>

          {/* Trust bar — labels bumped to gray-400 for video legibility */}
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
            {[
              { dot: 'bg-green-400',  label: '10.000+ redações corrigidas' },
              { dot: 'bg-purple-400', label: 'Devolutiva em até 24h' },
              { dot: 'bg-blue-400',   label: 'Correção humana, não IA' },
              { dot: 'bg-amber-400',  label: 'Correção por especialistas em redação ENEM' },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
                <span className="text-xs text-gray-400">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          PROBLEM
      ════════════════════════════════════════════════════════════ */}
      <section className="section-padding">
        <div className="section-container">
          <div className="text-center mb-14">
            <div className="section-label justify-center">O desafio</div>
            <h2 className="section-title mb-4">
              Professores sem tempo.{' '}
              <span className="gradient-text">Alunos sem evolução real.</span>
            </h2>
            <p className="section-subtitle mx-auto max-w-2xl">
              A sala de aula não foi desenhada para oferecer feedback individual e estratégico em cada
              redação. Em turmas de 30 alunos, isso é impossível sem ajuda. O resultado é uma escola
              que pratica redação, mas não produz evolução mensurável.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {painPoints.map((p) => (
              <div key={p.title} className="card-dark p-7">
                <div className="w-10 h-10 rounded-xl bg-red-500/8 border border-red-500/15 flex items-center justify-center mb-5">
                  {p.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2 leading-snug">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SOLUTION
      ════════════════════════════════════════════════════════════ */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-center">

              {/* Left */}
              <div>
                <div className="section-label mb-4">A solução</div>
                <h2 className="section-title mb-5">
                  Correção com profundidade.{' '}
                  <span className="gradient-text">Sem mudar a operação da sua escola.</span>
                </h2>
                <p className="text-gray-400 text-base leading-relaxed mb-6">
                  O Método Revisão não substitui o professor — libera ele. Enquanto a especialista
                  corrige cada redação com profundidade, o professor pode focar no que importa: ensinar.
                </p>
                <p className="text-gray-400 text-base leading-relaxed mb-6">
                  Cada aluno recebe uma devolutiva completa: nota por competência, anotações direto
                  no texto e orientação clara para a próxima redação. Sem feedback específico, prática
                  não vira aprendizado. Com ele, cada redação escrita é um passo calculado.
                </p>
                <p className="text-gray-400 text-base leading-relaxed">
                  A escola passa a ter visibilidade real: quem evoluiu, quem precisa de atenção, quais
                  competências estão mais fracas na turma. Dados concretos para decisões pedagógicas concretas.
                </p>
              </div>

              {/* Right: flow pills */}
              <div className="space-y-3">
                {[
                  { label: 'Aluno envia a redação',              sub: 'foto, PDF ou texto — como for mais fácil' },
                  { label: 'Especialista lê e corrige',           sub: 'professoras especializadas em redação ENEM' },
                  { label: 'Devolutiva completa em até 24h',     sub: 'nota + anotações no texto + orientação' },
                  { label: 'Avaliação por C1–C5',                sub: 'critérios oficiais do ENEM, competência a competência' },
                  { label: 'Escola acompanha a evolução',        sub: 'relatório por aluno, turma e período' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4"
                  >
                    <span className="text-xs font-bold text-gray-600 w-5 flex-shrink-0 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          BENEFITS
      ════════════════════════════════════════════════════════════ */}
      <section className="section-padding">
        <div className="section-container">
          <div className="text-center mb-14">
            <div className="section-label justify-center">Benefícios</div>
            <h2 className="section-title">
              O impacto real — em cada aluno e no resultado da escola.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

            {/* For students */}
            <div className="card-dark p-7 border-purple-500/[0.14]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white">Para os alunos</h3>
              </div>
              <ul className="space-y-3.5">
                {studentBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <CheckGreen />
                    <span className="text-sm text-gray-400 leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* For school */}
            <div className="card-dark p-7 border-green-500/[0.14]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white">Para a escola</h3>
              </div>
              <ul className="space-y-3.5">
                {schoolBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-400 leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          HOW IT WORKS (OPERATIONAL)
      ════════════════════════════════════════════════════════════ */}
      <section id="como-funciona" className="section-padding" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="section-container">
          <div className="text-center mb-14">
            <div className="section-label justify-center">Como funciona na prática</div>
            <h2 className="section-title mb-4">
              Simples de implementar.{' '}
              <span className="gradient-text">Rápido de sentir o resultado.</span>
            </h2>
            <p className="section-subtitle mx-auto max-w-xl">
              Sem onboarding longo, sem treinamento de plataforma, sem burocracia.
              Em dias, sua turma já recebe feedback de verdade.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-5">
              {steps.map((s) => (
                <div key={s.n} className="card-dark p-7">
                  <div className="text-3xl font-black text-purple-500/25 mb-4 leading-none tabular-nums">
                    {s.n}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          PRICING MODEL
      ════════════════════════════════════════════════════════════ */}
      <section className="section-padding">
        <div className="section-container">
          <div className="text-center mb-5">
            <div className="section-label justify-center">Planos para Escolas</div>
            <h2 className="section-title mb-4">
              Um modelo que se adapta ao tamanho e ritmo da sua escola.
            </h2>
            <p className="section-subtitle mx-auto max-w-lg">
              Todos os planos incluem devolutiva completa, nota por competência e acompanhamento
              da evolução de cada aluno.
            </p>
          </div>

          <div className="text-center mb-10">
            <a
              href="https://wa.me/5522992682207?text=Ol%C3%A1%2C+gostaria+de+receber+uma+proposta+do+M%C3%A9todo+Revis%C3%A3o+para+minha+escola."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-purple-500/25 px-4 py-2 rounded-full transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Valores adaptados ao número de alunos — solicite uma proposta e receba em até 24h
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`relative card-dark p-7 flex flex-col ${
                  t.popular ? 'border-purple-500/25 md:scale-[1.03] md:-translate-y-1 z-10' : ''
                }`}
              >
                {t.popular && (
                  <div className="absolute -top-3 inset-x-0 flex justify-center">
                    <span className="bg-purple-600 text-white text-[10px] font-bold px-4 py-1 rounded-full shadow-btn-primary">
                      Mais escolhido
                    </span>
                  </div>
                )}

                <div className="mb-1">
                  <h3 className="text-base font-extrabold text-white">{t.name}</h3>
                  <p className="text-xs text-purple-400 font-semibold mt-0.5">{t.freq}</p>
                </div>

                <div className="divider my-4" />

                <p className="text-sm text-gray-400 leading-relaxed mb-3 flex-1">{t.desc}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{t.who}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          PILOT
      ════════════════════════════════════════════════════════════ */}
      <section className="section-padding relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-700/8 rounded-full blur-3xl pointer-events-none" />

        <div className="section-container relative">
          <div className="max-w-2xl mx-auto text-center">
            <div className="section-label justify-center">Piloto estruturado</div>
            <h2 className="section-title mb-5">
              Não precisa decidir por toda a escola agora.{' '}
              <span className="gradient-text">Comece com uma turma.</span>
            </h2>
            <p className="text-base text-gray-400 leading-relaxed mb-4">
              Se não gerar resultado visível, não faz sentido continuar — e estamos tranquilos com
              isso. É assim que trabalhamos.
            </p>
            <p className="text-base text-gray-400 leading-relaxed mb-10">
              Uma turma. Quatro semanas. Piloto iniciado agora: resultado mensurável antes do
              encerramento deste semestre — e uma visão clara de como escalar para o restante da escola.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mb-12">
              {[
                {
                  icon: '🏫',
                  title: 'Sem risco',
                  desc: 'Começa com uma turma. Escala conforme o resultado.',
                },
                {
                  icon: '📅',
                  title: 'Resultado em 4 semanas',
                  desc: 'Evolução visível antes de qualquer decisão maior.',
                },
                {
                  icon: '📊',
                  title: 'Dados para apresentar',
                  desc: 'Relatório de evolução pronto para a direção e para os pais.',
                },
              ].map((item) => (
                <div key={item.title} className="card-dark p-5 text-center">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* What happens in the conversation */}
            <div className="text-left rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 mb-10">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">O que acontece na conversa</p>
              <ol className="space-y-3">
                {[
                  'Você nos conta o perfil da turma e o momento da preparação (10–15 min)',
                  'A gente propõe um piloto desenhado para a realidade da sua escola',
                  'Proposta por escrito enviada em até 24h — sem custo, sem compromisso',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-[10px] font-bold text-purple-400 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-400 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <a
              href="https://wa.me/5522992682207?text=Ol%C3%A1%2C+gostaria+de+entender+como+seria+um+piloto+do+M%C3%A9todo+Revis%C3%A3o+na+minha+escola."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-8 py-4 text-base font-bold rounded-xl inline-flex items-center gap-2"
            >
              Agendar a conversa sobre o piloto →
            </a>

            <p className="text-xs text-gray-700 mt-4">
              Em 20 minutos você sabe exatamente se faz sentido para a sua escola.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════════════════════════ */}
      <section className="section-padding">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="section-title mb-5">
              Seus alunos vão escrever redações de qualquer forma.
              <span className="gradient-text"> A questão é se vão aprender algo com elas.</span>
            </h2>
            <p className="section-subtitle mx-auto mb-10">
              A escola que começa hoje tem quatro, oito, doze devolutivas a mais antes da prova.
              O próximo ciclo de redações começa com ou sem essa decisão. A diferença está no que
              os alunos vão levar de cada texto. A conversa dura 20 minutos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/5522992682207?text=Ol%C3%A1%2C+tenho+interesse+em+levar+o+M%C3%A9todo+Revis%C3%A3o+para+minha+escola.+Gostaria+de+entender+como+funciona."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-7 py-3.5 text-sm font-bold rounded-xl inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.108.552 4.088 1.515 5.812L.057 23.812a.5.5 0 00.61.634l6.188-1.621A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 01-4.951-1.355l-.355-.213-3.676.963.981-3.586-.232-.369A9.718 9.718 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                </svg>
                Solicitar proposta para minha escola
              </a>

              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200 underline underline-offset-4"
              >
                Conhecer o Método Revisão →
              </Link>
            </div>

            <p className="text-xs text-gray-700 mt-8">
              Sem contrato. Sem fidelidade. Começa com um piloto e escala conforme o resultado — no ritmo da sua escola.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
