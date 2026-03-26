-- ============================================================================
-- Professor remuneration schema — minimal practical implementation
-- ============================================================================
-- Run this after the core users/essays/corrections tables are in place.
-- All tables use RLS; professors should only see their own rows.
-- ============================================================================


-- ── professor_rates ──────────────────────────────────────────────────────────
-- Stores the rate each professor is paid per unit of work.
-- Defaults to the platform-wide rate but can be overridden per professor.
-- A null valid_to means the rate is currently active.

create table if not exists professor_rates (
  id             uuid primary key default gen_random_uuid(),
  professor_id   uuid not null references users(id) on delete cascade,
  essay_rate     numeric(6,2) not null default 4.50,
  lesson_rate    numeric(6,2) not null default 16.50,
  valid_from     date not null default current_date,
  valid_to       date,                         -- null = currently active
  created_at     timestamptz not null default now(),

  constraint professor_rates_valid_range check (valid_to is null or valid_to > valid_from)
);

create index if not exists professor_rates_professor_id_idx on professor_rates(professor_id);


-- ── lesson_sessions ──────────────────────────────────────────────────────────
-- One row per completed lesson session (30-min slots).
-- duration_min allows for half-sessions or double sessions later.
-- status: scheduled | completed | cancelled

create table if not exists lesson_sessions (
  id             uuid primary key default gen_random_uuid(),
  professor_id   uuid not null references users(id) on delete cascade,
  student_id     uuid references users(id) on delete set null,
  session_date   date not null,
  duration_min   integer not null default 30,
  topic          text,
  status         text not null default 'scheduled'
                   check (status in ('scheduled', 'completed', 'cancelled')),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists lesson_sessions_professor_id_idx  on lesson_sessions(professor_id);
create index if not exists lesson_sessions_session_date_idx  on lesson_sessions(session_date);


-- ── monthly_payouts ───────────────────────────────────────────────────────────
-- One row per professor per calendar month.
-- Populated by a closing job on the last day of each month.
-- status: open | closed | paid

create table if not exists monthly_payouts (
  id                  uuid primary key default gen_random_uuid(),
  professor_id        uuid not null references users(id) on delete cascade,
  reference_month     date not null,            -- always the 1st of the month
  essays_count        integer not null default 0,
  lessons_count       integer not null default 0,
  essays_amount       numeric(10,2) not null default 0,
  lessons_amount      numeric(10,2) not null default 0,
  total_amount        numeric(10,2) generated always as (essays_amount + lessons_amount) stored,
  status              text not null default 'open'
                        check (status in ('open', 'closed', 'paid')),
  closed_at           timestamptz,
  paid_at             timestamptz,
  payment_reference   text,                     -- bank transfer ID, PIX txid, etc.
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  unique (professor_id, reference_month)
);

create index if not exists monthly_payouts_professor_id_idx     on monthly_payouts(professor_id);
create index if not exists monthly_payouts_reference_month_idx  on monthly_payouts(reference_month);
create index if not exists monthly_payouts_status_idx           on monthly_payouts(status);


-- ── RLS policies (template — adjust to match your auth setup) ────────────────

alter table professor_rates   enable row level security;
alter table lesson_sessions   enable row level security;
alter table monthly_payouts   enable row level security;

-- Professors see only their own rates
create policy "professor_rates_own" on professor_rates
  for select using (professor_id = auth.uid());

-- Professors see only their own sessions
create policy "lesson_sessions_own" on lesson_sessions
  for select using (professor_id = auth.uid());

-- Professors see only their own payouts
create policy "monthly_payouts_own" on monthly_payouts
  for select using (professor_id = auth.uid());

-- Admins can do everything (adjust role check to match your users table)
create policy "professor_rates_admin" on professor_rates
  for all using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

create policy "lesson_sessions_admin" on lesson_sessions
  for all using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

create policy "monthly_payouts_admin" on monthly_payouts
  for all using (exists (select 1 from users where id = auth.uid() and role = 'admin'));


-- ============================================================================
-- Implementation notes
-- ============================================================================
--
-- 1. Closing job (run on last day of each month, or first day of next month):
--    INSERT INTO monthly_payouts (professor_id, reference_month, essays_count, ...)
--    SELECT
--      corrector_id,
--      date_trunc('month', now())::date,
--      count(*) filter (where status = 'corrected'),
--      count(*) * <essay_rate>,
--      ...
--    FROM essays
--    WHERE corrected_at >= date_trunc('month', now())
--    ON CONFLICT (professor_id, reference_month) DO UPDATE SET ...;
--
-- 2. The effective rate for a professor at a given date is:
--    SELECT essay_rate, lesson_rate FROM professor_rates
--    WHERE professor_id = $1
--      AND valid_from <= $date
--      AND (valid_to IS NULL OR valid_to > $date)
--    ORDER BY valid_from DESC LIMIT 1;
--
-- 3. If no row in professor_rates, fall back to the constants in
--    src/lib/professor/rates.ts (RATE_ESSAY / RATE_LESSON).
-- ============================================================================
