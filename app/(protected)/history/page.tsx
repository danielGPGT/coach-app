import Link from 'next/link'
import { getCurrentUserRole, getWorkoutHistoryForClient } from '@/actions/workouts'
import { WorkoutHistoryContent } from '@/components/workouts/workout-history-content'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default async function HistoryPage() {
  const role = await getCurrentUserRole()

  if (role === 'coach') {
    return (
      <div className='space-y-8'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>Workout history</h1>
          <p className='mt-1 text-muted-foreground'>
            View a client&apos;s workout history from their detail page.
          </p>
        </div>
        <Card className='rounded-2xl border-border bg-muted/30'>
          <CardContent className='p-8 text-center'>
            <p className='text-muted-foreground'>
              Open a client and check their Schedule to see completed workouts.
            </p>
            <Button variant='outline' className='mt-4 rounded-xl' asChild>
              <Link href='/clients'>Go to clients</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const workouts = await getWorkoutHistoryForClient()
  return <WorkoutHistoryContent workouts={workouts} />
}
