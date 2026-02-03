import { Skeleton } from '@/components/ui/skeleton'

export default function ProgramsLoading() {
  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-32' />
          <Skeleton className='h-5 w-96' />
        </div>
        <Skeleton className='h-11 w-36 rounded-xl' />
      </div>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-24 rounded-2xl' />
        ))}
      </div>
    </div>
  )
}
