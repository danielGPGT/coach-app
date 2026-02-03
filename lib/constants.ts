/**
 * Exercise categories (must match Supabase enum exercise_category).
 * Used for filtering, labels, and form options.
 */
export const EXERCISE_CATEGORIES = [
  { value: 'squat', label: 'Squat' },
  { value: 'hinge', label: 'Hinge' },
  { value: 'push', label: 'Push' },
  { value: 'pull', label: 'Pull' },
  { value: 'carry', label: 'Carry' },
  { value: 'core', label: 'Core' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'other', label: 'Other' },
] as const

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number]['value']

export function getCategoryLabel(value: string): string {
  return EXERCISE_CATEGORIES.find(c => c.value === value)?.label ?? value
}
