'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2Icon, SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { addPrescribedExercise } from '@/actions/programs'
import { getCategoryLabel } from '@/lib/constants'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { ExerciseRow } from '@/actions/exercises'

type AddExerciseToDayDialogProps = {
  programWorkoutId: string
  exercises: ExerciseRow[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded?: () => void
}

export function AddExerciseToDayDialog({
  programWorkoutId,
  exercises,
  open,
  onOpenChange,
  onAdded,
}: AddExerciseToDayDialogProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState('10')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return exercises.slice(0, 20)
    return exercises
      .filter((e) => e.name.toLowerCase().includes(q) || getCategoryLabel(e.category).toLowerCase().includes(q))
      .slice(0, 20)
  }, [exercises, search])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) {
      toast.error('Pick an exercise')
      return
    }
    setIsSubmitting(true)
    const formData = new FormData()
    formData.set('program_workout_id', programWorkoutId)
    formData.set('exercise_id', selectedId)
    formData.set('sets', String(sets))
    formData.set('reps', reps)
    try {
      await addPrescribedExercise(formData)
      toast.success('Exercise added to this workout')
      router.refresh()
      onAdded?.()
      setSelectedId(null)
      setSets(3)
      setReps('10')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md gap-4 rounded-2xl border-border bg-card p-6 sm:p-8'>
        <DialogHeader>
          <DialogTitle className='text-left text-lg'>Add exercise to this day</DialogTitle>
          <p className='text-muted-foreground text-left text-sm'>
            Choose an exercise, then set sets and reps.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label className='text-foreground'>Choose exercise</Label>
            <div className='relative'>
              <SearchIcon className='text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2' />
              <Input
                type='search'
                placeholder='Search exercises...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='h-10 rounded-lg pl-9'
              />
            </div>
            <div className='max-h-44 overflow-y-auto rounded-lg border border-border'>
              {filtered.length === 0 ? (
                <p className='p-3 text-sm text-muted-foreground'>No exercises match. Add some in the Exercise library first.</p>
              ) : (
                <ul className='divide-y divide-border'>
                  {filtered.map((ex) => (
                    <li key={ex.id}>
                      <button
                        type='button'
                        onClick={() => setSelectedId(ex.id)}
                        className={cn(
                          'flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors',
                          selectedId === ex.id
                            ? 'bg-accent text-primary'
                            : 'hover:bg-muted'
                        )}
                      >
                        <span className='font-medium'>{ex.name}</span>
                        <span className='text-xs text-muted-foreground'>{getCategoryLabel(ex.category)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='sets' className='text-foreground'>Sets</Label>
              <Input
                id='sets'
                type='number'
                min={1}
                max={20}
                value={sets}
                onChange={(e) => setSets(parseInt(e.target.value, 10) || 1)}
                className='h-10 rounded-lg'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='reps' className='text-foreground'>Reps</Label>
              <Input
                id='reps'
                type='text'
                placeholder='e.g. 10 or 8-12'
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className='h-10 rounded-lg'
              />
            </div>
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} className='rounded-xl'>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={!selectedId || isSubmitting}
              className='rounded-xl bg-primary text-primary-foreground hover:bg-primary/90'
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className='size-4 animate-spin' />
                  Adding…
                </>
              ) : (
                'Add to workout'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
