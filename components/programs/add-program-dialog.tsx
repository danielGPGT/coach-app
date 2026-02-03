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
import { createProgram } from '@/actions/programs'
import { toast } from 'sonner'

type AddProgramDialogProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const DURATION_OPTIONS = [4, 6, 8, 12]
const DAYS_OPTIONS = [3, 4, 5, 6]

export function AddProgramDialog({ open: controlledOpen, onOpenChange }: AddProgramDialogProps = {}) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [durationWeeks, setDurationWeeks] = useState(4)
  const [daysPerWeek, setDaysPerWeek] = useState(4)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('duration_weeks', String(durationWeeks))
    formData.set('days_per_week', String(daysPerWeek))
    setIsSubmitting(true)
    try {
      const { id } = await createProgram(formData)
      toast.success('Program created', {
        description: "Now add exercises to each workout day.",
      })
      setOpen(false)
      router.refresh()
      router.push(`/programs/${id}`)
      form.reset()
      setDurationWeeks(4)
      setDaysPerWeek(4)
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
          Add program
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-md gap-6 rounded-2xl border-border bg-card p-6 sm:p-8'>
        <DialogHeader>
          <DialogTitle className='text-left text-xl'>Add program</DialogTitle>
          <p className='text-muted-foreground text-left text-sm'>
            Give it a name and choose how many weeks and days per week. You can add exercises to each day next.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='program-name' className='text-foreground'>
              Program name
            </Label>
            <Input
              id='program-name'
              name='name'
              type='text'
              placeholder='e.g. Strength Block, Hypertrophy Phase'
              required
              autoFocus
              className='h-11 rounded-xl border-border'
              disabled={isSubmitting}
            />
          </div>
          <div className='space-y-3'>
            <Label className='text-foreground'>Duration (weeks)</Label>
            <div className='flex flex-wrap gap-2'>
              {DURATION_OPTIONS.map((n) => (
                <button
                  key={n}
                  type='button'
                  onClick={() => setDurationWeeks(n)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                    durationWeeks === n
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  {n} weeks
                </button>
              ))}
            </div>
          </div>
          <div className='space-y-3'>
            <Label className='text-foreground'>Days per week</Label>
            <div className='flex flex-wrap gap-2'>
              {DAYS_OPTIONS.map((n) => (
                <button
                  key={n}
                  type='button'
                  onClick={() => setDaysPerWeek(n)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                    daysPerWeek === n
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  {n} days
                </button>
              ))}
            </div>
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button type='button' variant='outline' onClick={() => setOpen(false)} className='rounded-xl'>
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
                  Creating…
                </>
              ) : (
                'Create program'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
