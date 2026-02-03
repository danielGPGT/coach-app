'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { updateProgram } from '@/actions/programs'
import { toast } from 'sonner'
import type { ProgramRow } from '@/actions/programs'

type EditProgramDialogProps = {
  program: ProgramRow
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProgramDialog({ program, open, onOpenChange }: EditProgramDialogProps) {
  const router = useRouter()
  const [name, setName] = useState(program.name)
  const [description, setDescription] = useState(program.description ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(program.name)
      setDescription(program.description ?? '')
    }
  }, [open, program.name, program.description])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateProgram(program.id, {
        name: name.trim(),
        description: description.trim() || null,
      })
      toast.success('Program updated')
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md gap-6 rounded-2xl border-border bg-card p-6 sm:p-8'>
        <DialogHeader>
          <DialogTitle className='text-left text-xl'>Edit program</DialogTitle>
          <p className='text-left text-sm text-muted-foreground'>
            Change the program name and description.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='edit-program-name' className='text-foreground'>
              Program name
            </Label>
            <Input
              id='edit-program-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              type='text'
              placeholder='e.g. Strength Block'
              required
              autoFocus
              className='h-11 rounded-xl border-border'
              disabled={isSubmitting}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='edit-program-description' className='text-foreground'>
              Description (optional)
            </Label>
            <Textarea
              id='edit-program-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Brief description of the program'
              rows={3}
              className='rounded-xl border-border resize-none'
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              className='rounded-xl bg-primary text-primary-foreground hover:bg-primary/90'
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className='size-4 animate-spin' />
                  Saving…
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
