'use server'

import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SetLogEntry = {
  set_number: number
  reps_completed: number | null
  weight_kg: number | null
  rpe: number | null
  notes: string | null
}

export type WorkoutLogForPage = {
  id: string
  client_id: string
  assignment_id: string
  program_id: string
  program_workout_id: string
  scheduled_date: string
  completed_at: string | null
  notes: string | null
  program_workout_name: string
  program_name: string
  client_name: string
  exercises: {
    id: string
    prescribed_id: string
    exercise_name: string
    sets: number
    reps: string
    notes: string | null
    set_logs: SetLogEntry[]
  }[]
}

/** Whether current user can access this workout: coach who owns the client, or the client themselves. */
async function canAccessWorkoutLog(
  supabase: Awaited<ReturnType<typeof createAdminClient>>,
  userId: string,
  clientId: string
): Promise<boolean> {
  if (clientId === userId) return true
  const { data: link } = await supabase
    .from('coach_clients')
    .select('client_id')
    .eq('coach_id', userId)
    .eq('client_id', clientId)
    .single()
  return !!link
}

/** Get a single workout log with prescribed exercises (for log-workout page). Coach who owns client or the client may access. */
export async function getWorkoutLogForPage(workoutLogId: string): Promise<WorkoutLogForPage | null> {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createAdminClient()
  const { data: log, error: logError } = await supabase
    .from('workout_logs')
    .select(`
      id,
      client_id,
      assignment_id,
      program_workout_id,
      scheduled_date,
      completed_at,
      notes,
      program_workouts ( name ),
      client_assignments ( program_id, programs ( name ) )
    `)
    .eq('id', workoutLogId)
    .single()

  if (logError || !log) return null

  const clientId = (log as { client_id: string }).client_id
  if (!(await canAccessWorkoutLog(supabase, userId, clientId))) return null

  const { data: user } = await supabase
    .from('users')
    .select('name')
    .eq('id', (log as { client_id: string }).client_id)
    .single()

  const { data: prescribed } = await supabase
    .from('prescribed_exercises')
    .select('id, exercise_id, sets, reps, notes')
    .eq('program_workout_id', (log as { program_workout_id: string }).program_workout_id)
    .order('sort_order')

  const exerciseIds = [...new Set((prescribed ?? []).map((p) => p.exercise_id))]
  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, name')
    .in('id', exerciseIds)
  const nameMap = new Map((exercises ?? []).map((e) => [e.id, e.name]))

  const { data: setLogs } = await supabase
    .from('set_logs')
    .select('prescribed_exercise_id, set_number, reps_completed, weight_kg, rpe, notes')
    .eq('workout_log_id', workoutLogId)
    .order('set_number')

  const setLogsByPrescribed = new Map<string, SetLogEntry[]>()
  for (const s of setLogs ?? []) {
    const key = (s as { prescribed_exercise_id: string }).prescribed_exercise_id
    const entry: SetLogEntry = {
      set_number: (s as { set_number: number }).set_number,
      reps_completed: (s as { reps_completed: number | null }).reps_completed,
      weight_kg: (s as { weight_kg: number | null }).weight_kg,
      rpe: (s as { rpe: number | null }).rpe,
      notes: (s as { notes: string | null }).notes,
    }
    const list = setLogsByPrescribed.get(key) ?? []
    list.push(entry)
    setLogsByPrescribed.set(key, list)
  }

  const exerciseRows = (prescribed ?? []).map((p: { id: string; exercise_id: string; sets: number; reps: string; notes: string | null }) => {
    const existing = (setLogsByPrescribed.get(p.id) ?? []).sort((a, b) => a.set_number - b.set_number)
    const set_logs: SetLogEntry[] = []
    for (let i = 1; i <= p.sets; i++) {
      const found = existing.find((e) => e.set_number === i)
      set_logs.push(
        found ?? {
          set_number: i,
          reps_completed: null,
          weight_kg: null,
          rpe: null,
          notes: null,
        }
      )
    }
    return {
      id: p.id,
      prescribed_id: p.id,
      exercise_name: nameMap.get(p.exercise_id) ?? 'Exercise',
      sets: p.sets,
      reps: p.reps,
      notes: p.notes,
      set_logs,
    }
  })

  const raw = log as Record<string, unknown>
  const ca = raw.client_assignments as { program_id?: string; programs?: { name?: string } | null } | null | undefined
  const pw = raw.program_workouts as { name?: string } | null | undefined
  return {
    id: raw.id as string,
    client_id: raw.client_id as string,
    assignment_id: raw.assignment_id as string,
    program_id: ca?.program_id ?? '',
    program_workout_id: raw.program_workout_id as string,
    scheduled_date: raw.scheduled_date as string,
    completed_at: raw.completed_at as string | null,
    notes: raw.notes as string | null,
    program_workout_name: pw?.name ?? 'Workout',
    program_name: ca?.programs?.name ?? 'Program',
    client_name: user?.name ?? 'Client',
    exercises: exerciseRows,
  }
}

/** Mark a workout as complete. Coach or the client may complete. */
export async function completeWorkout(workoutLogId: string, notes?: string | null): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { data: log } = await supabase
    .from('workout_logs')
    .select('id, client_id')
    .eq('id', workoutLogId)
    .single()
  if (!log) throw new Error('Workout not found.')

  if (!(await canAccessWorkoutLog(supabase, userId, log.client_id))) throw new Error('Unauthorized.')

  const { error } = await supabase
    .from('workout_logs')
    .update({
      completed_at: new Date().toISOString(),
      ...(notes !== undefined && { notes: notes || null }),
    })
    .eq('id', workoutLogId)

  if (error) throw error
  revalidatePath('/workout/' + workoutLogId)
  revalidatePath('/clients/' + log.client_id)
  revalidatePath('/clients')
  revalidatePath('/dashboard')
  revalidatePath('/history')
}

export type SaveSetLogInput = {
  prescribed_exercise_id: string
  set_number: number
  reps_completed?: number | null
  weight_kg?: number | null
  rpe?: number | null
  notes?: string | null
}

/** Save set logs for a workout (replaces existing). Coach or the client may save. */
export async function saveSetLogs(
  workoutLogId: string,
  entries: SaveSetLogInput[]
): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { data: log } = await supabase
    .from('workout_logs')
    .select('id, client_id')
    .eq('id', workoutLogId)
    .single()
  if (!log) throw new Error('Workout not found.')

  if (!(await canAccessWorkoutLog(supabase, userId, log.client_id))) throw new Error('Unauthorized.')

  await supabase.from('set_logs').delete().eq('workout_log_id', workoutLogId)

  if (entries.length > 0) {
    const rows = entries.map((e) => ({
      workout_log_id: workoutLogId,
      prescribed_exercise_id: e.prescribed_exercise_id,
      set_number: e.set_number,
      reps_completed: e.reps_completed ?? null,
      weight_kg: e.weight_kg ?? null,
      rpe: e.rpe ?? null,
      notes: e.notes ?? null,
    }))
    const { error } = await supabase.from('set_logs').insert(rows)
    if (error) throw error
  }

  revalidatePath('/workout/' + workoutLogId)
  revalidatePath('/clients/' + log.client_id)
}

export type WorkoutLogSummary = {
  id: string
  program_workout_name: string
  program_name: string
  scheduled_date: string
  completed_at: string | null
}

/** Today’s scheduled workouts for the current user (as client). */
export async function getTodaysWorkoutsForClient(): Promise<WorkoutLogSummary[]> {
  const { userId } = await auth()
  if (!userId) return []

  const today = new Date().toISOString().slice(0, 10)
  const supabase = createAdminClient()
  const { data: rows } = await supabase
    .from('workout_logs')
    .select(`
      id,
      scheduled_date,
      completed_at,
      program_workouts ( name ),
      client_assignments ( program_id, programs ( name ) )
    `)
    .eq('client_id', userId)
    .eq('scheduled_date', today)
    .order('scheduled_date')

  if (!rows?.length) return []

  return rows.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    program_workout_name: (r.program_workouts as { name: string } | null)?.name ?? 'Workout',
    program_name: (r.client_assignments as { programs: { name: string } | null } | null)?.programs?.name ?? 'Program',
    scheduled_date: r.scheduled_date as string,
    completed_at: r.completed_at as string | null,
  }))
}

/** Completed workout history for the current user (as client), newest first. */
export async function getWorkoutHistoryForClient(limit = 50): Promise<WorkoutLogSummary[]> {
  const { userId } = await auth()
  if (!userId) return []

  const supabase = createAdminClient()
  const { data: rows } = await supabase
    .from('workout_logs')
    .select(`
      id,
      scheduled_date,
      completed_at,
      program_workouts ( name ),
      client_assignments ( program_id, programs ( name ) )
    `)
    .eq('client_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (!rows?.length) return []

  return rows.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    program_workout_name: (r.program_workouts as { name: string } | null)?.name ?? 'Workout',
    program_name: (r.client_assignments as { programs: { name: string } | null } | null)?.programs?.name ?? 'Program',
    scheduled_date: r.scheduled_date as string,
    completed_at: r.completed_at as string | null,
  }))
}

/** Next upcoming workout (first scheduled on or after today) for the current client. */
export async function getNextWorkoutForClient(): Promise<WorkoutLogSummary | null> {
  const { userId } = await auth()
  if (!userId) return null

  const today = new Date().toISOString().slice(0, 10)
  const supabase = createAdminClient()
  const { data: rows } = await supabase
    .from('workout_logs')
    .select(`
      id,
      scheduled_date,
      completed_at,
      program_workouts ( name ),
      client_assignments ( program_id, programs ( name ) )
    `)
    .eq('client_id', userId)
    .gte('scheduled_date', today)
    .order('scheduled_date', { ascending: true })
    .limit(1)

  if (!rows?.length) return null

  const r = rows[0] as Record<string, unknown>
  return {
    id: r.id as string,
    program_workout_name: (r.program_workouts as { name: string } | null)?.name ?? 'Workout',
    program_name: (r.client_assignments as { programs: { name: string } | null } | null)?.programs?.name ?? 'Program',
    scheduled_date: r.scheduled_date as string,
    completed_at: r.completed_at as string | null,
  }
}

export type WorkoutLogWithNotes = WorkoutLogSummary & { notes: string | null }

/** Recent completed workouts with notes (for client dashboard activity/notes). */
export async function getRecentActivityWithNotesForClient(limit = 5): Promise<WorkoutLogWithNotes[]> {
  const { userId } = await auth()
  if (!userId) return []

  const supabase = createAdminClient()
  const { data: rows } = await supabase
    .from('workout_logs')
    .select(`
      id,
      scheduled_date,
      completed_at,
      notes,
      program_workouts ( name ),
      client_assignments ( program_id, programs ( name ) )
    `)
    .eq('client_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (!rows?.length) return []

  return rows.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    program_workout_name: (r.program_workouts as { name: string } | null)?.name ?? 'Workout',
    program_name: (r.client_assignments as { programs: { name: string } | null } | null)?.programs?.name ?? 'Program',
    scheduled_date: r.scheduled_date as string,
    completed_at: r.completed_at as string | null,
    notes: (r.notes as string | null) ?? null,
  })) as WorkoutLogWithNotes[]
}

/** Current user is a client if they appear in coach_clients as client_id. */
export async function getCurrentUserRole(): Promise<'coach' | 'client'> {
  const { userId } = await auth()
  if (!userId) return 'coach'

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('coach_clients')
    .select('client_id')
    .eq('client_id', userId)
    .limit(1)
  return data?.length ? 'client' : 'coach'
}
