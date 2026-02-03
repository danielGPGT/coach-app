-- RLS policies for programs, program_workouts, prescribed_exercises (Clerk JWT: user id in auth.jwt() ->> 'sub').
-- Run in Supabase SQL Editor if you use the JWT template. Until then, the app uses the service role for these tables.

-- Programs
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "programs_select_own" ON public.programs;
DROP POLICY IF EXISTS "programs_insert_own" ON public.programs;
DROP POLICY IF EXISTS "programs_update_own" ON public.programs;
DROP POLICY IF EXISTS "programs_delete_own" ON public.programs;

CREATE POLICY "programs_select_own" ON public.programs FOR SELECT TO authenticated
  USING (coach_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "programs_insert_own" ON public.programs FOR INSERT TO authenticated
  WITH CHECK (coach_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "programs_update_own" ON public.programs FOR UPDATE TO authenticated
  USING (coach_id = (auth.jwt() ->> 'sub'))
  WITH CHECK (coach_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "programs_delete_own" ON public.programs FOR DELETE TO authenticated
  USING (coach_id = (auth.jwt() ->> 'sub'));

-- Program workouts (via program ownership)
ALTER TABLE public.program_workouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "program_workouts_select" ON public.program_workouts;
DROP POLICY IF EXISTS "program_workouts_insert" ON public.program_workouts;
DROP POLICY IF EXISTS "program_workouts_update" ON public.program_workouts;
DROP POLICY IF EXISTS "program_workouts_delete" ON public.program_workouts;

CREATE POLICY "program_workouts_select" ON public.program_workouts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.programs p WHERE p.id = program_workouts.program_id AND p.coach_id = (auth.jwt() ->> 'sub')));

CREATE POLICY "program_workouts_insert" ON public.program_workouts FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.programs p WHERE p.id = program_workouts.program_id AND p.coach_id = (auth.jwt() ->> 'sub')));

CREATE POLICY "program_workouts_update" ON public.program_workouts FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.programs p WHERE p.id = program_workouts.program_id AND p.coach_id = (auth.jwt() ->> 'sub')));

CREATE POLICY "program_workouts_delete" ON public.program_workouts FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.programs p WHERE p.id = program_workouts.program_id AND p.coach_id = (auth.jwt() ->> 'sub')));

-- Prescribed exercises (via program_workouts -> program ownership)
ALTER TABLE public.prescribed_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prescribed_exercises_select" ON public.prescribed_exercises;
DROP POLICY IF EXISTS "prescribed_exercises_insert" ON public.prescribed_exercises;
DROP POLICY IF EXISTS "prescribed_exercises_update" ON public.prescribed_exercises;
DROP POLICY IF EXISTS "prescribed_exercises_delete" ON public.prescribed_exercises;

CREATE POLICY "prescribed_exercises_select" ON public.prescribed_exercises FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.program_workouts pw
    JOIN public.programs p ON p.id = pw.program_id
    WHERE pw.id = prescribed_exercises.program_workout_id AND p.coach_id = (auth.jwt() ->> 'sub')
  ));

CREATE POLICY "prescribed_exercises_insert" ON public.prescribed_exercises FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.program_workouts pw
    JOIN public.programs p ON p.id = pw.program_id
    WHERE pw.id = prescribed_exercises.program_workout_id AND p.coach_id = (auth.jwt() ->> 'sub')
  ));

CREATE POLICY "prescribed_exercises_update" ON public.prescribed_exercises FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.program_workouts pw
    JOIN public.programs p ON p.id = pw.program_id
    WHERE pw.id = prescribed_exercises.program_workout_id AND p.coach_id = (auth.jwt() ->> 'sub')
  ));

CREATE POLICY "prescribed_exercises_delete" ON public.prescribed_exercises FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.program_workouts pw
    JOIN public.programs p ON p.id = pw.program_id
    WHERE pw.id = prescribed_exercises.program_workout_id AND p.coach_id = (auth.jwt() ->> 'sub')
  ));
