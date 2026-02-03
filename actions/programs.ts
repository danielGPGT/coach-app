'use server'

import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ProgramRow = {
  id: string
  coach_id: string
  name: string
  description: string | null
  duration_weeks: number
  days_per_week: number
  created_at: string
  updated_at: string
}

export type ProgramWorkoutRow = {
  id: string
  program_id: string
  week_number: number
  day_number: number
  name: string
  notes: string | null
}

export type PrescribedExerciseRow = {
  id: string
  program_workout_id: string
  exercise_id: string
  sort_order: number
  sets: number
  reps: string
  intensity_value: number | null
  intensity_type: string | null
  rest_seconds: number | null
  notes: string | null
  exercise?: { id: string; name: string; category: string }
}

/** List programs for the current coach. */
export async function getProgramsForCoach(): Promise<ProgramRow[]> {
  const { userId } = await auth()
  if (!userId) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('programs')
    .select('id, coach_id, name, description, duration_weeks, days_per_week, created_at, updated_at')
    .eq('coach_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ProgramRow[]
}

/** Create a program and empty workout slots (weeks × days). */
export async function createProgram(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('You must be signed in to create a program.')

  const name = (formData.get('name') as string)?.trim()
  const durationWeeks = parseInt(String(formData.get('duration_weeks') ?? '4'), 10)
  const daysPerWeek = parseInt(String(formData.get('days_per_week') ?? '4'), 10)
  const description = (formData.get('description') as string)?.trim() || null

  if (!name) throw new Error('Program name is required.')
  if (durationWeeks < 1 || durationWeeks > 52) throw new Error('Duration must be 1–52 weeks.')
  if (daysPerWeek < 1 || daysPerWeek > 7) throw new Error('Days per week must be 1–7.')

  const supabase = createAdminClient()
  const { data: program, error: programError } = await supabase
    .from('programs')
    .insert({
      coach_id: userId,
      name,
      description,
      duration_weeks: durationWeeks,
      days_per_week: daysPerWeek,
    })
    .select('id')
    .single()

  if (programError) throw programError
  if (!program) throw new Error('Failed to create program.')

  const workouts: { program_id: string; week_number: number; day_number: number; name: string }[] = []
  for (let w = 1; w <= durationWeeks; w++) {
    for (let d = 1; d <= daysPerWeek; d++) {
      workouts.push({
        program_id: program.id,
        week_number: w,
        day_number: d,
        name: `Week ${w} Day ${d}`,
      })
    }
  }
  const { error: workoutsError } = await supabase.from('program_workouts').insert(workouts)
  if (workoutsError) throw workoutsError

  revalidatePath('/programs')
  return { id: program.id }
}

/** Get one program with its workouts (and prescribed exercises per workout). */
export async function getProgramWithWorkouts(programId: string) {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createAdminClient()
  const { data: program, error: programError } = await supabase
    .from('programs')
    .select('id, coach_id, name, description, duration_weeks, days_per_week, created_at, updated_at')
    .eq('id', programId)
    .eq('coach_id', userId)
    .single()

  if (programError || !program) return null

  const { data: workouts, error: workoutsError } = await supabase
    .from('program_workouts')
    .select('id, program_id, week_number, day_number, name, notes')
    .eq('program_id', programId)
    .order('week_number')
    .order('day_number')

  if (workoutsError) return { program: program as ProgramRow, workouts: [] }

  const workoutIds = (workouts ?? []).map((w) => w.id)
  const { data: prescribed } = await supabase
    .from('prescribed_exercises')
    .select(
      'id, program_workout_id, exercise_id, sort_order, sets, reps, intensity_value, intensity_type, rest_seconds, notes'
    )
    .in('program_workout_id', workoutIds)
    .order('sort_order')

  const exerciseIds = [...new Set((prescribed ?? []).map((p) => p.exercise_id))]
  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, name, category')
    .in('id', exerciseIds)

  const exerciseMap = new Map((exercises ?? []).map((e) => [e.id, e]))
  const prescribedWithExercise = (prescribed ?? []).map((p) => ({
    ...p,
    exercise: exerciseMap.get(p.exercise_id),
  }))

  return {
    program: program as ProgramRow,
    workouts: (workouts ?? []) as ProgramWorkoutRow[],
    prescribed: prescribedWithExercise as (PrescribedExerciseRow & { exercise?: { id: string; name: string; category: string } })[],
  }
}

/** Update program metadata (name, description only to avoid workout grid changes). */
export async function updateProgram(
  programId: string,
  updates: { name?: string; description?: string | null }
) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('programs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', programId)
    .eq('coach_id', userId)

  if (error) throw error
  revalidatePath('/programs')
  revalidatePath(`/programs/${programId}`)
}

/** Delete a program and all its workouts, prescribed exercises, and assignments. */
export async function deleteProgram(programId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { data: program, error: programError } = await supabase
    .from('programs')
    .select('id')
    .eq('id', programId)
    .eq('coach_id', userId)
    .single()

  if (programError || !program) throw new Error('Program not found or unauthorized')

  const { data: workouts } = await supabase
    .from('program_workouts')
    .select('id')
    .eq('program_id', programId)
  const workoutIds = (workouts ?? []).map((w) => w.id)

  if (workoutIds.length > 0) {
    await supabase.from('prescribed_exercises').delete().in('program_workout_id', workoutIds)
  }
  await supabase.from('program_workouts').delete().eq('program_id', programId)
  await supabase.from('client_assignments').delete().eq('program_id', programId)
  const { error: deleteError } = await supabase.from('programs').delete().eq('id', programId)

  if (deleteError) throw deleteError
  revalidatePath('/programs')
}

/** Update a workout day (name, notes). */
export async function updateProgramWorkout(
  workoutId: string,
  updates: { name?: string; notes?: string | null }
) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { data: workout } = await supabase
    .from('program_workouts')
    .select('program_id')
    .eq('id', workoutId)
    .single()
  if (!workout) throw new Error('Workout not found')

  const { data: program } = await supabase
    .from('programs')
    .select('id')
    .eq('id', workout.program_id)
    .eq('coach_id', userId)
    .single()
  if (!program) throw new Error('Unauthorized')

  const { error } = await supabase.from('program_workouts').update(updates).eq('id', workoutId)
  if (error) throw error
  revalidatePath('/programs')
  revalidatePath(`/programs/${workout.program_id}`)
}

/** Add an exercise to a workout day. */
export async function addPrescribedExercise(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const programWorkoutId = formData.get('program_workout_id') as string
  const exerciseId = formData.get('exercise_id') as string
  const sets = parseInt(String(formData.get('sets') ?? '3'), 10)
  const reps = (formData.get('reps') as string)?.trim() || '10'
  const restSeconds = formData.get('rest_seconds') ? parseInt(String(formData.get('rest_seconds')), 10) : null
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!programWorkoutId || !exerciseId) throw new Error('Missing workout or exercise.')

  const supabase = createAdminClient()
  const { data: workout } = await supabase
    .from('program_workouts')
    .select('program_id')
    .eq('id', programWorkoutId)
    .single()
  if (!workout) throw new Error('Workout not found')

  const { data: program } = await supabase
    .from('programs')
    .select('id')
    .eq('id', workout.program_id)
    .eq('coach_id', userId)
    .single()
  if (!program) throw new Error('Unauthorized')

  const { data: maxOrder } = await supabase
    .from('prescribed_exercises')
    .select('sort_order')
    .eq('program_workout_id', programWorkoutId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sortOrder = (maxOrder?.sort_order ?? -1) + 1

  const { error } = await supabase.from('prescribed_exercises').insert({
    program_workout_id: programWorkoutId,
    exercise_id: exerciseId,
    sort_order: sortOrder,
    sets,
    reps,
    rest_seconds: restSeconds,
    notes,
  })

  if (error) throw error
  revalidatePath('/programs')
  revalidatePath(`/programs/${workout.program_id}`)
}

/** Remove a prescribed exercise. */
export async function removePrescribedExercise(prescribedId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { data: prescribed } = await supabase
    .from('prescribed_exercises')
    .select('program_workout_id')
    .eq('id', prescribedId)
    .single()
  if (!prescribed) throw new Error('Not found')

  const { data: workout } = await supabase
    .from('program_workouts')
    .select('program_id')
    .eq('id', prescribed.program_workout_id)
    .single()
  if (!workout) throw new Error('Not found')

  const { data: program } = await supabase
    .from('programs')
    .select('id')
    .eq('id', workout.program_id)
    .eq('coach_id', userId)
    .single()
  if (!program) throw new Error('Unauthorized')

  const { error } = await supabase.from('prescribed_exercises').delete().eq('id', prescribedId)
  if (error) throw error
  revalidatePath('/programs')
  revalidatePath(`/programs/${workout.program_id}`)
}
