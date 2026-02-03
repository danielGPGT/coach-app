-- RLS for client feature: coach_invitations, coach_clients, client_assignments (Clerk JWT: auth.jwt() ->> 'sub').
-- Run in Supabase SQL Editor.

-- ========== coach_invitations ==========
ALTER TABLE public.coach_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coach_invitations_select_own" ON public.coach_invitations;
DROP POLICY IF EXISTS "coach_invitations_insert_own" ON public.coach_invitations;
DROP POLICY IF EXISTS "coach_invitations_delete_own" ON public.coach_invitations;

CREATE POLICY "coach_invitations_select_own" ON public.coach_invitations FOR SELECT TO authenticated
  USING (coach_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "coach_invitations_insert_own" ON public.coach_invitations FOR INSERT TO authenticated
  WITH CHECK (coach_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "coach_invitations_delete_own" ON public.coach_invitations FOR DELETE TO authenticated
  USING (coach_id = (auth.jwt() ->> 'sub'));

-- ========== coach_clients ==========
ALTER TABLE public.coach_clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coach_clients_select_own" ON public.coach_clients;
DROP POLICY IF EXISTS "coach_clients_insert_own" ON public.coach_clients;
DROP POLICY IF EXISTS "coach_clients_update_own" ON public.coach_clients;
DROP POLICY IF EXISTS "coach_clients_delete_own" ON public.coach_clients;

CREATE POLICY "coach_clients_select_own" ON public.coach_clients FOR SELECT TO authenticated
  USING (coach_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "coach_clients_insert_own" ON public.coach_clients FOR INSERT TO authenticated
  WITH CHECK (coach_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "coach_clients_update_own" ON public.coach_clients FOR UPDATE TO authenticated
  USING (coach_id = (auth.jwt() ->> 'sub'))
  WITH CHECK (coach_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "coach_clients_delete_own" ON public.coach_clients FOR DELETE TO authenticated
  USING (coach_id = (auth.jwt() ->> 'sub'));

-- ========== client_assignments ==========
ALTER TABLE public.client_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_assignments_select_coach" ON public.client_assignments;
DROP POLICY IF EXISTS "client_assignments_insert_coach" ON public.client_assignments;
DROP POLICY IF EXISTS "client_assignments_update_coach" ON public.client_assignments;
DROP POLICY IF EXISTS "client_assignments_delete_coach" ON public.client_assignments;

-- Coach can only see assignments for their clients and their programs
CREATE POLICY "client_assignments_select_coach" ON public.client_assignments FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.coach_clients cc WHERE cc.client_id = client_assignments.client_id AND cc.coach_id = (auth.jwt() ->> 'sub'))
    AND EXISTS (SELECT 1 FROM public.programs p WHERE p.id = client_assignments.program_id AND p.coach_id = (auth.jwt() ->> 'sub'))
  );

CREATE POLICY "client_assignments_insert_coach" ON public.client_assignments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.coach_clients cc WHERE cc.client_id = client_assignments.client_id AND cc.coach_id = (auth.jwt() ->> 'sub'))
    AND EXISTS (SELECT 1 FROM public.programs p WHERE p.id = client_assignments.program_id AND p.coach_id = (auth.jwt() ->> 'sub'))
  );

CREATE POLICY "client_assignments_update_coach" ON public.client_assignments FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.coach_clients cc WHERE cc.client_id = client_assignments.client_id AND cc.coach_id = (auth.jwt() ->> 'sub'))
    AND EXISTS (SELECT 1 FROM public.programs p WHERE p.id = client_assignments.program_id AND p.coach_id = (auth.jwt() ->> 'sub'))
  );

CREATE POLICY "client_assignments_delete_coach" ON public.client_assignments FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.coach_clients cc WHERE cc.client_id = client_assignments.client_id AND cc.coach_id = (auth.jwt() ->> 'sub'))
    AND EXISTS (SELECT 1 FROM public.programs p WHERE p.id = client_assignments.program_id AND p.coach_id = (auth.jwt() ->> 'sub'))
  );
