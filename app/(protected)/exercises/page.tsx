import { getExercisesForCoach } from '@/actions/exercises'
import { ExercisesPageContent } from '@/components/exercises/exercises-page-content'

export default async function ExercisesPage() {
  const exercises = await getExercisesForCoach()

  return (
    <div className='space-y-8'>
      <ExercisesPageContent exercises={exercises} />
    </div>
  )
}
