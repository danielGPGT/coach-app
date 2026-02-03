'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { SearchIcon, PlusIcon, DumbbellIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ExerciseCard } from './exercise-card'
import { EXERCISE_CATEGORIES, getCategoryLabel } from '@/lib/constants'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import type { ExerciseRow } from '@/actions/exercises'
import { cn } from '@/lib/utils'

type ExerciseListProps = {
  exercises: ExerciseRow[]
  /** When set, empty-state and tip "Add" buttons call this instead of linking to /exercises/new */
  onAddClick?: () => void
}

export function ExerciseList({ exercises, onAddClick }: ExerciseListProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = exercises
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          getCategoryLabel(e.category).toLowerCase().includes(q)
      )
    }
    if (category) {
      list = list.filter((e) => e.category === category)
    }
    return list
  }, [exercises, search, category])

  const customCount = exercises.filter((e) => e.coach_id != null).length
  const hasCustom = customCount > 0

  return (
    <div className='space-y-6'>
      {/* Search + category filters */}
      <div className='space-y-4'>
        <div className='relative'>
          <SearchIcon className='text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2' />
          <Input
            type='search'
            placeholder='Search exercises...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-11 rounded-xl border-border pl-10 placeholder:text-muted-foreground'
            autoComplete='off'
          />
        </div>
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => setCategory(null)}
            className={cn(
              'rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors',
              category === null
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-foreground hover:bg-muted'
            )}
          >
            All
          </button>
          {EXERCISE_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type='button'
              onClick={() => setCategory(c.value)}
              className={cn(
                'rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors',
                category === c.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:bg-muted'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className='text-sm text-muted-foreground'>
        {filtered.length === exercises.length
          ? `${exercises.length} exercise${exercises.length === 1 ? '' : 's'}`
          : `${filtered.length} of ${exercises.length} exercise${exercises.length === 1 ? '' : 's'}`}
      </p>

      {/* List or empty state */}
      {filtered.length === 0 ? (
        <Empty className='rounded-2xl border-border bg-muted/50'>
          <EmptyHeader>
            <EmptyMedia variant='icon' className='rounded-xl bg-card'>
              <DumbbellIcon className='size-6 text-muted-foreground' />
            </EmptyMedia>
            <EmptyTitle>
              {exercises.length === 0
                ? 'No exercises yet'
                : 'No matches'}
            </EmptyTitle>
            <EmptyDescription>
              {exercises.length === 0
                ? 'Add your first exercise to build your library, or use built-in exercises once they’re available.'
                : 'Try a different search or category.'}
            </EmptyDescription>
          </EmptyHeader>
          {exercises.length === 0 && (
            <EmptyContent>
              {onAddClick ? (
                <Button onClick={onAddClick} className='rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90'>
                  <PlusIcon className='size-4' />
                  Add your first exercise
                </Button>
              ) : (
                <Button asChild className='rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90'>
                  <Link href='/exercises/new'>
                    <PlusIcon className='size-4' />
                    Add your first exercise
                  </Link>
                </Button>
              )}
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <>
          {!hasCustom && exercises.length > 0 && (
            <div className='rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-foreground'>
              <p className='font-medium'>Tip</p>
              <p className='mt-0.5 opacity-90'>
                Add your own exercises for movements that aren’t in the library.
              </p>
              {onAddClick ? (
                <Button variant='outline' size='sm' className='mt-3 rounded-lg border-warning/50 text-warning-foreground' onClick={onAddClick}>
                  Add custom exercise
                </Button>
              ) : (
                <Button asChild variant='outline' size='sm' className='mt-3 rounded-lg border-warning/50 text-warning-foreground'>
                  <Link href='/exercises/new'>Add custom exercise</Link>
                </Button>
              )}
            </div>
          )}
          <ul className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {filtered.map((exercise) => (
              <li key={exercise.id}>
                <ExerciseCard exercise={exercise} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
