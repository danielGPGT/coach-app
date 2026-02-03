import { redirect } from 'next/navigation'

/** Add program is now a dialog on /programs. Redirect so old links work. */
export default function NewProgramPage() {
  redirect('/programs')
}
