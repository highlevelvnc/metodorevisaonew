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
