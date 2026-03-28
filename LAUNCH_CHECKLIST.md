# Launch Checklist — Método Revisão

Practical checklist for production launch. Each item is either a one-time setup or a manual test.

---

## 1. Database Migrations

Apply in order. Each migration is idempotent but order matters.

| # | File | What it does | Status |
|---|------|-------------|--------|
| 001 | `supabase/migrations/001_atomic_essay_credit.sql` | `submit_essay_atomic()` RPC + row-level locking | ⬜ |
| 002 | `supabase/migrations/002_stripe_fields.sql` | Stripe customer/session ID columns | ⬜ |
| 003 | `supabase/migrations/003_fix_subscription_rls.sql` | Remove dangerous student UPDATE RLS policy | ⬜ |
| 004 | `supabase/migrations/004_upload_fields.sql` | `upload_type`, `original_file_url`, `processing_status` | ⬜ |
| 005 | `supabase/migrations/005_stripe_subscription_id.sql` | `stripe_subscription_id` unique constraint | ⬜ |
| 006 | `supabase/migrations/006_share_feedback.sql` | `share_tokens` table | ⬜ |
| 007 | `supabase/migrations/007_activation_retention_state.sql` | `last_activity_at`, `viewed_at`, `nudge_events` | ⬜ |
| 008 | `supabase/migrations/008_share_tokens.sql` | Share tokens for public correction sharing | ⬜ |
| 009 | `supabase/migrations/009_correction_feedback.sql` | `correction_feedback` table | ⬜ |
| 010 | `supabase/migrations/010_product_events.sql` | `product_events` table for analytics | ⬜ |

Check: `supabase/schema.sql` has the base schema including the `handle_new_user` trigger that creates Trial subscriptions.

---

## 2. Database Seed Data

| Item | Required | Notes |
|------|----------|-------|
| `plans` table has `trial` row | ✅ Critical | Must exist with `slug='trial'`, `essay_count=1`, `price_brl=0`, `active=true` |
| `plans` table has `evolucao` row | ✅ Critical | `slug='evolucao'`, correct `essay_count` and `price_brl` |
| `plans` table has `estrategia` row | ✅ Critical | `slug='estrategia'`, marked as popular |
| `plans` table has `intensivo` row | ✅ Critical | `slug='intensivo'` |

---

## 3. Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + .env.local | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + .env.local | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (server only) | Admin client for RLS bypass, analytics, webhooks |
| `STRIPE_SECRET_KEY` | Vercel (server only) | Stripe API key for checkout sessions |
| `STRIPE_WEBHOOK_SECRET` | Vercel (server only) | Webhook signature verification |
| `NEXT_PUBLIC_APP_URL` | Vercel | Canonical app URL (e.g. `https://app.metodorevisao.com`) |

---

## 4. Stripe Setup

| Item | Status |
|------|--------|
| Products created for each plan (Evolução, Estratégia, Intensivo) | ⬜ |
| Recurring prices set (monthly) matching `plans.price_brl` | ⬜ |
| Webhook endpoint registered: `{APP_URL}/api/webhooks/stripe` | ⬜ |
| Webhook events enabled: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.payment_succeeded`, `customer.subscription.deleted`, `customer.subscription.updated` | ⬜ |
| `STRIPE_WEBHOOK_SECRET` set in Vercel env | ⬜ |
| Test mode checkout flow verified end-to-end | ⬜ |

---

## 5. Supabase Storage

| Item | Status |
|------|--------|
| Bucket `essay-images` created | ⬜ |
| Bucket set to **public** (for image essay URLs) | ⬜ |
| RLS policies allow authenticated upload to `essays/{userId}/*` | ⬜ |

---

## 6. DNS & Domain

| Item | Status |
|------|--------|
| `metodorevisao.com` resolves to Vercel | ⬜ |
| `app.metodorevisao.com` subdomain configured (if separate) | ⬜ |
| SSL certificates active | ⬜ |

---

## 7. Email & Support

| Item | Status |
|------|--------|
| `suporte@metodorevisao.com` configured and receiving mail | ⬜ |
| FormSubmit.co confirmation for para-escolas form (if used) | ⬜ |

---

## 8. Trial Flow — Manual Test Checklist

Test the complete trial user journey:

| Step | What to verify | ✓ |
|------|---------------|---|
| 1. Visit landing page | "Começar com 1 correção grátis" CTA visible in Hero | ⬜ |
| 2. Click Hero CTA | Navigates to `/cadastro` | ⬜ |
| 3. Sign up with email | Account created, redirected to `/aluno` | ⬜ |
| 4. Dashboard loads | Shows "Vamos começar sua primeira redação" with "1 correção gratuita" | ⬜ |
| 5. Click "Enviar primeira redação" | Navigates to `/aluno/redacoes/nova` | ⬜ |
| 6. Submission form | Shows "Correção gratuita" (green) in header | ⬜ |
| 7. Submit essay | Essay created, credit debited, redirect to essay page | ⬜ |
| 8. Dashboard after submit | Shows 0 credits, "Correção gratuita utilizada", upgrade CTAs | ⬜ |
| 9. Essay page (waiting) | Shows "Redação na fila de correção" | ⬜ |
| 10. After correction (admin) | Correction appears, student can view | ⬜ |
| 11. View correction | Post-trial CTA appears: "Agora que você viu sua devolutiva..." | ⬜ |
| 12. Click "Continuar minha evolução" | Navigates to `/aluno/upgrade` | ⬜ |
| 13. Upgrade page | Shows "Continue sua evolução" heading, trial plan with "Grátis / 1 correção incluída" | ⬜ |
| 14. Select paid plan | Redirects to Stripe checkout | ⬜ |
| 15. Complete payment | Subscription activated, credits available | ⬜ |

---

## 9. Analytics Verification

| Item | Status |
|------|--------|
| `product_events` table exists (migration 010) | ⬜ |
| `SUPABASE_SERVICE_ROLE_KEY` set (required for analytics writes) | ⬜ |
| Test: `trial_started` fires on new user dashboard | ⬜ |
| Test: `trial_correction_used` fires on trial essay submit | ⬜ |
| Test: `trial_to_paid_conversion` fires on Stripe webhook | ⬜ |
| `/professor/analytics` page loads for admin users | ⬜ |
| Trial funnel section shows in analytics page | ⬜ |

---

## 10. Pre-Launch Smoke Tests

| Test | Status |
|------|--------|
| Landing page loads without errors | ⬜ |
| All landing page sections render (Hero → FloatingCTA) | ⬜ |
| Plan CTAs link to `/checkout/{slug}` correctly | ⬜ |
| Mobile floating CTA shows "Começar grátis" | ⬜ |
| FAQ includes trial question | ⬜ |
| Login page works | ⬜ |
| Password reset works | ⬜ |
| Professor dashboard loads for admin | ⬜ |
| Essay correction submission (professor side) works | ⬜ |
| Biia chatbot responds | ⬜ |
| Share link generates and public page renders | ⬜ |

---

## Notes

- **No unlimited access**: Trial gives exactly 1 credit, enforced by DB constraint
- **No abuse loopholes**: `handle_new_user` trigger runs once per auth signup; `submit_essay_atomic` uses row-level locking
- **Analytics are fire-and-forget**: If `product_events` table doesn't exist yet, events silently fail without blocking user flow
- **Stripe webhooks are idempotent**: Duplicate events are handled via `stripe_checkout_session_id` unique constraint
