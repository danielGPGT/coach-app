'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarIcon, LayoutGridIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { deleteProgram } from '@/actions/programs'
import { toast } from 'sonner'
import { EditProgramDialog } from './edit-program-dialog'
import type { ProgramRow } from '@/actions/programs'

type ProgramCardProps = {
  program: ProgramRow
  workoutCount?: number
}

export function ProgramCard({ program, workoutCount }: ProgramCardProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const totalSlots = program.duration_weeks * program.days_per_week
  const label =
    workoutCount !== undefined
      ? `${workoutCount} exercise${workoutCount === 1 ? '' : 's'} in program`
      : `${program.duration_weeks} wk × ${program.days_per_week} days`

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteProgram(program.id)
      toast.success('Program deleted')
      setDeleteOpen(false)
      router.push('/programs')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card
        className={cn(
          'rounded-2xl border-border bg-card shadow-sm transition-shadow hover:shadow-md',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
        )}
      >
        <CardContent className='flex flex-col gap-4'>
          {/* Top row: icon + title/subtitle, three dots top right */}
          <div className='flex items-center justify-between  gap-3'>
            <Link
              href={`/programs/${program.id}`}
              className='flex min-w-0 flex-1 items-start gap-4'
            >
              <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary'>
                <LayoutGridIcon className='size-6' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='font-medium text-foreground'>{program.name}</p>
                <p className='mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground'>
                  <CalendarIcon className='size-3.5 shrink-0' />
                  {label}
                </p>
              </div>
            </Link>
            <div className='flex flex-col justify-center h-full items-center'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-9 shrink-0 rounded-lg text-muted-foreground hover:text-foreground'
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontalIcon className='size-5' />
                  <span className='sr-only'>Program actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='rounded-xl'>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <PencilIcon className='size-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant='destructive'
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2Icon className='size-4' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href={`/programs/${program.id}`}
              className='inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
            >
              Open
              <span aria-hidden>→</span>
            </Link>
            </div>
          </div>
      

        </CardContent>
      </Card>

      <EditProgramDialog
        program={program}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
              onClick={handleDelete}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
