import Link from 'next/link'
import {
  CheckCircle2Icon,
  ChevronRightIcon,
  DumbbellIcon,
  HistoryIcon,
  MailIcon,
  StickyNoteIcon,
  TrophyIcon,
  UserIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import type { WorkoutLogSummary, WorkoutLogWithNotes } from '@/actions/workouts'
import type { ClientProgramSummary, CoachSummary } from '@/actions/clients'
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns'

type ClientDashboardContentProps = {
  todaysWorkouts: WorkoutLogSummary[]
  coach: CoachSummary | null
  programSummary: ClientProgramSummary | null
  nextWorkout: WorkoutLogSummary | null
  recentActivityWithNotes: WorkoutLogWithNotes[]
}

function formatScheduledDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return isToday(d) ? 'Today' : format(d, 'EEEE, MMM d')
}

function nextWorkoutCountdown(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  const days = differenceInDays(d, new Date())
  return days === 1 ? 'In 1 day' : `In ${days} days`
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ClientDashboardContent({
  todaysWorkouts,
  coach,
  programSummary,
  nextWorkout,
  recentActivityWithNotes,
}: ClientDashboardContentProps) {
  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-foreground'>Dashboard</h1>
        <p className='mt-1 text-muted-foreground'>
          {todaysWorkouts.length > 0
            ? "Here's your workout for today."
            : "You're all set for today. Rest up or do something light."}
        </p>
      </div>

      {coach && (
        <Card className='rounded-2xl border-border bg-card'>
          <CardContent className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-3'>
              <Avatar className='size-12 shrink-0 rounded-xl border border-border'>
                <AvatarFallback className='rounded-xl bg-accent text-primary text-sm font-medium'>
                  {initials(coach.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className='text-sm text-muted-foreground'>Your coach</p>
                <p className='font-medium text-foreground'>{coach.name}</p>
                <p className='text-sm text-muted-foreground flex items-center gap-1.5'>
                  <MailIcon className='size-3.5' />
                  {coach.email}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <UserIcon className='size-3.5' />
              Reach out any time if you need help.
            </div>
          </CardContent>
        </Card>
      )}

      {programSummary && (
        <Card className='rounded-2xl border-border bg-card'>
          <CardContent className=''>
            <h3 className='text-sm font-medium text-muted-foreground'>Current program</h3>
            <p className='mt-1 font-medium text-foreground'>{programSummary.programName}</p>
            <p className='mt-0.5 text-sm text-muted-foreground'>
              Week {programSummary.currentWeek} of {programSummary.totalWeeks}
            </p>
            <Progress
              value={
                programSummary.totalWeeks > 0
                  ? Math.round((programSummary.currentWeek / programSummary.totalWeeks) * 100)
                  : 0
              }
              className='mt-3 h-2 w-full max-w-xs rounded-full'
            />
          </CardContent>
        </Card>
      )}

      {nextWorkout && nextWorkout.scheduled_date !== new Date().toISOString().slice(0, 10) && (
        <Card className='rounded-2xl border-border bg-card'>
          <Link href={`/workout/${nextWorkout.id}`}>
            <CardContent className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Next workout</p>
                <p className='font-medium text-foreground'>{nextWorkout.program_workout_name}</p>
                <p className='text-sm text-muted-foreground'>
                  {nextWorkout.program_name} · {nextWorkoutCountdown(nextWorkout.scheduled_date)}
                </p>
              </div>
              <Button variant='outline' size='sm' className='shrink-0 rounded-xl' asChild>
                <span>
                  View
                  <ChevronRightIcon className='ml-1 size-4' />
                </span>
              </Button>
            </CardContent>
          </Link>
        </Card>
      )}

      {todaysWorkouts.length > 0 ? (
        <div className='space-y-4'>
          <h2 className='text-sm font-medium text-muted-foreground'>Today&apos;s workout</h2>
          <ul className='space-y-3'>
            {todaysWorkouts.map((w) => (
              <li key={w.id}>
                <Card className='rounded-2xl border-border bg-card transition-colors hover:border-primary/40'>
                  <Link href={`/workout/${w.id}`}>
                    <CardContent className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5'>
                      <div className='flex items-start gap-3'>
                        <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary'>
                          <DumbbellIcon className='size-5' />
                        </div>
                        <div>
                          <p className='font-medium text-foreground'>{w.program_workout_name}</p>
                          <p className='text-sm text-muted-foreground'>
                            {w.program_name} · {formatScheduledDate(w.scheduled_date)}
                          </p>
                          {w.completed_at && (
                            <span className='mt-1 inline-flex items-center gap-1 text-sm text-primary'>
                              <CheckCircle2Icon className='size-4' />
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant='ghost' size='sm' className='shrink-0 rounded-xl' asChild>
                        <span>
                          {w.completed_at ? 'View' : 'Log workout'}
                          <ChevronRightIcon className='ml-1 size-4' />
                        </span>
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Card className='rounded-2xl border-border bg-muted/30'>
          <CardContent className='p-8 text-center'>
            <p className='text-muted-foreground'>No workouts scheduled for today.</p>
            <p className='mt-1 text-sm text-muted-foreground'>
              Check back tomorrow or view your history below.
            </p>
          </CardContent>
        </Card>
      )}

      {recentActivityWithNotes.length > 0 && (
        <div>
          <h2 className='text-lg font-semibold text-foreground'>Recent activity & notes</h2>
          <p className='mt-0.5 text-sm text-muted-foreground'>
            Your latest completed workouts and any notes you or your coach added.
          </p>
          <ul className='mt-4 space-y-2'>
            {recentActivityWithNotes.map((w) => (
              <li key={w.id}>
                <Link href={`/workout/${w.id}`}>
                  <Card className='rounded-2xl border-border bg-card transition-colors hover:bg-muted/30'>
                    <CardContent className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:px-5'>
                      <div className='min-w-0'>
                        <p className='font-medium text-foreground'>{w.program_workout_name}</p>
                        <p className='text-sm text-muted-foreground'>
                          {w.program_name} ·{' '}
                          {w.completed_at
                            ? format(new Date(w.completed_at), 'MMM d, yyyy')
                            : format(new Date(w.scheduled_date + 'T12:00:00'), 'MMM d')}
                        </p>
                        {w.notes && (
                          <p className='mt-1 flex items-start gap-1.5 text-sm text-muted-foreground'>
                            <StickyNoteIcon className='mt-0.5 size-3.5 shrink-0' />
                            <span className='line-clamp-2'>{w.notes}</span>
                          </p>
                        )}
                      </div>
                      <ChevronRightIcon className='size-4 shrink-0 text-muted-foreground' />
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
          <Button variant='outline' size='sm' className='mt-3 rounded-xl' asChild>
            <Link href='/history'>View full history</Link>
          </Button>
        </div>
      )}

      <Card className='rounded-2xl border-dashed border-border bg-muted/20'>
        <CardContent className='flex flex-col items-center justify-center py-10 text-center'>
          <div className='flex size-12 items-center justify-center rounded-xl bg-muted'>
            <TrophyIcon className='size-6 text-muted-foreground' />
          </div>
          <h3 className='mt-3 font-medium text-foreground'>Personal records</h3>
          <p className='mt-0.5 text-sm text-muted-foreground'>
            PRs and key metrics will appear here in a future update.
          </p>
        </CardContent>
      </Card>

      <div>
        <Button variant='outline' className='rounded-xl' asChild>
          <Link href='/history'>
            <HistoryIcon className='mr-2 size-4' />
            View workout history
          </Link>
        </Button>
      </div>
    </div>
  )
}
