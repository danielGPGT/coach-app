'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EditWorkoutDayDialog } from './edit-workout-day-dialog'
import { EditProgramDialog } from './edit-program-dialog'
import { deleteProgram } from '@/actions/programs'
import { toast } from 'sonner'
import type { ProgramRow, ProgramWorkoutRow, PrescribedExerciseRow } from '@/actions/programs'
import { cn } from '@/lib/utils'

type ProgramBuilderProps = {
  program: ProgramRow
  workouts: ProgramWorkoutRow[]
  prescribed: (PrescribedExerciseRow & { exercise?: { id: string; name: string; category: string } })[]
}

export function ProgramBuilder({ program, workouts, prescribed }: ProgramBuilderProps) {
  const router = useRouter()
  const [editingWorkout, setEditingWorkout] = useState<ProgramWorkoutRow | null>(null)
  const [editProgramOpen, setEditProgramOpen] = useState(false)
  const [deleteProgramOpen, setDeleteProgramOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDeleteProgram() {
    setIsDeleting(true)
    try {
      await deleteProgram(program.id)
      toast.success('Program deleted')
      setDeleteProgramOpen(false)
      router.push('/programs')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsDeleting(false)
    }
  }

  const prescribedByWorkout = new Map<string, (PrescribedExerciseRow & { exercise?: { id: string; name: string; category: string } })[]>()
  for (const p of prescribed) {
    const list = prescribedByWorkout.get(p.program_workout_id) ?? []
    list.push(p)
    prescribedByWorkout.set(p.program_workout_id, list)
  }

  const grid: (ProgramWorkoutRow | null)[][] = []
  for (let w = 1; w <= program.duration_weeks; w++) {
    const row: (ProgramWorkoutRow | null)[] = []
    for (let d = 1; d <= program.days_per_week; d++) {
      const workout = workouts.find((x) => x.week_number === w && x.day_number === d) ?? null
      row.push(workout)
    }
    grid.push(row)
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='sm' asChild className='-ml-2 text-muted-foreground'>
            <Link href='/programs'>
              <ArrowLeftIcon className='size-4' />
              Programs
            </Link>
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='rounded-xl border-border'
            >
              <MoreHorizontalIcon className='size-4' />
              <span className='sr-only'>Program actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='rounded-xl'>
            <DropdownMenuItem onClick={() => setEditProgramOpen(true)}>
              <PencilIcon className='size-4' />
              Edit program
            </DropdownMenuItem>
            <DropdownMenuItem
              variant='destructive'
              onClick={() => setDeleteProgramOpen(true)}
            >
              <Trash2Icon className='size-4' />
              Delete program
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-foreground'>{program.name}</h1>
        <p className='mt-1 text-muted-foreground'>
          {program.duration_weeks} weeks × {program.days_per_week} days — click a day to add exercises
        </p>
      </div>

      {/* Mobile: stacked list so days aren't squished */}
      <div className='space-y-3 md:hidden'>
        {workouts.map((workout) => {
          const count = prescribedByWorkout.get(workout.id)?.length ?? 0
          return (
            <button
              key={workout.id}
              type='button'
              onClick={() => setEditingWorkout(workout)}
              className={cn(
                'flex w-full items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-border bg-muted/50 p-4 text-left transition-colors tap-target',
                'hover:border-primary/40 hover:bg-accent/50 active:bg-accent/70'
              )}
            >
              <div className='min-w-0 flex-1'>
                <p className='font-medium text-foreground'>{workout.name}</p>
                <p className='mt-0.5 text-sm text-muted-foreground'>
                  Week {workout.week_number}, Day {workout.day_number} · {count} exercise{count === 1 ? '' : 's'}
                </p>
              </div>
              <span className='text-xs font-medium text-primary shrink-0'>Edit</span>
            </button>
          )
        })}
      </div>

      {/* Desktop: table grid */}
      <div className='hidden overflow-x-auto md:block rounded-xl shadow-md'>
        <table className='w-full min-w-[400px] border-collapse bg-card shadow-sm'>
          <thead>
            <tr className='border-b border-border bg-muted/80'>
              <th className='w-24 py-2 px-4 text-left text-sm font-medium text-muted-foreground'>Week</th>
              {Array.from({ length: program.days_per_week }, (_, i) => (
                <th key={i} className='min-w-[120px] p-3 text-center text-sm font-medium text-muted-foreground'>
                  Day {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, weekIndex) => (
              <tr key={weekIndex} className='border-b border-border last:border-0'>
                <td className='p-4 text-sm font-medium text-foreground'>Week {weekIndex + 1}</td>
                {row.map((workout) => {
                  if (!workout) return <td key={`empty-${weekIndex}`} className='p-2' />
                  const count = prescribedByWorkout.get(workout.id)?.length ?? 0
                  return (
                    <td key={workout.id} className='p-2'>
                      <button
                        type='button'
                        onClick={() => setEditingWorkout(workout)}
                        className={cn(
                          'flex h-full min-h-[80px] w-full min-w-[100px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-3 text-center transition-colors',
                          'border-border bg-muted/50 hover:border-primary/40 hover:bg-accent/50'
                        )}
                      >
                        <span className='text-sm font-medium text-foreground'>{workout.name}</span>
                        <span className='text-xs text-muted-foreground'>
                          {count} exercise{count === 1 ? '' : 's'}
                        </span>
                        <span className='text-xs text-primary'>Tap to edit</span>
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingWorkout && (
        <EditWorkoutDayDialog
          workout={editingWorkout}
          prescribed={prescribedByWorkout.get(editingWorkout.id) ?? []}
          onClose={() => setEditingWorkout(null)}
        />
      )}

      <EditProgramDialog
        program={program}
        open={editProgramOpen}
        onOpenChange={setEditProgramOpen}
      />

      <AlertDialog open={deleteProgramOpen} onOpenChange={setDeleteProgramOpen}>
        <AlertDialogContent className='rounded-2xl border-border'>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete program?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{program.name}&quot; and all its workout days and exercises. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-2 sm:gap-0'>
            <AlertDialogCancel className='rounded-xl' disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant='destructive'
              disabled={isDeleting}
              className='rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={handleDeleteProgram}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
