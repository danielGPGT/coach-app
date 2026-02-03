import Link from 'next/link'
import { format } from 'date-fns'
import { CheckCircle2Icon, ChevronRightIcon, DumbbellIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { WorkoutLogSummary } from '@/actions/workouts'

type WorkoutHistoryContentProps = {
  workouts: WorkoutLogSummary[]
}

export function WorkoutHistoryContent({ workouts }: WorkoutHistoryContentProps) {
  if (workouts.length === 0) {
    return (
      <div className='space-y-8'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>Workout history</h1>
          <p className='mt-1 text-muted-foreground'>Your completed workouts will appear here.</p>
        </div>
        <Card className='rounded-2xl border-border bg-muted/30'>
          <CardContent className='p-8 text-center'>
            <p className='text-muted-foreground'>No completed workouts yet.</p>
            <p className='mt-1 text-sm text-muted-foreground'>
              Complete a workout from your dashboard to see it here.
            </p>
            <Button variant='outline' className='mt-4 rounded-xl' asChild>
              <Link href='/dashboard'>Go to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-foreground'>Workout history</h1>
        <p className='mt-1 text-muted-foreground'>Your completed workouts.</p>
      </div>

      <ul className='space-y-3'>
        {workouts.map((w) => (
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
                        {w.program_name} · {format(new Date(w.scheduled_date + 'T12:00:00'), 'MMM d, yyyy')}
                      </p>
                      {w.completed_at && (
                        <span className='mt-1 inline-flex items-center gap-1 text-sm text-primary'>
                          <CheckCircle2Icon className='size-4' />
                          {format(new Date(w.completed_at), 'MMM d, yyyy \'at\' h:mm a')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant='ghost' size='sm' className='shrink-0 rounded-xl' asChild>
                    <span>
                      View
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
  )
}
