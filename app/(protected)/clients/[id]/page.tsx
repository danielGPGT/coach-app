import { notFound } from 'next/navigation'
import { getClientWithAssignments, getWorkoutLogsForClient } from '@/actions/clients'
import { ClientDetailContent } from '@/components/clients/client-detail-content'

type Props = { params: Promise<{ id: string }> }

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params
  const [data, workoutLogs] = await Promise.all([
    getClientWithAssignments(id),
    getWorkoutLogsForClient(id),
  ])
  if (!data) notFound()

  return (
    <div className='space-y-8'>
      <ClientDetailContent
        client={data.client}
        assignments={data.assignments}
        workoutLogs={workoutLogs}
      />
    </div>
  )
}
