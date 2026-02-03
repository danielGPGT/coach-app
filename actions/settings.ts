'use server'

import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type UserSettings = {
  unit_preference: 'kg' | 'lb'
}

/** Get settings for the current user. */
export async function getUserSettings(): Promise<UserSettings> {
  const { userId } = await auth()
  if (!userId) return { unit_preference: 'kg' }

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('users')
    .select('unit_preference')
    .eq('id', userId)
    .single()

  const unit = (data as { unit_preference?: 'kg' | 'lb' } | null)?.unit_preference ?? 'kg'
  return { unit_preference: unit }
}

/** Update unit preference for the current user. */
export async function updateUnitPreference(unit: 'kg' | 'lb'): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('users')
    .update({ unit_preference: unit })
    .eq('id', userId)

  if (error) throw error
  revalidatePath('/settings')
}
