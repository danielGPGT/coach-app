-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.client_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  program_id uuid NOT NULL,
  start_date date NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'active'::assignment_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT client_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT client_assignments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id),
  CONSTRAINT client_assignments_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id)
);
CREATE TABLE public.coach_clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id text NOT NULL,
  client_id text NOT NULL,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
  invited_at timestamp with time zone NOT NULL DEFAULT now(),
  joined_at timestamp with time zone,
  CONSTRAINT coach_clients_pkey PRIMARY KEY (id),
  CONSTRAINT coach_clients_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.users(id),
  CONSTRAINT coach_clients_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id)
);
CREATE TABLE public.exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id text,
  name text NOT NULL,
  category USER-DEFINED NOT NULL DEFAULT 'other'::exercise_category,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT exercises_pkey PRIMARY KEY (id),
  CONSTRAINT exercises_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.users(id)
);
CREATE TABLE public.prescribed_exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  program_workout_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  sets integer NOT NULL,
  reps text NOT NULL,
  intensity_value numeric,
  intensity_type USER-DEFINED,
  rest_seconds integer,
  notes text,
  CONSTRAINT prescribed_exercises_pkey PRIMARY KEY (id),
  CONSTRAINT prescribed_exercises_program_workout_id_fkey FOREIGN KEY (program_workout_id) REFERENCES public.program_workouts(id),
  CONSTRAINT prescribed_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id)
);
CREATE TABLE public.program_workouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL,
  week_number integer NOT NULL,
  day_number integer NOT NULL,
  name text NOT NULL,
  notes text,
  CONSTRAINT program_workouts_pkey PRIMARY KEY (id),
  CONSTRAINT program_workouts_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id)
);
CREATE TABLE public.programs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id text NOT NULL,
  name text NOT NULL,
  description text,
  duration_weeks integer NOT NULL DEFAULT 4,
  days_per_week integer NOT NULL DEFAULT 4,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT programs_pkey PRIMARY KEY (id),
  CONSTRAINT programs_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.users(id)
);
CREATE TABLE public.set_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workout_log_id uuid NOT NULL,
  prescribed_exercise_id uuid NOT NULL,
  set_number integer NOT NULL,
  reps_completed integer,
  weight_kg numeric,
  rpe numeric,
  notes text,
  CONSTRAINT set_logs_pkey PRIMARY KEY (id),
  CONSTRAINT set_logs_workout_log_id_fkey FOREIGN KEY (workout_log_id) REFERENCES public.workout_logs(id),
  CONSTRAINT set_logs_prescribed_exercise_id_fkey FOREIGN KEY (prescribed_exercise_id) REFERENCES public.prescribed_exercises(id)
);
CREATE TABLE public.users (
  id text NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  role USER-DEFINED NOT NULL,
  unit_preference USER-DEFINED NOT NULL DEFAULT 'kg'::unit_preference,
  stripe_customer_id text,
  subscription_status USER-DEFINED NOT NULL DEFAULT 'none'::subscription_status,
  subscription_tier USER-DEFINED NOT NULL DEFAULT 'free'::subscription_tier,
  subscription_current_period_end timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.workout_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  assignment_id uuid NOT NULL,
  program_workout_id uuid NOT NULL,
  scheduled_date date NOT NULL,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT workout_logs_pkey PRIMARY KEY (id),
  CONSTRAINT workout_logs_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id),
  CONSTRAINT workout_logs_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.client_assignments(id),
  CONSTRAINT workout_logs_program_workout_id_fkey FOREIGN KEY (program_workout_id) REFERENCES public.program_workouts(id)
);