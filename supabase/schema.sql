-- ============================================================================
-- Método Revisão — Database Schema
-- Cole no Supabase: Dashboard → SQL Editor → New query → Execute
-- ============================================================================

-- ─── Enums ────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.user_role as enum ('student', 'reviewer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.essay_status as enum ('pending', 'in_review', 'corrected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_status as enum ('active', 'cancelled', 'expired');
exception when duplicate_object then null; end $$;

-- ─── users ────────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  full_name   text not null default '',
  role        public.user_role not null default 'student',
  avatar_url  text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- ─── plans ────────────────────────────────────────────────────────────────────
create table if not exists public.plans (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  price_brl   numeric(10,2) not null,
  essay_count int not null,
  features    jsonb default '[]'::jsonb,
  active      boolean default true,
  created_at  timestamptz default now() not null
);

-- ─── subscriptions ────────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.users(id) on delete cascade not null,
  plan_id       uuid references public.plans(id) not null,
  status        public.subscription_status not null default 'active',
  essays_used   int not null default 0,
  essays_limit  int not null,
  started_at    timestamptz default now() not null,
  expires_at    timestamptz,
  created_at    timestamptz default now() not null
);

-- ─── themes ───────────────────────────────────────────────────────────────────
create table if not exists public.themes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  source      text,
  year        int,
  active      boolean default true,
  created_at  timestamptz default now() not null
);

-- ─── essays ───────────────────────────────────────────────────────────────────
create table if not exists public.essays (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid references public.users(id) on delete cascade not null,
  theme_id      uuid references public.themes(id) on delete set null,
  theme_title   text not null,
  content_text  text,
  notes         text,
  status        public.essay_status not null default 'pending',
  submitted_at  timestamptz default now() not null,
  created_at    timestamptz default now() not null
);

-- ─── corrections ──────────────────────────────────────────────────────────────
create table if not exists public.corrections (
  id                uuid primary key default gen_random_uuid(),
  essay_id          uuid references public.essays(id) on delete cascade not null unique,
  reviewer_id       uuid references public.users(id) not null,
  reviewer_name     text not null default '',
  c1_score          int not null check (c1_score in (0,40,80,120,160,200)),
  c2_score          int not null check (c2_score in (0,40,80,120,160,200)),
  c3_score          int not null check (c3_score in (0,40,80,120,160,200)),
  c4_score          int not null check (c4_score in (0,40,80,120,160,200)),
  c5_score          int not null check (c5_score in (0,40,80,120,160,200)),
  total_score       int not null,
  general_feedback  text not null,
  annotations       jsonb default '[]'::jsonb,
  corrected_at      timestamptz default now() not null,
  created_at        timestamptz default now() not null
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists essays_student_id_idx    on public.essays(student_id);
create index if not exists essays_status_idx        on public.essays(status);
create index if not exists essays_submitted_at_idx  on public.essays(submitted_at desc);
create index if not exists corrections_essay_id_idx on public.corrections(essay_id);
create index if not exists subs_user_id_idx         on public.subscriptions(user_id);

-- ─── Helper functions (SECURITY DEFINER = bypass RLS to avoid recursion) ──────
create or replace function public.is_admin_or_reviewer()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists(
    select 1 from public.users
    where id = auth.uid()
    and role in ('admin', 'reviewer')
  );
$$;

create or replace function public.get_user_role()
returns text
language sql security definer stable
set search_path = public
as $$
  select role::text from public.users where id = auth.uid();
$$;

-- ─── Trigger: auto-create user profile on signup ──────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  trial_plan_id uuid;
begin
  -- Create user profile
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'student'
  );

  -- Create free trial subscription (1 essay)
  select id into trial_plan_id from public.plans where slug = 'trial' limit 1;
  if trial_plan_id is not null then
    insert into public.subscriptions (user_id, plan_id, essays_limit, status)
    values (new.id, trial_plan_id, 1, 'active');
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();

-- ─── RLS ──────────────────────────────────────────────────────────────────────
alter table public.users         enable row level security;
alter table public.plans         enable row level security;
alter table public.subscriptions enable row level security;
alter table public.themes        enable row level security;
alter table public.essays        enable row level security;
alter table public.corrections   enable row level security;

-- users
create policy if not exists "users: read own" on public.users for select using (auth.uid() = id);
create policy "users: update own"  on public.users for update using (auth.uid() = id);
create policy "users: admin read"  on public.users for select using (public.is_admin_or_reviewer());
create policy "users: admin update" on public.users for update using (public.is_admin_or_reviewer());

-- plans (público — qualquer autenticado lê)
create policy "plans: authenticated read" on public.plans for select to authenticated using (true);

-- subscriptions
create policy "subs: read own"        on public.subscriptions for select using (user_id = auth.uid());
create policy "subs: update own"      on public.subscriptions for update using (user_id = auth.uid());
create policy "subs: admin all"       on public.subscriptions for all using (public.is_admin_or_reviewer());

-- themes (público — qualquer autenticado lê)
create policy "themes: read active"   on public.themes for select to authenticated using (active = true);
create policy "themes: admin all"     on public.themes for all using (public.is_admin_or_reviewer());

-- essays
create policy "essays: student read"  on public.essays for select using (student_id = auth.uid());
create policy "essays: student insert" on public.essays for insert with check (student_id = auth.uid());
create policy "essays: admin all"     on public.essays for all using (public.is_admin_or_reviewer());

-- corrections
create policy "corrections: student read"
  on public.corrections for select
  using (
    exists (
      select 1 from public.essays
      where essays.id = corrections.essay_id
      and essays.student_id = auth.uid()
      and essays.status = 'corrected'
    )
  );
create policy "corrections: admin all" on public.corrections for all using (public.is_admin_or_reviewer());

-- ─── Storage: essay-images bucket ────────────────────────────────────────────
-- STEP 1 (Dashboard only — cannot be done via SQL):
--   Supabase Dashboard → Storage → New bucket
--   Name: essay-images
--   Public: ✅ YES (images need a stable public URL for the reviewer panel)
--   Allowed MIME types: image/jpeg, image/png, image/webp, application/pdf
--   Max upload size: 8 MB
--
-- STEP 2: Apply these storage RLS policies (run in SQL Editor):

-- Students may only upload into their own folder (essays/{user_id}/*)
create policy "storage: student upload own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'essay-images'
    and (storage.foldername(name))[1] = 'essays'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- Admins/reviewers may read all uploaded essay images
create policy "storage: admin read all"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'essay-images'
    and public.is_admin_or_reviewer()
  );

-- Students may read only their own uploads
create policy "storage: student read own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'essay-images'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- ─── CHECK constraint: defesa final contra débito excessivo ──────────────────
-- Impede qualquer UPDATE que leve essays_used acima de essays_limit.
-- Complementa a função atômica como última linha de defesa no banco.
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'subs_essays_used_lte_limit'
  ) then
    alter table public.subscriptions
      add constraint subs_essays_used_lte_limit
      check (essays_used >= 0 and essays_used <= essays_limit)
      not valid;
  end if;
end $$;

-- ─── Função atômica: submit_essay_atomic ──────────────────────────────────────
-- Garante que o check de crédito, o débito e a inserção da redação
-- aconteçam em uma única transação com row-level lock (SELECT … FOR UPDATE).
-- Elimina race conditions em envios simultâneos.
create or replace function public.submit_essay_atomic(
  p_user_id      uuid,
  p_theme_title  text,
  p_content_text text,
  p_theme_id     uuid  default null,
  p_notes        text  default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub_id   uuid;
  v_used     int;
  v_limit    int;
  v_essay_id uuid;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'UNAUTHORIZED'
      using hint = 'Acesso não autorizado.';
  end if;

  select id, essays_used, essays_limit
    into v_sub_id, v_used, v_limit
    from public.subscriptions
   where user_id  = p_user_id
     and status   = 'active'
     and (expires_at is null or expires_at > now())
   order by created_at desc
   limit 1
     for update;

  if v_sub_id is null then
    raise exception 'NO_ACTIVE_PLAN'
      using hint = 'Nenhum plano ativo. Adquira um plano para enviar redações.';
  end if;

  if v_used >= v_limit then
    raise exception 'CREDIT_LIMIT_REACHED'
      using hint = 'Créditos esgotados. Faça upgrade do seu plano para continuar.';
  end if;

  update public.subscriptions
     set essays_used = essays_used + 1
   where id = v_sub_id;

  insert into public.essays (
    student_id, theme_title, theme_id, content_text, notes, status
  ) values (
    p_user_id, p_theme_title, p_theme_id, p_content_text, p_notes, 'pending'
  )
  returning id into v_essay_id;

  return v_essay_id;
end;
$$;

revoke all    on function public.submit_essay_atomic from public;
grant execute on function public.submit_essay_atomic to authenticated;

-- ─── Seed data ────────────────────────────────────────────────────────────────
insert into public.plans (name, slug, price_brl, essay_count, features) values
  ('Trial',     'trial',     0,      1, '["1 redação gratuita", "Devolutiva completa C1-C5"]'::jsonb),
  ('Evolução',  'evolucao',  97.00,  3, '["3 redações por ciclo", "Devolutiva C1-C5", "Acompanhamento de evolução"]'::jsonb),
  ('Estratégia','estrategia',167.00, 5, '["5 redações por ciclo", "Devolutiva C1-C5", "Acompanhamento prioritário", "Análise de padrões"]'::jsonb),
  ('Intensivo', 'intensivo', 227.00, 8, '["8 redações por ciclo", "Devolutiva C1-C5", "Correção em até 24h", "Análise completa"]'::jsonb)
on conflict (slug) do nothing;

insert into public.themes (title, source, year, active) values
  ('Violência e desigualdade no Brasil contemporâneo',            'ENEM', 2023, true),
  ('Impactos da inteligência artificial no mercado de trabalho',  'ENEM', 2023, true),
  ('O papel das redes sociais na polarização política',           'ENEM', 2022, true),
  ('Crise hídrica e gestão de recursos naturais',                 'ENEM', 2022, true),
  ('Saúde mental e produtividade na sociedade contemporânea',     'ENEM', 2023, true),
  ('Educação inclusiva no Brasil',                                'ENEM', 2021, true),
  ('Desafios da segurança alimentar no século XXI',               'ENEM', 2021, true),
  ('A invisibilidade da pessoa idosa na sociedade brasileira',    'ENEM', 2020, true),
  ('Fake news e os riscos para a democracia',                     'ENEM', 2020, true),
  ('O legado da escravidão na sociedade brasileira',              'ENEM', 2019, true)
on conflict do nothing;
