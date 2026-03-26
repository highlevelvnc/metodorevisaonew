-- ============================================================================
-- Migration 001 — Débito atômico de crédito
--
-- Problema resolvido:
--   O fluxo original fazia 3 operações separadas (SELECT → INSERT → UPDATE),
--   abrindo janela para race condition em envios simultâneos:
--   dois requests leem essays_used=4, ambos passam no check, ambos inserem
--   redação e ambos atualizam para essays_used=5 — um crédito consumido,
--   duas redações criadas.
--
-- Solução:
--   Função PL/pgSQL com SELECT … FOR UPDATE (row-level lock) que bloqueia
--   qualquer transação concorrente na mesma assinatura até o COMMIT.
--   Todo o ciclo check → debit → insert acontece em uma única transação.
--
-- Como aplicar:
--   Supabase Dashboard → SQL Editor → New query → cole este arquivo → Run
-- ============================================================================

-- ─── 1. CHECK constraint: última defesa no banco ───────────────────────────
-- NOT VALID: não valida linhas históricas (evita erro em dados já existentes),
-- mas passa a bloquear qualquer INSERT ou UPDATE que viole a restrição.
-- Para validar dados existentes depois: VALIDATE CONSTRAINT subs_essays_used_lte_limit
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'subs_essays_used_lte_limit'
  ) then
    alter table public.subscriptions
      add constraint subs_essays_used_lte_limit
      check (essays_used >= 0 and essays_used <= essays_limit)
      not valid; -- não trava em linhas históricas, mas protege novas escritas
  end if;
end $$;

-- ─── 2. Função atômica: check + debit + insert em uma única transação ──────
create or replace function public.submit_essay_atomic(
  p_user_id      uuid,
  p_theme_title  text,
  p_content_text text,
  p_theme_id     uuid  default null,
  p_notes        text  default null
)
returns uuid            -- retorna o id da redação criada
language plpgsql
security definer        -- roda como owner (ignora RLS) para evitar recursão
set search_path = public
as $$
declare
  v_sub_id   uuid;
  v_used     int;
  v_limit    int;
  v_essay_id uuid;
begin

  -- ── 0. Verificação de identidade ────────────────────────────────────────
  -- Impede que um usuário autenticado envie redação como outro user_id.
  -- auth.uid() é preenchido pelo Supabase via JWT — não pode ser forjado.
  if auth.uid() is distinct from p_user_id then
    raise exception 'UNAUTHORIZED'
      using hint = 'Acesso não autorizado.';
  end if;

  -- ── 1. Buscar e travar a assinatura ativa ────────────────────────────────
  -- FOR UPDATE: adquire row-level lock nesta linha específica.
  -- Qualquer outra transação que tente fazer SELECT ... FOR UPDATE na mesma
  -- linha ficará BLOQUEADA até que esta transação faça COMMIT ou ROLLBACK.
  -- Isso elimina completamente a race condition de créditos duplos.
  select id, essays_used, essays_limit
    into v_sub_id, v_used, v_limit
    from public.subscriptions
   where user_id  = p_user_id
     and status   = 'active'
     and (expires_at is null or expires_at > now())
   order by created_at desc
   limit 1
     for update;  -- row-level lock: bloqueia transações concorrentes nesta linha

  -- ── 2. Sem plano ativo ───────────────────────────────────────────────────
  if v_sub_id is null then
    raise exception 'NO_ACTIVE_PLAN'
      using hint = 'Nenhum plano ativo. Adquira um plano para enviar redações.';
  end if;

  -- ── 3. Créditos esgotados ────────────────────────────────────────────────
  if v_used >= v_limit then
    raise exception 'CREDIT_LIMIT_REACHED'
      using hint = 'Créditos esgotados. Faça upgrade do seu plano para continuar.';
  end if;

  -- ── 4. Debitar crédito ───────────────────────────────────────────────────
  -- Usa `essays_used + 1` (não v_used + 1) como defesa extra contra leituras
  -- obsoletas. O CHECK constraint também rejeita se ultrapassar o limite.
  update public.subscriptions
     set essays_used = essays_used + 1
   where id = v_sub_id;

  -- ── 5. Inserir redação ───────────────────────────────────────────────────
  -- Acontece na mesma transação do debit: ou ambos persistem, ou nenhum.
  insert into public.essays (
    student_id, theme_title, theme_id, content_text, notes, status
  ) values (
    p_user_id, p_theme_title, p_theme_id, p_content_text, p_notes, 'pending'
  )
  returning id into v_essay_id;

  -- ── 6. Retornar id da redação criada ─────────────────────────────────────
  return v_essay_id;

end;
$$;

-- ─── 3. Permissões ────────────────────────────────────────────────────────
-- Remove execução pública (padrão do Postgres), garante apenas para autenticados.
revoke all    on function public.submit_essay_atomic from public;
grant execute on function public.submit_essay_atomic to authenticated;

-- ─── 4. Comentários ───────────────────────────────────────────────────────
comment on function public.submit_essay_atomic is
  'Debita 1 crédito da assinatura ativa do aluno e insere a redação atomicamente. '
  'Usa SELECT ... FOR UPDATE para prevenir race conditions em envios simultâneos. '
  'Retorna o UUID da redação criada. Lança exceção com código em message em caso de erro.';
