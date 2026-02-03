import { redirect } from 'next/navigation'

/** Add exercise is now a dialog on /exercises. Redirect so old links work. */
export default function NewExercisePage() {
  redirect('/exercises')
}
