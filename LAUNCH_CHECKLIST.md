# Launch Checklist — Método Revisão

Practical checklist for production launch. Each item is either a one-time setup or a manual test.

Last updated: 2026-03-28

---

## 1. Database — Schema & Migrations

Apply `schema.sql` first (base tables, `handle_new_user` trigger, RLS policies), then migrations in order.

| # | File | What it does | Status |
|---|------|-------------|--------|
| — | `supabase/schema.sql` | Base schema, `handle_new_user` trigger (creates Trial subscription), RLS | ⬜ |
| 001 | `001_atomic_essay_credit.sql` | `submit_essay_atomic()` RPC + row-level locking | ⬜ |
| 002 | `002_stripe_fields.sql` | `stripe_customer_id`, `stripe_checkout_session_id` columns | ⬜ |
| 003 | `003_fix_subscription_rls.sql` | Remove dangerous student UPDATE RLS policy | ⬜ |
| 004 | `004_correction_upgrade.sql` | `upload_type`, `original_file_url`, `processing_status` on essays | ⬜ |
| 005 | `005_stripe_subscription_id.sql` | `stripe_subscription_id` unique constraint | ⬜ |
| 006 | `006_correction_unique_essay.sql` | Unique correction per essay constraint | ⬜ |
| 007 | `007_activation_retention_state.sql` | `last_activity_at`, `viewed_at`, `nudge_events` | ⬜ |
| 008 | `008_share_tokens.sql` | Share tokens for public correction sharing | ⬜ |
| 009 | `009_correction_feedback.sql` | `correction_feedback` table | ⬜ |
| 010 | `010_product_events.sql` | `product_events` table for analytics | ⬜ |

**Verification:** After applying, run in SQL Editor:
```sql
SELECT slug, price_brl, essays_limit FROM plans ORDER BY price_brl;
-- Must return: trial (0, 1), evolucao (97, 3), estrategia (167, 5), intensivo (227, 8)

SELECT proname FROM pg_proc WHERE proname = 'submit_essay_atomic';
-- Must return 1 row

SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
-- Must return 1 row
```

---

## 2. Database Seed Data

| Item | Required | How to verify |
|------|----------|---------------|
| `plans` table has `trial` row | **Critical** | `slug='trial'`, `essays_limit=1`, `price_brl=0`, `active=true` |
| `plans` table has `evolucao` row | **Critical** | `slug='evolucao'`, `price_brl=97` |
| `plans` table has `estrategia` row | **Critical** | `slug='estrategia'`, `price_brl=167` |
| `plans` table has `intensivo` row | **Critical** | `slug='intensivo'`, `price_brl=227` |

Plans are seeded in `schema.sql` lines 330-349. If the table is empty after migration, run the INSERT statements manually.

---

## 3. Environment Variables (Vercel)

All must be set in Vercel → Settings → Environment Variables for **Production**, **Preview**, AND **Development**.

| Variable | Purpose | How to get |
|----------|---------|-----------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for email links, Stripe redirects | `https://metodorevisao.com` (no trailing slash) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase public key | Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin client (webhooks, analytics) | Dashboard → Settings → API → service_role |
| `STRIPE_SECRET_KEY` | Stripe API (checkout sessions) | Stripe Dashboard → API keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | Stripe Dashboard → Webhooks → endpoint → Signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe (future use) | Stripe Dashboard → API keys |

**Validation:** The app will throw descriptive errors at startup if any are missing (no more silent `!` assertion crashes).

---

## 4. Stripe Setup

| Item | Status |
|------|--------|
| Products created for each plan (Evolução, Estratégia, Intensivo) | ⬜ |
| Recurring monthly prices matching `plans.price_brl` (R$97, R$167, R$227) | ⬜ |
| Webhook endpoint: `https://metodorevisao.com/api/webhooks/stripe` | ⬜ |
| Webhook events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.payment_succeeded`, `customer.subscription.deleted`, `customer.subscription.updated` | ⬜ |
| `STRIPE_WEBHOOK_SECRET` from endpoint copied to Vercel env | ⬜ |
| Test mode checkout verified end-to-end | ⬜ |

---

## 5. Supabase Storage

| Item | Status |
|------|--------|
| Bucket `essay-images` created | ⬜ |
| Bucket set to **public** | ⬜ |
| RLS policies applied (schema.sql lines 224-249) | ⬜ |

---

## 6. Supabase Auth Configuration

| Item | Status |
|------|--------|
| Email confirmation enabled (Authentication → Providers → Email) | ⬜ |
| PKCE flow enabled (Authentication → Configuration) | ⬜ |
| Redirect URL added: `https://metodorevisao.com/auth/callback` | ⬜ |
| SMTP configured (Resend or custom) | ⬜ |
| Email templates customized (confirmation, password reset) | ⬜ |

---

## 7. DNS & Domain

| Item | Status |
|------|--------|
| `metodorevisao.com` resolves to Vercel | ⬜ |
| SSL certificate active | ⬜ |
| `NEXT_PUBLIC_SITE_URL` matches the canonical domain exactly | ⬜ |

---

## 8. Launch Day — Manual QA Checklist

### A. Landing → Signup

| Step | Expected | ✓ |
|------|----------|---|
| 1. Visit landing page | Page loads, Hero section visible | ⬜ |
| 2. Hero CTA text | "Enviar redação e receber correção grátis" | ⬜ |
| 3. Click Hero CTA | Navigates to `/cadastro` | ⬜ |
| 4. FloatingCTA (mobile) | Shows "Enviar grátis" → links to `/cadastro` | ⬜ |
| 5. ComoFunciona CTAs | Both link to `/cadastro` | ⬜ |
| 6. Planos section | Green trial banner at top → `/cadastro` | ⬜ |
| 7. Planos paid CTAs | Link to `/checkout/{slug}` (evolucao/estrategia/intensivo) | ⬜ |
| 8. CTAFinal | CTA links to `/cadastro` | ⬜ |
| 9. FAQ | Includes "Posso experimentar antes de assinar?" | ⬜ |
| 10. Blog post CTA | Links to `/cadastro` (not /checkout/evolucao) | ⬜ |

### B. Signup → Email Confirmation

| Step | Expected | ✓ |
|------|----------|---|
| 11. Fill signup form | Name, email, password fields work | ⬜ |
| 12. Submit | Shows "Conta criada. Verifique seu email para confirmar o cadastro." | ⬜ |
| 13. Check email | Confirmation email received (check spam) | ⬜ |
| 14. Click confirmation link | Redirects to `/aluno` (not error page) | ⬜ |
| 15. Check terminal logs | `[auth/callback] ✓ session exchanged` with Set-Cookie count > 0 | ⬜ |

### C. Trial Activation → First Essay

| Step | Expected | ✓ |
|------|----------|---|
| 16. Dashboard loads | Shows onboarding state, "1 correção gratuita" | ⬜ |
| 17. Click "Enviar redação" | Navigates to `/aluno/redacoes/nova` | ⬜ |
| 18. Essay form | Shows "Correção gratuita" green badge | ⬜ |
| 19. Submit essay (text or image) | Essay created, redirect to essay page | ⬜ |
| 20. Essay waiting state | Shows "Redação na fila de correção" + green "Sua primeira correção gratuita está a caminho" pill | ⬜ |
| 21. Dashboard after submit | Shows 0 credits remaining | ⬜ |

### D. Correction Delivery → View

| Step | Expected | ✓ |
|------|----------|---|
| 22. Professor submits correction | Correction saved, student notified | ⬜ |
| 23. Student views correction | Full devolutiva with C1-C5 scores, feedback, coaching | ⬜ |
| 24. Post-trial upgrade CTA | "Continuar minha evolução" → `/aluno/upgrade` visible | ⬜ |

### E. Upgrade → Stripe → Activation

| Step | Expected | ✓ |
|------|----------|---|
| 25. Upgrade page | "Continue sua evolução" heading, trial shows "Grátis" | ⬜ |
| 26. Select paid plan | Redirects to Stripe checkout | ⬜ |
| 27. Complete Stripe payment | Returns to `/aluno/upgrade/sucesso` | ⬜ |
| 28. Success page | Shows "Pagamento confirmado" or "Ativando..." | ⬜ |
| 29. Dashboard after upgrade | New plan name, correct credit count | ⬜ |
| 30. Webhook log | `checkout.session.completed` processed (Vercel logs) | ⬜ |

### F. Smoke Tests

| Test | Status |
|------|--------|
| Login page works (`/login`) | ⬜ |
| Password reset email sends and works | ⬜ |
| Professor dashboard loads | ⬜ |
| Professor can submit a correction | ⬜ |
| Share link generates and public page renders | ⬜ |
| Mobile responsive (landing, dashboard, essay form) | ⬜ |

---

## 9. Analytics Verification (Optional — Non-Blocking)

| Item | Status |
|------|--------|
| `product_events` table exists (migration 010) | ⬜ |
| `trial_started` fires on new user dashboard | ⬜ |
| `trial_correction_used` fires on essay submit | ⬜ |
| `trial_to_paid_conversion` fires on webhook | ⬜ |

Analytics are fire-and-forget — if the table doesn't exist, events silently fail without blocking user flow.

---

## Safety Properties (Already Built)

- **No unlimited access**: Trial = exactly 1 credit, enforced by `submit_essay_atomic()` with row-level locking
- **No abuse loopholes**: `handle_new_user` trigger runs once per auth signup
- **Stripe webhooks are idempotent**: `stripe_checkout_session_id` has UNIQUE constraint
- **Env vars validated at startup**: All Supabase/Stripe clients throw descriptive errors if env vars missing
- **Middleware skips /auth/ paths**: Prevents interference with PKCE code exchange
- **No fake urgency/social proof**: Removed all fabricated scarcity messaging
- **All landing CTAs → /cadastro**: Trial-first acquisition, no direct-to-paid bypass
