'use client'

import { useState } from 'react'
import { AddProgramDialog } from './add-program-dialog'
import { ProgramCard } from './program-card'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { LayoutGridIcon, PlusIcon } from 'lucide-react'
import type { ProgramRow } from '@/actions/programs'

type ProgramsPageContentProps = {
  programs: ProgramRow[]
}

export function ProgramsPageContent({ programs }: ProgramsPageContentProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Programs
          </h1>
          <p className='mt-1 text-muted-foreground'>
            Build training programs and assign them to clients. Each program has workout days you can fill with exercises.
          </p>
        </div>
        <AddProgramDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>

      {programs.length === 0 ? (
        <Empty className='rounded-2xl border-border bg-muted/50'>
          <EmptyHeader>
            <EmptyMedia variant='icon' className='rounded-xl bg-card'>
              <LayoutGridIcon className='size-6 text-muted-foreground' />
            </EmptyMedia>
            <EmptyTitle>No programs yet</EmptyTitle>
            <EmptyDescription>
              Create your first program to define weeks and workout days, then add exercises to each day.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={() => setDialogOpen(true)}
              className='rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90'
            >
              <PlusIcon className='size-4' />
              Create your first program
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <p className='text-sm text-muted-foreground'>
            {programs.length} program{programs.length === 1 ? '' : 's'}
          </p>
          <ul className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {programs.map((program) => (
              <li key={program.id}>
                <ProgramCard program={program} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
