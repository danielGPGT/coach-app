import { getProgramsForCoach } from '@/actions/programs'
import { ProgramsPageContent } from '@/components/programs/programs-page-content'

export default async function ProgramsPage() {
  const programs = await getProgramsForCoach()

  return (
    <div className='space-y-8'>
      <ProgramsPageContent programs={programs} />
    </div>
  )
}
