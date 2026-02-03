'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  DumbbellIcon,
  Loader2Icon,
  SaveIcon,
  UserIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { completeWorkout, saveSetLogs } from '@/actions/workouts'
import type { WorkoutLogForPage, SetLogEntry } from '@/actions/workouts'
import { toast } from 'sonner'
import { format, isToday, isTomorrow } from 'date-fns'

type WorkoutLogContentProps = {
  workout: WorkoutLogForPage
  /** When true, viewer is the client (show "Back to dashboard", hide client name). */
  isClientView?: boolean
}

function formatWorkoutDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'EEEE, MMM d, yyyy')
}

type ExerciseLogState = { prescribed_id: string; set_logs: SetLogEntry[] }

function toNum(val: string): number | null {
  const n = parseFloat(val)
  return val.trim() === '' || Number.isNaN(n) ? null : n
}

export function WorkoutLogContent({ workout, isClientView = false }: WorkoutLogContentProps) {
  const router = useRouter()
  const [completing, setCompleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const isComplete = Boolean(workout.completed_at)

  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogState[]>(() =>
    workout.exercises.map((ex) => ({
      prescribed_id: ex.prescribed_id,
      set_logs: ex.set_logs.map((s) => ({ ...s })),
    }))
  )

  const hasChanges = useMemo(() => {
    return workout.exercises.some((ex, ei) => {
      const current = exerciseLogs[ei]?.set_logs ?? []
      const initial = ex.set_logs
      return current.some(
        (s, si) =>
          s.reps_completed !== initial[si]?.reps_completed ||
          s.weight_kg !== initial[si]?.weight_kg ||
          s.rpe !== initial[si]?.rpe
      )
    })
  }, [workout.exercises, exerciseLogs])

  function updateSet(exerciseIndex: number, setIndex: number, field: keyof SetLogEntry, value: number | string | null) {
    setExerciseLogs((prev) => {
      const next = prev.map((e, ei) => {
        if (ei !== exerciseIndex) return e
        return {
          ...e,
          set_logs: e.set_logs.map((s, si) =>
            si !== setIndex ? s : { ...s, [field]: typeof value === 'number' ? value : value }
          ),
        }
      })
      return next
    })
  }

  async function handleSaveLog() {
    setSaving(true)
    try {
      const entries = exerciseLogs.flatMap((e) =>
        e.set_logs.map((s) => ({
          prescribed_exercise_id: e.prescribed_id,
          set_number: s.set_number,
          reps_completed: s.reps_completed,
          weight_kg: s.weight_kg,
          rpe: s.rpe,
          notes: s.notes,
        }))
      )
      await saveSetLogs(workout.id, entries)
      toast.success('Log saved')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleComplete() {
    setCompleting(true)
    try {
      const entries = exerciseLogs.flatMap((e) =>
        e.set_logs.map((s) => ({
          prescribed_exercise_id: e.prescribed_id,
          set_number: s.set_number,
          reps_completed: s.reps_completed,
          weight_kg: s.weight_kg,
          rpe: s.rpe,
          notes: s.notes,
        }))
      )
      await saveSetLogs(workout.id, entries)
      await completeWorkout(workout.id)
      toast.success('Workout marked complete')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <Button variant='ghost' size='sm' asChild className='-ml-2 text-muted-foreground'>
          <Link href={isClientView ? '/dashboard' : `/clients/${workout.client_id}`}>
            <ArrowLeftIcon className='size-4' />
            {isClientView ? 'Back to dashboard' : 'Back to client'}
          </Link>
        </Button>
      </div>

      <div>
        {!isClientView && (
          <p className='flex items-center gap-1.5 text-sm text-muted-foreground'>
            <UserIcon className='size-3.5' />
            {workout.client_name}
          </p>
        )}
        <h1 className='mt-1 text-2xl font-bold tracking-tight text-foreground'>
          {workout.program_workout_name}
        </h1>
        <p className='mt-1 text-muted-foreground'>
          {workout.program_name} · {formatWorkoutDate(workout.scheduled_date)}
        </p>
      </div>

      {workout.exercises.length === 0 ? (
        <Card className='rounded-2xl border-border bg-muted/30'>
          <CardContent className='p-8 text-center'>
            <p className='text-muted-foreground'>
              No exercises in this workout yet. Add them from the program builder.
            </p>
            <Button variant='outline' asChild className='mt-4 rounded-xl'>
              <Link href={workout.program_id ? `/programs/${workout.program_id}` : `/clients/${workout.client_id}`}>
                {workout.program_id ? 'Open program' : 'Back to client'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-6'>
          <h2 className='text-sm font-medium text-muted-foreground'>Log sets</h2>
          {workout.exercises.map((ex, exerciseIndex) => {
            const logs = exerciseLogs[exerciseIndex]?.set_logs ?? ex.set_logs
            return (
              <Card key={ex.prescribed_id} className='rounded-2xl border-border bg-card'>
                <CardContent className='p-4 sm:p-5'>
                  <div className='mb-4 flex items-center gap-3'>
                    <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary'>
                      <DumbbellIcon className='size-5' />
                    </div>
                    <div>
                      <p className='font-medium text-foreground'>{ex.exercise_name}</p>
                      <p className='text-sm text-muted-foreground'>
                        Target: {ex.sets} set{ex.sets === 1 ? '' : 's'} × {ex.reps} reps
                        {ex.notes ? ` · ${ex.notes}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className='overflow-x-auto'>
                    <table className='w-full min-w-[280px] text-sm'>
                      <thead>
                        <tr className='border-b border-border text-left text-muted-foreground'>
                          <th className='pb-2 pr-4 font-medium'>Set</th>
                          <th className='pb-2 pr-4 font-medium'>Reps</th>
                          <th className='pb-2 pr-4 font-medium'>Weight (kg)</th>
                          <th className='pb-2 font-medium'>RPE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((set, setIndex) => (
                          <tr key={set.set_number} className='border-b border-border last:border-0'>
                            <td className='py-2 pr-4 font-medium text-foreground'>{set.set_number}</td>
                            <td className='py-2 pr-4'>
                              <Input
                                type='number'
                                min={0}
                                step={1}
                                placeholder='—'
                                className='h-9 w-20 rounded-lg border-border'
                                value={set.reps_completed ?? ''}
                                onChange={(e) =>
                                  updateSet(exerciseIndex, setIndex, 'reps_completed', toNum(e.target.value))
                                }
                                disabled={isComplete}
                              />
                            </td>
                            <td className='py-2 pr-4'>
                              <Input
                                type='number'
                                min={0}
                                step={0.5}
                                placeholder='—'
                                className='h-9 w-20 rounded-lg border-border'
                                value={set.weight_kg ?? ''}
                                onChange={(e) =>
                                  updateSet(exerciseIndex, setIndex, 'weight_kg', toNum(e.target.value))
                                }
                                disabled={isComplete}
                              />
                            </td>
                            <td className='py-2'>
                              <Input
                                type='number'
                                min={1}
                                max={10}
                                step={0.5}
                                placeholder='—'
                                className='h-9 w-16 rounded-lg border-border'
                                value={set.rpe ?? ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'rpe', toNum(e.target.value))}
                                disabled={isComplete}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {!isComplete && workout.exercises.length > 0 && (
        <div className='flex flex-wrap gap-3'>
          {hasChanges && (
            <Button
              variant='outline'
              onClick={handleSaveLog}
              disabled={saving || completing}
              className='rounded-xl border-border'
            >
              {saving ? (
                <Loader2Icon className='size-4 animate-spin' />
              ) : (
                <SaveIcon className='size-4' />
              )}
              Save log
            </Button>
          )}
          <Button
            onClick={handleComplete}
            disabled={completing}
            className='rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90'
          >
            {completing ? (
              <>
                <Loader2Icon className='size-4 animate-spin' />
                Marking complete…
              </>
            ) : (
              <>
                <CheckCircle2Icon className='size-4' />
                Mark workout complete
              </>
            )}
          </Button>
        </div>
      )}

      {isComplete && (
        <Card className='rounded-2xl border-primary/30 bg-primary/5'>
          <CardContent className='flex items-center gap-3 p-4'>
            <CheckCircle2Icon className='size-6 text-primary' />
            <div>
              <p className='font-medium text-foreground'>Completed</p>
              <p className='text-sm text-muted-foreground'>
                {workout.completed_at &&
                  format(new Date(workout.completed_at), 'MMM d, yyyy \'at\' h:mm a')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
