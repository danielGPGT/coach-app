'use server'

import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
export type ExerciseRow = {
  id: string
  coach_id: string | null
  name: string
  category: string
  created_at: string
}

/**
 * Fetch all exercises the coach can use: global (coach_id null) + their own.
 * Uses service role so it works without the Clerk Supabase JWT template; we scope by Clerk userId.
 */
export async function getExercisesForCoach(): Promise<ExerciseRow[]> {
  const { userId } = await auth()
  if (!userId) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('exercises')
    .select('id, coach_id, name, category, created_at')
    .or(`coach_id.is.null,coach_id.eq.${userId}`)
    .order('name')

  if (error) throw error
  return (data ?? []) as ExerciseRow[]
}

/**
 * Create a custom exercise for the current coach.
 * Uses service role so it works without the Clerk Supabase JWT template; we enforce coach_id from Clerk auth.
 */
export async function createExercise(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('You must be signed in to add an exercise.')

  const name = (formData.get('name') as string)?.trim()
  const category = (formData.get('category') as string)?.trim()

  if (!name) throw new Error('Exercise name is required.')
  if (!category) throw new Error('Category is required.')

  const validCategories = ['squat', 'hinge', 'push', 'pull', 'carry', 'core', 'accessory', 'cardio', 'other']
  if (!validCategories.includes(category)) throw new Error('Invalid category.')

  const supabase = createAdminClient()
  const { error } = await supabase.from('exercises').insert({
    coach_id: userId,
    name,
    category,
  })

  if (error) throw error
  revalidatePath('/exercises')
  revalidatePath('/programs')
  return { ok: true }
}
