-- RLS policies for the exercises table (Clerk JWT: user id in auth.jwt() ->> 'sub').
-- Run this in the Supabase SQL Editor after your tables exist.

-- Ensure RLS is enabled
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if you're re-running (adjust names if you already have different ones)
DROP POLICY IF EXISTS "exercises_select_global_and_own" ON public.exercises;
DROP POLICY IF EXISTS "exercises_insert_own" ON public.exercises;
DROP POLICY IF EXISTS "exercises_update_own" ON public.exercises;
DROP POLICY IF EXISTS "exercises_delete_own" ON public.exercises;

-- SELECT: global exercises (coach_id IS NULL) or exercises created by the current user
CREATE POLICY "exercises_select_global_and_own"
ON public.exercises
FOR SELECT
TO authenticated
USING (
  coach_id IS NULL
  OR coach_id = (auth.jwt() ->> 'sub')
);

-- INSERT: only allow inserting rows where coach_id is the current user
CREATE POLICY "exercises_insert_own"
ON public.exercises
FOR INSERT
TO authenticated
WITH CHECK (coach_id = (auth.jwt() ->> 'sub'));

-- UPDATE: only allow updating your own custom exercises
CREATE POLICY "exercises_update_own"
ON public.exercises
FOR UPDATE
TO authenticated
USING (coach_id = (auth.jwt() ->> 'sub'))
WITH CHECK (coach_id = (auth.jwt() ->> 'sub'));

-- DELETE: only allow deleting your own custom exercises
CREATE POLICY "exercises_delete_own"
ON public.exercises
FOR DELETE
TO authenticated
USING (coach_id = (auth.jwt() ->> 'sub'));
