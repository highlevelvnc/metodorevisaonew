/**
 * notifications.ts — Transactional notification layer
 *
 * Sends email notifications for key student events.
 * Uses Resend API (no SDK — just fetch). Falls back gracefully
 * if RESEND_API_KEY is not configured (logs warning, never throws).
 *
 * Also exports helper for future push/realtime notifications.
 */

import { getSiteUrl } from '@/lib/get-site-url'
import { SUPPORT_EMAIL, NOREPLY_EMAIL } from '@/lib/contact'

// ─── Email via Resend ────────────────────────────────────────────────────────

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[notifications] RESEND_API_KEY not set — email not sent')
    return false
  }

  const from = process.env.RESEND_FROM_EMAIL ?? NOREPLY_EMAIL

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to, subject, html }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error(`[notifications] Resend API ${res.status}: ${err.slice(0, 200)}`)
      return false
    }

    console.log(`[notifications] Email sent to ${to}: "${subject}"`)
    return true
  } catch (err) {
    console.error('[notifications] Email send failed:', err instanceof Error ? err.message : err)
    return false
  }
}

// ─── Correction Ready ────────────────────────────────────────────────────────

export async function notifyCorrectionReady(params: {
  studentEmail: string
  studentName: string
  essayId: string
  themeTitle: string
  totalScore: number
  reviewerName: string
}): Promise<void> {
  const { studentEmail, studentName, essayId, themeTitle, totalScore, reviewerName } = params
  const siteUrl = getSiteUrl()
  const firstName = studentName.split(' ')[0] || 'Aluno'
  const essayUrl = `${siteUrl}/aluno/redacoes/${essayId}`

  const subject = `Sua devolutiva está pronta — ${totalScore}/1000 pts`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#080d18;color:#e5e7eb;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.02em;">Método Revisão</span>
    </div>

    <!-- Card -->
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 24px;">
      <p style="font-size:15px;color:#d1d5db;margin:0 0 8px;">Olá, ${firstName}!</p>
      <h1 style="font-size:22px;color:#fff;margin:0 0 20px;font-weight:700;">
        Sua devolutiva está pronta ✅
      </h1>

      <!-- Score -->
      <div style="text-align:center;padding:20px;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:12px;margin-bottom:20px;">
        <p style="font-size:36px;font-weight:800;color:#fff;margin:0;">${totalScore}<span style="font-size:16px;color:#9ca3af;">/1000</span></p>
        <p style="font-size:12px;color:#9ca3af;margin:4px 0 0;">Nota total</p>
      </div>

      <!-- Details -->
      <table style="width:100%;font-size:13px;color:#9ca3af;margin-bottom:24px;" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;color:#6b7280;">Tema</td><td style="padding:6px 0;text-align:right;color:#d1d5db;">${themeTitle.length > 50 ? themeTitle.slice(0, 50) + '…' : themeTitle}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Corrigido por</td><td style="padding:6px 0;text-align:right;color:#d1d5db;">${reviewerName}</td></tr>
      </table>

      <!-- CTA -->
      <div style="text-align:center;">
        <a href="${essayUrl}" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
          Ver devolutiva completa →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <p style="text-align:center;font-size:11px;color:#4b5563;margin-top:24px;">
      Método Revisão — Correção estratégica de redação ENEM<br/>Dúvidas? ${SUPPORT_EMAIL}
    </p>
  </div>
</body>
</html>`

  await sendEmail({ to: studentEmail, subject, html })
}

// ─── Lesson scheduled (professor → student) ──────────────────────────────────

export async function notifyLessonScheduled(params: {
  studentEmail: string
  studentName: string | null
  subject: string | null
  sessionDate: string   // 'YYYY-MM-DD'
  sessionTime: string | null
  durationMin: number
  topic: string | null
  meetLink: string | null
}): Promise<void> {
  const { studentEmail, studentName, subject, sessionDate, sessionTime, durationMin, topic, meetLink } = params
  const siteUrl   = getSiteUrl()
  const firstName = studentName ? studentName.split(' ')[0] : 'Aluno'

  // Format date nicely: "sex., 4 de abr."
  const dateLabel = (() => {
    const d = new Date(sessionDate + 'T12:00:00')
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long' })
  })()

  const subject_ = `Aula agendada${subject ? ` de ${subject}` : ''} — ${dateLabel}`

  const meetRow = meetLink
    ? `<tr><td style="padding:6px 0;color:#6b7280;">Link da aula</td><td style="padding:6px 0;text-align:right;"><a href="${meetLink}" style="color:#a78bfa;font-weight:600;">Acessar Google Meet →</a></td></tr>`
    : `<tr><td style="padding:6px 0;color:#6b7280;">Link da aula</td><td style="padding:6px 0;text-align:right;color:#9ca3af;">Será enviado em breve</td></tr>`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#080d18;color:#e5e7eb;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.02em;">Método Revisão</span>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 24px;">
      <p style="font-size:15px;color:#d1d5db;margin:0 0 8px;">Olá, ${firstName}!</p>
      <h1 style="font-size:22px;color:#fff;margin:0 0 6px;font-weight:700;">Sua aula foi agendada 📅</h1>
      <p style="font-size:13px;color:#9ca3af;margin:0 0 24px;">Confira os detalhes abaixo e salve na sua agenda.</p>
      <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;font-size:13px;" cellpadding="0" cellspacing="0">
          ${subject ? `<tr><td style="padding:6px 0;color:#6b7280;">Matéria</td><td style="padding:6px 0;text-align:right;color:#e5e7eb;font-weight:600;">${subject}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#6b7280;">Data</td><td style="padding:6px 0;text-align:right;color:#e5e7eb;font-weight:600;">${dateLabel}${sessionTime ? ` às ${sessionTime}` : ''}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Duração</td><td style="padding:6px 0;text-align:right;color:#e5e7eb;">${durationMin} min</td></tr>
          ${topic ? `<tr><td style="padding:6px 0;color:#6b7280;">Tópico</td><td style="padding:6px 0;text-align:right;color:#e5e7eb;">${topic}</td></tr>` : ''}
          ${meetRow}
        </table>
      </div>
      <div style="text-align:center;">
        <a href="${siteUrl}/aluno/reforco-escolar" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
          Ver no meu painel →
        </a>
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:#4b5563;margin-top:24px;">
      Método Revisão — Reforço escolar online<br/>Dúvidas? ${SUPPORT_EMAIL}
    </p>
  </div>
</body>
</html>`

  await sendEmail({ to: studentEmail, subject: subject_, html })
}

// ─── Lesson requested (student → professor) ───────────────────────────────────

export async function notifyLessonRequested(params: {
  professorEmail: string
  studentEmail: string
  studentName: string | null
  subject: string | null
  sessionDate: string
  sessionTime: string | null
  notes: string | null
}): Promise<void> {
  const { professorEmail, studentEmail, studentName, subject, sessionDate, sessionTime, notes } = params

  const dateLabel = (() => {
    const d = new Date(sessionDate + 'T12:00:00')
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long' })
  })()

  const subjectLine = `Nova solicitação de aula${subject ? ` de ${subject}` : ''} — ${studentName ?? studentEmail}`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#080d18;color:#e5e7eb;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.02em;">Método Revisão</span>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 24px;">
      <h1 style="font-size:22px;color:#fff;margin:0 0 6px;font-weight:700;">Nova solicitação de aula 📬</h1>
      <p style="font-size:13px;color:#9ca3af;margin:0 0 24px;">Um aluno pediu para agendar uma aula no painel. Confirme no seu painel de aulas.</p>
      <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;font-size:13px;" cellpadding="0" cellspacing="0">
          <tr><td style="padding:6px 0;color:#6b7280;">Aluno</td><td style="padding:6px 0;text-align:right;color:#e5e7eb;font-weight:600;">${studentName ?? '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;text-align:right;color:#a78bfa;">${studentEmail}</td></tr>
          ${subject ? `<tr><td style="padding:6px 0;color:#6b7280;">Matéria</td><td style="padding:6px 0;text-align:right;color:#e5e7eb;font-weight:600;">${subject}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#6b7280;">Data preferida</td><td style="padding:6px 0;text-align:right;color:#e5e7eb;">${dateLabel}${sessionTime ? ` às ${sessionTime}` : ''}</td></tr>
          ${notes ? `<tr><td style="padding:6px 0;color:#6b7280;vertical-align:top;">Observações</td><td style="padding:6px 0;text-align:right;color:#9ca3af;">${notes}</td></tr>` : ''}
        </table>
      </div>
      <div style="text-align:center;">
        <a href="https://metodorevisao.com/professor/aulas" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
          Ver no painel de aulas →
        </a>
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:#4b5563;margin-top:24px;">
      Método Revisão — Painel do professor
    </p>
  </div>
</body>
</html>`

  await sendEmail({ to: professorEmail, subject: subjectLine, html })
}

// ─── Inactivity nudge (24h) ───────────────────────────────────────────────────

export async function notifyInactivity24h(params: {
  studentEmail: string
  studentName: string
  lastEssayCount: number
}): Promise<void> {
  const { studentEmail, studentName, lastEssayCount } = params
  const siteUrl = getSiteUrl()
  const firstName = studentName.split(' ')[0] || 'Aluno'

  const subject = 'Você ainda não enviou sua próxima redação'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#080d18;color:#e5e7eb;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:800;color:#fff;">Método Revisão</span>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 24px;">
      <p style="font-size:15px;color:#d1d5db;margin:0 0 16px;">Oi, ${firstName}!</p>
      <p style="font-size:14px;color:#9ca3af;line-height:1.6;margin:0 0 24px;">
        ${lastEssayCount === 0
          ? 'Você se cadastrou mas ainda não enviou sua primeira redação. Leva menos de 2 minutos — e você recebe uma devolutiva detalhada em até 24h.'
          : `Já faz um tempo desde sua última redação. Você tem ${lastEssayCount} redaç${lastEssayCount !== 1 ? 'ões' : 'ão'} no histórico — envie a próxima para manter sua evolução.`
        }
      </p>
      <div style="text-align:center;">
        <a href="${siteUrl}/aluno/redacoes/nova" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
          Enviar redação agora →
        </a>
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:#4b5563;margin-top:24px;">
      Método Revisão — Correção estratégica de redação ENEM<br/>Dúvidas? ${SUPPORT_EMAIL}
    </p>
  </div>
</body>
</html>`

  await sendEmail({ to: studentEmail, subject, html })
}

// ─── Inactivity nudge (48h) ───────────────────────────────────────────────────

export async function notifyInactivity48h(params: {
  studentEmail: string
  studentName: string
  avgScore: number | null
}): Promise<void> {
  const { studentEmail, studentName, avgScore } = params
  const siteUrl = getSiteUrl()
  const firstName = studentName.split(' ')[0] || 'Aluno'

  const subject = 'Você está deixando pontos na mesa'

  const scoreContext = avgScore !== null
    ? `Com média de <strong style="color:#fff;">${avgScore} pts</strong>, sua próxima redação pode te levar a ${Math.min(1000, avgScore + 100)}+.`
    : 'Cada redação corrigida te mostra exatamente onde subir a nota.'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#080d18;color:#e5e7eb;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:800;color:#fff;">Método Revisão</span>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 24px;">
      <p style="font-size:15px;color:#d1d5db;margin:0 0 8px;">Oi, ${firstName}!</p>
      <h2 style="font-size:20px;color:#fff;margin:0 0 16px;font-weight:700;">
        Você está deixando pontos na mesa
      </h2>
      <p style="font-size:14px;color:#9ca3af;line-height:1.6;margin:0 0 24px;">
        ${scoreContext} Quanto mais você escreve, mais a professora entende seus padrões de erro — e mais precisas ficam as devolutivas.
      </p>
      <div style="text-align:center;">
        <a href="${siteUrl}/aluno/redacoes/nova" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
          Escrever próxima redação →
        </a>
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:#4b5563;margin-top:24px;">
      Método Revisão — Correção estratégica de redação ENEM<br/>Dúvidas? ${SUPPORT_EMAIL}
    </p>
  </div>
</body>
</html>`

  await sendEmail({ to: studentEmail, subject, html })
}

// ─── Winback for paying-but-inactive (M5) ────────────────────────────────────

export async function notifyPayingWinback(params: {
  studentEmail: string
  studentName: string
  creditsLeft: number
  planName: string
  avgScore: number | null
}): Promise<void> {
  const { studentEmail, studentName, creditsLeft, planName, avgScore } = params
  const siteUrl = getSiteUrl()
  const firstName = studentName.split(' ')[0] || 'Aluno'

  const subject = `${firstName}, você tem ${creditsLeft} correç${creditsLeft === 1 ? 'ão' : 'ões'} esperando por você`

  const scoreLine = avgScore !== null
    ? `Sua média está em <strong style="color:#fff;">${avgScore} pts</strong>. A próxima redação vai mostrar se você está subindo — e onde focar para avançar mais rápido.`
    : 'Cada redação corrigida te dá um diagnóstico mais preciso. Quanto mais cedo você enviar, mais tempo tem para evoluir.'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#080d18;color:#e5e7eb;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:800;color:#fff;">Método Revisão</span>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 24px;">
      <p style="font-size:15px;color:#d1d5db;margin:0 0 8px;">Oi, ${firstName}!</p>
      <h2 style="font-size:20px;color:#fff;margin:0 0 16px;font-weight:700;">
        Você tem correções não usadas
      </h2>
      <p style="font-size:14px;color:#9ca3af;line-height:1.6;margin:0 0 16px;">
        Seu plano <strong style="color:#fff;">${planName}</strong> ainda tem <strong style="color:#a78bfa;">${creditsLeft} correç${creditsLeft === 1 ? 'ão' : 'ões'}</strong> disponíve${creditsLeft === 1 ? 'l' : 'is'} neste ciclo.
      </p>
      <p style="font-size:14px;color:#9ca3af;line-height:1.6;margin:0 0 24px;">
        ${scoreLine}
      </p>
      <div style="text-align:center;">
        <a href="${siteUrl}/aluno/redacoes/nova" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
          Enviar redação agora →
        </a>
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:#4b5563;margin-top:24px;">
      Método Revisão — Correção estratégica de redação ENEM<br/>Dúvidas? ${SUPPORT_EMAIL}
    </p>
  </div>
</body>
</html>`

  await sendEmail({ to: studentEmail, subject, html })
}

// ─── Credits running low ─────────────────────────────────────────────────────

export async function notifyCreditsLow(params: {
  studentEmail: string
  studentName: string
  creditsLeft: number
  planName: string
}): Promise<void> {
  const { studentEmail, studentName, creditsLeft, planName } = params
  const siteUrl = getSiteUrl()
  const firstName = studentName.split(' ')[0] || 'Aluno'

  const subject = creditsLeft === 0
    ? `Seus créditos do plano ${planName} acabaram`
    : `Último crédito disponível no plano ${planName}`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#080d18;color:#e5e7eb;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:800;color:#fff;">Método Revisão</span>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 24px;">
      <p style="font-size:15px;color:#d1d5db;margin:0 0 16px;">Olá, ${firstName}!</p>
      <p style="font-size:14px;color:#9ca3af;line-height:1.6;margin:0 0 24px;">
        ${creditsLeft === 0
          ? `Você usou todas as correções do seu plano <strong style="color:#fff;">${planName}</strong> este mês. Seus créditos serão renovados automaticamente no próximo ciclo de faturamento.`
          : `Resta <strong style="color:#fff;">1 correção</strong> no seu plano <strong style="color:#fff;">${planName}</strong>. Seus créditos serão renovados automaticamente no próximo ciclo.`
        }
      </p>
      <div style="text-align:center;">
        <a href="${siteUrl}/aluno/redacoes/nova" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
          ${creditsLeft > 0 ? 'Usar última correção →' : 'Ver meu painel →'}
        </a>
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:#4b5563;margin-top:24px;">
      Método Revisão — Correção estratégica de redação ENEM<br/>Dúvidas? ${SUPPORT_EMAIL}
    </p>
  </div>
</body>
</html>`

  await sendEmail({ to: studentEmail, subject, html })
}

// ─── Lesson reminder (24h or 1h before) ──────────────────────────────────────

export async function notifyLessonReminder(params: {
  studentEmail: string
  studentName: string | null
  subject: string | null
  sessionDate: string
  sessionTime: string | null
  meetLink: string | null
  professorName: string | null
  hoursUntil: 24 | 1
}): Promise<void> {
  const { studentEmail, studentName, subject: subj, sessionDate, sessionTime, meetLink, professorName, hoursUntil } = params
  const siteUrl   = getSiteUrl()
  const firstName = studentName ? studentName.split(' ')[0] : 'Aluno'

  const dateLabel = (() => {
    const d = new Date(sessionDate + 'T12:00:00')
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  })()

  const isUrgent = hoursUntil === 1
  const emailSubject = isUrgent
    ? `Sua aula${subj ? ` de ${subj}` : ''} começa em 1 hora!`
    : `Lembrete: aula${subj ? ` de ${subj}` : ''} amanhã${sessionTime ? ` às ${sessionTime}` : ''}`

  const meetRow = meetLink
    ? `<div style="text-align:center;margin-bottom:20px;"><a href="${meetLink}" style="display:inline-block;background:#16a34a;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">Entrar na aula via Google Meet →</a></div>`
    : `<p style="font-size:13px;color:#9ca3af;text-align:center;margin-bottom:20px;">O link do Google Meet será enviado em breve.</p>`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#080d18;color:#e5e7eb;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.02em;">Método Revisão</span>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 24px;">
      <p style="font-size:15px;color:#d1d5db;margin:0 0 8px;">Olá, ${firstName}!</p>
      <h1 style="font-size:22px;color:#fff;margin:0 0 20px;font-weight:700;">
        ${isUrgent ? 'Sua aula começa em 1 hora! ⏰' : 'Lembrete da sua aula de amanhã 📅'}
      </h1>
      <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:20px;margin-bottom:20px;">
        <table style="width:100%;font-size:13px;" cellpadding="0" cellspacing="0">
          ${subj ? `<tr><td style="padding:6px 0;color:#6b7280;">Matéria</td><td style="padding:6px 0;text-align:right;color:#e5e7eb;font-weight:600;">${subj}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#6b7280;">Data</td><td style="padding:6px 0;text-align:right;color:#e5e7eb;font-weight:600;">${dateLabel}${sessionTime ? ` às ${sessionTime}` : ''}</td></tr>
          ${professorName ? `<tr><td style="padding:6px 0;color:#6b7280;">Professora</td><td style="padding:6px 0;text-align:right;color:#e5e7eb;">${professorName}</td></tr>` : ''}
        </table>
      </div>
      ${meetRow}
      <div style="text-align:center;">
        <a href="${siteUrl}/aluno/reforco-escolar" style="font-size:12px;color:#a78bfa;text-decoration:none;">Ver minha agenda de aulas →</a>
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:#4b5563;margin-top:24px;">
      Método Revisão — Reforço escolar online<br/>Dúvidas? ${SUPPORT_EMAIL}
    </p>
  </div>
</body>
</html>`

  await sendEmail({ to: studentEmail, subject: emailSubject, html })
}

// ─── Lesson credits renewed (monthly renewal) ────────────────────────────────

export async function notifyLessonCreditsRenewed(params: {
  studentEmail: string
  studentName: string | null
  creditsTotal: number
  planName: string
}): Promise<void> {
  const { studentEmail, studentName, creditsTotal, planName } = params
  const siteUrl   = getSiteUrl()
  const firstName = studentName ? studentName.split(' ')[0] : 'Aluno'

  const emailSubject = `Seus créditos de aula foram renovados — ${creditsTotal} aulas disponíveis`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#080d18;color:#e5e7eb;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.02em;">Método Revisão</span>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 24px;">
      <p style="font-size:15px;color:#d1d5db;margin:0 0 8px;">Olá, ${firstName}!</p>
      <h1 style="font-size:22px;color:#fff;margin:0 0 6px;font-weight:700;">Seus créditos foram renovados! 🎉</h1>
      <p style="font-size:13px;color:#9ca3af;margin:0 0 24px;">Seu plano ${planName} foi renovado com sucesso.</p>
      <div style="text-align:center;padding:20px;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:12px;margin-bottom:24px;">
        <p style="font-size:36px;font-weight:800;color:#fff;margin:0;">${creditsTotal}</p>
        <p style="font-size:12px;color:#9ca3af;margin:4px 0 0;">aulas disponíveis este mês</p>
      </div>
      <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0 0 24px;text-align:center;">
        Agende sua próxima aula agora para garantir o melhor horário com a professora.
      </p>
      <div style="text-align:center;">
        <a href="${siteUrl}/aluno/reforco-escolar" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
          Agendar minha próxima aula →
        </a>
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:#4b5563;margin-top:24px;">
      Método Revisão — Reforço escolar online<br/>Dúvidas? ${SUPPORT_EMAIL}
    </p>
  </div>
</body>
</html>`

  await sendEmail({ to: studentEmail, subject: emailSubject, html })
}

// ─── Activation nudge (24h after purchase, no lesson booked) ─────────────────

export async function notifyNoLessonBooked(params: {
  studentEmail: string
  studentName: string | null
  creditsTotal: number
  planName: string
}): Promise<void> {
  const { studentEmail, studentName, creditsTotal, planName } = params
  const siteUrl   = getSiteUrl()
  const firstName = studentName ? studentName.split(' ')[0] : 'Aluno'

  const emailSubject = `Você tem ${creditsTotal} aulas esperando por você`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#080d18;color:#e5e7eb;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.02em;">Método Revisão</span>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 24px;">
      <p style="font-size:15px;color:#d1d5db;margin:0 0 8px;">Olá, ${firstName}!</p>
      <h1 style="font-size:22px;color:#fff;margin:0 0 6px;font-weight:700;">Suas aulas estão te esperando</h1>
      <p style="font-size:13px;color:#9ca3af;margin:0 0 24px;line-height:1.6;">
        Você ativou o plano ${planName} mas ainda não agendou nenhuma aula.
        85% dos alunos agendam no primeiro dia — e começam a ver resultado já na segunda aula.
      </p>
      <div style="text-align:center;padding:20px;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:12px;margin-bottom:24px;">
        <p style="font-size:36px;font-weight:800;color:#fff;margin:0;">${creditsTotal}</p>
        <p style="font-size:12px;color:#9ca3af;margin:4px 0 0;">aulas disponíveis agora</p>
      </div>
      <div style="text-align:center;">
        <a href="${siteUrl}/aluno/reforco-escolar" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
          Agendar minha primeira aula →
        </a>
      </div>
      <p style="font-size:11px;color:#6b7280;margin-top:16px;text-align:center;line-height:1.5;">
        Escolha data, horário e matéria. A professora confirma em até 24h e envia o link do Google Meet.
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#4b5563;margin-top:24px;">
      Método Revisão — Reforço escolar online<br/>Dúvidas? ${SUPPORT_EMAIL}
    </p>
  </div>
</body>
</html>`

  await sendEmail({ to: studentEmail, subject: emailSubject, html })
}

// ─── Post-lesson re-booking (sent after lesson completed) ────────────────────

export async function notifyLessonCompleted(params: {
  studentEmail: string
  studentName: string | null
  subject: string | null
  creditsLeft: number
  lessonId?: string
}): Promise<void> {
  const { studentEmail, studentName, subject: subj, creditsLeft, lessonId } = params
  const siteUrl   = getSiteUrl()
  const firstName = studentName ? studentName.split(' ')[0] : 'Aluno'

  const emailSubject = subj
    ? `Aula de ${subj} concluída — agende a próxima`
    : 'Aula concluída — agende a próxima'

  const creditsMsg = creditsLeft > 0
    ? `Você ainda tem <strong style="color:#fff;">${creditsLeft} aula${creditsLeft !== 1 ? 's' : ''}</strong> disponíve${creditsLeft !== 1 ? 'is' : 'l'} neste ciclo.`
    : 'Seus créditos deste ciclo acabaram. Renove para continuar evoluindo.'

  const ctaHref = creditsLeft > 0
    ? `${siteUrl}/aluno/reforco-escolar`
    : `${siteUrl}/aluno/reforco-escolar/planos`
  const ctaText = creditsLeft > 0
    ? 'Agendar próxima aula →'
    : 'Renovar plano →'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#080d18;color:#e5e7eb;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.02em;">Método Revisão</span>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 24px;">
      <p style="font-size:15px;color:#d1d5db;margin:0 0 8px;">Olá, ${firstName}!</p>
      <h1 style="font-size:22px;color:#fff;margin:0 0 6px;font-weight:700;">Aula concluída! 🎉</h1>
      <p style="font-size:13px;color:#9ca3af;margin:0 0 20px;line-height:1.6;">
        ${subj ? `Sua aula de ${subj} foi registrada.` : 'Sua aula foi registrada.'}
        Alunos que mantêm frequência semanal evoluem 3x mais rápido.
      </p>
      <p style="font-size:13px;color:#9ca3af;margin:0 0 24px;line-height:1.6;">
        ${creditsMsg}
      </p>
      <div style="text-align:center;margin-bottom:16px;">
        <a href="${ctaHref}" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
          ${ctaText}
        </a>
      </div>${lessonId ? `
      <div style="text-align:center;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);">
        <p style="font-size:12px;color:#6b7280;margin:0 0 8px;">Como foi sua aula?</p>
        <a href="${siteUrl}/aluno/reforco-escolar/feedback/${lessonId}" style="font-size:12px;color:#a78bfa;text-decoration:none;">Avaliar com estrelas →</a>
      </div>` : ''}
    </div>
    <p style="text-align:center;font-size:11px;color:#4b5563;margin-top:24px;">
      Método Revisão — Reforço escolar online<br/>Dúvidas? ${SUPPORT_EMAIL}
    </p>
  </div>
</body>
</html>`

  await sendEmail({ to: studentEmail, subject: emailSubject, html })
}

// ─── Last lesson credit alert ────────────────────────────────────────────────

export async function notifyLastLessonCredit(params: {
  studentEmail: string
  studentName: string | null
  planName: string
}): Promise<void> {
  const { studentEmail, studentName, planName } = params
  const siteUrl   = getSiteUrl()
  const firstName = studentName ? studentName.split(' ')[0] : 'Aluno'

  const emailSubject = 'Você ainda tem 1 aula disponível'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#080d18;color:#e5e7eb;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.02em;">Método Revisão</span>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 24px;">
      <p style="font-size:15px;color:#d1d5db;margin:0 0 8px;">Olá, ${firstName}!</p>
      <h1 style="font-size:22px;color:#fff;margin:0 0 6px;font-weight:700;">Última aula do ciclo ⚡</h1>
      <p style="font-size:13px;color:#9ca3af;margin:0 0 24px;line-height:1.6;">
        Resta <strong style="color:#fff;">1 aula</strong> no seu plano ${planName}.
        Agende agora para aproveitar antes da renovação do ciclo.
      </p>
      <div style="text-align:center;padding:16px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:12px;margin-bottom:24px;">
        <p style="font-size:42px;font-weight:800;color:#fbbf24;margin:0;">1</p>
        <p style="font-size:12px;color:#9ca3af;margin:4px 0 0;">aula restante</p>
      </div>
      <div style="text-align:center;">
        <a href="${siteUrl}/aluno/reforco-escolar" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
          Agendar minha última aula →
        </a>
      </div>
      <p style="font-size:11px;color:#6b7280;margin-top:16px;text-align:center;line-height:1.5;">
        Seus créditos serão renovados automaticamente no próximo ciclo de faturamento.
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#4b5563;margin-top:24px;">
      Método Revisão — Reforço escolar online<br/>Dúvidas? ${SUPPORT_EMAIL}
    </p>
  </div>
</body>
</html>`

  await sendEmail({ to: studentEmail, subject: emailSubject, html })
}

// ─── Lesson inactivity reactivation ──────────────────────────────────────────

export async function notifyLessonInactive(params: {
  studentEmail: string
  studentName: string | null
  creditsLeft: number
  daysSinceLastLesson: number
  lastSubject: string | null
}): Promise<void> {
  const { studentEmail, studentName, creditsLeft, daysSinceLastLesson, lastSubject } = params
  const siteUrl   = getSiteUrl()
  const firstName = studentName ? studentName.split(' ')[0] : 'Aluno'

  const emailSubject = `Você ainda tem ${creditsLeft} aula${creditsLeft !== 1 ? 's' : ''} disponíve${creditsLeft !== 1 ? 'is' : 'l'}`

  const contextLine = lastSubject
    ? `Sua última aula foi de ${lastSubject}, há ${daysSinceLastLesson} dias. A professora está pronta para continuar de onde paramos.`
    : `Faz ${daysSinceLastLesson} dias desde sua última aula. A professora está pronta para continuar seu progresso.`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#080d18;color:#e5e7eb;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.02em;">Método Revisão</span>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 24px;">
      <p style="font-size:15px;color:#d1d5db;margin:0 0 8px;">Olá, ${firstName}!</p>
      <h1 style="font-size:22px;color:#fff;margin:0 0 6px;font-weight:700;">Suas aulas estão paradas</h1>
      <p style="font-size:13px;color:#9ca3af;margin:0 0 20px;line-height:1.6;">
        ${contextLine}
      </p>
      <div style="text-align:center;padding:16px;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:12px;margin-bottom:20px;">
        <p style="font-size:36px;font-weight:800;color:#fff;margin:0;">${creditsLeft}</p>
        <p style="font-size:12px;color:#9ca3af;margin:4px 0 0;">aula${creditsLeft !== 1 ? 's' : ''} disponíve${creditsLeft !== 1 ? 'is' : 'l'} agora</p>
      </div>
      <p style="font-size:13px;color:#9ca3af;margin:0 0 24px;line-height:1.6;text-align:center;">
        Alunos que mantêm frequência semanal evoluem 3x mais rápido. Não deixe seu plano parado.
      </p>
      <div style="text-align:center;">
        <a href="${siteUrl}/aluno/reforco-escolar" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
          Agendar aula agora →
        </a>
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:#4b5563;margin-top:24px;">
      Método Revisão — Reforço escolar online<br/>Dúvidas? ${SUPPORT_EMAIL}
    </p>
  </div>
</body>
</html>`

  await sendEmail({ to: studentEmail, subject: emailSubject, html })
}
