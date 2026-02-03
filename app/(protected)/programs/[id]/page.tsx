import { notFound } from 'next/navigation'
import { getProgramWithWorkouts } from '@/actions/programs'
import { ProgramBuilder } from '@/components/programs/program-builder'

type Props = { params: Promise<{ id: string }> }

export default async function ProgramDetailPage({ params }: Props) {
  const { id } = await params
  const data = await getProgramWithWorkouts(id)
  if (!data) notFound()

  return (
    <div className='space-y-8'>
      <ProgramBuilder
        program={data.program}
        workouts={data.workouts ?? []}
        prescribed={data.prescribed ?? []}
      />
    </div>
  )
}
