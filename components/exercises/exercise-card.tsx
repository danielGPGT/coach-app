'use client'

import { cn } from '@/lib/utils'
import { getCategoryLabel } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { ExerciseRow } from '@/actions/exercises'
import { LibraryIcon, DumbbellIcon } from 'lucide-react'

type ExerciseCardProps = {
  exercise: ExerciseRow
  className?: string
}

export function ExerciseCard({ exercise, className }: ExerciseCardProps) {
  const isCustom = exercise.coach_id != null
  const categoryLabel = getCategoryLabel(exercise.category)

  return (
    <Card
      className={cn(
        'rounded-2xl border-border bg-card shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <CardContent className='flex flex-wrap items-center gap-3'>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary'>
            <DumbbellIcon className='size-5' />
          </div>
          <div className='min-w-0'>
            <p className='truncate font-medium text-foreground'>{exercise.name}</p>
            <div className='mt-0.5 flex items-center gap-2'>
              <Badge
                variant='secondary'
                className='rounded-lg border-border bg-muted px-2 py-0 text-xs font-medium text-muted-foreground'
              >
                {categoryLabel}
              </Badge>
              {isCustom ? (
                <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                  <DumbbellIcon className='size-3' />
                  Yours
                </span>
              ) : (
                <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                  <LibraryIcon className='size-3' />
                  Built-in
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
