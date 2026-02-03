'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircle2Icon,
  LayoutGridIcon,
  MailIcon,
  PlusIcon,
  CalendarCheckIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { AssignProgramDialog } from './assign-program-dialog'
import type { ClientRow, ClientAssignmentRow, WorkoutLogRow } from '@/actions/clients'
import { format, isToday, isTomorrow } from 'date-fns'
import { cn } from '@/lib/utils'

type ClientDetailContentProps = {
  client: ClientRow
  assignments: ClientAssignmentRow[]
  workoutLogs: WorkoutLogRow[]
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatScheduleDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'EEE, MMM d')
}

export function ClientDetailContent({ client, assignments, workoutLogs }: ClientDetailContentProps) {
  const [assignOpen, setAssignOpen] = useState(false)
  const existingProgramIds = assignments.map((a) => a.program_id)
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = workoutLogs.filter((w) => w.scheduled_date >= today)
  const recent = workoutLogs.filter((w) => w.scheduled_date < today)
  const completedCount = workoutLogs.filter((w) => w.completed_at).length

  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <Button variant='ghost' size='sm' asChild className='-ml-2 text-muted-foreground'>
          <Link href='/clients'>
            <ArrowLeftIcon className='size-4' />
            Clients
          </Link>
        </Button>
      </div>

      {/* Client info card */}
      <Card className='overflow-hidden rounded-2xl border-border bg-card'>
        <CardContent className='flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8'>
          <Avatar className='size-20 shrink-0 rounded-2xl border-2 border-border'>
            <AvatarImage src={client.image_url ?? undefined} />
            <AvatarFallback className='rounded-2xl bg-accent text-primary text-2xl font-semibold'>
              {initials(client.name)}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>{client.name}</h1>
            <p className='mt-1 flex items-center gap-2 text-muted-foreground'>
              <MailIcon className='size-4 shrink-0' />
              {client.email}
            </p>
            {client.joined_at && (
              <p className='mt-1 flex items-center gap-2 text-sm text-muted-foreground'>
                <CalendarIcon className='size-3.5 shrink-0' />
                Joined {format(new Date(client.joined_at), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule & progress */}
      <div>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h2 className='text-lg font-semibold text-foreground'>Schedule & progress</h2>
            <p className='mt-0.5 text-sm text-muted-foreground'>
              Upcoming workouts and workout history from their assigned programs.
            </p>
          </div>
          {completedCount > 0 && (
            <div className='rounded-xl border border-border bg-muted/30 px-4 py-2 text-center'>
              <p className='text-2xl font-bold text-foreground'>{completedCount}</p>
              <p className='text-xs text-muted-foreground'>workouts completed</p>
            </div>
          )}
        </div>
        {workoutLogs.length === 0 ? (
          <Empty className='mt-4 rounded-2xl border border-dashed border-border bg-muted/30'>
            <EmptyHeader>
              <EmptyMedia variant='icon' className='rounded-xl bg-card'>
                <CalendarCheckIcon className='size-6 text-muted-foreground' />
              </EmptyMedia>
              <EmptyTitle>No scheduled workouts yet</EmptyTitle>
              <EmptyDescription>
                Assign a program with a start date to generate their workout schedule.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                onClick={() => setAssignOpen(true)}
                className='rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90'
              >
                <PlusIcon className='size-4' />
                Assign program
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className='mt-4 space-y-4'>
            {upcoming.length > 0 && (
              <div>
                <h3 className='mb-2 text-sm font-medium text-muted-foreground'>Upcoming</h3>
                <ul className='space-y-2'>
                  {upcoming.map((log) => (
                    <li key={log.id}>
                      <Link href={`/workout/${log.id}`}>
                        <Card className='rounded-2xl border-border bg-card transition-colors hover:bg-muted/30'>
                          <CardContent className='flex flex-wrap items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                              <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary'>
                                <CalendarCheckIcon className='size-5' />
                              </div>
                              <div>
                                <p className='font-medium text-foreground'>{log.program_workout_name}</p>
                                <p className='text-sm text-muted-foreground'>
                                  {log.program_name} · {formatScheduleDate(log.scheduled_date)}
                                </p>
                              </div>
                            </div>
                            <span className='text-muted-foreground text-sm'>View / complete →</span>
                          </CardContent>
                        </Card>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {recent.length > 0 && (
              <div>
                <h3 className='mb-2 text-sm font-medium text-muted-foreground'>Workout history</h3>
                <ul className='space-y-2'>
                  {recent.slice(0, 10).map((log) => (
                    <li key={log.id}>
                      <Link href={`/workout/${log.id}`}>
                        <Card className='rounded-2xl border-border bg-card transition-colors hover:bg-muted/30'>
                          <CardContent className='flex flex-wrap items-center justify-between gap-3'>
                          <div className='flex items-center gap-3'>
                            <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted'>
                              <LayoutGridIcon className='size-5 text-muted-foreground' />
                            </div>
                            <div>
                              <p className='font-medium text-foreground'>{log.program_workout_name}</p>
                              <p className='text-sm text-muted-foreground'>
                                {log.program_name} · {format(new Date(log.scheduled_date + 'T12:00:00'), 'MMM d, yyyy')}
                                {log.completed_at &&
                                  ` · Completed ${format(new Date(log.completed_at), 'MMM d')}`}
                              </p>
                            </div>
                          </div>
                          {log.completed_at ? (
                            <span className='inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
                              <CheckCircle2Icon className='size-3.5' />
                              Done
                            </span>
                          ) : (
                            <span className='text-xs text-muted-foreground'>Past</span>
                          )}
                        </CardContent>
                      </Card>
                      </Link>
                    </li>
                  ))}
                </ul>
                {recent.length > 10 && (
                  <p className='mt-2 text-sm text-muted-foreground'>
                    + {recent.length - 10} more in the past
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assignments */}
      <div>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-foreground'>Programs</h2>
            <p className='text-sm text-muted-foreground'>
              Programs assigned to this client. Add one to get them started.
            </p>
          </div>
          <Button
            onClick={() => setAssignOpen(true)}
            className='h-11 rounded-xl bg-primary px-5 font-medium text-primary-foreground hover:bg-primary/90'
          >
            <PlusIcon className='size-4' />
            Assign program
          </Button>
        </div>

        {assignments.length === 0 ? (
          <Empty className='mt-6 rounded-2xl border border-dashed border-border bg-muted/30'>
            <EmptyHeader>
              <EmptyMedia variant='icon' className='rounded-xl bg-card'>
                <LayoutGridIcon className='size-6 text-muted-foreground' />
              </EmptyMedia>
              <EmptyTitle>No programs assigned</EmptyTitle>
              <EmptyDescription>
                Assign a program and start date to schedule their training.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                onClick={() => setAssignOpen(true)}
                className='rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90'
              >
                <PlusIcon className='size-4' />
                Assign program
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <ul className='mt-4 space-y-3'>
            {assignments.map((a) => (
              <li key={a.id}>
                <Link href={`/programs/${a.program_id}`}>
                  <Card className='rounded-2xl border-border bg-card transition-colors hover:bg-muted/50'>
                    <CardContent className='flex flex-wrap items-center justify-between gap-4'>
                      <div className='flex items-center gap-3'>
                        <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary'>
                          <LayoutGridIcon className='size-5' />
                        </div>
                        <div>
                          <p className='font-medium text-foreground'>{a.program_name}</p>
                          <p className='text-sm text-muted-foreground'>
                            Started {format(new Date(a.start_date), 'MMM d, yyyy')}
                            {a.status !== 'active' && ` · ${a.status}`}
                          </p>
                        </div>
                      </div>
                      <span className='text-muted-foreground text-sm'>Open →</span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AssignProgramDialog
        clientId={client.id}
        clientName={client.name}
        open={assignOpen}
        onOpenChange={setAssignOpen}
        existingProgramIds={existingProgramIds}
      />
    </div>
  )
}
