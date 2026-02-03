'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EXERCISE_CATEGORIES } from '@/lib/constants'
import { createExercise } from '@/actions/exercises'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function ExerciseForm() {
  const router = useRouter()
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
      router.push('/exercises')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      <div className='space-y-2'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          asChild
          className='-ml-2 text-muted-foreground'
        >
          <Link href='/exercises'>
            <ArrowLeftIcon className='size-4' />
            Back to library
          </Link>
        </Button>
      </div>

      <div className='rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8'>
        <div className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='name' className='text-foreground'>
              Exercise name
            </Label>
            <Input
              id='name'
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
            <p className='text-sm text-muted-foreground'>
              Choose the movement pattern so you can filter later.
            </p>
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
              {EXERCISE_CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type='button'
                  onClick={() => setSelectedCategory(c.value)}
                  className={cn(
                    'rounded-xl border py-3 text-sm font-medium transition-colors',
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
        </div>

        <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:items-center'>
          <Button
            type='submit'
            disabled={isSubmitting}
            className='h-11 rounded-xl bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90'
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
          <Button type='button' variant='outline' asChild className='rounded-xl'>
            <Link href='/exercises'>Cancel</Link>
          </Button>
        </div>
      </div>
    </form>
  )
}
