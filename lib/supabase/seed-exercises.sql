-- Optional: seed global exercises (coach_id = null) so the library has built-in options.
-- Run this in Supabase SQL Editor after the main schema is applied.
-- Requires exercise_category enum to exist.

INSERT INTO public.exercises (id, coach_id, name, category)
VALUES
  (gen_random_uuid(), null, 'Back Squat', 'squat'),
  (gen_random_uuid(), null, 'Front Squat', 'squat'),
  (gen_random_uuid(), null, 'Goblet Squat', 'squat'),
  (gen_random_uuid(), null, 'Romanian Deadlift', 'hinge'),
  (gen_random_uuid(), null, 'Conventional Deadlift', 'hinge'),
  (gen_random_uuid(), null, 'Hip Thrust', 'hinge'),
  (gen_random_uuid(), null, 'Bench Press', 'push'),
  (gen_random_uuid(), null, 'Overhead Press', 'push'),
  (gen_random_uuid(), null, 'Push-up', 'push'),
  (gen_random_uuid(), null, 'Barbell Row', 'pull'),
  (gen_random_uuid(), null, 'Pull-up', 'pull'),
  (gen_random_uuid(), null, 'Lat Pulldown', 'pull'),
  (gen_random_uuid(), null, 'Farmer''s Walk', 'carry'),
  (gen_random_uuid(), null, 'Plank', 'core'),
  (gen_random_uuid(), null, 'Dead Bug', 'core'),
  (gen_random_uuid(), null, 'Bicep Curl', 'accessory'),
  (gen_random_uuid(), null, 'Tricep Pushdown', 'accessory'),
  (gen_random_uuid(), null, 'Treadmill Run', 'cardio'),
  (gen_random_uuid(), null, 'Rowing Machine', 'cardio');
-- Run once. If you run again you will get duplicate names (no unique constraint on name).
