'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { createAssignment } from '@/actions/clients'
import { getProgramsForCoach, type ProgramRow } from '@/actions/programs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type AssignProgramDialogProps = {
  clientId: string
  clientName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Existing assignment program IDs so we can disable or hide them */
  existingProgramIds?: string[]
}

export function AssignProgramDialog({
  clientId,
  clientName,
  open,
  onOpenChange,
  existingProgramIds = [],
}: AssignProgramDialogProps) {
  const router = useRouter()
  const [programs, setPrograms] = useState<ProgramRow[]>([])
  const [loading, setLoading] = useState(true)
  const [programId, setProgramId] = useState<string>('')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    return d.toISOString().slice(0, 10)
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    getProgramsForCoach()
      .then((list) => {
        setPrograms(list)
        const first = list.find((p) => !existingProgramIds.includes(p.id))
        setProgramId(first?.id ?? '')
      })
      .finally(() => setLoading(false))
  }, [open, existingProgramIds.join(',')])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!programId) return
    setIsSubmitting(true)
    try {
      await createAssignment(clientId, programId, startDate)
      toast.success('Program assigned')
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const availablePrograms = programs.filter((p) => !existingProgramIds.includes(p.id))
  const canSubmit = programId && startDate && !isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md gap-6 rounded-2xl border-border bg-card p-6 sm:p-8'>
        <DialogHeader>
          <DialogTitle className='text-left text-xl'>Assign program</DialogTitle>
          <p className='text-left text-sm text-muted-foreground'>
            Assign a program to {clientName}. Pick a start date for the first week.
          </p>
        </DialogHeader>
        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2Icon className='size-8 animate-spin text-muted-foreground' />
          </div>
        ) : availablePrograms.length === 0 ? (
          <p className='text-center text-sm text-muted-foreground'>
            No programs left to assign—this client already has all your programs, or you don’t have any yet.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label className='text-foreground'>Program</Label>
              <div className='flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-2'>
                {availablePrograms.map((p) => (
                  <button
                    key={p.id}
                    type='button'
                    onClick={() => setProgramId(p.id)}
                    className={cn(
                      'rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors',
                      programId === p.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-transparent text-foreground hover:bg-muted'
                    )}
                  >
                    {p.name}
                    <span className='text-muted-foreground ml-1'>
                      — {p.duration_weeks} wk × {p.days_per_week} days
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='assign-start-date' className='text-foreground'>
                Start date
              </Label>
              <input
                id='assign-start-date'
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='h-11 w-full rounded-xl border border-border bg-background px-3 text-foreground'
                disabled={isSubmitting}
                required
              />
            </div>
            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                className='rounded-xl'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={!canSubmit}
                className='rounded-xl bg-primary text-primary-foreground hover:bg-primary/90'
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className='size-4 animate-spin' />
                    Assigning…
                  </>
                ) : (
                  'Assign program'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
