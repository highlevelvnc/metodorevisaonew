-- ============================================================================
-- Professor Remuneration — Supabase Migration
-- Run once in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Safe to re-run: uses IF NOT EXISTS and DROP POLICY IF EXISTS throughout
-- ============================================================================


-- ── 1. professor_rates ────────────────────────────────────────────────────────
-- Per-professor rate overrides. Falls back to src/lib/professor/rates.ts
-- constants if no row exists for a given professor.
-- A null valid_to means the rate is currently active.

create table if not exists professor_rates (
  id             uuid        primary key default gen_random_uuid(),
  professor_id   uuid        not null references users(id) on delete cascade,
  essay_rate     numeric(6,2) not null default 4.50,
  lesson_rate    numeric(6,2) not null default 16.50,
  valid_from     date        not null default current_date,
  valid_to       date,                        -- null = currently active
  created_at     timestamptz not null default now(),

  constraint professor_rates_positive_rates check (essay_rate >= 0 and lesson_rate >= 0),
  constraint professor_rates_valid_range    check (valid_to is null or valid_to > valid_from)
);

create index if not exists professor_rates_lookup_idx
  on professor_rates (professor_id, valid_from desc)
  where valid_to is null;


-- ── 2. lesson_sessions ────────────────────────────────────────────────────────
-- One row per lesson session (default 30 min). Status progression:
--   scheduled → completed  (professor confirmed session happened)
--   scheduled → cancelled  (session did not happen, not billable)

create table if not exists lesson_sessions (
  id             uuid        primary key default gen_random_uuid(),
  professor_id   uuid        not null references users(id) on delete cascade,
  student_id     uuid        references users(id) on delete set null,
  session_date   date        not null,
  duration_min   integer     not null default 30
                             check (duration_min > 0 and duration_min <= 480),
  topic          text,
  status         text        not null default 'scheduled'
                             check (status in ('scheduled', 'completed', 'cancelled')),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists lesson_sessions_professor_date_idx
  on lesson_sessions (professor_id, session_date desc);

create index if not exists lesson_sessions_status_idx
  on lesson_sessions (professor_id, status)
  where status = 'completed';


-- ── 3. monthly_payouts ────────────────────────────────────────────────────────
-- One row per professor per calendar month.
-- Populated/updated by the closing job on the last day of each month.
-- total_amount is a computed column — never set it manually.
--
-- Status lifecycle:
--   open   → closed  (month ended, amounts confirmed)
--   closed → paid    (payment transferred to professor)

create table if not exists monthly_payouts (
  id                  uuid         primary key default gen_random_uuid(),
  professor_id        uuid         not null references users(id) on delete cascade,
  reference_month     date         not null,   -- always the 1st of the month
  essays_count        integer      not null default 0 check (essays_count  >= 0),
  lessons_count       integer      not null default 0 check (lessons_count >= 0),
  essays_amount       numeric(10,2) not null default 0 check (essays_amount  >= 0),
  lessons_amount      numeric(10,2) not null default 0 check (lessons_amount >= 0),
  total_amount        numeric(10,2)
                      generated always as (essays_amount + lessons_amount) stored,
  status              text         not null default 'open'
                                   check (status in ('open', 'closed', 'paid')),
  closed_at           timestamptz,
  paid_at             timestamptz,
  payment_reference   text,        -- PIX txid, bank transfer ID, etc.
  notes               text,
  created_at          timestamptz  not null default now(),
  updated_at          timestamptz  not null default now(),

  unique (professor_id, reference_month),
  constraint monthly_payouts_month_is_first_day
    check (extract(day from reference_month) = 1)
);

create index if not exists monthly_payouts_professor_month_idx
  on monthly_payouts (professor_id, reference_month desc);

create index if not exists monthly_payouts_status_idx
  on monthly_payouts (status)
  where status in ('open', 'closed');


-- ── 4. Row Level Security ─────────────────────────────────────────────────────

alter table professor_rates  enable row level security;
alter table lesson_sessions  enable row level security;
alter table monthly_payouts  enable row level security;

-- Drop and recreate policies (idempotent)

drop policy if exists "professor_rates_select_own"   on professor_rates;
drop policy if exists "lesson_sessions_select_own"   on lesson_sessions;
drop policy if exists "lesson_sessions_insert_own"   on lesson_sessions;
drop policy if exists "lesson_sessions_update_own"   on lesson_sessions;
drop policy if exists "monthly_payouts_select_own"   on monthly_payouts;
drop policy if exists "professor_rates_admin"        on professor_rates;
drop policy if exists "lesson_sessions_admin"        on lesson_sessions;
drop policy if exists "monthly_payouts_admin"        on monthly_payouts;

-- Professors read their own rows
create policy "professor_rates_select_own"  on professor_rates
  for select using (professor_id = auth.uid());

create policy "lesson_sessions_select_own"  on lesson_sessions
  for select using (professor_id = auth.uid());

create policy "lesson_sessions_insert_own"  on lesson_sessions
  for insert with check (
    professor_id = auth.uid()
    and (select role from users where id = auth.uid()) in ('admin', 'reviewer')
  );

create policy "lesson_sessions_update_own"  on lesson_sessions
  for update using (
    professor_id = auth.uid()
    and (select role from users where id = auth.uid()) in ('admin', 'reviewer')
  );

create policy "monthly_payouts_select_own"  on monthly_payouts
  for select using (professor_id = auth.uid());

-- Admins have full access to all three tables
create policy "professor_rates_admin"  on professor_rates
  for all using ((select role from users where id = auth.uid()) = 'admin');

create policy "lesson_sessions_admin"  on lesson_sessions
  for all using ((select role from users where id = auth.uid()) = 'admin');

create policy "monthly_payouts_admin"  on monthly_payouts
  for all using ((select role from users where id = auth.uid()) = 'admin');


-- ── 5. Closing job reference (run on last day of each month) ──────────────────
-- This is not part of the migration. It's the query to run (via cron, Edge
-- Function, or manually) to produce a payout record for a given professor.
--
-- Replace :professor_id and :ref_month ('YYYY-MM-01') with real values.
--
-- insert into monthly_payouts (
--   professor_id, reference_month,
--   essays_count, essays_amount,
--   lessons_count, lessons_amount,
--   status
-- )
-- select
--   c.professor_id,
--   :ref_month,
--   count(c.id)                                as essays_count,
--   count(c.id) * coalesce(r.essay_rate, 4.50) as essays_amount,
--   coalesce(l.completed_lessons, 0)           as lessons_count,
--   coalesce(l.completed_lessons, 0) * coalesce(r.lesson_rate, 16.50) as lessons_amount,
--   'closed'
-- from (
--   select reviewer_id as professor_id, id
--   from corrections
--   where reviewer_id  = :professor_id
--     and corrected_at >= :ref_month
--     and corrected_at  < :ref_month::date + interval '1 month'
-- ) c
-- left join lateral (
--   select essay_rate, lesson_rate from professor_rates
--   where professor_id = :professor_id
--     and valid_from  <= current_date
--     and (valid_to is null or valid_to > current_date)
--   order by valid_from desc limit 1
-- ) r on true
-- left join lateral (
--   select count(*) as completed_lessons from lesson_sessions
--   where professor_id = :professor_id
--     and status       = 'completed'
--     and session_date >= :ref_month
--     and session_date  < :ref_month::date + interval '1 month'
-- ) l on true
-- on conflict (professor_id, reference_month)
-- do update set
--   essays_count  = excluded.essays_count,
--   essays_amount = excluded.essays_amount,
--   lessons_count = excluded.lessons_count,
--   lessons_amount = excluded.lessons_amount,
--   status        = excluded.status,
--   closed_at     = now(),
--   updated_at    = now();


-- ── 4. professor_payout_profiles ──────────────────────────────────────────────
-- Stores PIX payment details for each professor. One row per professor (unique).
-- Referenced by the /professor/perfil page and snapshotted at closing time.

create table if not exists professor_payout_profiles (
  id             uuid        primary key default gen_random_uuid(),
  professor_id   uuid        not null references users(id) on delete cascade,
  pix_key        text,
  pix_key_type   text        check (pix_key_type in ('cpf', 'cnpj', 'email', 'phone', 'random')),
  cpf            text,
  short_bio      text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint professor_payout_profiles_professor_id_key unique (professor_id)
);

-- RLS
alter table professor_payout_profiles enable row level security;

drop policy if exists "professors can view own payout profile" on professor_payout_profiles;
drop policy if exists "professors can upsert own payout profile" on professor_payout_profiles;
drop policy if exists "admins can view all payout profiles" on professor_payout_profiles;

create policy "professors can view own payout profile"
  on professor_payout_profiles for select
  using (professor_id = auth.uid());

create policy "professors can upsert own payout profile"
  on professor_payout_profiles for all
  using (professor_id = auth.uid())
  with check (professor_id = auth.uid());

create policy "admins can view all payout profiles"
  on professor_payout_profiles for select
  using (
    exists (
      select 1 from users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Index
create index if not exists professor_payout_profiles_professor_id_idx
  on professor_payout_profiles (professor_id);

-- updated_at trigger (reuse existing trigger function if present)
create or replace trigger professor_payout_profiles_updated_at
  before update on professor_payout_profiles
  for each row execute function update_updated_at_column();


-- ── 5. monthly_payouts — add payment columns ──────────────────────────────────
-- Add payment_method and pix_key_snapshot to monthly_payouts if not present.
-- pix_key_snapshot captures the professor's PIX key at the moment of closing.

alter table monthly_payouts
  add column if not exists payment_method   text default 'pix',
  add column if not exists pix_key_snapshot text;
