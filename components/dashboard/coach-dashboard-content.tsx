import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import {
  CalendarIcon,
  ChartColumnStackedIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  DumbbellIcon,
  UsersIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type {
  ClientProgressRow,
  CoachDashboardStats,
  RecentActivityRow,
} from '@/actions/clients'

type CoachDashboardContentProps = {
  stats: CoachDashboardStats
  recentActivity: RecentActivityRow[]
  clientsWithProgress: ClientProgressRow[]
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function lastActivityLabel(completedAt: string | null): { text: string; recent: boolean } {
  if (!completedAt) return { text: 'No activity yet', recent: false }
  const d = new Date(completedAt)
  const hoursAgo = (Date.now() - d.getTime()) / (60 * 60 * 1000)
  const text =
    hoursAgo < 24
      ? formatDistanceToNow(d, { addSuffix: true })
      : hoursAgo < 48
        ? 'Yesterday'
        : formatDistanceToNow(d, { addSuffix: true })
  return { text, recent: hoursAgo < 48 }
}

export function CoachDashboardContent({
  stats,
  recentActivity,
  clientsWithProgress,
}: CoachDashboardContentProps) {
  const { clientCount, programCount, completionsThisWeek, todaysScheduled } = stats

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-foreground'>Dashboard</h1>
        <p className='mt-1 text-muted-foreground'>
          Welcome back. Manage your clients, programs, and exercises from here.
        </p>
      </div>

      {/* Stats row */}
      <div className='grid gap-4 sm:grid-cols-3'>
        <Card className='rounded-2xl border-border'>
          <CardContent className='flex items-center gap-4 '>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              <UsersIcon className='size-6' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>{clientCount}</p>
              <p className='text-sm text-muted-foreground'>Active clients</p>
            </div>
          </CardContent>
        </Card>
        <Card className='rounded-2xl border-border'>
          <CardContent className='flex items-center gap-4 '>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              <DumbbellIcon className='size-6' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>{programCount}</p>
              <p className='text-sm text-muted-foreground'>Programs</p>
            </div>
          </CardContent>
        </Card>
        <Card className='rounded-2xl border-border'>
          <CardContent className='flex items-center gap-4'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              <CheckCircle2Icon className='size-6' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>{completionsThisWeek}</p>
              <p className='text-sm text-muted-foreground'>Completed this week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your clients – progress */}
      {clientsWithProgress.length > 0 && (
        <div>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <h2 className='text-lg font-semibold text-foreground'>Your clients</h2>
              <p className='mt-0.5 text-sm text-muted-foreground'>
                Program progress and recent activity.
              </p>
            </div>
            <Button variant='ghost' size='sm' className='rounded-xl text-primary' asChild>
              <Link href='/clients'>View all</Link>
            </Button>
          </div>
          <Card className='mt-4 rounded-2xl border-border p-0'>
            <CardContent className='divide-y divide-border p-0'>
              {clientsWithProgress.map((client) => {
                const activity = lastActivityLabel(client.lastActivityAt)
                const progressPercent =
                  client.totalWeeks > 0
                    ? Math.round((client.currentWeek / client.totalWeeks) * 100)
                    : 0
                return (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className='flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-4'
                  >
                    <div className='flex min-w-0 flex-1 items-center gap-3'>
                      <Avatar className='size-11 shrink-0 rounded-xl border border-border'>
                        <AvatarFallback className='rounded-xl bg-accent text-sm font-medium text-primary'>
                          {initials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0 flex-1'>
                        <p className='font-medium text-foreground'>{client.name}</p>
                        <p className='text-sm text-muted-foreground'>
                          {client.programName ?? 'No program assigned'}
                        </p>
                        {client.totalWeeks > 0 && (
                          <>
                            <p className='mt-0.5 text-xs text-muted-foreground'>
                              Week {client.currentWeek} of {client.totalWeeks}
                            </p>
                            <Progress
                              value={progressPercent}
                              className='mt-2 h-2 w-full max-w-[200px] rounded-full'
                            />
                          </>
                        )}
                      </div>
                    </div>
                    <div className='flex shrink-0 items-center gap-2 sm:ml-auto'>
                      <span
                        className={`size-2 shrink-0 rounded-full ${
                          activity.recent ? 'bg-primary' : 'bg-muted-foreground/60'
                        }`}
                        aria-hidden
                      />
                      <span
                        className={`text-xs ${
                          activity.recent ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {activity.text}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Today's scheduled */}
      {todaysScheduled.length > 0 && (
        <div>
          <h2 className='text-lg font-semibold text-foreground'>Today&apos;s workouts</h2>
          <p className='mt-0.5 text-sm text-muted-foreground'>
            Workouts scheduled for today. Open to view or log.
          </p>
          <ul className='mt-4 space-y-2'>
            {todaysScheduled.map((row) => (
              <li key={row.id}>
                <Link href={`/workout/${row.id}`}>
                  <Card className='rounded-2xl border-border bg-card transition-colors hover:bg-muted/30'>
                    <CardContent className='flex flex-wrap items-center justify-between gap-3'>
                      <div className='flex items-center gap-3'>
                        <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground'>
                          <CalendarIcon className='size-5' />
                        </div>
                        <div>
                          <p className='font-medium text-foreground'>{row.program_workout_name}</p>
                          <p className='text-sm text-muted-foreground'>
                            {row.client_name} · {row.program_name}
                          </p>
                          {row.completed_at && (
                            <p className='text-xs text-primary'>
                              Completed {format(new Date(row.completed_at), 'h:mm a')}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRightIcon className='size-4 text-muted-foreground' />
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent activity */}
      {recentActivity.length > 0 ? (
        <div>
          <h2 className='text-lg font-semibold text-foreground'>Recent activity</h2>
          <p className='mt-0.5 text-sm text-muted-foreground'>
            Latest workout completions from your clients.
          </p>
          <ul className='mt-4 space-y-2'>
            {recentActivity.map((row) => (
              <li key={row.id}>
                <Link href={`/workout/${row.id}`}>
                  <Card className='rounded-2xl border-border bg-card transition-colors hover:bg-muted/30'>
                    <CardContent className='flex flex-wrap items-center justify-between gap-3 '>
                      <div className='flex items-center gap-3'>
                        <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                          <CheckCircle2Icon className='size-5' />
                        </div>
                        <div>
                          <p className='font-medium text-foreground'>{row.program_workout_name}</p>
                          <p className='text-sm text-muted-foreground'>
                            {row.client_name} · {row.program_name}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Completed {format(new Date(row.completed_at), 'MMM d, yyyy \'at\' h:mm a')}
                          </p>
                        </div>
                      </div>
                      <ChevronRightIcon className='size-4 text-muted-foreground' />
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
          <Button variant='outline' size='sm' className='mt-3 rounded-xl' asChild>
            <Link href='/clients'>View all clients</Link>
          </Button>
        </div>
      ) : (
        <Card className='rounded-2xl border-dashed border-border bg-muted/20'>
          <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='flex size-14 items-center justify-center rounded-2xl bg-muted'>
              <CheckCircle2Icon className='size-7 text-muted-foreground' />
            </div>
            <h3 className='mt-4 font-semibold text-foreground'>No completions yet</h3>
            <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
              When your clients log and complete workouts, they&apos;ll show up here. Assign programs and share workout links to get started.
            </p>
            <Button variant='outline' className='mt-4 rounded-xl' asChild>
              <Link href='/clients'>Go to clients</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <Card className='rounded-2xl border-border'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-base font-medium'>
              <UsersIcon className='size-4 text-muted-foreground' />
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Invite clients and assign programs.
            </p>
            <Button variant='outline' size='sm' className='mt-3 rounded-xl' asChild>
              <Link href='/clients'>Go to clients</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className='rounded-2xl border-border'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-base font-medium'>
              <DumbbellIcon className='size-4 text-muted-foreground' />
              Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Build and edit training programs.
            </p>
            <Button variant='outline' size='sm' className='mt-3 rounded-xl' asChild>
              <Link href='/programs'>Go to programs</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className='rounded-2xl border-border'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-base font-medium'>
              <ChartColumnStackedIcon className='size-4 text-muted-foreground' />
              Exercises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Exercise library and custom exercises.
            </p>
            <Button variant='outline' size='sm' className='mt-3 rounded-xl' asChild>
              <Link href='/exercises'>Go to exercises</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
