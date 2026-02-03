'use client'

import { useState } from 'react'
import { AddExerciseDialog } from './add-exercise-dialog'
import { ExerciseList } from './exercise-list'
import type { ExerciseRow } from '@/actions/exercises'

type ExercisesPageContentProps = {
  exercises: ExerciseRow[]
}

export function ExercisesPageContent({ exercises }: ExercisesPageContentProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Exercise library
          </h1>
          <p className='mt-1 text-muted-foreground'>
            Browse built-in exercises and add your own. Use them when building programs.
          </p>
        </div>
        <AddExerciseDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>

      <ExerciseList exercises={exercises} onAddClick={() => setDialogOpen(true)} />
    </>
  )
}
