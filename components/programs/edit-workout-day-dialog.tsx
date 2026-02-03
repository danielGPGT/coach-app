'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2Icon, PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { updateProgramWorkout, removePrescribedExercise } from '@/actions/programs'
import { AddExerciseToDayDialog } from './add-exercise-to-day-dialog'
import { getExercisesForCoach } from '@/actions/exercises'
import { toast } from 'sonner'
import type { ProgramWorkoutRow, PrescribedExerciseRow } from '@/actions/programs'

type EditWorkoutDayDialogProps = {
  workout: ProgramWorkoutRow
  prescribed: (PrescribedExerciseRow & { exercise?: { id: string; name: string; category: string } })[]
  onClose: () => void
}

export function EditWorkoutDayDialog({ workout, prescribed, onClose }: EditWorkoutDayDialogProps) {
  const router = useRouter()
  const [name, setName] = useState(workout.name)
  const [notes, setNotes] = useState(workout.notes ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [addExerciseOpen, setAddExerciseOpen] = useState(false)
  const [exercises, setExercises] = useState<Awaited<ReturnType<typeof getExercisesForCoach>>>([])

  async function handleSaveNameNotes() {
    if (name === workout.name && (notes ?? '') === (workout.notes ?? '')) return
    setIsSaving(true)
    try {
      await updateProgramWorkout(workout.id, { name: name.trim() || workout.name, notes: notes.trim() || null })
      toast.success('Saved')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRemove(prescribedId: string) {
    try {
      await removePrescribedExercise(prescribedId)
      toast.success('Exercise removed')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove')
    }
  }

  async function openAddExercise() {
    const list = await getExercisesForCoach()
    setExercises(list)
    setAddExerciseOpen(true)
  }

  return (
    <>
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className='max-w-lg gap-4 rounded-2xl border-border bg-card p-6 sm:p-8'>
          <DialogHeader>
            <DialogTitle className='text-left text-xl'>
              Week {workout.week_number}, Day {workout.day_number}
            </DialogTitle>
            <p className='text-muted-foreground text-left text-sm'>
              Give this workout a name and add exercises. Clients will see these when they log.
            </p>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='workout-name' className='text-foreground'>Workout name</Label>
              <Input
                id='workout-name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSaveNameNotes}
                placeholder='e.g. Upper A, Lower B'
                className='h-11 rounded-xl'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='workout-notes' className='text-foreground'>Notes (optional)</Label>
              <Input
                id='workout-notes'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSaveNameNotes}
                placeholder='e.g. Focus on form'
                className='h-10 rounded-xl'
              />
            </div>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-foreground'>Exercises</Label>
                <Button
                  type='button'
                  size='sm'
                  onClick={openAddExercise}
                  className='rounded-lg bg-primary text-primary-foreground hover:bg-primary/90'
                >
                  <PlusIcon className='size-4' />
                  Add exercise
                </Button>
              </div>
              {prescribed.length === 0 ? (
                <p className='rounded-xl border border-dashed border-border bg-muted/50 py-6 text-center text-sm text-muted-foreground'>
                  No exercises yet. Click “Add exercise” to add some.
                </p>
              ) : (
                <ul className='space-y-2'>
                  {prescribed.map((p) => (
                    <li
                      key={p.id}
                      className='flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5'
                    >
                      <div>
                        <span className='font-medium text-foreground'>{p.exercise?.name ?? 'Exercise'}</span>
                        <span className='ml-2 text-sm text-muted-foreground'>
                          {p.sets} × {p.reps}
                          {p.rest_seconds ? ` · ${p.rest_seconds}s rest` : ''}
                        </span>
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='text-muted-foreground hover:text-destructive'
                        onClick={() => handleRemove(p.id)}
                      >
                        <Trash2Icon className='size-4' />
                        <span className='sr-only'>Remove</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className='flex justify-end'>
            <Button type='button' variant='outline' onClick={onClose} className='rounded-xl'>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddExerciseToDayDialog
        programWorkoutId={workout.id}
        exercises={exercises}
        open={addExerciseOpen}
        onOpenChange={setAddExerciseOpen}
        onAdded={() => {
          setAddExerciseOpen(false)
        }}
      />
    </>
  )
}
