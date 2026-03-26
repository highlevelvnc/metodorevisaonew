-- ============================================================================
-- Migration 003: Fix subscription RLS — remove student write access
-- Run in Supabase: Dashboard → SQL Editor → Execute
-- ============================================================================

-- SECURITY: Remove the policy that allows students to UPDATE their own
-- subscriptions via the anon-key Supabase client.
--
-- Why it existed: likely added as a boilerplate "update own row" policy.
-- Why it's dangerous: an authenticated student can run from the browser:
--
--   supabase.from('subscriptions')
--     .update({ essays_limit: 999, status: 'active' })
--     .eq('user_id', '<their id>')
--
-- ...and give themselves unlimited credits with zero payment.
--
-- Why it's safe to remove:
-- • Credits are debited via submit_essay_atomic() — a SECURITY DEFINER
--   function that runs as the function owner, not the calling user.
-- • Subscription inserts/updates from payments use createAdminClient()
--   (service-role key), which bypasses RLS entirely.
-- • No legitimate UI path requires a student to UPDATE their subscription.
--
drop policy if exists "subs: update own" on public.subscriptions;

-- Verify remaining policies (expected: read own + admin all)
-- select policyname, cmd from pg_policies where tablename = 'subscriptions';
