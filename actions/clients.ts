'use server'

import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'
import { sendInviteEmail } from '@/lib/email'

export type ClientRow = {
  id: string
  name: string
  email: string
  image_url: string | null
  status: string
  joined_at: string | null
}

export type ClientAssignmentRow = {
  id: string
  client_id: string
  program_id: string
  program_name: string
  start_date: string
  status: string
  created_at: string
}

export type ClientProgressRow = {
  id: string
  name: string
  programName: string | null
  currentWeek: number
  totalWeeks: number
  lastActivityAt: string | null
}

export type CoachSummary = {
  id: string
  name: string
  email: string
}

/** Clients with current program progress and last activity (for dashboard "Your Clients"). */
export async function getClientsWithProgressForCoach(limit = 10): Promise<ClientProgressRow[]> {
  const { userId } = await auth()
  if (!userId) return []

  const supabase = createAdminClient()
  const { data: links } = await supabase
    .from('coach_clients')
    .select('client_id')
    .eq('coach_id', userId)
    .eq('status', 'active')
  const clientIds = (links ?? []).map((l) => l.client_id)
  if (clientIds.length === 0) return []

  const { data: users } = await supabase
    .from('users')
    .select('id, name')
    .in('id', clientIds)
  const nameMap = new Map((users ?? []).map((u) => [u.id, u.name]))

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  const { data: assignments } = await supabase
    .from('client_assignments')
    .select(`
      client_id,
      start_date,
      programs ( name, duration_weeks )
    `)
    .in('client_id', clientIds)
    .eq('status', 'active')
    .order('start_date', { ascending: false })

  const { data: lastActivities } = await supabase
    .from('workout_logs')
    .select('client_id, completed_at')
    .in('client_id', clientIds)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

  const assignmentByClient = new Map<string, { programName: string; totalWeeks: number; start_date: string }>()
  for (const a of assignments ?? []) {
    const cid = (a as Record<string, unknown>).client_id as string
    if (assignmentByClient.has(cid)) continue
    const prog = (a as Record<string, unknown>).programs as { name?: string; duration_weeks?: number } | null
    const start_date = (a as Record<string, unknown>).start_date as string
    assignmentByClient.set(cid, {
      programName: prog?.name ?? 'Program',
      totalWeeks: Math.max(1, prog?.duration_weeks ?? 4),
      start_date,
    })
  }

  const lastByClient = new Map<string, string>()
  for (const row of lastActivities ?? []) {
    const cid = (row as { client_id: string; completed_at: string }).client_id
    if (!lastByClient.has(cid)) lastByClient.set(cid, (row as { completed_at: string }).completed_at)
  }

  const result: ClientProgressRow[] = clientIds.slice(0, limit).map((clientId) => {
    const name = nameMap.get(clientId) ?? 'Client'
    const assignment = assignmentByClient.get(clientId)
    const lastAt = lastByClient.get(clientId) ?? null

    if (!assignment) {
      return {
        id: clientId,
        name,
        programName: null,
        currentWeek: 0,
        totalWeeks: 0,
        lastActivityAt: lastAt,
      }
    }

    const start = new Date(assignment.start_date + 'T12:00:00')
    const diffMs = today.getTime() - start.getTime()
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
    const weekIndex = Math.floor(diffDays / 7)
    const currentWeek = Math.min(assignment.totalWeeks, Math.max(1, weekIndex + 1))

    return {
      id: clientId,
      name,
      programName: assignment.programName,
      currentWeek,
      totalWeeks: assignment.totalWeeks,
      lastActivityAt: lastAt,
    }
  })

  return result
}

/** Coach info for the current client (for client dashboard). */
export async function getCoachForCurrentClient(): Promise<CoachSummary | null> {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createAdminClient()
  const { data: link } = await supabase
    .from('coach_clients')
    .select('coach_id')
    .eq('client_id', userId)
    .eq('status', 'active')
    .order('joined_at', { ascending: false })
    .limit(1)
    .single()

  if (!link) return null

  const { data: coach } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('id', link.coach_id)
    .single()

  if (!coach) return null

  return {
    id: coach.id,
    name: coach.name,
    email: coach.email,
  }
}

export type ClientProgramSummary = {
  programName: string
  currentWeek: number
  totalWeeks: number
}

/** Current program and week progress for the signed-in client (for client dashboard). */
export async function getClientProgramSummary(): Promise<ClientProgramSummary | null> {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createAdminClient()
  const { data: assignment } = await supabase
    .from('client_assignments')
    .select('start_date, programs ( name, duration_weeks )')
    .eq('client_id', userId)
    .eq('status', 'active')
    .order('start_date', { ascending: false })
    .limit(1)
    .single()

  if (!assignment) return null

  const prog = assignment.programs as { name?: string; duration_weeks?: number } | null
  const programName = prog?.name ?? 'Program'
  const totalWeeks = Math.max(1, prog?.duration_weeks ?? 4)
  const start = new Date((assignment as { start_date: string }).start_date + 'T12:00:00')
  const today = new Date()
  const diffMs = today.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  const weekIndex = Math.floor(diffDays / 7)
  const currentWeek = Math.min(totalWeeks, Math.max(1, weekIndex + 1))

  return { programName, currentWeek, totalWeeks }
}

/** List clients for the current coach (from coach_clients + users). */
export async function getClientsForCoach(): Promise<ClientRow[]> {
  const { userId } = await auth()
  if (!userId) return []

  const supabase = createAdminClient()
  const { data: links, error: linkError } = await supabase
    .from('coach_clients')
    .select('client_id, status, joined_at')
    .eq('coach_id', userId)
    .eq('status', 'active')

  if (linkError) throw linkError
  if (!links?.length) return []

  const userIds = links.map((l) => l.client_id)
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, name, email')
    .in('id', userIds)

  if (userError) throw userError
  const userMap = new Map((users ?? []).map((u) => [u.id, u]))

  return links
    .map((l) => {
      const u = userMap.get(l.client_id)
      if (!u) return null
      return {
        id: l.client_id,
        name: u.name,
        email: u.email,
        image_url: null,
        status: l.status,
        joined_at: l.joined_at,
      }
    })
    .filter(Boolean) as ClientRow[]
}

/** Get one client and their program assignments (for detail page). */
export async function getClientWithAssignments(clientId: string) {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createAdminClient()
  const { data: link, error: linkError } = await supabase
    .from('coach_clients')
    .select('client_id, status, joined_at')
    .eq('coach_id', userId)
    .eq('client_id', clientId)
    .single()

  if (linkError || !link) return null

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('id', clientId)
    .single()

  if (userError || !user) return null

  const { data: assignments } = await supabase
    .from('client_assignments')
    .select(`
      id,
      client_id,
      program_id,
      start_date,
      status,
      created_at,
      programs ( name )
    `)
    .eq('client_id', clientId)
    .order('start_date', { ascending: false })

  const client = {
    id: user.id,
    name: user.name,
    email: user.email,
    image_url: null as string | null,
    status: link.status,
    joined_at: link.joined_at,
  }
  const assignmentRows = (assignments ?? []).map((a: Record<string, unknown>) => {
    const programs = a.programs as { name?: string } | null | undefined
    return {
      id: a.id as string,
      client_id: a.client_id as string,
      program_id: a.program_id as string,
      program_name: programs?.name ?? 'Program',
      start_date: a.start_date as string,
      status: a.status as string,
      created_at: a.created_at as string,
    }
  })

  return { client, assignments: assignmentRows as ClientAssignmentRow[] }
}

/** Base URL for invite links (server-side). Use localhost in dev, set NEXT_PUBLIC_APP_URL in production. */
function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

/** Create an invitation; sends email via Resend if configured, returns token and email status. */
export async function createInvitation(
  email: string
): Promise<{ token: string; emailSent: boolean }> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const normalized = email.trim().toLowerCase()
  if (!normalized) throw new Error('Email is required.')

  const supabase = createAdminClient()
  const token = randomBytes(24).toString('hex')

  const { error } = await supabase.from('coach_invitations').insert({
    coach_id: userId,
    email: normalized,
    token,
  })

  if (error) throw error
  revalidatePath('/clients')

  const inviteLink = `${getAppBaseUrl()}/invite/${token}`
  const { sent } = await sendInviteEmail(normalized, inviteLink)

  return { token, emailSent: sent }
}

/** Get invitation by token (for public invite page). */
export async function getInvitationByToken(token: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('coach_invitations')
    .select('id, coach_id, email')
    .eq('token', token)
    .single()
  if (error || !data) return null
  return data as { id: string; coach_id: string; email: string }
}

/** Accept invite: add coach_clients, delete invitation. Call when user is signed in. */
export async function acceptInvitation(token: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('You must be signed in to accept.')

  const supabase = createAdminClient()
  const { data: inv, error: invError } = await supabase
    .from('coach_invitations')
    .select('id, coach_id, email')
    .eq('token', token)
    .single()

  if (invError || !inv) throw new Error('Invalid or expired invite.')

  const { error: insertError } = await supabase.from('coach_clients').insert({
    coach_id: inv.coach_id,
    client_id: userId,
    status: 'active',
    joined_at: new Date().toISOString(),
  })

  if (insertError) throw insertError

  await supabase.from('coach_invitations').delete().eq('id', inv.id)
  revalidatePath('/clients')
}

/** Create a program assignment for a client and generate scheduled workout_logs. */
export async function createAssignment(
  clientId: string,
  programId: string,
  startDate: string
): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { data: program } = await supabase
    .from('programs')
    .select('id')
    .eq('id', programId)
    .eq('coach_id', userId)
    .single()
  if (!program) throw new Error('Program not found.')

  const { data: link } = await supabase
    .from('coach_clients')
    .select('client_id')
    .eq('coach_id', userId)
    .eq('client_id', clientId)
    .single()
  if (!link) throw new Error('Client not found.')

  const { data: assignment, error: assignError } = await supabase
    .from('client_assignments')
    .insert({
      client_id: clientId,
      program_id: programId,
      start_date: startDate,
      status: 'active',
    })
    .select('id')
    .single()
  if (assignError) throw assignError
  if (!assignment) throw new Error('Failed to create assignment.')

  const { data: workouts } = await supabase
    .from('program_workouts')
    .select('id, week_number, day_number')
    .eq('program_id', programId)
    .order('week_number')
    .order('day_number')

  if (workouts?.length) {
    const start = new Date(startDate)
    const logs = workouts.map((w) => {
      const scheduled = new Date(start)
      scheduled.setDate(scheduled.getDate() + (w.week_number - 1) * 7 + (w.day_number - 1))
      return {
        client_id: clientId,
        assignment_id: assignment.id,
        program_workout_id: w.id,
        scheduled_date: scheduled.toISOString().slice(0, 10),
      }
    })
    const { error: logsError } = await supabase.from('workout_logs').insert(logs)
    if (logsError) throw logsError
  }

  revalidatePath('/clients')
  revalidatePath(`/clients/${clientId}`)
}

export type WorkoutLogRow = {
  id: string
  client_id: string
  assignment_id: string
  program_workout_id: string
  scheduled_date: string
  completed_at: string | null
  notes: string | null
  program_workout_name: string
  program_name: string
}

/** Get scheduled workouts for a client (for coach view). Upcoming first, then recent. */
export async function getWorkoutLogsForClient(clientId: string): Promise<WorkoutLogRow[]> {
  const { userId } = await auth()
  if (!userId) return []

  const supabase = createAdminClient()
  const { data: link } = await supabase
    .from('coach_clients')
    .select('client_id')
    .eq('coach_id', userId)
    .eq('client_id', clientId)
    .single()
  if (!link) return []

  const { data: logs, error } = await supabase
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
      client_assignments ( programs ( name ) )
    `)
    .eq('client_id', clientId)
    .order('scheduled_date', { ascending: true })

  if (error) return []
  const today = new Date().toISOString().slice(0, 10)
  const rows = (logs ?? []).map((log: Record<string, unknown>) => {
    const pw = log.program_workouts as { name?: string } | null | undefined
    const ca = log.client_assignments as { programs?: { name?: string } | null } | null | undefined
    return {
      id: log.id as string,
      client_id: log.client_id as string,
      assignment_id: log.assignment_id as string,
      program_workout_id: log.program_workout_id as string,
      scheduled_date: log.scheduled_date as string,
      completed_at: log.completed_at as string | null,
      notes: log.notes as string | null,
      program_workout_name: pw?.name ?? 'Workout',
      program_name: ca?.programs?.name ?? 'Program',
    }
  }) as WorkoutLogRow[]
  // Sort: upcoming first (date >= today asc), then past (date < today desc)
  const upcoming = rows.filter((r) => r.scheduled_date >= today)
  const past = rows.filter((r) => r.scheduled_date < today).reverse()
  return [...upcoming, ...past]
}

export type RecentActivityRow = {
  id: string
  client_id: string
  client_name: string
  program_workout_name: string
  program_name: string
  scheduled_date: string
  completed_at: string
}

/** Recent completed workouts across all of the coach's clients (for dashboard). */
export async function getRecentActivityForCoach(limit = 15): Promise<RecentActivityRow[]> {
  const { userId } = await auth()
  if (!userId) return []

  const supabase = createAdminClient()
  const { data: links } = await supabase
    .from('coach_clients')
    .select('client_id')
    .eq('coach_id', userId)
    .eq('status', 'active')
  const clientIds = (links ?? []).map((l) => l.client_id)
  if (clientIds.length === 0) return []

  const { data: logs } = await supabase
    .from('workout_logs')
    .select(`
      id,
      client_id,
      scheduled_date,
      completed_at,
      program_workouts ( name ),
      client_assignments ( programs ( name ) )
    `)
    .in('client_id', clientIds)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (!logs?.length) return []

  const userIds = [...new Set((logs as Record<string, unknown>[]).map((r) => r.client_id as string))]
  const { data: users } = await supabase
    .from('users')
    .select('id, name')
    .in('id', userIds)
  const nameMap = new Map((users ?? []).map((u) => [u.id, u.name]))

  return logs.map((log: Record<string, unknown>) => {
    const pw = log.program_workouts as { name?: string } | null | undefined
    const ca = log.client_assignments as { programs?: { name?: string } | null } | null | undefined
    return {
      id: log.id as string,
      client_id: log.client_id as string,
      client_name: nameMap.get(log.client_id as string) ?? 'Client',
      program_workout_name: pw?.name ?? 'Workout',
      program_name: ca?.programs?.name ?? 'Program',
      scheduled_date: log.scheduled_date as string,
      completed_at: log.completed_at as string,
    }
  }) as RecentActivityRow[]
}

export type TodaysScheduledRow = {
  id: string
  client_id: string
  client_name: string
  program_workout_name: string
  program_name: string
  scheduled_date: string
  completed_at: string | null
}

export type CoachDashboardStats = {
  clientCount: number
  programCount: number
  completionsThisWeek: number
  todaysScheduled: TodaysScheduledRow[]
}

/** Stats and today's schedule for the coach dashboard. */
export async function getCoachDashboardStats(): Promise<CoachDashboardStats> {
  const { userId } = await auth()
  if (!userId) {
    return { clientCount: 0, programCount: 0, completionsThisWeek: 0, todaysScheduled: [] }
  }

  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: links } = await supabase
    .from('coach_clients')
    .select('client_id')
    .eq('coach_id', userId)
    .eq('status', 'active')
  const clientIds = (links ?? []).map((l) => l.client_id)
  const clientCount = clientIds.length

  const [programRes, weekCompletionsRes, todaysLogsRes] = await Promise.all([
    supabase.from('programs').select('id', { count: 'exact', head: true }).eq('coach_id', userId),
    clientIds.length > 0
      ? (() => {
          const weekStart = new Date()
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
          weekStart.setHours(0, 0, 0, 0)
          return supabase
            .from('workout_logs')
            .select('id', { count: 'exact', head: true })
            .in('client_id', clientIds)
            .not('completed_at', 'is', null)
            .gte('completed_at', weekStart.toISOString())
        })()
      : Promise.resolve({ count: 0 }),
    clientIds.length > 0
      ? supabase
          .from('workout_logs')
          .select(`
            id,
            client_id,
            scheduled_date,
            completed_at,
            program_workouts ( name ),
            client_assignments ( programs ( name ) )
          `)
          .in('client_id', clientIds)
          .eq('scheduled_date', today)
      : Promise.resolve({ data: [] }),
  ])

  const programCount = programRes.count ?? 0
  const completionsThisWeek = weekCompletionsRes.count ?? 0
  const todaysLogs = (todaysLogsRes.data ?? []) as Record<string, unknown>[]

  if (todaysLogs.length === 0) {
    return { clientCount, programCount, completionsThisWeek, todaysScheduled: [] }
  }

  const userIds = [...new Set(todaysLogs.map((r) => r.client_id as string))]
  const { data: users } = await supabase.from('users').select('id, name').in('id', userIds)
  const nameMap = new Map((users ?? []).map((u) => [u.id, u.name]))

  const todaysScheduled: TodaysScheduledRow[] = todaysLogs.map((log) => {
    const pw = log.program_workouts as { name?: string } | null | undefined
    const ca = log.client_assignments as { programs?: { name?: string } | null } | null | undefined
    return {
      id: log.id as string,
      client_id: log.client_id as string,
      client_name: nameMap.get(log.client_id as string) ?? 'Client',
      program_workout_name: pw?.name ?? 'Workout',
      program_name: ca?.programs?.name ?? 'Program',
      scheduled_date: log.scheduled_date as string,
      completed_at: log.completed_at as string | null,
    }
  })

  return { clientCount, programCount, completionsThisWeek, todaysScheduled }
}

const SEED_CLIENT_ID = 'seed-demo-client-1'
const SEED_CLIENT_EMAIL = 'demo-client@liftkit.local'
const SEED_CLIENT_NAME = 'Demo Client'

/** Create a demo client linked to the current coach (for testing when no real clients exist). */
export async function seedDemoClient(): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await auth()
  if (!userId) return { ok: false, error: 'Unauthorized' }

  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', SEED_CLIENT_ID)
    .single()
  if (existing) {
    const { data: link } = await supabase
      .from('coach_clients')
      .select('id')
      .eq('coach_id', userId)
      .eq('client_id', SEED_CLIENT_ID)
      .single()
    if (link) return { ok: false, error: 'Demo client already added.' }
    await supabase.from('coach_clients').insert({
      coach_id: userId,
      client_id: SEED_CLIENT_ID,
      status: 'active',
      joined_at: new Date().toISOString(),
    })
    revalidatePath('/clients')
    return { ok: true }
  }

  const { error: userError } = await supabase.from('users').insert({
    id: SEED_CLIENT_ID,
    email: SEED_CLIENT_EMAIL,
    name: SEED_CLIENT_NAME,
    role: 'client',
  })
  if (userError) return { ok: false, error: userError.message }

  const { error: linkError } = await supabase.from('coach_clients').insert({
    coach_id: userId,
    client_id: SEED_CLIENT_ID,
    status: 'active',
    joined_at: new Date().toISOString(),
  })
  if (linkError) return { ok: false, error: linkError.message }

  revalidatePath('/clients')
  return { ok: true }
}
