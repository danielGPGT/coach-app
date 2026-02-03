import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { getWorkoutLogForPage } from '@/actions/workouts'
import { WorkoutLogContent } from '@/components/workouts/workout-log-content'

type Props = { params: Promise<{ id: string }> }

export default async function WorkoutLogPage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()
  const workout = await getWorkoutLogForPage(id)
  if (!workout) notFound()

  const isClientView = Boolean(userId && userId === workout.client_id)

  return (
    <div className='space-y-8'>
      <WorkoutLogContent workout={workout} isClientView={isClientView} />
    </div>
  )
}
