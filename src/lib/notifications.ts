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

  const from = process.env.RESEND_FROM_EMAIL ?? 'Método Revisão <noreply@metodorevisao.com>'

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
      Método Revisão — Correção estratégica de redação ENEM
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
  </div>
</body>
</html>`

  await sendEmail({ to: studentEmail, subject, html })
}
