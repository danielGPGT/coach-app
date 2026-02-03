'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2Icon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { EXERCISE_CATEGORIES } from '@/lib/constants'
import { createExercise } from '@/actions/exercises'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type AddExerciseDialogProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddExerciseDialog({ open: controlledOpen, onOpenChange }: AddExerciseDialogProps = {}) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('other')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('category', selectedCategory)
    setIsSubmitting(true)
    try {
      await createExercise(formData)
      toast.success('Exercise added', {
        description: 'You can use it when building programs.',
      })
      setOpen(false)
      router.refresh()
      form.reset()
      setSelectedCategory('other')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='h-11 rounded-xl bg-primary px-5 font-medium text-primary-foreground hover:bg-primary/90'>
          <PlusIcon className='size-4' />
          Add exercise
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-md gap-6 rounded-2xl border-border bg-card p-6 sm:p-8'>
        <DialogHeader>
          <DialogTitle className='text-left text-xl'>Add exercise</DialogTitle>
          <p className='text-muted-foreground text-left text-sm'>
            It will appear in your library and when building programs.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='dialog-name' className='text-foreground'>
              Exercise name
            </Label>
            <Input
              id='dialog-name'
              name='name'
              type='text'
              placeholder='e.g. Back Squat, Romanian Deadlift'
              required
              autoFocus
              className='h-11 rounded-xl border-border'
              disabled={isSubmitting}
            />
          </div>
          <div className='space-y-3'>
            <Label className='text-foreground'>Category</Label>
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
              {EXERCISE_CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type='button'
                  onClick={() => setSelectedCategory(c.value)}
                  className={cn(
                    'rounded-xl border py-2.5 text-sm font-medium transition-colors',
                    selectedCategory === c.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              className='rounded-xl'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='rounded-xl bg-primary text-primary-foreground hover:bg-primary/90'
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className='size-4 animate-spin' />
                  Adding…
                </>
              ) : (
                'Add exercise'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
